
import React, { useState, useCallback, useMemo } from 'react';
import { PART_1_QUESTIONS } from './constants';
import { generateQuestions, generateSummary } from './services/geminiService';
import { Answer } from './types';
import QuizPart from './components/QuizPart';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';

type AppState = 'intro' | 'quiz' | 'loading' | 'results' | 'error';

const getRandomQuestions = (questions: string[], count: number): string[] => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const Disclaimer: React.FC<{ onAgree: () => void }> = ({ onAgree }) => (
  <div className="fixed inset-0 bg-stone-200 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-stone-50 p-8 max-w-lg w-full border-2 border-stone-900 text-stone-900">
      <h2 className="text-base font-bold uppercase tracking-wider mb-4">Official Notice</h2>
      <div className="space-y-4 text-base">
        <p>
          This standardized instrument is designed to evaluate the metaphysical parameters of the entity herein referred to as “Bob.”
        </p>
        <p>
          Please respond to each statement as accurately as possible. Your cooperation ensures the continued stability of Bob’s ontological classification within recognized reality frameworks.
        </p>
      </div>
      <button
        onClick={onAgree}
        className="w-full mt-6 px-8 py-3 bg-stone-900 text-white font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors duration-200"
      >
        Acknowledge & Proceed
      </button>
    </div>
  </div>
);


const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center p-8 max-w-2xl mx-auto">
    <header className="mb-8 border-b-2 border-stone-900 pb-4">
      <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Institute for Ontological Inquiry</p>
      <h2 className="text-sm uppercase tracking-widest text-stone-600">Project B-08 // Psychometric Inquiry</h2>
      <h1 className="text-5xl md:text-7xl font-bold">Define Bob</h1>
    </header>
    <p className="text-lg text-stone-700 mb-6">
      This assessment is an experimental inquiry into the nature of a conceptual entity designated "Bob". 
      Your responses will construct a unique psychological profile. There are no right or wrong answers, only your subjective truth.
    </p>
    <p className="text-base text-stone-500 mb-10">
      The procedure consists of three parts, each with five questions. The initial baseline inquiry will be followed by two adaptive, AI-generated question sets designed to probe the emergent characteristics of your construct.
    </p>
    <button
      onClick={onStart}
      className="px-12 py-4 bg-stone-900 text-white font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors duration-200"
    >
      Begin Assessment
    </button>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('intro');
  const [quizPart, setQuizPart] = useState<number>(1);
  const [questions, setQuestions] = useState<string[]>(() => getRandomQuestions(PART_1_QUESTIONS, 5));
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);


  const resetState = () => {
    setAppState('intro');
    setQuizPart(1);
    setQuestions(getRandomQuestions(PART_1_QUESTIONS, 5));
    setAllAnswers([]);
    setSummary('');
    setError(null);
  };

  const handlePartComplete = useCallback(async (currentPartAnswers: Answer[]) => {
    const updatedAnswers = [...allAnswers, ...currentPartAnswers];
    setAllAnswers(updatedAnswers);
    setAppState('loading');
    setError(null);

    try {
      if (quizPart < 3) {
        const nextQuestions = await generateQuestions(updatedAnswers);
        setQuestions(nextQuestions);
        setQuizPart(prev => prev + 1);
        setAppState('quiz');
      } else {
        const finalSummary = await generateSummary(updatedAnswers);
        setSummary(finalSummary);
        setAppState('results');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
      setAppState('error');
    }
  }, [quizPart, allAnswers]);

  const loadingMessage = useMemo(() => {
    if (quizPart < 3) {
      return `ANALYZING RESPONSES... GENERATING PART ${quizPart + 1}`;
    }
    return 'COMPILING FINAL PSYCHOMETRIC PROFILE...';
  }, [quizPart]);

  const renderContent = () => {
    switch (appState) {
      case 'intro':
        return <IntroScreen onStart={() => setAppState('quiz')} />;
      case 'quiz':
        return (
          <QuizPart
            questions={questions}
            partNumber={quizPart}
            onComplete={handlePartComplete}
          />
        );
      case 'loading':
        return <LoadingSpinner message={loadingMessage} />;
      case 'results':
        return <Results summary={summary} allAnswers={allAnswers} onRestart={resetState} />;
      case 'error':
        return (
          <div className="text-center p-8 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-red-700 mb-4">SYSTEM ERROR</h2>
            <p className="text-stone-700 mb-6">{error}</p>
            <button
              onClick={resetState}
              className="px-8 py-3 bg-stone-900 text-white font-bold tracking-wider uppercase"
            >
              Restart Inquiry
            </button>
          </div>
        );
      default:
        return <IntroScreen onStart={() => setAppState('quiz')} />;
    }
  };

  return (
    <>
      {showDisclaimer && <Disclaimer onAgree={() => setShowDisclaimer(false)} />}
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        {renderContent()}
      </main>
    </>
  );
};

export default App;
