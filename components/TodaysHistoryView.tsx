
import React, { useState, useEffect } from 'react';
import { ALL_EXERCISES, exerciseConfigs } from '../types';
import type { Exercise, DailyLogEntry, ExerciseLog } from '../types';
import { ArrowLeftIcon } from './Icons';

interface TodaysHistoryViewProps {
  onBack: () => void;
}

interface TodayLog {
  exercise: Exercise;
  entry: DailyLogEntry;
}

const TodaysHistoryView: React.FC<TodaysHistoryViewProps> = ({ onBack }) => {
  const [todaysLogs, setTodaysLogs] = useState<TodayLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const logs: TodayLog[] = [];

    ALL_EXERCISES.forEach(exercise => {
      try {
        const item = window.localStorage.getItem(`log-${exercise}`);
        if (item) {
          const log: ExerciseLog = JSON.parse(item);
          if (log[todayKey]) {
            logs.push({ exercise, entry: log[todayKey] });
          }
        }
      } catch (error) {
        console.error(`Error reading log for ${exercise}:`, error);
      }
    });

    setTodaysLogs(logs);
    setLoading(false);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col p-4 animate-fade-in">
      <header className="flex items-center mb-8 w-full max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all duration-300 transform hover:scale-105"
          aria-label="Go back to home"
        >
          <ArrowLeftIcon />
          <span>Home</span>
        </button>
        <h1 className="text-3xl font-bold text-cyan-400 text-center flex-grow -ml-16 sm:ml-0">
          Today's Summary
        </h1>
      </header>

      <main className="flex-grow w-full">
        {loading ? (
          <div className="text-center p-8 text-gray-400">Loading summary...</div>
        ) : todaysLogs.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md mx-auto">
            <p className="text-xl text-gray-400">No workouts logged yet today.</p>
            <p className="text-gray-500 mt-2">Time to get to work!</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {todaysLogs.map(({ exercise, entry }) => {
              const config = exerciseConfigs[exercise];
              const unitText = config.unit === 'reps' ? 'reps' : 'sec';
              return (
                <div key={exercise} className="p-6 bg-gray-800 rounded-xl shadow-lg animate-fade-in">
                  <div className="flex justify-between items-baseline mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">{config.name}</h2>
                    <p className="text-3xl font-bold text-cyan-400">
                      {entry.total}
                      <span className="text-xl text-gray-500 ml-2">{unitText}</span>
                    </p>
                  </div>
                  {entry.sets.filter(set => !set.isTest).length > 0 && (
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {entry.sets.filter(set => !set.isTest).map((set, index) => (
                        <li key={set.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                          <span className="font-semibold text-gray-300">Set {index + 1}</span>
                          <span className="font-bold text-lg text-cyan-400">{set.count} {unitText}</span>
                          <span className="text-sm text-gray-500">{new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
       <footer className="text-center p-4 text-gray-500 text-sm">
            <p>Stay strong. One rep at a time.</p>
        </footer>
    </div>
  );
};

export default TodaysHistoryView;
