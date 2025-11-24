
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, XIcon } from './Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ExerciseLog, ExerciseSet } from '../types';

interface StrengthWorkoutViewProps {
    workoutType: 'Push' | 'Pull' | 'Legs';
    onBack: () => void;
}

const EXERCISE_POOLS = {
    'Push': [
        'Chest Press', 'Pushups', 'Shoulder Press', 'Bench Press', 
        'Dumbbell Press', 'Seated Shoulder Press', 'Dips', 'Tricep Extensions',
        'Incline Bench Press', 'Cable Flys', 'Lateral Raises', 'Skullcrushers',
        'Overhead Press', 'Landmine Press', 'Pec Deck', 'Tricep Pushdowns',
        'Arnold Press', 'Floor Press', 'Close Grip Bench', 'Front Raises'
    ],
    'Pull': [
        'Chin-ups', 'Dumbbell Rows', 'Lat Pulldowns', 'Widegrip Pulldowns', 
        'Barbell Rows', 'Face Pulls', 'Bicep Curls', 'Hammer Curls',
        'Pull-ups', 'T-Bar Rows', 'Seated Cable Rows', 'Preacher Curls',
        'Shrugs', 'Reverse Flys', 'Concentration Curls', 'Meadows Row',
        'Renegade Rows', 'Upright Rows', 'Rack Pulls', 'Cable Curls'
    ],
    'Legs': [
        'Squats', 'Deadlifts', 'Single Legged Deadlift', 'Calf Raises', 
        'Leg Extensions', 'Lunges', 'Leg Press', 'Hamstring Curls',
        'Romanian Deadlift', 'Bulgarian Split Squat', 'Goblet Squats', 'Step Ups',
        'Hip Thrusts', 'Hack Squat', 'Seated Calf Raise', 'Walking Lunges',
        'Sumo Deadlift', 'Front Squat', 'Glute Bridges', 'Box Jumps'
    ]
};

// --- NumPad Modal Component ---
interface NumPadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (val: string) => void;
    title: string;
}

const NumPadModal: React.FC<NumPadModalProps> = ({ isOpen, onClose, onSave, title }) => {
    const [value, setValue] = useState('');
    
    useEffect(() => {
        if(isOpen) setValue('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNum = (num: string) => {
        if (num === '.' && value.includes('.')) return;
        setValue(prev => prev + num);
    };

    const handleBack = () => {
        setValue(prev => prev.slice(0, -1));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 w-full sm:max-w-xs sm:rounded-xl p-4 border-t sm:border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-200">{title}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg mb-4 text-right text-3xl font-mono text-cyan-400 min-h-[4rem] flex items-center justify-end overflow-hidden">
                    {value || <span className="text-gray-600">0</span>}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => (
                        <button 
                            key={num} 
                            onClick={() => handleNum(String(num))}
                            className="bg-gray-700 hover:bg-gray-600 active:bg-cyan-600 text-white text-2xl font-semibold py-4 rounded-lg transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <button 
                        onClick={handleBack}
                        className="bg-gray-700 hover:bg-gray-600 active:bg-red-600 text-red-400 text-xl font-semibold py-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        ⌫
                    </button>
                </div>

                <button 
                    onClick={() => { onSave(value); onClose(); }}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-lg"
                >
                    Done
                </button>
            </div>
        </div>
    );
};
// ------------------------------

const StrengthWorkoutView: React.FC<StrengthWorkoutViewProps> = ({ workoutType, onBack }) => {
    const logKey = `log-Strength-${workoutType}`;
    const [log, setLog] = useLocalStorage<ExerciseLog>(logKey, {});
    
    const [exerciseName, setExerciseName] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('20'); // Default to 20
    const [isNumPadOpen, setIsNumPadOpen] = useState(false);
    const [displayedExamples, setDisplayedExamples] = useState<string[]>([]);
    const [placeholder, setPlaceholder] = useState('');

    const todayKey = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const pool = EXERCISE_POOLS[workoutType];
        // Shuffle for displayed examples
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        setDisplayedExamples(shuffled.slice(0, 8));
        
        // Random placeholder
        const randomEx = pool[Math.floor(Math.random() * pool.length)];
        setPlaceholder(`e.g. ${randomEx}`);
    }, [workoutType]);

    const handleAddSet = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!exerciseName.trim() || !reps) return;

        const newSet: ExerciseSet = {
            id: `set-${Date.now()}`,
            count: parseInt(reps),
            timestamp: Date.now(),
            exerciseName: exerciseName,
            weight: weight ? parseFloat(weight) : 0
        };

        setLog(prevLog => {
            const entryForDate = prevLog[todayKey] || {
                date: todayKey,
                sets: [],
                total: 0,
            };

            const updatedSets = [...entryForDate.sets, newSet];
            const newTotal = updatedSets.reduce((sum, set) => sum + set.count, 0);

            return {
                ...prevLog,
                [todayKey]: {
                    ...entryForDate,
                    sets: updatedSets,
                    total: newTotal,
                },
            };
        });

        setReps('20');
        setWeight('');
        setExerciseName('');
        onBack();
    };

    const handleExampleClick = (name: string) => {
        setExerciseName(name);
    };

    const adjustWeight = (delta: number) => {
        const current = parseFloat(weight) || 0;
        const newVal = Math.max(0, current + delta);
        setWeight(String(newVal));
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            <header className="p-4 bg-gray-800 shadow-lg flex items-center justify-between sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all" aria-label="Back">
                    <ArrowLeftIcon />
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">
                    {workoutType.toUpperCase()}
                </h1>
                <div className="w-16"></div>
            </header>

            <main className="flex-grow p-4 max-w-3xl mx-auto w-full space-y-6">
                
                {/* Examples Section */}
                <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Example Exercises</h3>
                    <div className="flex flex-wrap gap-2">
                        {displayedExamples.map(ex => (
                            <button
                                key={ex}
                                onClick={() => handleExampleClick(ex)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                    exerciseName === ex 
                                    ? 'bg-cyan-500 text-gray-900 border-cyan-500' 
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-cyan-400'
                                }`}
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Section */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <form onSubmit={handleAddSet} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Exercise Name</label>
                            <input 
                                type="text" 
                                value={exerciseName}
                                onChange={(e) => setExerciseName(e.target.value)}
                                placeholder={placeholder}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (lbs/kg)</label>
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button"
                                        onClick={() => adjustWeight(-5)}
                                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-cyan-400 font-bold"
                                    >
                                        -5
                                    </button>
                                    <input 
                                        type="number" 
                                        value={weight}
                                        onClick={() => setIsNumPadOpen(true)}
                                        readOnly
                                        placeholder="0"
                                        className="w-full p-3 text-center bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all cursor-pointer"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => adjustWeight(5)}
                                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-cyan-400 font-bold"
                                    >
                                        +5
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Reps</label>
                                <input 
                                    type="number" 
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    placeholder="20"
                                    className="w-full p-3 text-center bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold rounded-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <PlusIcon /> Add Set
                        </button>
                    </form>
                </div>
            </main>

            <NumPadModal 
                isOpen={isNumPadOpen}
                onClose={() => setIsNumPadOpen(false)}
                onSave={(val) => setWeight(val)}
                title="Enter Weight"
            />
        </div>
    );
};

export default StrengthWorkoutView;
