import type { Task, Subtask } from '../types';

const API_URL = 'http://localhost:3001/api';

// Verify server health and MongoDB connection
export const checkServerHealth = async (): Promise<{
  status: string;
  mongodb: {
    connected: boolean;
    host?: string;
    database?: string;
    tasksCount?: number;
  };
}> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error verifying server health:', error);
    throw error;
  }
};

// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Error obtaining tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error obtaining tasks:', error);
    return [];
  }
};

// Create a new task
export const createTask = async (text: string): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Error creating task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

// Update a task
export const updateTask = async (task: Task): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error('Error updating task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error deleting task');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Add a subtask
export const addSubtask = async (taskId: string, text: string): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Error adding subtask');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding subtask:', error);
    return null;
  }
};

// Update a subtask
export const updateSubtask = async (
  taskId: string, 
  subtaskId: string, 
  updates: Partial<Subtask>
): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Error updating subtask');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating subtask:', error);
    return null;
  }
};

// Delete a subtask
export const deleteSubtask = async (taskId: string, subtaskId: string): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error deleting subtask');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return null;
  }
};
