import React, { useState } from 'react';
import { Activity, BrainCircuit, Play, FileText, Settings, Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AuditTabs from './components/AuditTabs';
import { runMultiModalAudit } from './services/geminiService';
import { AppStatus, AuditResult } from './types';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [logData, setLogData] = useState<string>('');
  const [diagnosticGoal, setDiagnosticGoal] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAudit = async () => {
    if (!videoFile && !logData && !blueprintFile) {
        setErrorMsg("Please provide at least one input (Video, Logs, or Blueprint) to run the audit.");
        return;
    }
    
    setErrorMsg(null);
    setStatus(AppStatus.ANALYZING);

    try {
      const auditResults = await runMultiModalAudit(videoFile, logData, blueprintFile, diagnosticGoal);
      setResults(auditResults);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred during the audit.");
    }
  };

  const isAnalyzing = status === AppStatus.ANALYZING;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Proactive Manufacturing Auditor</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Gemini 2.5 Multi-Modal Powered</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
                <Activity className="w-4 h-4 text-green-500" />
                <span>System Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                Audit Configuration
              </h2>
              
              <div className="space-y-6">
                {/* 1. Video Upload */}
                <FileUpload 
                  label="1. Machine Video Feed" 
                  accept=".mp4,.mov,.webm" 
                  icon="video"
                  file={videoFile}
                  setFile={setVideoFile}
                />

                {/* 2. Log Data */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    2. Sensor / Log Data
                  </label>
                  <div className="relative">
                    <textarea
                      value={logData}
                      onChange={(e) => setLogData(e.target.value)}
                      placeholder="Paste unstructured log data, error codes, or vibration readings here..."
                      className="w-full h-32 rounded-xl border-slate-300 bg-slate-50 p-3 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none shadow-inner"
                    />
                    <FileText className="absolute top-3 right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Blueprint Upload */}
                <FileUpload 
                  label="3. Machine Blueprint / Schematic" 
                  accept=".png,.jpg,.jpeg,.webp" 
                  icon="image"
                  file={blueprintFile}
                  setFile={setBlueprintFile}
                />

                {/* 4. Diagnostic Goal */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Diagnostic Goal (Vibe Code)
                    </label>
                    <input 
                        type="text"
                        value={diagnosticGoal}
                        onChange={(e) => setDiagnosticGoal(e.target.value)}
                        placeholder="e.g. 'Identify cause of spindle rattling at 3000 RPM'"
                        className="w-full rounded-xl border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRunAudit}
              disabled={isAnalyzing}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2
                ${isAnalyzing 
                    ? 'bg-slate-800 cursor-not-allowed opacity-80' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Multi-Modal Analysis...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Run Multi-Modal Audit
                </>
              )}
            </button>

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                </div>
            )}
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
             {results ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Audit Results</h2>
                        <span className="text-xs font-mono text-slate-400">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <AuditTabs results={results} />
                </div>
             ) : (
                <div className="h-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    {isAnalyzing ? (
                         <div className="flex flex-col items-center max-w-sm">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Analyzing Inputs</h3>
                            <p className="text-sm">Gemini is processing your video frames, analyzing log patterns, and cross-referencing with the blueprint...</p>
                         </div>
                    ) : (
                        <div className="max-w-sm">
                            <div className="bg-slate-50 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <Activity className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Ready to Audit</h3>
                            <p className="text-sm">Upload machine data on the left to generate a comprehensive AI-driven diagnostic report.</p>
                        </div>
                    )}
                </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
