import React from 'react';
import { ArrowLeftIcon } from './Icons';

interface VO2MaxViewProps {
  onBack: () => void;
  onContinue: () => void;
}

const VO2MaxView: React.FC<VO2MaxViewProps> = ({ onBack, onContinue }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col p-4 animate-fade-in">
      <header className="flex items-center mb-8 w-full max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all duration-300 transform hover:scale-105"
          aria-label="Go back to workout selection"
        >
          <ArrowLeftIcon />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-cyan-400 text-center flex-grow -ml-16 sm:ml-0">
          VO₂ Max Training
        </h1>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto flex flex-col justify-center">
        <div className="p-8 bg-gray-800 rounded-xl shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">VO₂ Max Protocol</h2>
          <p className="text-lg text-gray-300">
            You will be doing 30-45 seconds at 100% max effort, then taking up to 4 minutes to fully recover.
          </p>
          <p className="text-lg text-gray-300 font-semibold text-amber-400">
            Take the full recovery time, as you really want to push the 100% max effort on each interval.
          </p>
          <p className="text-lg text-gray-300">
            You will need a 10 minute active warm up. If you plan to run, start by walking for 10 minutes. If you plan to bike, start with a very light ride for 10 minutes.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
          >
            Continue
          </button>
        </div>
      </main>

      <footer className="text-center p-4 text-gray-500 text-sm mt-8">
            <p>Push your limits. Safely.</p>
      </footer>
    </div>
  );
};

export default VO2MaxView;