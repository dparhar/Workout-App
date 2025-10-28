import React, { useState } from 'react';
import type { View, Exercise } from '../types';
import { exerciseConfigs } from '../types';
import { ElephantIcon } from './Icons';
import Stopwatch from './Stopwatch';

interface StrengthTestViewProps {
  addReps: (count: number, isTest: boolean) => void;
  setView: (view: View) => void;
  startProgram: (maxCount: number) => void;
  exercise: Exercise;
}

const StrengthTestView: React.FC<StrengthTestViewProps> = ({ addReps, setView, startProgram, exercise }) => {
  const [maxCount, setMaxCount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const config = exerciseConfigs[exercise];

  const handleTestSubmit = (value: number) => {
    if (value > 0) {
      addReps(value, true);
      startProgram(value);
      setMaxCount(String(value));
      setSubmitted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(maxCount, 10);
    handleTestSubmit(numCount);
  };

  if (submitted) {
    const numCount = parseInt(maxCount, 10);
    const weeklyGoal = Math.floor(numCount * 4.5);
    const dailyAvg = Math.floor(weeklyGoal / 7);
    const workoutTotal = Math.floor(weeklyGoal / 3);
    const setsReps = Math.floor(workoutTotal / 3);
    
    const unitText = config.unit;
    const unitTextShort = config.unit === 'reps' ? 'reps' : 'sec';

    return (
      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl text-center animate-fade-in">
        <ElephantIcon className="w-40 h-40 mx-auto mb-6 rounded-full" />
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">Great job! Program Started!</h2>
        <div className="text-left text-lg text-gray-300 mb-8 space-y-4 bg-gray-700 p-6 rounded-lg">
           <p>Your new weekly goal is <strong className="text-cyan-400 text-2xl">{weeklyGoal}</strong> {unitText}.</p>
           <p className="text-gray-400">You can complete this however you like through the week. Here are some examples:</p>
           <ul className="list-disc list-inside text-gray-400 pl-2">
                <li>Do approximately <strong className="text-white">{dailyAvg}</strong> {unitText} every day.</li>
                <li>Do 3 workouts of 3 sets, with about <strong className="text-white">{setsReps}</strong> {unitTextShort} per set.</li>
           </ul>
           <p className="font-bold">Your personalized weekly goals will dynamically change based on your goals and results.</p>
        </div>
        <p className="text-center text-lg text-gray-300 mb-8">
          Now go rest for a few days and we'll start the program.
        </p>
        <button
          onClick={() => setView('input')}
          className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400">{config.name} Strength Test</h2>
        <p className="text-center text-lg text-gray-300 mb-6">
          {config.unit === 'reps'
            ? `Do as many ${config.verbPast} as you can until you dramatically slow down. Do not force the last few reps.`
            : `Hold the ${config.verb} for as long as you can with good form.`}
        </p>
        {config.unit === 'reps' ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              value={maxCount}
              onChange={(e) => setMaxCount(e.target.value)}
              placeholder={`Enter your max ${config.verbPast}`}
              className="w-full text-center text-xl sm:text-2xl p-4 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-amber-400 focus:ring focus:ring-amber-400 focus:ring-opacity-50 transition-colors duration-300"
              autoFocus
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
            >
              Save Max
            </button>
          </form>
        ) : (
          <Stopwatch onLog={handleTestSubmit} />
        )}
      </div>
    </div>
  );
};

export default StrengthTestView;
