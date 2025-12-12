import React, { useState } from 'react';
import { AuditResult } from '../types';
import { AlertTriangle, Search, Wrench, CheckCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AuditTabsProps {
  results: AuditResult;
}

const AuditTabs: React.FC<AuditTabsProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<'anomaly' | 'rootCause' | 'fix'>('anomaly');

  const tabs = [
    { id: 'anomaly', label: 'Anomaly Detection', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500' },
    { id: 'rootCause', label: 'Root Cause Analysis', icon: Search, color: 'text-blue-500', bg: 'bg-blue-500' },
    { id: 'fix', label: 'Prescribed Fix', icon: Wrench, color: 'text-green-500', bg: 'bg-green-500' },
  ] as const;

  const getContent = () => {
    switch (activeTab) {
      case 'anomaly': return results.anomalyDetection;
      case 'rootCause': return results.rootCauseAnalysis;
      case 'fix': return results.prescribedFix;
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-full">
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 relative
                        ${isActive ? 'text-slate-900 bg-white' : 'text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700'}
                    `}
                >
                    <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                    {tab.label}
                    {isActive && (
                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.bg}`} />
                    )}
                </button>
            )
        })}
      </div>
      <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white">
        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-600">
          <ReactMarkdown>
            {getContent()}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default AuditTabs;
