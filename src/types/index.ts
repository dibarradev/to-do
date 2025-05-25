// Define the Subtask interface
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Define the Task interface
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks: Subtask[];
  comment?: string;
}

// Define the filter types
export type FilterType = 'all' | 'active' | 'completed';
