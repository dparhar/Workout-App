import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { ExerciseLog, DailyLogEntry, ExerciseSet, View, ProgramState, Exercise } from '../types';
import { HistoryIcon, ArrowLeftIcon } from './Icons';
import ExerciseInputForm from './ExerciseInputForm';
import HistoryView from './HistoryView';
import StrengthTestView from './StrengthTestView';

interface ExerciseTrackerProps {
    exercise: Exercise;
}

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ exercise }) => {
  const logKey = `log-${exercise}`;
  const programKey = `program-${exercise}`;
  
  const [log, setLog] = useLocalStorage<ExerciseLog>(logKey, {});
  const [program, setProgram] = useLocalStorage<ProgramState | null>(programKey, null);
  const [view, setView] = useState<View>('input');

  const programWeek = useMemo(() => {
    if (!program || !program.isActive) return null;
    
    const startDate = new Date(program.startDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.floor(diffDays / 7) + 1;
  }, [program]);

  useEffect(() => {
    if (program && program.isActive && programWeek && programWeek !== program.currentWeek) {
        setProgram({ ...program, currentWeek: programWeek });
    }
  }, [program, programWeek, setProgram]);

  const addReps = (count: number, isTest: boolean = false, date?: string) => {
    if (count <= 0 || isNaN(count)) return;

    const dateKey = date || new Date().toISOString().split('T')[0];

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}`,
      count,
      timestamp: Date.now(),
      isTest,
    };

    setLog(prevLog => {
      const entryForDate = prevLog[dateKey] || {
        date: dateKey,
        sets: [],
        total: 0,
      };

      const updatedSets = [...entryForDate.sets, newSet]
        .sort((a,b) => a.timestamp - b.timestamp);

      const newTotal = updatedSets
        .filter(set => !set.isTest)
        .reduce((sum, set) => sum + set.count, 0);

      const updatedEntry: DailyLogEntry = {
        ...entryForDate,
        sets: updatedSets,
        total: newTotal,
      };

      return {
        ...prevLog,
        [dateKey]: updatedEntry,
      };
    });
  };

  const deleteSet = (dateKey: string, setId: string) => {
    setLog(prevLog => {
        const entry = prevLog[dateKey];
        if (!entry) return prevLog;

        const updatedSets = entry.sets.filter(set => set.id !== setId);
        
        if (updatedSets.length === 0) {
            const newLog = { ...prevLog };
            delete newLog[dateKey];
            return newLog;
        }

        const newTotal = updatedSets
            .filter(set => !set.isTest)
            .reduce((sum, set) => sum + set.count, 0);

        return {
            ...prevLog,
            [dateKey]: {
                ...entry,
                sets: updatedSets,
                total: newTotal
            }
        };
    });
  };
  
  const editSet = (dateKey: string, setId: string, newCount: number) => {
      if (newCount <= 0 || isNaN(newCount)) return;
      
      setLog(prevLog => {
          const entry = prevLog[dateKey];
          if (!entry) return prevLog;

          const updatedSets = entry.sets.map(set =>
              set.id === setId ? { ...set, count: newCount } : set
          );

          const newTotal = updatedSets
              .filter(set => !set.isTest)
              .reduce((sum, set) => sum + set.count, 0);
          
          return {
              ...prevLog,
              [dateKey]: {
                  ...entry,
                  sets: updatedSets,
                  total: newTotal
              }
          };
      });
  };
  
  const startProgram = (maxReps: number) => {
    const goals: number[] = [];
    const initialGoal = Math.floor(maxReps * 4.5);
    goals.push(initialGoal);

    for (let i = 1; i < 4; i++) {
      const prevGoal = goals[i - 1];
      let nextGoal = Math.floor(prevGoal * 1.1);
      nextGoal = Math.max(nextGoal, prevGoal + 1); // Minimum increase of 1
      goals.push(nextGoal);
    }
    
    const newProgram: ProgramState = {
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      initialMax: maxReps,
      currentWeek: 1,
      weeklyGoals: goals as [number, number, number, number],
    };
    setProgram(newProgram);
  };


  const todayKey = new Date().toISOString().split('T')[0];
  const todaysData = useMemo(() => log[todayKey], [log, todayKey]);

  return (
    <>
        <div className="flex justify-end mb-4">
            <button
                onClick={() => setView(view === 'input' ? 'history' : 'input')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all duration-300 transform hover:scale-105"
                aria-label={view === 'input' ? 'Show History' : 'Back to workout'}
            >
                {view === 'input' ? <HistoryIcon /> : <ArrowLeftIcon />}
                <span className="hidden sm:inline">{view === 'input' ? 'History' : 'Back to workout'}</span>
            </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {view === 'input' ? (
            <ExerciseInputForm 
              addReps={(count) => addReps(count, false)} 
              todaysData={todaysData} 
              setView={setView}
              log={log}
              program={program}
              exercise={exercise}
            />
          ) : view === 'history' ? (
            <HistoryView 
              log={log} 
              addReps={addReps}
              editSet={editSet}
              deleteSet={deleteSet}
              exercise={exercise}
            />
          ) : (
            <StrengthTestView 
              addReps={addReps} 
              setView={setView}
              startProgram={startProgram}
              exercise={exercise}
            />
          )}
        </div>
    </>
  );
}

export default ExerciseTracker;