import React, { useState, useEffect, useRef } from 'react';

interface StopwatchProps {
  onLog: (seconds: number) => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onLog }) => {
  const [status, setStatus] = useState<'idle' | 'countdown' | 'running' | 'stopped'>('idle');
  const [countdown, setCountdown] = useState(5);
  const [time, setTime] = useState(0);
  const [adjustedTime, setAdjustedTime] = useState('');

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setStatus('countdown');
    setCountdown(5);
    setTime(0);
    setAdjustedTime('');
    intervalRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setStatus('running');
          intervalRef.current = window.setInterval(() => {
            setTime(t => t + 1);
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus('stopped');
    setAdjustedTime(String(time));
  };

  const handleLog = () => {
    const finalTime = parseInt(adjustedTime, 10);
    if (!isNaN(finalTime) && finalTime > 0) {
      onLog(finalTime);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus('idle');
    setTime(0);
    setCountdown(5);
    setAdjustedTime('');
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (status === 'stopped') {
    return (
      <div className="p-8 bg-gray-800 rounded-xl shadow-2xl text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Log Your Time</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <input
            type="number"
            min="1"
            value={adjustedTime}
            onChange={e => setAdjustedTime(e.target.value)}
            className="w-full sm:w-48 text-center text-xl sm:text-2xl p-4 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-cyan-400 focus:ring focus:ring-cyan-400 focus:ring-opacity-50 transition-colors duration-300"
            autoFocus
          />
          <span className="text-xl text-gray-400">seconds</span>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={handleLog} className="px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105">Log Time</button>
          <button onClick={handleReset} className="px-6 py-4 font-semibold bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-800 rounded-xl shadow-2xl text-center">
      <div className="mb-6">
        <p className="text-8xl font-mono font-bold text-cyan-400">
          {status === 'countdown' ? countdown : formatTime(time)}
        </p>
        <p className="text-lg text-gray-400">{status === 'countdown' ? 'Get Ready...' : 'Time Elapsed'}</p>
      </div>
      <div className="flex justify-center gap-4">
        {status === 'idle' && (
          <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105">
            Go
          </button>
        )}
        {(status === 'running' || status === 'countdown') && (
          <button onClick={handleStop} className="w-full sm:w-auto px-8 py-4 text-xl font-bold bg-red-500 hover:bg-red-400 text-gray-900 rounded-lg transition-all duration-300 transform hover:scale-105">
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
