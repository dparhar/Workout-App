import React, { useState, useMemo } from 'react';
import type { ExerciseLog, DailyLogEntry, Exercise } from '../types';
import { exerciseConfigs } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import DayDetailModal from './DayDetailModal';

interface HistoryViewProps {
  log: ExerciseLog;
  addReps: (count: number, isTest: boolean, date: string) => void;
  editSet: (dateKey: string, setId: string, newCount: number) => void;
  deleteSet: (dateKey: string, setId: string) => void;
  exercise: Exercise;
}

const getWeekStartDate = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is the start of the week (day=0)
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

const HistoryView: React.FC<HistoryViewProps> = ({ log, addReps, editSet, deleteSet, exercise }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);

  const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDay });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const weeklyTotals = useMemo(() => {
    const totals: { [weekStart: string]: { total: number, count: number } } = {};
    (Object.values(log) as DailyLogEntry[])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(entry => {
        const weekStart = getWeekStartDate(new Date(entry.date));
        if (!totals[weekStart]) {
          totals[weekStart] = { total: 0, count: 0 };
        }
        totals[weekStart].total += entry.total;
        totals[weekStart].count += 1; // Number of days trained in that week
      });
    return Object.entries(totals)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime());
  }, [log]);

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 25) return 'bg-cyan-900';
    if (count <= 50) return 'bg-cyan-800';
    if (count <= 100) return 'bg-cyan-700';
    if (count <= 200) return 'bg-cyan-600';
    return 'bg-cyan-500';
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {selectedDateKey && (
        <DayDetailModal
          dateKey={selectedDateKey}
          entry={log[selectedDateKey]}
          onClose={() => setSelectedDateKey(null)}
          addReps={addReps}
          editSet={editSet}
          deleteSet={deleteSet}
          exercise={exercise}
        />
      )}
      
      <div className="p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronLeftIcon /></button>
          <h2 className="text-xl font-bold text-cyan-400">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronRightIcon /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm">
          {weekDays.map(day => <div key={day} className="font-semibold text-gray-400 py-2">{day}</div>)}
          {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-16 sm:h-24"></div>)}
          {days.map(day => {
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const total = log[dateKey]?.total || 0;
            const colorClass = getIntensityColor(total);
            const isToday = new Date().toISOString().split('T')[0] === dateKey;
            
            return (
              <div
                key={day}
                onClick={() => setSelectedDateKey(dateKey)}
                className={`flex flex-col justify-between p-2 rounded-lg text-xs sm:text-sm transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-cyan-500 ${colorClass} ${total > 0 ? 'text-white' : 'text-gray-500'} ${isToday ? 'border-2 border-cyan-400' : ''}`}
                title={`Click to view/edit sets for ${dateKey}`}
              >
                <span className="font-bold">{day}</span>
                {total > 0 && <span className="font-extrabold text-sm sm:text-lg">{total}</span>}
              </div>
            );
          })}
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
            Click on a day in the calendar to view, edit, or add sets.
        </p>
      </div>

      <div className="p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Weekly Summary</h2>
        {weeklyTotals.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {weeklyTotals.map(({ week, total, count }) => (
              <li key={week} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-700 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-300">Week of {new Date(week).toLocaleString()}</span>
                  <span className="text-sm text-gray-500 block sm:inline sm:ml-4">{count} training day{count > 1 ? 's' : ''}</span>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <span className="font-bold text-xl text-cyan-400">{total}</span>
                  {/* FIX: exerciseConfigs was not defined, imported from types.ts */}
                  <span className="text-gray-400 ml-2">{exercise === 'VO2 Max Interval' ? 'sets' : exerciseConfigs[exercise].unit}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No data available to calculate weekly totals.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryView;