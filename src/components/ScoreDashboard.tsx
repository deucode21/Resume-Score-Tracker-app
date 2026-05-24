import React from 'react';
import { ScoringResult } from '../types';
import { Award, CheckCircle, Info, User, Mail, Phone } from 'lucide-react';

interface ScoreDashboardProps {
  result: ScoringResult;
  onBack: () => void;
}

export default function ScoreDashboard({ result, onBack }: ScoreDashboardProps) {
  const { score, breakdown, summary, strengths, parsedInfo } = result;

  const getScoreColor = (val: number) => {
    if (val < 60) return { stroke: 'stroke-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
    if (val < 80) return { stroke: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { stroke: 'stroke-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
  };

  const scoreTheme = getScoreColor(score);
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ATS Evaluation Complete</span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              Resume Analysis Scorecard
            </h1>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold bg-white transition-all cursor-pointer self-start sm:self-center"
        >
          Scan Another Resume
        </button>
      </div>

      {/* Primary Score Grid layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Circle Dial */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
          
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">Overall ATS Grade</span>
          
          {/* Circular SVG Progress */}
          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={`transition-all duration-1000 ease-out ${scoreTheme.stroke}`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${scoreTheme.text}`}>{score}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">out of 100</span>
            </div>
          </div>

          <div className={`mt-6 px-4 py-2 rounded-xl text-xs font-semibold ${scoreTheme.bg} ${scoreTheme.text} border ${scoreTheme.border}`}>
            {score >= 80 ? '⭐ Strong Resume' : score >= 60 ? '⚠️ Corrections Suggested' : '🚨 High Optimization Required'}
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Resume Dimensions</h3>
            <span className="text-xs text-slate-400">ATS Match Weight</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Impact */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">⚡ Impact & Achievements</span>
                <span className={getScoreColor(breakdown.impact).text}>{breakdown.impact}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getScoreColor(breakdown.impact).stroke.replace('stroke', 'bg')}`}
                  style={{ width: `${breakdown.impact}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">How well achievements use STAR format and quantified values.</p>
            </div>

            {/* Formatting */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">📋 Formatting & Readability</span>
                <span className={getScoreColor(breakdown.formatting).text}>{breakdown.formatting}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getScoreColor(breakdown.formatting).stroke.replace('stroke', 'bg')}`}
                  style={{ width: `${breakdown.formatting}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Structural visual hierarchy and layout standards readability.</p>
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">🔍 Core Keyterms Density</span>
                <span className={getScoreColor(breakdown.keywords).text}>{breakdown.keywords}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getScoreColor(breakdown.keywords).stroke.replace('stroke', 'bg')}`}
                  style={{ width: `${breakdown.keywords}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Frequency and distribution of relevant industry skill tags.</p>
            </div>

            {/* Style */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">✍️ Style & Active Language</span>
                <span className={getScoreColor(breakdown.style).text}>{breakdown.style}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getScoreColor(breakdown.style).stroke.replace('stroke', 'bg')}`}
                  style={{ width: `${breakdown.style}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Spelling, passive voice elimination, and generic word removals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Strengths Identified */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h4 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Core Strengths Identified
          </h4>
          <div className="space-y-2">
            {strengths && strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <div key={idx} className="flex gap-2.5 bg-emerald-50/20 border border-emerald-100/20 p-3 rounded-lg text-xs leading-relaxed text-slate-700">
                  <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                  <span>{str}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No standout highlights recorded.</p>
            )}
          </div>

          {parsedInfo.skillsFound && parsedInfo.skillsFound.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Detected Skillsets</span>
              <div className="flex flex-wrap gap-1">
                {parsedInfo.skillsFound.slice(0, 12).map((skill, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parsed Contact Info Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h4 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Info className="w-4 h-4 text-indigo-500" />
            Candidate Information File
          </h4>
          
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <User className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Candidate Name</span>
                <span className="font-semibold text-slate-800">{parsedInfo.name || 'Not detected'}</span>
              </div>
            </div>
            {parsedInfo.email && parsedInfo.email !== 'Not specified' && (
              <div className="flex items-center gap-2.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Email</span>
                  <span className="font-semibold text-slate-800">{parsedInfo.email}</span>
                </div>
              </div>
            )}
            {parsedInfo.phone && parsedInfo.phone !== 'Not specified' && (
              <div className="flex items-center gap-2.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Phone</span>
                  <span className="font-semibold text-slate-800">{parsedInfo.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ATS Keyword Check & Missing Skills Tracker row */}
      {((result.atsKeywords && result.atsKeywords.length > 0) || (parsedInfo.skillsMissing && parsedInfo.skillsMissing.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ATS Keyword Scan */}
          {result.atsKeywords && result.atsKeywords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">🔍</span>
                ATS Keyword Checklist
              </h4>
              <p className="text-[11px] text-slate-500">
                Key terms targeted by Applicant Tracking Systems. Integrate missing phrases to climb candidate lists:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {result.atsKeywords.slice(0, 10).map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2 rounded-lg border text-[11px] ${
                      item.found 
                        ? 'bg-emerald-50/30 border-emerald-100 text-emerald-950' 
                        : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={item.found ? 'text-emerald-600 font-extrabold' : 'text-slate-400 font-bold'}>
                        {item.found ? '✓' : '—'}
                      </span>
                      <span className={`font-medium truncate ${!item.found ? 'text-slate-400' : ''}`}>
                        {item.keyword}
                      </span>
                    </div>
                    {item.importance === 'high' && (
                      <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded shrink-0">
                        High
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Crucial Skills & Templates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs">⚠️</span>
              Recommended Additions & Templates
            </h4>
            
            {/* Missing Skills */}
            {parsedInfo.skillsMissing && parsedInfo.skillsMissing.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Skills Omitted from Document</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedInfo.skillsMissing.slice(0, 8).map((skill, idx) => (
                    <span key={idx} className="text-[10px] font-medium px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100/50 rounded-lg">
                      + Add "{skill}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formatting templates suggested */}
            {result.suggestedTemplates && result.suggestedTemplates.length > 0 && (
              <div className="pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Recommended Formatting Frameworks</span>
                <div className="space-y-1.5">
                  {result.suggestedTemplates.slice(0, 3).map((template, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 text-xs">
                      <span className="text-xs">📋</span>
                      <span className="font-semibold text-slate-800">{template}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
