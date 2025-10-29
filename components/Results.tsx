
import React from 'react';
import { Answer } from '../types';

interface ResultsProps {
  summary: string;
  allAnswers: Answer[];
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ summary, allAnswers, onRestart }) => {
  const yesCount = allAnswers.filter(ans => ans.value).length;
  const noCount = allAnswers.length - yesCount;
  
  let balanceScore = "0.0";
  if (yesCount > 0 || noCount > 0) {
    const max = Math.max(yesCount, noCount);
    if (max > 0) {
      balanceScore = ((Math.min(yesCount, noCount) / max) * 100).toFixed(1);
    }
  }

  const caseId = React.useMemo(() => Math.floor(100000 + Math.random() * 900000), []);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
      <header className="text-center mb-8 border-b-2 border-stone-900 pb-4">
        <h2 className="text-sm uppercase tracking-widest text-stone-600">Conclusion // Case File #{caseId}</h2>
        <h1 className="text-4xl font-bold">Psychometric Profile: Bob</h1>
      </header>
      
      <div className="bg-white border border-stone-300 p-6 mb-8">
        <h3 className="font-bold text-xl mb-4">Executive Summary</h3>
        <div className="prose prose-lg max-w-none text-stone-800" style={{ fontFamily: "'EB Garamond', serif" }}>
            {summary.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-center">
          <div className="border border-stone-300 p-4 bg-white">
              <p className="text-sm text-stone-500 uppercase">Affirmations</p>
              <p className="text-3xl font-bold">{yesCount}</p>
          </div>
          <div className="border border-stone-300 p-4 bg-white">
              <p className="text-sm text-stone-500 uppercase">Negations</p>
              <p className="text-3xl font-bold">{noCount}</p>
          </div>
          <div className="border border-stone-300 p-4 bg-white">
              <p className="text-sm text-stone-500 uppercase">Definitional Balance</p>
              <p className="text-3xl font-bold">{balanceScore}%</p>
          </div>
      </div>

      <footer className="flex justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-stone-900 text-white font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors duration-200"
        >
          Begin New Inquiry
        </button>
      </footer>
    </div>
  );
};

export default Results;
