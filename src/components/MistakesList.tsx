import React, { useState } from 'react';
import { ResumeMistake, Category, Severity } from '../types';
import { FileWarning, CornerDownRight, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface MistakesListProps {
  mistakes: ResumeMistake[];
}

export default function MistakesList({ mistakes }: MistakesListProps) {
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [expandedMistakes, setExpandedMistakes] = useState<Record<string, boolean>>({});

  if (!mistakes || mistakes.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedMistakes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 text-[10px] uppercase rounded bg-rose-50 text-rose-600 border border-rose-100">Critical Mistake</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 text-[10px] uppercase rounded bg-amber-50 text-amber-600 border border-amber-100">Warning</span>;
      case 'optimization':
        return <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 text-[10px] uppercase rounded bg-sky-50 text-sky-600 border border-sky-100">Optimization</span>;
    }
  };

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case 'impact': return '⚡ Impact & Metrics';
      case 'formatting': return '📋 Formatting & Design';
      case 'keywords': return '🔍 Keyword Match';
      case 'style': return '✍️ Writing Style';
    }
  };

  const getCategoryCount = (cat: Category | 'all') => {
    if (cat === 'all') return mistakes.length;
    return mistakes.filter(m => m.category === cat).length;
  };

  const getSeverityCount = (sev: Severity | 'all') => {
    if (sev === 'all') return mistakes.length;
    return mistakes.filter(m => m.severity === sev).length;
  };

  const filteredMistakes = mistakes.filter(m => {
    const matchCat = filterCategory === 'all' || m.category === filterCategory;
    const matchSev = filterSeverity === 'all' || m.severity === filterSeverity;
    return matchCat && matchSev;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      
      {/* Header & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">
          Filter Improvements:
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Category Filter selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                filterCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ALL ({getCategoryCount('all')})
            </button>
            {(['impact', 'formatting', 'keywords', 'style'] as Category[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  filterCategory === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat.toUpperCase()} ({getCategoryCount(cat)})
              </button>
            ))}
          </div>

          {/* Severity Filter Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                filterSeverity === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ALL ({getSeverityCount('all')})
            </button>
            {(['critical', 'warning', 'optimization'] as Severity[]).map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  filterSeverity === sev ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sev.toUpperCase()} ({getSeverityCount(sev)})
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* List of analyzed Mistakes and actions */}
      <div className="space-y-4">
        {filteredMistakes.length > 0 ? (
          filteredMistakes.map((mistake, index) => {
            const isExpanded = expandedMistakes[mistake.id] !== false; // Default to expanded for immediate view!
            
            return (
              <div 
                key={mistake.id || index}
                className={`border rounded-xl transition-all overflow-hidden ${
                  mistake.severity === 'critical' 
                    ? 'border-rose-100 hover:border-rose-200 bg-rose-50/5' 
                    : mistake.severity === 'warning'
                      ? 'border-amber-100 hover:border-amber-200 bg-amber-50/5'
                      : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(mistake.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getSeverityBadge(mistake.severity)}
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {getCategoryLabel(mistake.category)}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                      {mistake.title}
                    </h3>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Collapsible content (Mistake Explanation and Side-by-Side rewritten items) */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-50 space-y-4">
                    
                    {/* Explanation */}
                    <div className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed bg-slate-50 p-3 rounded-lg">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-700 font-semibold block mb-0.5">Why this matters:</strong>
                        {mistake.explanation}
                      </div>
                    </div>

                    {/* Solutions Area */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Actionable Solutions & Corrections</h4>
                      
                      {mistake.solutions && mistake.solutions.length > 0 ? (
                        mistake.solutions.map((sol, solIdx) => (
                          <div key={solIdx} className="space-y-3 border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                            
                            {/* Original vs Correction Dual panels */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                              
                              {/* Original Segment */}
                              {sol.originalText ? (
                                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-slate-700">
                                  <span className="font-bold text-red-700 flex items-center gap-1 text-[10px] uppercase mb-1.5">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Original Resume Segment
                                  </span>
                                  <p className="font-mono text-[11px] text-red-600/90 whitespace-pre-wrap">{sol.originalText}</p>
                                </div>
                              ) : (
                                <div className="p-3 bg-red-50/20 border border-dashed border-red-100 rounded-lg text-slate-500 italic flex items-center justify-center">
                                  Structural layout correction (No text snippet)
                                </div>
                              )}

                              {/* Corrected & Re-written Segment */}
                              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg text-slate-700 relative overflow-hidden group">
                                <span className="font-bold text-emerald-800 flex items-center gap-1 text-[10px] uppercase mb-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Better Re-write / Correction
                                </span>
                                <p className="font-semibold text-emerald-900 whitespace-pre-wrap">{sol.correctedText}</p>
                                
                                {/* Quick click comparison hover effect */}
                                <div className="absolute right-2 top-2">
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 uppercase rounded">ATS Optimised</span>
                                </div>
                              </div>

                            </div>

                            {/* Why this is better */}
                            <div className="text-xs text-slate-600 flex items-center gap-2 pl-2 bg-slate-50/30 p-2.5 rounded border border-slate-100/50">
                              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <p>
                                <span className="font-bold text-indigo-900">Coach correction note: </span>
                                {sol.explanation}
                              </p>
                            </div>

                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No solution block defined. Standard correction applies.</p>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm">Great news! No mistakes match the selected filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
