import React, { useState, FormEvent, useEffect } from 'react';
import type { DailyLogEntry, ExerciseSet, Exercise } from '../types';
import { exerciseConfigs } from '../types';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, PlusIcon } from './Icons';

interface DayDetailModalProps {
  dateKey: string;
  entry: DailyLogEntry | undefined;
  onClose: () => void;
  addReps: (count: number, isTest: boolean, date: string) => void;
  editSet: (dateKey: string, setId: string, newCount: number) => void;
  deleteSet: (dateKey: string, setId: string) => void;
  exercise: Exercise;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ dateKey, entry, onClose, addReps, editSet, deleteSet, exercise }) => {
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState<string>('');
  const [addCount, setAddCount] = useState<string>('');

  const config = exerciseConfigs[exercise];
  const unitText = config.unit === 'reps' ? 'reps' : 'sec';

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleEditClick = (set: ExerciseSet) => {
    setEditingSetId(set.id);
    setEditCount(String(set.count));
  };

  const handleCancelEdit = () => {
    setEditingSetId(null);
    setEditCount('');
  };

  const handleSaveEdit = () => {
    const numCount = parseInt(editCount, 10);
    if (!isNaN(numCount) && numCount > 0 && editingSetId) {
      editSet(dateKey, editingSetId, numCount);
      handleCancelEdit();
    }
  };

  const handleDelete = (setId: string) => {
    if (window.confirm('Are you sure you want to delete this set?')) {
      deleteSet(dateKey, setId);
    }
  };

  const handleAddSet = (e: FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(addCount, 10);
    if (!isNaN(numCount) && numCount > 0) {
      addReps(numCount, false, dateKey);
      setAddCount('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 text-white border border-gray-700 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-cyan-400">Details for {dateKey}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto pr-2 space-y-4">
          {!entry || entry.sets.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No sets logged for this day.</p>
          ) : (
            <ul className="space-y-2">
              {entry.sets.filter(set => !set.isTest).map((set, index) => (
                <li key={set.id} className="p-3 bg-gray-700 rounded-lg">
                  {editingSetId === set.id ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-300 flex-shrink-0">Set {index + 1}:</span>
                      <input
                        type="number"
                        min="1"
                        value={editCount}
                        onChange={e => setEditCount(e.target.value)}
                        className="w-full text-center p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                        autoFocus
                      />
                      <span className="text-gray-400">{unitText}</span>
                      <button onClick={handleSaveEdit} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg"><CheckIcon /></button>
                      <button onClick={handleCancelEdit} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg"><XIcon className="h-5 w-5" /></button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-4">
                        <span className="font-semibold text-gray-300">Set {index + 1}</span>
                        <span className="font-bold text-lg text-cyan-400">{set.count} {unitText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-500">{new Date(set.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button onClick={() => handleEditClick(set)} className="p-2 hover:bg-gray-600 rounded-lg text-amber-400"><PencilIcon /></button>
                        <button onClick={() => handleDelete(set.id)} className="p-2 hover:bg-gray-600 rounded-lg text-red-500"><TrashIcon /></button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>

        <footer className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Add New Set</h3>
          <form onSubmit={handleAddSet} className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={addCount}
              onChange={e => setAddCount(e.target.value)}
              placeholder={`Enter ${config.unit}`}
              className="w-full text-center p-2 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon /> Add
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default DayDetailModal;
