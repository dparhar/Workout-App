import React, { useState } from 'react';
import ExerciseTracker from './components/ExerciseTracker';
import { ALL_EXERCISES, Exercise, exerciseConfigs } from './types';
import TodaysHistoryView from './components/TodaysHistoryView';
import GlobalHistoryView from './components/GlobalHistoryView';
import GlobalDayDetailView from './components/GlobalDayDetailView';
import VO2MaxView from './components/VO2MaxView';
import { ArrowLeftIcon } from './components/Icons';

type AppView = 'selection' | 'tracking' | 'todaysHistory' | 'globalHistory' | 'globalDayDetail' | 'vo2max_intro';

function App() {
  const [view, setView] = useState<AppView>('selection');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedGlobalDate, setSelectedGlobalDate] = useState<string | null>(null);

  const handleExerciseSelect = (exercise: Exercise) => {
    if (exercise === 'VO2 Max Interval') {
        setView('vo2max_intro');
    } else {
        setSelectedExercise(exercise);
        setView('tracking');
    }
  };

  const handleBackToSelection = () => {
    setSelectedExercise(null);
    setSelectedGlobalDate(null);
    setView('selection');
  }

  const handleSelectGlobalDate = (dateKey: string) => {
    setSelectedGlobalDate(dateKey);
    setView('globalDayDetail');
  }

  const renderSelection = () => (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        <header className="p-4 bg-gray-800 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider text-center">
                Workout Tracker
            </h1>
        </header>
        <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-300">Choose Your Workout</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ALL_EXERCISES.map(ex => (
                        <button
                            key={ex}
                            onClick={() => handleExerciseSelect(ex)}
                            className="p-6 bg-gray-800 text-white rounded-lg text-xl font-semibold hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                        >
                            {exerciseConfigs[ex].name}
                        </button>
                    ))}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setView('todaysHistory')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Today's Summary</button>
                    <button onClick={() => setView('globalHistory')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Full History</button>
                </div>
            </div>
        </main>
        <footer className="text-center p-4 text-gray-500 text-sm">
            <p>Stay strong. One rep at a time.</p>
        </footer>
    </div>
  );

  if (view === 'tracking' && selectedExercise) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            <header className="p-4 bg-gray-800 shadow-lg flex items-center justify-between">
                <button onClick={handleBackToSelection} className="p-2 rounded-full hover:bg-gray-700" aria-label="Back to selection">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider">
                    {exerciseConfigs[selectedExercise].name}
                </h1>
                <div className="w-10 h-10" /> {/* Spacer for centering title */}
            </header>
            <main className="flex-grow p-4 md:p-8">
                <ExerciseTracker exercise={selectedExercise} />
            </main>
            <footer className="text-center p-4 text-gray-500 text-sm">
                <p>Stay strong. One rep at a time.</p>
            </footer>
        </div>
    );
  }

  if (view === 'todaysHistory') {
      return <TodaysHistoryView onBack={handleBackToSelection} />;
  }
  if (view === 'globalHistory') {
      return <GlobalHistoryView onBack={handleBackToSelection} onDateSelect={handleSelectGlobalDate} />;
  }
  if (view === 'vo2max_intro') {
      return <VO2MaxView onBack={handleBackToSelection} onContinue={() => {
        setSelectedExercise('VO2 Max Interval');
        setView('tracking');
      }} />;
  }

  if (view === 'globalDayDetail' && selectedGlobalDate) {
      return <GlobalDayDetailView
          dateKey={selectedGlobalDate}
          onBackToCalendar={() => setView('globalHistory')}
          onBackToMainMenu={handleBackToSelection}
      />;
  }

  return renderSelection();
}

export default App;
