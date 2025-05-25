// src/types/index.ts

// Define the Task interface
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// Define the filter types
export type FilterType = 'all' | 'active' | 'completed';
