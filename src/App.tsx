import React, { useState } from 'react';
import { ScoringResult } from './types';
import ResumeUpload from './components/ResumeUpload';
import ScoreDashboard from './components/ScoreDashboard';
import MistakesList from './components/MistakesList';
import { FileText, AlertCircle, RefreshCw, Star, Info } from 'lucide-react';

export default function App() {
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyzeResume = async (payload: { 
    text: string; 
    file?: { mimeType: string; data: string; name: string }; 
  }) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Since target role is removed, we send standard payloads
      const finalPayload = {
        ...payload,
        role: "",
        description: ""
      };

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload)
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}: Analysis failed.`);
      }

      const data: ScoringResult = await response.json();
      
      if (data && typeof data.score === 'number') {
        setResult(data);
      } else {
        throw new Error('Analysis response formatting issue. Please submit again.');
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setErrorMsg(err.message || 'Server error occurred while scoring the resume. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block">Resume Score Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        
        {/* Error Panel */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-3 items-start shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="space-y-1">
              <strong className="font-bold">Error grading resume:</strong>
              <p>{errorMsg}</p>
              <button 
                onClick={handleReset} 
                className="mt-2 text-rose-800 font-bold underline hover:text-rose-950 block"
              >
                Clear Error and Retry
              </button>
            </div>
          </div>
        )}

        {/* Dynamic State Views */}
        {!result ? (
          <div className="space-y-6">
            {/* Simplistic uploader */}
            <ResumeUpload onAnalyze={handleAnalyzeResume} isLoading={isLoading} />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Scoreboard block */}
            <ScoreDashboard 
              result={result} 
              onBack={handleReset} 
            />

            {/* Detailed list of Mistakes and Actionable Solution Rewrites */}
            <MistakesList mistakes={result.mistakes || []} />

            {/* End recommendation Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center space-y-4 shadow-lg">
              <Star className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <div className="space-y-1.5">
                <h3 className="text-base font-bold">Ready to apply with your revisions?</h3>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  Copy down the recommended re-writes and corrected segments to optimize your resume, beat the ATS scanners, and standout during hiring reviews.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Grade Another Resume
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-4xl mx-auto px-4">
          <p>© 2026 Resume Score Tracker</p>
        </div>
      </footer>
    </div>
  );
}
