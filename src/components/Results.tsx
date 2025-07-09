import React from 'react';
import type { QuizConfiguration, QuizResult } from '../utils/quizLogic';
import { Card, Button } from './UI';

interface ResultsProps {
  results: QuizResult[];
  onRestart: () => void;
  loading?: boolean;
  configuration?: QuizConfiguration;
}

export const Results: React.FC<ResultsProps> = ({ 
  results, 
  onRestart, 
  loading = false,
  configuration 
}) => {

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <div className="py-8 sm:py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Finding Your Perfect Tea...
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            We're analyzing your preferences to recommend the best teas for you.
          </p>
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <div className="py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-4">🍵</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            No Perfect Matches Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            We couldn't find teas that match your specific preferences. 
            Try adjusting your answers or explore our full collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button onClick={onRestart} className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              Retake Quiz
            </Button>
            <Button variant="outline" className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              Browse All Teas
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your Perfect Tea {results.length > 1 ? 'Matches' : 'Match'}!
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Based on your preferences, we found {results.length} perfect tea{results.length > 1 ? 's' : ''} for you.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6 sm:mb-8">
        {results.map((result, index) => (
          <Card key={result.productId} className="group hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-square mb-3 sm:mb-4 overflow-hidden rounded-xl bg-gray-100">
              {result.productImage ? (
                <img 
                  src={result.productImage} 
                  alt={result.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl">
                  🍵
                </div>
              )}
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {result.productName}
                </h3>
                {index === 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
                    Best Match
                  </span>
                )}
              </div>
              
              {result.productDescription && (
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {result.productDescription}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-3 sm:pt-4">
                {result.price && configuration?.showPrice && (
                  <span className="text-xl sm:text-2xl font-bold text-primary-600">
                    {result.price}
                  </span>
                )}
                <Button
                  onClick={() => {
                    if (result.shopLink && result.shopLink !== '#') {
                      window.open(result.shopLink, '_blank');
                    }
                  }}
                  className="px-4 sm:px-6 py-2 text-xs sm:text-sm"
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={onRestart}
          className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
        >
          Take Quiz Again
        </Button>
      </div>
    </div>
  );
};
