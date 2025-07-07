import React from 'react';
import { Card, Button } from './UI';

interface WelcomeConfiguration {
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeWhatToExpect: string;
  welcomeClaimer: string;
}

interface WelcomeProps {
  onStart: () => void;
  configuration: WelcomeConfiguration;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart, configuration }) => {
  // Parse the welcomeWhatToExpect string into an array of lines
  const expectationLines = configuration.welcomeWhatToExpect.split('\n').filter((line: string) => line.trim());

  return (
    <Card className="max-w-2xl mx-auto text-center">
      <div className="py-8">
        <div className="text-8xl mb-6">🍵</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {configuration.welcomeTitle}
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {configuration.welcomeDescription}
        </p>
        
        <div className="bg-tea-50 border border-tea-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-tea-800 mb-3">
            What to expect:
          </h2>
          <ul className="text-left text-tea-700 space-y-2">
            {expectationLines.map((line: string, index: number) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-tea-500 rounded-full mr-3"></span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="px-12 py-4 text-lg font-semibold"
        >
          Start Quiz
        </Button>
        
        <p className="text-sm text-gray-500 mt-6">
          {configuration.welcomeClaimer}
        </p>
      </div>
    </Card>
  );
};
