import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to handle base64 documents (PDF, Docx, Image resumes)
app.use(express.json({ limit: '15mb' }));

// Helper to initialize the Gemini client with appropriate telemetry header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const api_key = process.env.GEMINI_API_KEY;
    if (!api_key) {
      console.warn('GEMINI_API_KEY is not defined. Using mocked/placeholder evaluations for setup.');
    }
    aiClient = new GoogleGenAI({
      apiKey: api_key || 'DUMMY_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to analyze and score resume
app.post('/api/analyze-resume', async (req, res): Promise<any> => {
  try {
    const { text, file, role, description } = req.body;
    
    if (!text && !file) {
      return res.status(400).json({ error: 'Please submit either a resume text or copy/upload a resume file.' });
    }

    const ai = getGeminiClient();

    // Prepare content parts
    const parts: any[] = [];
    
    let resumeRefText = '';
    if (text) {
      resumeRefText = text;
      parts.push({ text: `Resume Text Content:\n${text}` });
    }
    
    if (file && file.data && file.mimeType) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data, // This is expected to be raw base64 data (without prefix)
        }
      });
      // Add extra instruction if it's a file
      parts.push({ text: 'Please extract and analyze the content from the uploaded resume file attached above.' });
    }

    // Role-specific instruction
    const targetRoleText = role ? `Target Professional Role: ${role}` : 'Target Professional Role: General Industry Standard';
    const customDescText = description ? `Target Job Description Context:\n${description}` : '';

    const instructionPrompt = `
You are an elite Executive Recruiter and ATS (Applicant Tracking System) Expert with decades of resume auditing experience.
Analyze the resume content against the target professional role and standard professional resume guidelines.

${targetRoleText}
${customDescText}

Please perform the following steps:
1. Parse details: Name, Email, Phone, Skills identified, and critical skills missing for the ${role || 'specified'} role.
2. Grade the resume across four key categories (out of 100):
   - Impact & Achievements: Look for quantified results, bullet points starting with strong action verbs, and STAR methodology (Situation, Task, Action, Result). Penalize generic responsibility statements (e.g. "responsible for...").
   - Formatting & Readability: Grade document flow, layout suggestions, section ordering, and standard structure.
   - Keywords & ATS: Grade matching speed against typical keyword matching pipelines. Suggest custom keywords that must be integrated to pass.
   - Language & Style: Check spelling, grammar, passive voice usage, clichés, and jargon.
3. Calculate an overall average score (0 to 100) that reflects hiring manager appeal.
4. Highlight major strengths (strengths).
5. Extract a list of specific mistakes (mistakes) in the resume. For EACH mistake, you MUST categorise its severity ("critical" for deal-breakers like no metrics or active email, "warning" for mild issues, "optimization" for slight edits), explain why it's a problem, and supply highly concrete solution corrections.
   - Crucially, identify the "originalText" snippet from the resume containing the mistake, and give a "correctedText" rewrite suggestion showing exactly how to phrase it using action-oriented metrics.
   - For example: if original was "Responsible for managing a team and doing sales," the correction should be "Led and mentored a cross-functional team of 5, exceeding quarterly sales targets by 27% through targeted field outreach."

Provide detailed feedback. Return a fully valid structured JSON matching the requested responseSchema.
`;

    parts.push({ text: instructionPrompt });

    // Call Gemini with schema constraints
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: parts,
      config: {
        systemInstruction: 'You are a professional ATS resume scanner and Career Coach. Always return responses in valid structure compliant with the responseSchema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: 'Overall aggregate hiring and ATS scoring index between 0 and 100',
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                impact: { type: Type.INTEGER, description: 'STAR format, achievement metrics, action verbs (0-100)' },
                formatting: { type: Type.INTEGER, description: 'Layout design, formatting consistency, visual hierarchy (0-100)' },
                keywords: { type: Type.INTEGER, description: 'ATS compatibility, relevant skills presence (0-100)' },
                style: { type: Type.INTEGER, description: 'Cliché elimination, perfect spelling, grammar, action voice (0-100)' }
              },
              required: ['impact', 'formatting', 'keywords', 'style']
            },
            summary: {
              type: Type.STRING,
              description: 'A professional executive evaluation of the resume, detailing potential, key concerns, and overall polish.'
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'A list of 3-5 major positive highlights from the resume'
            },
            mistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Option: "formatting" or "impact" or "keywords" or "style"' },
                  severity: { type: Type.STRING, description: 'Option: "critical" or "warning" or "optimization"' },
                  title: { type: Type.STRING, description: 'Headline of the issue' },
                  explanation: { type: Type.STRING, description: 'Reasoning why this is an issue' },
                  solutions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        originalText: { type: Type.STRING, description: 'The raw text segment from the resume that is problematic (or empty for layout level)' },
                        correctedText: { type: Type.STRING, description: 'A detailed rewrite or specific correction recommendation' },
                        explanation: { type: Type.STRING, description: 'A breakdown of why this correction improves standard ATS success' }
                      },
                      required: ['correctedText', 'explanation']
                    }
                  }
                },
                required: ['category', 'severity', 'title', 'explanation', 'solutions']
              }
            },
            parsedInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Candidate name extracted or "Unknown"' },
                email: { type: Type.STRING, description: 'Email address extracted or "Not specified"' },
                phone: { type: Type.STRING, description: 'Phone number extracted or "Not specified"' },
                skillsFound: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Technical and soft skills detected in the document' },
                skillsMissing: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Standard high-value industry skills for this role that were omitted' }
              },
              required: ['name', 'email', 'phone', 'skillsFound', 'skillsMissing']
            },
            atsKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING, description: 'Required industry terminology or technical skill keyword' },
                  found: { type: Type.BOOLEAN, description: 'Whether the keyword is physically present in the resume' },
                  importance: { type: Type.STRING, description: 'Option: "high" or "medium" or "low"' }
                },
                required: ['keyword', 'found', 'importance']
              }
            },
            suggestedTemplates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Types of layouts or structural frameworks recommended (e.g., "Review Harvard Business Review classical", "Reverse Chronological Header")'
            }
          },
          required: ['score', 'breakdown', 'summary', 'strengths', 'mistakes', 'parsedInfo', 'atsKeywords']
        }
      }
    });

    const jsonText = response.text || '{}';
    const reportData = JSON.parse(jsonText.trim());
    
    // Assign incremental ids to mistakes on the server-side to be safe
    if (reportData.mistakes && Array.isArray(reportData.mistakes)) {
      reportData.mistakes = reportData.mistakes.map((m: any, idx: number) => ({
        ...m,
        id: `mst-${Date.now()}-${idx}`
      }));
    }

    return res.json(reportData);

  } catch (error: any) {
    console.error('Resume grading pipeline error:', error);
    
    // Graceful error state structure if API key missing or errors out
    if (process.env.GEMINI_API_KEY === undefined || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' || !process.env.GEMINI_API_KEY) {
      // Mock result when Gemini API is not working or not configured, ensuring UI is fully usable and interactive
      return res.status(200).json(getBackupScoringResult(req.body.role || 'Software Engineer'));
    }
    
    return res.status(500).json({ 
      error: 'Failed to evaluate resume on the server. Please try again.',
      details: error.message 
    });
  }
});

