import { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { QuestionCard } from './components/QuestionCard';
import { Results } from './components/Results';
import { LoadingSpinner } from './components/UI';
import type { QuizData, QuizAnswer, QuizResult } from './utils/quizLogic';
import { getRecommendations, validateQuizAnswer, simulateLoading } from './utils/quizLogic';

type QuizState = 'welcome' | 'quiz' | 'loading' | 'results';

function App() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Load quiz data on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const response = await fetch('/quiz.json');
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      }
    };

    loadQuizData();
  }, []);

  const handleStartQuiz = () => {
    setQuizState('quiz');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResults([]);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const existingAnswerIndex = answers.findIndex(
      answer => answer.questionId === currentQuestion.id
    );

    if (currentQuestion.type === 'single-select') {
      // Replace the answer for single-select questions
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        selectedOptions: [optionId]
      };

      if (existingAnswerIndex >= 0) {
        const newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = newAnswer;
        setAnswers(newAnswers);
      } else {
        setAnswers([...answers, newAnswer]);
      }
    } else {
      // Toggle options for multi-select questions
      if (existingAnswerIndex >= 0) {
        const existingAnswer = answers[existingAnswerIndex];
        const isOptionSelected = existingAnswer.selectedOptions.includes(optionId);
        
        let newSelectedOptions;
        if (isOptionSelected) {
          newSelectedOptions = existingAnswer.selectedOptions.filter(id => id !== optionId);
        } else {
          newSelectedOptions = [...existingAnswer.selectedOptions, optionId];
        }

        const newAnswer: QuizAnswer = {
          questionId: currentQuestion.id,
          selectedOptions: newSelectedOptions
        };

        const newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = newAnswer;
        setAnswers(newAnswers);
      } else {
        const newAnswer: QuizAnswer = {
          questionId: currentQuestion.id,
          selectedOptions: [optionId]
        };
        setAnswers([...answers, newAnswer]);
      }
    }
  };

  const handleNextQuestion = async () => {
    if (!quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const currentAnswer = answers.find(
      answer => answer.questionId === currentQuestion.id
    );

    if (!currentAnswer || !validateQuizAnswer(currentAnswer, currentQuestion)) {
      alert('Please select an answer before proceeding.');
      return;
    }

    if (currentQuestionIndex === quizData.questions.length - 1) {
      // Quiz complete, show results
      setQuizState('loading');
      setLoading(true);
      
      // Simulate loading time
      await simulateLoading(2000);
      
      const recommendations = getRecommendations(quizData, answers, 6);
      setResults(recommendations);
      setQuizState('results');
      setLoading(false);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestartQuiz = () => {
    setQuizState('welcome');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResults([]);
  };

  const getCurrentAnswerOptions = (): string[] => {
    if (!quizData) return [];
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const currentAnswer = answers.find(
      answer => answer.questionId === currentQuestion.id
    );
    
    return currentAnswer?.selectedOptions || [];
  };

  const canGoNext = (): boolean => {
    if (!quizData) return false;
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const currentAnswer = answers.find(
      answer => answer.questionId === currentQuestion.id
    );
    
    return currentAnswer ? validateQuizAnswer(currentAnswer, currentQuestion) : false;
  };

  const canGoPrevious = (): boolean => {
    return currentQuestionIndex > 0;
  };

  // Show loading spinner while quiz data is being loaded
  if (!quizData) {
    return (
      <div className="quiz-container min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading quiz..." />
      </div>
    );
  }

  return (
    <div className="quiz-container min-h-screen flex items-center justify-center bg-gray-50">
      {quizState === 'welcome' && (
        <Welcome onStart={handleStartQuiz} />
      )}
      
      {quizState === 'quiz' && (
        <QuestionCard
          question={quizData.questions[currentQuestionIndex]}
          selectedOptions={getCurrentAnswerOptions()}
          onOptionSelect={handleOptionSelect}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={quizData.questions.length}
          canGoNext={canGoNext()}
          canGoPrevious={canGoPrevious()}
        />
      )}
      
      {quizState === 'loading' && (
        <Results 
          results={results} 
          onRestart={handleRestartQuiz} 
          loading={loading}
        />
      )}
      
      {quizState === 'results' && (
        <Results 
          results={results} 
          onRestart={handleRestartQuiz} 
          loading={false}
        />
      )}
    </div>
  );
}

export default App;
