import React, { useState, useEffect, useRef } from 'react';

interface VO2MaxWorkoutViewProps {
  addReps: (count: number) => void;
}

const WORK_DURATION = 45; // seconds
const REST_DURATION = 240; // 4 minutes in seconds
const COUNTDOWN_DURATION = 5; // 5 second countdown

const VO2MaxWorkoutView: React.FC<VO2MaxWorkoutViewProps> = ({ addReps }) => {
  const [status, setStatus] = useState<'idle' | 'countdown' | 'working' | 'recovering'>('idle');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [round, setRound] = useState(1);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => { if (!audioContextRef.current) { try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { console.error("Web Audio API is not supported in this browser"); } } window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); };
    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    return () => { window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); }
  }, []);

  const playSound = (type: 'start' | 'end') => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.01);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(type === 'start' ? 880 : 523.25, audioContextRef.current.currentTime);
    oscillator.start(audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 0.5);
    oscillator.stop(audioContextRef.current.currentTime + 0.5);
  };

  useEffect(() => {
    if (status === 'idle') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeLeft(WORK_DURATION);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (status === 'countdown') {
            playSound('start');
            setStatus('working');
            return WORK_DURATION;
          }
          if (status === 'working') {
            addReps(1);
            playSound('end');
            setStatus('recovering');
            return REST_DURATION;
          } 
          if (status === 'recovering') {
            setStatus('idle');
            setRound(r => r + 1);
            return WORK_DURATION;
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, addReps]);
  
  const handleStart = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') { audioContextRef.current.resume(); }
    setStatus('countdown');
    setTimeLeft(COUNTDOWN_DURATION);
  };

  const handleStartRest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    addReps(1);
    playSound('end');
    setStatus('recovering');
    setTimeLeft(REST_DURATION);
  };

  const handleStartWork = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRound(r => r + 1);
    setStatus('countdown');
    setTimeLeft(COUNTDOWN_DURATION);
  };

  const handleReset = () => {
    setStatus('idle');
    setRound(1);
  };
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center">
      {status === 'idle' && round === 1 && (
          <div className="p-4 sm:p-6 mb-8 bg-amber-900 bg-opacity-50 border border-amber-600 rounded-xl text-center">
              <p className="text-base sm:text-lg font-semibold text-amber-300">Remember to warm up for 10 minutes before you begin.</p>
          </div>
      )}
      <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex flex-col justify-center items-center border-8 shadow-2xl transition-all duration-500 ${
          status === 'working' ? 'border-green-500' 
          : status === 'recovering' ? 'border-red-500' 
          : status === 'countdown' ? 'border-amber-500'
          : 'border-gray-600'
      }`}>
          <p className="text-base sm:text-lg text-gray-400 mb-2">Round {round}</p>
          <p className="text-6xl sm:text-8xl font-mono font-bold text-white">
            {status === 'countdown' ? timeLeft : formatTime(timeLeft)}
          </p>
          <p className="text-lg sm:text-xl font-semibold mt-2 tracking-wider">
            { status === 'countdown' ? 'Get Ready...'
            : status === 'working' ? '100% Max Effort' 
            : status === 'recovering' ? 'Full Recovery' 
            : 'Ready to Start'
            }
          </p>
      </div>
      <div className="mt-12 flex flex-col items-center gap-4 w-full">
        {status === 'idle' && <button onClick={handleStart} className="w-full sm:w-auto px-12 py-4 text-2xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105">Start Round {round}</button>}
        {status === 'working' && <button onClick={handleStartRest} className="w-full sm:w-auto px-12 py-4 text-xl font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105">Start Rest Period</button>}
        {status === 'recovering' && <button onClick={handleStartWork} className="w-full sm:w-auto px-12 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105">Start 100% Max Effort</button>}
        
        {(status === 'working' || status === 'recovering' || status === 'countdown') && (
            <button onClick={handleReset} className="px-6 py-2 text-base font-semibold bg-red-700 hover:bg-red-600 text-gray-200 rounded-lg transition-colors">
                Stop Workout
            </button>
        )}
        
        {status === 'idle' && round > 1 && <button onClick={handleReset} className="text-sm text-gray-500 hover:text-white transition-colors">Reset</button>}
      </div>
    </div>
  );
};

export default VO2MaxWorkoutView;