// Provides high-quality realistic fallback evaluations during setup if API is not active
function getBackupScoringResult(role: string) {
  return {
    score: 68,
    breakdown: {
      impact: 55,
      formatting: 78,
      keywords: 62,
      style: 75
    },
    summary: `Note: This is a simulated high-quality critique because the Gemini API Key is loading or needs to be set up in the Secrets menu. Your resume is off to a solid start, but contains visual and structural warnings typical of job candidates in the ${role} field. Visual readability is quite clear, but achievements lack quantified metrics, and several high-priority applicant tracking system (ATS) keywords were missed.`,
    strengths: [
      "Contact information is perfectly clean and professional.",
      "Professional summary is punchy and establishes direct core capabilities.",
      "Chronological experience is sorted appropriately with clear company names."
    ],
    mistakes: [
      {
        id: "mock-mst-1",
        category: "impact",
        severity: "critical",
        title: "Weak responsibility statements without metric achievements",
        explanation: "Many bullets describe day-to-day duties instead of showcasing concrete achievements, which makes you look passive instead of proactive.",
        solutions: [
          {
            originalText: "Responsible for managing a team and doing sales support.",
            correctedText: "Spearheaded sales enablement support for a 12-person cross-functional group, boosting target achievement rates by 34% in 2 quarters.",
            explanation: "Starts with an action verb, defines scope (12-person), and provides a precise quantitative result (+34%)."
          }
        ]
      },
      {
        id: "mock-mst-2",
        category: "keywords",
        severity: "warning",
        title: "Missing high-signal industry keywords",
        explanation: "Modern ATS platforms filter resumes by keyword frequencies. Critical terms expected for this target role are currently absent.",
        solutions: [
          {
            originalText: "I know how to write programs and fix issues on systems.",
            correctedText: "Adept at systems troubleshooting, continuous integration / deployment pipelines (CI/CD), version control, and regression testing.",
            explanation: "Swaps simple colloquial phrases for specific enterprise keyword strings that ATS algorithms index highly."
          }
        ]
      },
      {
        id: "mock-mst-3",
        category: "style",
        severity: "optimization",
        title: "Use of filler jargon and buzzwords",
        explanation: "Words like 'highly passionate', 'team-player', and 'synergy' clutter resumes without introducing tangible proof of accomplishment.",
        solutions: [
          {
            originalText: "Synergized across multiple departments as a passionate team player.",
            correctedText: "Collaborated across 3 business divisions to design and consolidate shared analytical portals, reducing manual reporting hours by 15%.",
            explanation: "Replaces empty phrases with objective actions (collaborated, designed, consolidated) and adds clear value metrics."
          }
        ]
      }
    ],
    parsedInfo: {
      name: "John Doe Candidate",
      email: "candidate@domain.com",
      phone: "+1 (555) 019-2834",
      skillsFound: ["Python", "JavaScript", "Team Management", "Technical Support", "Communication"],
      skillsMissing: ["CI/CD Pipelines", "Automated Testing", "Systems Architecture", "Docker", "Agile Methodologies"]
    },
    atsKeywords: [
      { keyword: "Agile Development", found: false, importance: "high" },
      { keyword: "Vite & React", found: true, importance: "high" },
      { keyword: "CI/CD Pipeline", found: false, importance: "medium" },
      { keyword: "Cloud Operations", found: false, importance: "low" },
      { keyword: "Database Systems", found: true, importance: "high" }
    ],
    suggestedTemplates: [
      "Harvard Business Review Standard Single Column",
      "Modern Minimalist Editorial Structure"
    ]
  };
}

// Vite middleware and static asset routing
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Resume Score Tracker server is running on port ${PORT}`);
  });
}

initServer().catch(err => {
  console.error('Failed to boot fullstack server:', err);
});
