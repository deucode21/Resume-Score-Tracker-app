import React, { useState, useRef } from 'react';
import { Upload, FileText, Chrome, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ResumeUploadProps {
  onAnalyze: (payload: { text: string; file?: { mimeType: string; data: string; name: string } }) => void;
  isLoading: boolean;
}

export default function ResumeUpload({ onAnalyze, isLoading }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [pasteText, setPasteText] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Convert to base64 for Gemini
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setFileBase64(base64Data);
    };
    reader.onerror = (error) => {
      console.error('Error converting file to base64:', error);
    };
    reader.readAsDataURL(selectedFile);

    // If it's plain text, load it into paste text
    if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = () => {
        setPasteText(textReader.result as string);
      };
      textReader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'file' && !file) {
      alert('Please upload a resume file first.');
      return;
    }
    if (uploadMode === 'text' && !pasteText.trim()) {
      alert('Please paste your resume text content first.');
      return;
    }

    const payload: {
      text: string;
      file?: { mimeType: string; data: string; name: string };
    } = {
      text: pasteText,
    };

    if (uploadMode === 'file' && file && fileBase64) {
      payload.file = {
        name: file.name,
        mimeType: file.type || 'application/pdf',
        data: fileBase64,
      };
    }

    onAnalyze(payload);
  };

  const clearFile = () => {
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Upload or Paste Resume Content
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {uploadMode === 'file' 
                  ? 'Drop your PDF, Image (PNG/JPG), or Plain Text. Gemini AI automatically parses and scores.' 
                  : 'Paste your raw resume text below to detect critical mistakes and read solutions.'
                }
              </p>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-center">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${uploadMode === 'file' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${uploadMode === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <div className="mt-6">
            {uploadMode === 'file' ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`group relative border-2 border-dashed rounded-xl p-10 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/20 scale-[0.99]' 
                    : file 
                      ? 'border-emerald-500 bg-emerald-50/10' 
                      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
                onClick={!file ? onButtonClick : undefined}
                id="dropzone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg,.txt"
                />

                {!file ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Drag & drop your resume file, or <span className="text-indigo-600 hover:underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG, and TXT formats</p>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Ready to grade</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 hover:border-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  placeholder="Paste the full plain text content of your resume here to pinpoint grammar, style, or metric achievements mistakes..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={10}
                  className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 bg-slate-50/10"
                  required={uploadMode === 'text'}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <span className="text-[11px] text-slate-500">
                    💡 No document handy? Instantly load a mock resume with common formatting & metric mistakes to evaluate.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasteText(`NAME: John Doe
EMAIL: john.doe@email.com
PHONE: (555) 019-2834

OBJECTIVE:
Hardworking web developer with 3 years of experience looking for a challenging role in an elite company to grow my IT skills.

EXPERIENCE:
Software Developer at Acme Web Corp (2023 - Present)
- Responsible for writing frontend code under strict instructions.
- Worked on fixing bugs in the legacy portal.
- Helped backend developers with basic database updates.
- Attended weekly status meetings to report project standings.

Junior Webmaster at Spark Logistics (2021 - 2023)
- Assisted other programmers with daily programming tasks.
- Configured visual parameters on websites.
- Drafted generic internal testing documentation.`);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0 py-1 px-2.5 bg-white border border-indigo-100 hover:border-indigo-200 rounded shadow-xs"
                  >
                    ✨ Load Practice Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full md:w-auto px-8 py-3.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all inline-flex items-center justify-center gap-2 group cursor-pointer ${
              isLoading ? 'opacity-85 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Evaluating Mistakes & Score...</span>
              </>
            ) : (
              <>
                <span>Grade and Find Resume Mistakes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Info */}
      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Secured Sandbox Parsing</span>
        </div>
        <div className="flex items-center gap-2">
          <Chrome className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Real-time ATS benchmarking</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Actionable rewrites & solutions</span>
        </div>
      </div>
    </div>
  );
}
