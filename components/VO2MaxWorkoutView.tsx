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

  const handleTimerClick = () => {
    switch (status) {
        case 'idle':
            handleStart();
            break;
        case 'working':
            handleStartRest();
            break;
        case 'recovering':
            handleStartWork();
            break;
        case 'countdown':
            handleReset();
            break;
    }
  }
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getBorderColor = () => {
    if (status === 'working') return 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]';
    if (status === 'recovering') return 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
    if (status === 'countdown') return 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]';
    return 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:border-cyan-400';
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center py-8">
      {status === 'idle' && round === 1 && (
          <div className="w-full max-w-md p-3 mb-8 bg-blue-900/30 border border-blue-700/50 rounded-lg text-center backdrop-blur-sm">
              <p className="text-sm sm:text-base font-medium text-blue-200">Remember to warm up for 10 minutes before you begin.</p>
          </div>
      )}
      
      <button 
        onClick={handleTimerClick}
        className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex flex-col justify-center items-center border-8 transition-all duration-300 transform active:scale-95 focus:outline-none ${getBorderColor()}`}
      >
          <div className="flex flex-col items-center justify-center z-10">
            {status === 'idle' ? (
                 <>
                    <p className="text-4xl font-bold text-white mb-2">START</p>
                    <p className="text-xl text-cyan-300">Round {round}</p>
                 </>
            ) : (
                <>
                    <p className="text-lg text-gray-400 mb-2 font-medium">Round {round}</p>
                    <p className="text-7xl sm:text-8xl font-mono font-bold text-white">
                        {status === 'countdown' ? timeLeft : formatTime(timeLeft)}
                    </p>
                    <p className={`text-lg sm:text-xl font-bold mt-2 tracking-wider uppercase ${
                        status === 'working' ? 'text-green-400' 
                        : status === 'recovering' ? 'text-red-400' 
                        : 'text-amber-400'
                    }`}>
                        { status === 'countdown' ? 'Get Ready'
                        : status === 'working' ? 'Max Effort' 
                        : status === 'recovering' ? 'Recovering' 
                        : ''
                        }
                    </p>
                    {status === 'working' && <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest">Tap to Rest</p>}
                    {status === 'recovering' && <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest">Start Next Round</p>}
                    {status === 'countdown' && <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest">Tap to Cancel</p>}
                </>
            )}
          </div>
      </button>

      <div className="mt-12 h-16 flex flex-col justify-center">
        {(status !== 'idle' || round > 1) && (
            <button 
                onClick={handleReset} 
                className="text-gray-500 hover:text-red-400 transition-colors text-sm font-semibold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-gray-800"
            >
                {status === 'idle' ? 'Reset Workout' : 'End Workout'}
            </button>
        )}
      </div>
    </div>
  );
};

export default VO2MaxWorkoutView;