
import React, { useState } from 'react';
import ExerciseTracker from './components/ExerciseTracker';
import { ALL_EXERCISES, Exercise, exerciseConfigs, REP_EXERCISES, TIME_EXERCISES } from './types';
import TodaysHistoryView from './components/TodaysHistoryView';
import GlobalHistoryView from './components/GlobalHistoryView';
import GlobalDayDetailView from './components/GlobalDayDetailView';
import VO2MaxView from './components/VO2MaxView';
import { ArrowLeftIcon } from './components/Icons';
import StrengthSelectionView from './components/StrengthSelectionView';
import StrengthWorkoutView from './components/StrengthWorkoutView';

type AppView = 'selection' | 'tracking' | 'todaysHistory' | 'globalHistory' | 'globalDayDetail' | 'vo2max_intro' | 'strengthSelection' | 'strengthWorkout';

function App() {
  const [view, setView] = useState<AppView>('selection');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedGlobalDate, setSelectedGlobalDate] = useState<string | null>(null);
  const [selectedStrengthType, setSelectedStrengthType] = useState<'Push' | 'Pull' | 'Legs' | null>(null);

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
    setSelectedStrengthType(null);
    setView('selection');
  }

  const handleSelectGlobalDate = (dateKey: string) => {
    setSelectedGlobalDate(dateKey);
    setView('globalDayDetail');
  }

  const handleStrengthWorkoutSelect = (workoutType: 'Push' | 'Pull' | 'Legs') => {
    setSelectedStrengthType(workoutType);
    setView('strengthWorkout');
  };

  const renderSelection = () => (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        <header className="p-4 bg-gray-800 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider text-center">
                Workout Tracker
            </h1>
        </header>
        <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-300">Choose Your Workout</h2>
                
                {/* Primary Rep Exercises Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {REP_EXERCISES.map(ex => (
                        <button
                            key={ex}
                            onClick={() => handleExerciseSelect(ex)}
                            className="p-4 bg-gray-800 text-white rounded-lg text-lg font-semibold hover:bg-cyan-500 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center h-24 shadow-md border border-gray-700 hover:border-cyan-400"
                        >
                            {exerciseConfigs[ex].name}
                        </button>
                    ))}
                </div>

                {/* Secondary/Time Exercises Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                    {TIME_EXERCISES.map(ex => (
                        <button
                            key={ex}
                            onClick={() => handleExerciseSelect(ex)}
                            className="p-3 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-cyan-600 hover:text-white transition-all duration-300 transform hover:scale-105 border border-gray-700"
                        >
                            {exerciseConfigs[ex].name}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4 mt-8 max-w-2xl mx-auto w-full">
                    <button
                        onClick={() => setView('strengthSelection')}
                        className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-xl font-bold tracking-wide shadow-lg transform hover:scale-102"
                    >
                        Strength/Muscle
                    </button>
                    
                    <button
                        onClick={() => handleExerciseSelect('VO2 Max Interval')}
                        className="px-6 py-4 bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors text-xl font-bold tracking-wide shadow-lg transform hover:scale-102"
                    >
                        VO2 Max Interval
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <button onClick={() => setView('todaysHistory')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold border border-gray-600">Today's Summary</button>
                        <button onClick={() => setView('globalHistory')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold border border-gray-600">Full History</button>
                    </div>
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
                <button 
                    onClick={handleBackToSelection} 
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-cyan-500 rounded-lg transition-all" 
                    aria-label="Back to home"
                >
                    <ArrowLeftIcon />
                    <span>Home</span>
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

  if (view === 'strengthSelection') {
      return <StrengthSelectionView 
        onBack={handleBackToSelection} 
        onHistory={() => setView('globalHistory')}
        onSelectWorkout={handleStrengthWorkoutSelect}
      />
  }

  if (view === 'strengthWorkout' && selectedStrengthType) {
      return <StrengthWorkoutView 
        workoutType={selectedStrengthType}
        onBack={() => setView('strengthSelection')}
      />
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
