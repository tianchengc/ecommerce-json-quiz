import { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { QuestionCard } from './components/QuestionCard';
import { Results } from './components/Results';
import { LoadingSpinner } from './components/UI';
import type { QuizData, QuizAnswer, QuizResult, QuizConfiguration } from './utils/quizLogic';
import { getRecommendations, validateQuizAnswer, simulateLoading } from './utils/quizLogic';

type QuizState = 'welcome' | 'quiz' | 'loading' | 'results';
const defaultConfiguration: QuizConfiguration = {
  general: {
    showFakeLoading: true,
  },
  welcomePage: {
    title: 'Find Your Perfect Tea',
    description: 'Answer a few questions to find the best teas for you.',
    whatToExpect: 'You will answer questions about your tea preferences.\nGet personalized recommendations based on your answers.\nEnjoy discovering new teas!',
    claimer: 'This quiz is for entertainment purposes only. Results may vary.'
  },
  resultPage: {
    showPrice: true,
    loadingTitle: 'Finding Your Perfect Tea...',
    loadingDescription: 'We\'re analyzing your preferences to recommend the best teas for you.',
    noMatchesTitle: 'No Perfect Matches Found',
    noMatchesDescription: 'We couldn\'t find teas that match your specific preferences. Try adjusting your answers or explore our full collection.',
    successTitle: 'Your Perfect Tea',
    successDescription: 'Based on your preferences, we found {count} perfect tea{plural} for you.',
    bestMatchLabel: 'Best Match',
    retakeButtonText: 'Retake Quiz',
    browseAllButtonText: 'Browse All Teas',
    shopNowButtonText: 'Shop Now',
    takeAgainButtonText: 'Take Quiz Again'
  }
};

function App() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);

  // Load quiz data on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      let finalData = null;
      let usingFallback = false;

      // Helper function to try loading and parsing a JSON file
      const tryLoadJson = async (url: string): Promise<QuizData | null> => {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            console.warn(`${url} failed with status ${response.status}`);
            return null;
          }

          // Try to parse as JSON
          const data = await response.json();
          
          // Validate the data structure
          if (!data.questions || !data.results || !data.configuration) {
            console.warn(`${url} has invalid data structure`);
            return null;
          }

          return data;
        } catch (error) {
          console.warn(`Failed to load or parse ${url}:`, error);
          return null;
        }
      };

      try {
        console.log('Attempting to load quiz.json...');
        
        // First, try to load the main quiz.json
        finalData = await tryLoadJson('/quiz.json');
        
        if (!finalData) {
          console.warn('quiz.json not available, falling back to quiz_sample.json');
          
          // If main quiz.json fails, try sample
          finalData = await tryLoadJson('/quiz_sample.json');
          usingFallback = true;
          
          if (!finalData) {
            throw new Error('Both quiz.json and quiz_sample.json failed to load or are invalid');
          }
          
          console.log('Successfully loaded quiz_sample.json');
        } else {
          console.log('Successfully loaded quiz.json');
        }
        
        setQuizData(finalData);
        setIsUsingSampleData(usingFallback);
        
      } catch (error) {
        console.error('Failed to load quiz data:', error);
        
        // Provide fallback with default configuration
        console.warn('Using fallback configuration due to load failure');
        setQuizData({
          configuration: defaultConfiguration,
          questions: [
            {
              id: "fallback-q1",
              text: "Quiz configuration failed to load. Would you like to retry?",
              type: "single-select",
              options: [
                { id: "retry", text: "Refresh page to retry" },
                { id: "continue", text: "Continue with demo" }
              ]
            }
          ],
          results: [
            {
              productId: "fallback-product",
              productName: "Configuration Error",
              productImage: "",
              productDescription: "Unable to load quiz configuration. Please check your setup.",
              price: "N/A",
              shopLink: "#",
              conditions: { anyOf: ["*"] }
            }
          ]
        });
        setIsUsingSampleData(true);
      }
    };

    loadQuizData();
  }, []);

  useEffect(() => {
    if (isUsingSampleData) {
      console.log('Using sample data for quiz: ', isUsingSampleData);
    }
  }, [isUsingSampleData]);

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
      
      // Simulate loading time if enabled
      if (quizData.configuration?.general?.showFakeLoading) {
        await simulateLoading(2000);
      }
      
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
      <div className="quiz-container min-h-screen flex items-center justify-center p-4 sm:p-6">
        <LoadingSpinner message="Loading quiz..." />
      </div>
    );
  }

  return (
    <div className="quiz-container min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      
      {quizState === 'welcome' && quizData && (
        <Welcome 
          onStart={handleStartQuiz} 
          configuration={quizData.configuration.welcomePage}
        />
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
          configuration={quizData.configuration.resultPage || defaultConfiguration}
          onRestart={handleRestartQuiz} 
          loading={false}
        />
      )}
    </div>
  );
}

export default App;
