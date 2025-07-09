import React from 'react';
import type { QuizQuestion } from '../utils/quizLogic';
import { Card, Button, ProgressBar } from './UI';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptions,
  onOptionSelect,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canGoNext,
  canGoPrevious
}) => {
  const handleOptionClick = (optionId: string) => {
    if (question.type === 'single-select') {
      // For single select, replace the selection
      onOptionSelect(optionId);
    } else {
      // For multi-select, toggle the selection
      onOptionSelect(optionId);
    }
  };

  const isOptionSelected = (optionId: string) => {
    return selectedOptions.includes(optionId);
  };

  return (
    <Card className="question-card max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <ProgressBar current={currentQuestion} total={totalQuestions} className="mb-6" />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {question.text}
        </h2>
        {question.type === 'multi-select' && (
          <p className="text-sm text-gray-600 mb-4">
            Select all that apply
          </p>
        )}
      </div>

      <div className="space-y-3 mb-8">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`option-button ${
              isOptionSelected(option.id) ? 'selected' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {question.type === 'single-select' ? (
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isOptionSelected(option.id) 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(option.id) && (
                      <div className="w-2 h-2 gray rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                ) : (
                  <div className={`w-4 h-4 rounded border-2 ${
                    isOptionSelected(option.id) 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(option.id) && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              <span className="text-left font-medium text-gray-900">
                {option.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="px-6 py-3"
        >
          Previous
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-8 py-3"
        >
          {currentQuestion === totalQuestions ? 'Get Results' : 'Next'}
        </Button>
      </div>
    </Card>
  );
};
