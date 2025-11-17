import React, { useState, useEffect } from 'react';
import { ALL_EXERCISES, exerciseConfigs } from '../types';
import type { AggregatedLog, Exercise, DailyLogEntry, ExerciseLog } from '../types';
import { ArrowLeftIcon } from './Icons';

interface GlobalDayDetailViewProps {
  dateKey: string;
  onBackToCalendar: () => void;
  onBackToMainMenu: () => void;
}

const GlobalDayDetailView: React.FC<GlobalDayDetailViewProps> = ({ dateKey, onBackToCalendar, onBackToMainMenu }) => {
    const [dayData, setDayData] = useState<AggregatedLog[string] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const allLogs: AggregatedLog = {};

        ALL_EXERCISES.forEach(exercise => {
            try {
                const item = window.localStorage.getItem(`log-${exercise}`);
                if (item) {
                    const log: ExerciseLog = JSON.parse(item);
                    Object.entries(log).forEach(([date, entry]) => {
                        if (date === dateKey) {
                            if (!allLogs[date]) {
                                allLogs[date] = [];
                            }
                            allLogs[date].push({ exercise, entry });
                        }
                    });
                }
            } catch (error) {
                console.error(`Error reading log for ${exercise}:`, error);
            }
        });

        setDayData(allLogs[dateKey] || []);
        setLoading(false);
    }, [dateKey]);
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col p-4 animate-fade-in">
            <header className="flex items-center justify-between mb-8 w-full max-w-4xl mx-auto">
                <button
                    onClick={onBackToCalendar}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all"
                    aria-label="Back to Calendar"
                >
                    <ArrowLeftIcon />
                    <span className="hidden sm:inline">Calendar</span>
                </button>
                <h1 className="text-3xl font-bold text-cyan-400 text-center">
                    {dateKey}
                </h1>
                <button
                    onClick={onBackToMainMenu}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    aria-label="Back to Main Menu"
                >
                    Main Menu
                </button>
            </header>

            <main className="flex-grow w-full">
                {loading ? (
                  <div className="text-center p-8 text-gray-400">Loading details...</div>
                ) : !dayData || dayData.length === 0 ? (
                    <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md mx-auto">
                        <p className="text-xl text-gray-400">No workouts logged on this day.</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {dayData.map(({ exercise, entry }) => {
                            const config = exerciseConfigs[exercise];
                            const unitText = config.unit === 'reps' ? 'reps' : 'sec';
                            return (
                                <div key={exercise} className="p-6 bg-gray-800 rounded-xl shadow-lg animate-slide-in">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <h2 className="text-2xl font-bold text-gray-200">{config.name}</h2>
                                        <p className="text-3xl font-bold text-cyan-400">
                                            {entry.total}
                                            <span className="text-xl text-gray-500 ml-2">{unitText}</span>
                                        </p>
                                    </div>
                                    {entry.sets.filter(set => !set.isTest).length > 0 && (
                                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {entry.sets.filter(set => !set.isTest).map((set, index) => (
                                                <li key={set.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                                    <span className="font-semibold text-gray-400">Set {index + 1}</span>
                                                    <span className="font-bold text-lg text-cyan-300">{set.count} {unitText}</span>
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
            <footer className="text-center p-4 text-gray-500 text-sm mt-8">
                <p>Stay strong. One rep at a time.</p>
            </footer>
        </div>
    );
};

export default GlobalDayDetailView;
