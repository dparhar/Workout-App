import React, { useState, useEffect, useMemo } from 'react';
import { ALL_EXERCISES, exerciseConfigs } from '../types';
import type { Exercise, DailyLogEntry, ExerciseLog, AggregatedLog } from '../types';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface GlobalHistoryViewProps {
  onBack: () => void;
  onDateSelect: (dateKey: string) => void;
}

const exerciseTextColorMap: Record<Exercise, string> = {
    'Push-ups': 'text-red-400',
    'Squats': 'text-blue-400',
    'Chin-ups': 'text-green-400',
    'Kettlebell Swings': 'text-yellow-400',
    'Plank': 'text-indigo-400',
    'Left Plank': 'text-purple-400',
    'Right Plank': 'text-pink-400',
    'Wall Sit': 'text-teal-400',
    'Glute Bridge Hold': 'text-orange-400',
    'VO2 Max Interval': 'text-cyan-400',
};


const GlobalHistoryView: React.FC<GlobalHistoryViewProps> = ({ onBack, onDateSelect }) => {
  const [aggregatedLog, setAggregatedLog] = useState<AggregatedLog>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const allLogs: AggregatedLog = {};

    ALL_EXERCISES.forEach(exercise => {
      try {
        const item = window.localStorage.getItem(`log-${exercise}`);
        if (item) {
          const log: ExerciseLog = JSON.parse(item);
          Object.entries(log).forEach(([date, entry]) => {
            if (!allLogs[date]) {
              allLogs[date] = [];
            }
            allLogs[date].push({ exercise, entry });
          });
        }
      } catch (error) {
        console.error(`Error reading log for ${exercise}:`, error);
      }
    });

    setAggregatedLog(allLogs);
    setLoading(false);
  }, []);

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const startingDay = firstDayOfMonth.getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDay });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };
  
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
          Workout History
        </h1>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Calendar */}
        <div className="w-full p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronLeftIcon /></button>
            <h2 className="text-xl font-bold text-cyan-400">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronRightIcon /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm">
            {weekDays.map(day => <div key={day} className="font-semibold text-gray-400 py-2">{day}</div>)}
            {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-20 sm:h-24"></div>)}
            {days.map(day => {
              const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = aggregatedLog[dateKey];
              const hasData = !!dayData && dayData.length > 0;
              
              return (
                <div
                  key={day}
                  onClick={() => onDateSelect(dateKey)}
                  className={`p-1 rounded-lg transition-all duration-300 cursor-pointer h-20 sm:h-24 flex flex-col items-start bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400`}
                  title={`View workouts for ${dateKey}`}
                >
                  <span className={`font-bold text-xs text-gray-400`}>{day}</span>
                   {hasData && (
                    <div className="mt-1 flex-grow w-full overflow-hidden flex flex-col">
                      {dayData.slice(0, 3).map(({ exercise }, index) => (
                        <span
                          key={`${exercise}-${index}`}
                          className={`text-[10px] sm:text-xs font-semibold leading-tight truncate ${exerciseTextColorMap[exercise]}`}
                          title={exerciseConfigs[exercise].name}
                        >
                          {exerciseConfigs[exercise].name}
                        </span>
                      ))}
                       {dayData.length > 3 && (
                        <span className="text-[10px] text-gray-500 mt-auto">...more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
              Select a day to see your workout summary.
          </p>
        </div>

      </main>
       <footer className="text-center p-4 text-gray-500 text-sm mt-8">
            <p>Stay strong. One rep at a time.</p>
        </footer>
    </div>
  );
};

export default GlobalHistoryView;
