
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
  const questionId = `q-${questionNumber}`;
  return (
    <div className="py-4 border-b border-stone-300">
      <p className="text-stone-500 text-xs uppercase tracking-wider mb-2">
        Question {String(questionNumber).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
      </p>
      <div className="flex items-start gap-4 md:gap-6">
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name={questionId}
              checked={value === true}
              onChange={() => onAnswer(true)}
              className="w-4 h-4 cursor-pointer"
            />
            Yes
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name={questionId}
              checked={value === false}
              onChange={() => onAnswer(false)}
              className="w-4 h-4 cursor-pointer"
            />
            No
          </label>
        </div>
        <p className="text-base text-stone-900 flex-1">{question}</p>
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
        <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Institute for Ontological Inquiry</p>
        <h2 className="text-sm uppercase tracking-widest text-stone-600">Part {String(partNumber).padStart(2, '0')}</h2>
        <h1 className="text-4xl font-bold">{partTitles[partNumber] || `Inquiry ${partNumber}`}</h1>
      </header>
      
      <div className="space-y-2">
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
