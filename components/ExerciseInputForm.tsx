import React, { useState } from 'react';
import type { DailyLogEntry, View, ExerciseLog, ProgramState, Exercise } from '../types';
import { exerciseConfigs } from '../types';
import Stopwatch from './Stopwatch';

const ProgramTracker: React.FC<{ log: ExerciseLog; program: ProgramState; setView: (view: View) => void; exercise: Exercise }> = ({ log, program, setView, exercise }) => {
  const config = exerciseConfigs[exercise];

  if (program.currentWeek > 4) {
    return (
      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-amber-400">Program Complete!</h2>
        <p className="text-gray-400 mb-6">You've finished the 4-week program. It's time to test your new strength!</p>
        <button
          onClick={() => setView('test')}
          className="px-8 py-4 text-xl font-bold bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
        >
          Retake {config.name} Test
        </button>
      </div>
    );
  }

  const getWeekProgress = (log: ExerciseLog, program: ProgramState): number => {
    const startDate = new Date(program.startDate);
    const programDayOffset = (program.currentWeek - 1) * 7;
    
    const currentWeekStartDate = new Date(startDate);
    currentWeekStartDate.setDate(startDate.getDate() + programDayOffset);
    currentWeekStartDate.setHours(0,0,0,0);

    const currentWeekEndDate = new Date(currentWeekStartDate);
    currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6);
    currentWeekEndDate.setHours(23,59,59,999);
    
    return Object.values(log)
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= currentWeekStartDate && entryDate <= currentWeekEndDate;
        })
        .reduce((sum, entry) => sum + entry.total, 0);
  };

  const weeklyGoal = program.weeklyGoals[program.currentWeek - 1];
  const weekProgress = getWeekProgress(log, program);
  const progressPercent = weeklyGoal > 0 ? Math.min((weekProgress / weeklyGoal) * 100, 100) : 0;
  const unitText = config.unit === 'reps' ? '' : ' sec';

  return (
     <div className="p-8 bg-gray-800 rounded-xl shadow-2xl animate-fade-in">
        <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-2xl font-bold text-gray-300">Week {program.currentWeek} Goal</h2>
            <p className="text-lg font-bold text-cyan-400">{weekProgress} / {weeklyGoal}{unitText}</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
            <div 
                className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`}}
            ></div>
        </div>
        <p className="text-center text-gray-500 text-sm">Your goal increases by ~10% each week for 4 weeks.</p>
    </div>
  );
};


interface ExerciseInputFormProps {
  addReps: (count: number) => void;
  todaysData?: DailyLogEntry;
  setView: (view: View) => void;
  log: ExerciseLog;
  program: ProgramState | null;
  exercise: Exercise;
}

const ExerciseInputForm: React.FC<ExerciseInputFormProps> = ({ addReps, todaysData, setView, log, program, exercise }) => {
  const [count, setCount] = useState('');
  const config = exerciseConfigs[exercise];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(count, 10);
    if (!isNaN(numCount) && numCount > 0) {
      addReps(numCount);
      setCount('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {program && program.isActive && <ProgramTracker log={log} program={program} setView={setView} exercise={exercise} />}

      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl">
        {config.unit === 'reps' ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder={`How many ${config.verbPast}?`}
              className="w-full text-center text-xl sm:text-2xl p-4 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-cyan-400 focus:ring focus:ring-cyan-400 focus:ring-opacity-50 transition-colors duration-300"
              autoFocus
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400"
            >
              Log Reps
            </button>
          </form>
        ) : (
          <Stopwatch onLog={addReps} />
        )}
      </div>

      {(!program || !program.isActive) && (
        <div className="p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-300">Check Your Max</h2>
          <p className="text-center text-gray-400 mb-6">Perform a strength test to gauge your current level and start a personalized program.</p>
          <div className="flex justify-center">
              <button
                onClick={() => setView('test')}
                className="px-8 py-4 text-xl font-bold bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
              >
                {config.name} Test
              </button>
          </div>
        </div>
      )}

      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Today's Progress</h2>
        <div className="text-center mb-6">
          <p className="text-lg text-gray-400">Total {config.name}</p>
          <p className="text-6xl font-bold text-cyan-400">
            {todaysData?.total || 0}
            <span className="text-3xl text-gray-500 ml-2">{config.unit === 'reps' ? 'reps' : 'sec'}</span>
          </p>
        </div>
        
        {todaysData && todaysData.sets.filter(set => !set.isTest).length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center">Your Sets</h3>
            <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {todaysData.sets.filter(set => !set.isTest).map((set, index) => (
                <li
                  key={set.id}
                  className="flex justify-between items-center p-3 bg-gray-700 rounded-lg animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-semibold text-gray-300">Set {index + 1}</span>
                  <span className="font-bold text-lg text-cyan-400">{set.count} {config.unit === 'reps' ? 'reps' : 'sec'}</span>
                  <span className="text-sm text-gray-500">{new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">No sets logged yet today. Let's get started!</p>
        )}
      </div>
    </div>
  );
};

export default ExerciseInputForm;
