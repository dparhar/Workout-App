export type View = 'input' | 'history' | 'test';

export type Exercise =
  | 'Push-ups'
  | 'Squats'
  | 'Chin-ups'
  | 'Kettlebell Swings'
  | 'Plank'
  | 'Left Plank'
  | 'Right Plank'
  | 'Wall Sit'
  | 'Glute Bridge Hold';

export type ExerciseUnit = 'reps' | 'seconds';

export const exerciseConfigs: Record<Exercise, { name: string; verb: string; verbPast: string; unit: ExerciseUnit }> = {
    'Push-ups': { name: 'Push-ups', verb: 'pushup', verbPast: 'pushups', unit: 'reps' },
    'Squats': { name: 'Squats', verb: 'squat', verbPast: 'squats', unit: 'reps' },
    'Chin-ups': { name: 'Chin-ups', verb: 'chin-up', verbPast: 'chin-ups', unit: 'reps' },
    'Kettlebell Swings': { name: 'Kettlebell Swings', verb: 'swing', verbPast: 'swings', unit: 'reps' },
    'Plank': { name: 'Plank', verb: 'plank', verbPast: 'seconds', unit: 'seconds' },
    'Left Plank': { name: 'Left Plank', verb: 'left plank', verbPast: 'seconds', unit: 'seconds' },
    'Right Plank': { name: 'Right Plank', verb: 'right plank', verbPast: 'seconds', unit: 'seconds' },
    'Wall Sit': { name: 'Wall Sit', verb: 'wall sit', verbPast: 'seconds', unit: 'seconds' },
    'Glute Bridge Hold': { name: 'Glute Bridge Hold', verb: 'glute bridge hold', verbPast: 'seconds', unit: 'seconds' },
};

export interface ExerciseSet {
  id: string;
  count: number; // Represents reps or seconds
  timestamp: number;
  isTest?: boolean;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  sets: ExerciseSet[];
  total: number;
}

export interface ExerciseLog {
  [date: string]: DailyLogEntry;
}

export interface ProgramState {
  isActive: boolean;
  startDate: string; // YYYY-MM-DD
  initialMax: number;
  currentWeek: number; // 1 to 4+
  weeklyGoals: [number, number, number, number];
}
