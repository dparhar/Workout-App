
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, HistoryIcon, TrashIcon, PencilIcon, CheckIcon, XIcon, InfoIcon } from './Icons';
import { ExerciseLog, ExerciseSet } from '../types';

interface StrengthSelectionViewProps {
  onBack: () => void;
  onHistory: () => void;
  onSelectWorkout: (workout: 'Push' | 'Pull' | 'Legs') => void;
}

type WorkoutType = 'Push' | 'Pull' | 'Legs';

const StrengthSelectionView: React.FC<StrengthSelectionViewProps> = ({ onBack, onHistory, onSelectWorkout }) => {
  const [logs, setLogs] = useState<Record<WorkoutType, ExerciseSet[]>>({
      'Push': [],
      'Pull': [],
      'Legs': []
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');

  const todayKey = new Date().toISOString().split('T')[0];

  const loadLogs = () => {
      const newLogs: Record<WorkoutType, ExerciseSet[]> = { 'Push': [], 'Pull': [], 'Legs': [] };
      (['Push', 'Pull', 'Legs'] as WorkoutType[]).forEach(type => {
          try {
              const item = window.localStorage.getItem(`log-Strength-${type}`);
              if (item) {
                  const log: ExerciseLog = JSON.parse(item);
                  if (log[todayKey]) {
                      newLogs[type] = log[todayKey].sets;
                  }
              }
          } catch (e) {
              console.error(e);
          }
      });
      setLogs(newLogs);
  };

  useEffect(() => {
      loadLogs();
      // Listen for storage events in case tabs interact, though main updates happen on mount/re-render
      window.addEventListener('storage', loadLogs);
      return () => window.removeEventListener('storage', loadLogs);
  }, []);

  const deleteSet = (type: WorkoutType, setId: string) => {
      if (!window.confirm("Delete this set?")) return;

      try {
          const key = `log-Strength-${type}`;
          const item = window.localStorage.getItem(key);
          if (item) {
              const log: ExerciseLog = JSON.parse(item);
              if (log[todayKey]) {
                  const updatedSets = log[todayKey].sets.filter(s => s.id !== setId);
                  const newTotal = updatedSets.reduce((sum, s) => sum + s.count, 0);
                  
                  log[todayKey] = {
                      ...log[todayKey],
                      sets: updatedSets,
                      total: newTotal
                  };
                  
                  if (updatedSets.length === 0) {
                      // Optional: delete log[todayKey] if empty, but keeping object is fine
                  }
                  
                  window.localStorage.setItem(key, JSON.stringify(log));
                  loadLogs(); // Reload local state
              }
          }
      } catch (e) {
          console.error("Error deleting set", e);
      }
  };

  const startEdit = (set: ExerciseSet) => {
      setEditingId(set.id);
      setEditName(set.exerciseName || '');
      setEditWeight(set.weight ? String(set.weight) : '');
      setEditReps(String(set.count));
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditName('');
      setEditWeight('');
      setEditReps('');
  };

  const saveEdit = (type: WorkoutType, setId: string) => {
      try {
          const key = `log-Strength-${type}`;
          const item = window.localStorage.getItem(key);
          if (item) {
              const log: ExerciseLog = JSON.parse(item);
              if (log[todayKey]) {
                  const updatedSets = log[todayKey].sets.map(s => {
                      if (s.id === setId) {
                          return {
                              ...s,
                              exerciseName: editName,
                              weight: parseFloat(editWeight) || 0,
                              count: parseInt(editReps) || 0
                          };
                      }
                      return s;
                  });
                  
                  const newTotal = updatedSets.reduce((sum, s) => sum + s.count, 0);
                  log[todayKey] = {
                      ...log[todayKey],
                      sets: updatedSets,
                      total: newTotal
                  };

                  window.localStorage.setItem(key, JSON.stringify(log));
                  loadLogs();
                  cancelEdit();
              }
          }
      } catch (e) {
          console.error("Error saving set", e);
      }
  };

  const renderSetList = (type: WorkoutType) => {
      const sets = logs[type];
      if (!sets || sets.length === 0) return <p className="text-gray-600 text-sm italic">No sets yet</p>;

      return (
          <div className="space-y-2">
              {sets.slice().reverse().map(set => {
                  const isEditing = editingId === set.id;
                  
                  if (isEditing) {
                      return (
                          <div key={set.id} className="bg-gray-700 p-2 rounded border border-cyan-500 flex flex-col gap-2">
                              <input 
                                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm w-full" 
                                  value={editName} 
                                  onChange={e => setEditName(e.target.value)} 
                                  placeholder="Exercise"
                              />
                              <div className="flex gap-2">
                                  <input 
                                      className="bg-gray-800 text-white px-2 py-1 rounded text-sm w-1/2" 
                                      value={editWeight} 
                                      onChange={e => setEditWeight(e.target.value)} 
                                      placeholder="Lbs"
                                      type="number"
                                  />
                                  <input 
                                      className="bg-gray-800 text-white px-2 py-1 rounded text-sm w-1/2" 
                                      value={editReps} 
                                      onChange={e => setEditReps(e.target.value)} 
                                      placeholder="Reps"
                                      type="number"
                                  />
                              </div>
                              <div className="flex justify-end gap-2 mt-1">
                                  <button onClick={cancelEdit} className="p-1 bg-gray-600 rounded text-white"><XIcon className="w-4 h-4" /></button>
                                  <button onClick={() => saveEdit(type, set.id)} className="p-1 bg-green-600 rounded text-white"><CheckIcon className="w-4 h-4" /></button>
                              </div>
                          </div>
                      );
                  }

                  return (
                      <div key={set.id} className="bg-gray-700 p-3 rounded flex justify-between items-start group">
                          <div>
                              <div className="font-bold text-gray-200 text-sm">{set.exerciseName}</div>
                              <div className="text-xs text-cyan-400">
                                  {set.weight > 0 ? `${set.weight} lbs` : 'BW'} x {set.count}
                              </div>
                          </div>
                          <div className="flex gap-1">
                              <button 
                                  onClick={() => startEdit(set)}
                                  className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-600 rounded"
                              >
                                  <PencilIcon className="w-4 h-4" />
                              </button>
                              <button 
                                  onClick={() => deleteSet(type, set.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                              >
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="p-4 bg-gray-800 shadow-lg flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all" aria-label="Back to home">
            <ArrowLeftIcon />
            <span>Home</span>
            </button>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold text-cyan-400 tracking-wider text-center flex-grow">
            Strength/Muscle
        </h1>
       
        <div className="flex items-center gap-2">
            <button onClick={() => setShowInfo(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all" aria-label="Program Info">
                <InfoIcon />
                <span className="font-semibold">Info</span>
            </button>
            <button onClick={onHistory} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all" aria-label="View history">
                <HistoryIcon />
                <span className="hidden sm:inline">History</span>
            </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={() => setShowInfo(false)}>
              <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-700 relative shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700 rounded-full p-1">
                      <XIcon />
                  </button>
                  <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">Program Guide</h2>
                  <div className="space-y-4 text-gray-300 leading-relaxed">
                      <p>The point of this program is to do a variety of exercises. It's broken down as a Push, Pull, Legs routine.</p>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Full Body:</strong> Suggested max of 3-4 times a week.</li>
                            <li><strong>Structure:</strong> Do 1 Push, 1 Pull, and 1 Leg exercise in equal total sets.</li>
                            <li><strong>Variety:</strong> Do each specific exercise only once per workout.</li>
                        </ul>
                      </div>

                      <p><strong>Goal:</strong> Use a weight that allows you to do <span className="text-cyan-400 font-bold">20+ reps</span>.</p>
                      <p>If you get to <span className="text-amber-400 font-bold">30 reps</span>, stop.</p>
                      
                      <p className="text-sm text-gray-400 italic border-t border-gray-700 pt-2 mt-4">
                          This program will dynamically change the rep scheme based on your results.
                      </p>
                  </div>
                  <button 
                      onClick={() => setShowInfo(false)}
                      className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white transition-colors"
                  >
                      Got it
                  </button>
              </div>
          </div>
      )}

      <main className="flex-grow p-4 md:p-6 w-full max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Push', 'Pull', 'Legs'] as WorkoutType[]).map(type => (
                <button
                    key={type}
                    onClick={() => onSelectWorkout(type)}
                    className={`
                        p-6 rounded-xl font-bold text-2xl transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center gap-2
                        ${type === 'Push' ? 'bg-gradient-to-br from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white' : ''}
                        ${type === 'Pull' ? 'bg-gradient-to-br from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white' : ''}
                        ${type === 'Legs' ? 'bg-gradient-to-br from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 text-white' : ''}
                    `}
                >
                    <span>{type.toUpperCase()}</span>
                </button>
            ))}
        </div>

        {/* Dashboard */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 border border-gray-700 flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-gray-300 mb-6 border-b border-gray-700 pb-2">Today's Workout Log</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                {/* Push Column */}
                <div className="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700/50">
                    <h3 className="text-red-400 font-bold mb-4 tracking-wider text-center border-b border-gray-700 pb-2">PUSH</h3>
                    {renderSetList('Push')}
                </div>

                {/* Pull Column */}
                <div className="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700/50">
                    <h3 className="text-blue-400 font-bold mb-4 tracking-wider text-center border-b border-gray-700 pb-2">PULL</h3>
                    {renderSetList('Pull')}
                </div>

                {/* Legs Column */}
                <div className="bg-gray-900/50 rounded-lg p-3 md:p-4 border border-gray-700/50">
                    <h3 className="text-green-400 font-bold mb-4 tracking-wider text-center border-b border-gray-700 pb-2">LEGS</h3>
                    {renderSetList('Legs')}
                </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-8">
                Complete one exercise from each section to finish a circuit loop.
            </p>
        </div>

      </main>
    </div>
  );
};

export default StrengthSelectionView;
