
import React, { useState, useMemo } from 'react';
import { Answer } from '../types';

interface QuestionProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  value: boolean | undefined;
  onAnswer: (value: boolean) => void;
}

const Question: React.FC<QuestionProps> = ({ question, questionNumber, totalQuestions, value, onAnswer }) => {
  return (
    <div className="py-6 border-b border-stone-300">
      <p className="text-stone-500 text-sm mb-2">
        QUESTION {String(questionNumber).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
      </p>
      <p className="text-xl mb-4 text-stone-800">{question}</p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onAnswer(false)}
          className={`px-10 py-3 text-lg border-2 font-bold transition-colors duration-150 w-full md:w-auto ${
            value === false
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-transparent text-stone-700 border-stone-400 hover:bg-stone-200 hover:border-stone-700'
          }`}
        >
          No
        </button>
        <button
          onClick={() => onAnswer(true)}
          className={`px-10 py-3 text-lg border-2 font-bold transition-colors duration-150 w-full md:w-auto ${
            value === true
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-transparent text-stone-700 border-stone-400 hover:bg-stone-200 hover:border-stone-700'
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

interface QuizPartProps {
  questions: string[];
  partNumber: number;
  onComplete: (answers: Answer[]) => void;
}

const QuizPart: React.FC<QuizPartProps> = ({ questions, partNumber, onComplete }) => {
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, boolean>>({});

  const handleAnswer = (questionIndex: number, value: boolean) => {
    setCurrentAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const allAnswered = useMemo(() => {
    return Object.keys(currentAnswers).length === questions.length;
  }, [currentAnswers, questions.length]);

  const handleSubmit = () => {
    if (!allAnswered) return;
    const formattedAnswers: Answer[] = questions.map((q, i) => ({
      question: q,
      value: currentAnswers[i],
    }));
    onComplete(formattedAnswers);
  };

  const partTitles: { [key: number]: string } = {
    1: "Foundational Analysis",
    2: "Abstract Inquiry",
    3: "Metaphysical Examination"
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
      <header className="text-center mb-8 border-b-2 border-stone-900 pb-4">
        <h2 className="text-sm uppercase tracking-widest text-stone-600">Part {String(partNumber).padStart(2, '0')}</h2>
        <h1 className="text-4xl font-bold">{partTitles[partNumber] || `Inquiry ${partNumber}`}</h1>
      </header>
      
      <div className="space-y-4">
        {questions.map((q, index) => (
          <Question
            key={index}
            question={q}
            questionNumber={index + 1}
            totalQuestions={questions.length}
            value={currentAnswers[index]}
            onAnswer={(value) => handleAnswer(index, value)}
          />
        ))}
      </div>

      <footer className="mt-10 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="px-8 py-3 bg-stone-900 text-white font-bold tracking-wider uppercase disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {partNumber < 3 ? 'Continue Analysis' : 'Finalize Profile'}
        </button>
      </footer>
    </div>
  );
};

export default QuizPart;
