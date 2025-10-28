import React, { useState } from 'react';
import type { Exercise } from './types';
import { exerciseConfigs } from './types';
import ExerciseTracker from './components/ExerciseTracker';

const REP_EXERCISES: Exercise[] = [
  'Push-ups',
  'Squats',
  'Chin-ups',
  'Kettlebell Swings',
];

const TIME_EXERCISES: Exercise[] = [
  'Plank',
  'Left Plank',
  'Right Plank',
  'Wall Sit',
  'Glute Bridge Hold',
];

function App() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const renderExerciseButton = (exercise: Exercise) => (
    <button
      key={exercise}
      onClick={() => setSelectedExercise(exercise)}
      className="px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-gray-900 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
    >
      {exerciseConfigs[exercise].name}
    </button>
  );
  
  // Workout Selection Screen
  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">
            Workout Tracker
          </h1>
          <p className="text-lg text-gray-400 mt-2">Choose your workout to get started</p>
        </header>
        
        <main className="flex-grow flex flex-col justify-center items-center w-full max-w-4xl">
            <div className="flex flex-col items-center gap-4 w-full">
                <nav className="flex flex-wrap justify-center gap-4">
                    {REP_EXERCISES.map(renderExerciseButton)}
                </nav>
                <div className="w-1/2 border-b border-gray-700 my-4"></div>
                <nav className="flex flex-wrap justify-center gap-4">
                    {TIME_EXERCISES.map(renderExerciseButton)}
                </nav>
            </div>
        </main>

        <footer className="text-center p-4 text-gray-500 text-sm">
            <p>Stay strong. One rep at a time.</p>
        </footer>
      </div>
    );
  }

  // Exercise Tracker Screen for the selected exercise
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="p-4 bg-gray-800 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider">
          {exerciseConfigs[selectedExercise].name}
        </h1>
        <button
          onClick={() => setSelectedExercise(null)}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          Change Workout
        </button>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <ExerciseTracker key={selectedExercise} exercise={selectedExercise} />
      </main>
      
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Stay strong. One rep at a time.</p>
      </footer>
    </div>
  );
}

export default App;
