
import React, { useState, useCallback, useMemo } from 'react';
import { PART_1_QUESTIONS } from './constants';
import { generateQuestions, generateSummary } from './services/geminiService';
import { Answer } from './types';
import QuizPart from './components/QuizPart';
import Results from './components/Results';
import LoadingSpinner from './components/LoadingSpinner';

type AppState = 'intro' | 'quiz' | 'loading' | 'results' | 'error';

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center p-8 max-w-2xl mx-auto">
    <header className="mb-8 border-b-2 border-stone-900 pb-4">
      <h2 className="text-sm uppercase tracking-widest text-stone-600">Project B-08 // Psychometric Inquiry</h2>
      <h1 className="text-5xl md:text-7xl font-bold">Define Bob</h1>
    </header>
    <p className="text-xl text-stone-700 mb-6">
      This assessment is an experimental inquiry into the nature of a conceptual entity designated "Bob". 
      Your responses will construct a unique psychological profile. There are no right or wrong answers, only your subjective truth.
    </p>
    <p className="text-stone-500 mb-10">
      The procedure consists of three parts. The initial baseline inquiry will be followed by two adaptive, AI-generated question sets designed to probe the emergent characteristics of your construct.
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
  const [questions, setQuestions] = useState<string[]>(PART_1_QUESTIONS);
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setAppState('intro');
    setQuizPart(1);
    setQuestions(PART_1_QUESTIONS);
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
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      {renderContent()}
    </main>
  );
};

export default App;
