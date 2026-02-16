'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/UI';
import { useConfig } from '@/lib/ConfigContext';

interface Question {
  id: string;
  text: string;
  type: 'single-select' | 'multi-select';
  options: Array<{
    id: string;
    text: string;
  }>;
}

interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export default function QuizPage() {
  const { config, locale } = useConfig();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load questions from config context
    setQuestions(config.questions || []);
    setLoading(false);
  }, [config]);

  const handleOptionSelect = (optionId: string) => {
    if (questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    const existingAnswerIndex = answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id
    );

    if (currentQuestion.type === 'single-select') {
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        selectedOptions: [optionId],
      };

      if (existingAnswerIndex >= 0) {
        const newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = newAnswer;
        setAnswers(newAnswers);
      } else {
        setAnswers([...answers, newAnswer]);
      }
    } else {
      if (existingAnswerIndex >= 0) {
        const existingAnswer = answers[existingAnswerIndex];
        const isOptionSelected = existingAnswer.selectedOptions.includes(optionId);

        let newSelectedOptions;
        if (isOptionSelected) {
          newSelectedOptions = existingAnswer.selectedOptions.filter((id) => id !== optionId);
        } else {
          newSelectedOptions = [...existingAnswer.selectedOptions, optionId];
        }

        const newAnswer: QuizAnswer = {
          questionId: currentQuestion.id,
          selectedOptions: newSelectedOptions,
        };

        const newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = newAnswer;
        setAnswers(newAnswers);
      } else {
        const newAnswer: QuizAnswer = {
          questionId: currentQuestion.id,
          selectedOptions: [optionId],
        };
        setAnswers([...answers, newAnswer]);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz complete - navigate to results
      const answersParam = encodeURIComponent(JSON.stringify(answers));
      router.push(`/${locale}/results?answers=${answersParam}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getCurrentAnswerOptions = (): string[] => {
    if (questions.length === 0) return [];

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find((answer) => answer.questionId === currentQuestion.id);

    return currentAnswer?.selectedOptions || [];
  };

  const canGoNext = (): boolean => {
    if (questions.length === 0) return false;

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find((answer) => answer.questionId === currentQuestion.id);

    return currentAnswer ? currentAnswer.selectedOptions.length > 0 : false;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner message={locale === 'fr' ? 'Chargement...' : 'Loading...'} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {locale === 'fr' ? 'Aucune question trouvée' : 'No Questions Found'}
          </h1>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Retour' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptions = getCurrentAnswerOptions();
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Container with scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>
                {locale === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} {locale === 'fr' ? 'sur' : 'of'} {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              {currentQuestion.text}
            </h2>

            {/* Multi-select Hint */}
            {currentQuestion.type === 'multi-select' && (
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                {locale === 'fr' ? 'Sélectionnez toutes les réponses qui s\'appliquent' : 'Select all that apply'}
              </p>
            )}

            {/* Options */}
            <div className="space-y-2 mb-4 sm:mb-6">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-colors duration-200 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm sm:text-base text-gray-800">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                }`}
              >
                {locale === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className={`px-5 sm:px-6 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  canGoNext()
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === questions.length - 1
                  ? locale === 'fr'
                    ? 'Voir les résultats'
                    : 'See Results'
                  : locale === 'fr'
                  ? 'Suivant'
                  : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
