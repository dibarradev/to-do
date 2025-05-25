import { useState, useEffect } from 'react';
import './App.scss';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import Auth from './components/Auth';
import type { Task, FilterType, User, LoginCredentials, RegisterData } from './types';
import * as taskService from './services/taskService';
import * as authService from './services/authService';

function App() {
  // State for auth
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  // State for current filter
  const [filter, setFilter] = useState<FilterType>('all');
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State for connection status
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    message: string;
    details?: unknown;
  }>({ isConnected: false, message: 'Checking connection...' });

  // Check connection with server and MongoDB on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('🔍 Checking server connection...');
        const healthCheck = await taskService.checkServerHealth();

        setConnectionStatus({
          isConnected: healthCheck.mongodb.connected,
          message: healthCheck.mongodb.connected
            ? `✅ Connected to MongoDB`
            : '❌ Not connected to MongoDB',
          details: healthCheck,
        });

        console.log('📊 Connection status:', healthCheck);
      } catch (error) {
        console.error('❌ Error checking connection:', error);
        setConnectionStatus({
          isConnected: false,
          message: '❌ Connection error with server',
          details: error,
        });
      }
    };

    checkConnection();
  }, []);

  // Verify authentication when loading the application
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if there's a saved token
        const user = await authService.verifyToken();

        if (user) {
          // Authenticated user
          setAuthState({
            isAuthenticated: true,
            user,
            token: authService.getToken(),
            loading: false,
          });

          // Load the authenticated user's tasks
          fetchTasks();
        } else {
          // No authenticated user
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
      }
    };

    verifyAuth();
  }, []);

  // Load tasks from MongoDB when authenticated
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksFromDB = await taskService.getAllTasks();
      setTasks(tasksFromDB);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Call authentication service
      const result = await authService.login(credentials);

      // Update authentication state
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        token: result.token,
        loading: false,
      });

      // Load user tasks
      fetchTasks();

      return result;
    } catch (error: any) {
      throw error;
    }
  };

  // Handle user registration
  const handleRegister = async (userData: RegisterData) => {
    try {
      // Call authentication service
      const result = await authService.register(userData);

      // Update authentication state
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        token: result.token,
        loading: false,
      });

      // Load user tasks (which will be empty for a new user)
      fetchTasks();

      return result;
    } catch (error: any) {
      throw error;
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();

    // Reset application state
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });

    setTasks([]);
  };

  /**
   * Add a new task
   */
  const handleAddTask = async (text: string) => {
    try {
      const newTask = await taskService.createTask(text);
      if (newTask) {
        setTasks(prevTasks => [newTask, ...prevTasks]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  /**
   * Toggle task completion status
   * A task can only be completed if all its subtasks are completed
   */
  const handleToggleTask = async (id: string) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;

    // If trying to mark as completed, check subtasks
    if (!taskToUpdate.completed) {
      const hasActiveSubtasks = taskToUpdate.subtasks.some(subtask => !subtask.completed);
      if (hasActiveSubtasks) return;
    }

    const updatedTask = {
      ...taskToUpdate,
      completed: !taskToUpdate.completed,
    };

    try {
      const result = await taskService.updateTask(updatedTask);
      if (result) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === id ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (id: string) => {
    try {
      const success = await taskService.deleteTask(id);
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  /**
   * Edit a task's text
   */
  const handleEditTask = async (id: string, newText: string) => {
    if (!newText.trim()) return;

    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      text: newText.trim(),
    };

    try {
      const result = await taskService.updateTask(updatedTask);
      if (result) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === id ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  /**
   * Add a subtask to a task
   */
  const handleAddSubtask = async (taskId: string, text: string) => {
    if (!text.trim()) return;

    try {
      const updatedTask = await taskService.addSubtask(taskId, text.trim());
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  /**
   * Edit a subtask's text
   */
  const handleEditSubtask = async (taskId: string, subtaskId: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      const updatedTask = await taskService.updateSubtask(taskId, subtaskId, {
        text: newText.trim(),
      });

      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error editing subtask:', error);
    }
  };

  /**
   * Delete a subtask
   */
  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const updatedTask = await taskService.deleteSubtask(taskId, subtaskId);
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  /**
   * Toggle subtask completion status
   * When a subtask is toggled, update the parent task status accordingly
   */
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    try {
      // Update the subtask
      const updatedTask = await taskService.updateSubtask(taskId, subtaskId, {
        completed: !subtask.completed,
      });

      if (updatedTask) {
        // Check if all subtasks are completed
        const allSubtasksCompleted =
          updatedTask.subtasks.length > 0 && updatedTask.subtasks.every(st => st.completed);

        // Update the main task status if necessary
        if (updatedTask.completed !== allSubtasksCompleted) {
          const taskWithUpdatedStatus = {
            ...updatedTask,
            completed: allSubtasksCompleted,
          };

          const finalUpdatedTask = await taskService.updateTask(taskWithUpdatedStatus);
          if (finalUpdatedTask) {
            setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? finalUpdatedTask : t)));
          }
        } else {
          setTasks(prevTasks => prevTasks.map(t => (t.id === taskId ? updatedTask : t)));
        }
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  /**
   * Add a comment to a task
   */
  const handleAddComment = async (taskId: string, comment: string) => {
    if (!comment.trim()) return;

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      comment: comment.trim(),
    };

    try {
      const result = await taskService.updateTask(updatedTask);
      if (result) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  /**
   * Edit a task's comment
   */
  const handleEditComment = async (taskId: string, comment: string) => {
    if (!comment.trim()) return;

    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      comment: comment.trim(),
    };

    try {
      const result = await taskService.updateTask(updatedTask);
      if (result) {
        setTasks(prevTasks => prevTasks.map(task => (task.id === taskId ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  /**
   * Delete a task's comment
   */
  const handleDeleteComment = async (taskId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    // Create a copy without the comment property
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { comment, ...taskWithoutComment } = taskToUpdate;

    try {
      const result = await taskService.updateTask(taskWithoutComment as Task);
      if (result) {
        setTasks(prevTasks =>
          prevTasks.map(task => (task.id === taskId ? (taskWithoutComment as Task) : task))
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  /**
   * Change the current filter
   */
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  // Calculate counts for each task status
  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
  };

  // If authentication is loading, show indicator
  if (authState.loading) {
    return (
      <div className="loading-container">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <>
      {authState.isAuthenticated ? (
        <div className="todo-app">
          <div className="connection-status">
            <span
              className={`status-indicator ${
                connectionStatus.isConnected ? 'connected' : 'disconnected'
              }`}
            >
              {connectionStatus.message}
            </span>
          </div>

          <header className="app-header">
            <div className="header-content">
              <h1>To-Do</h1>
              {authState.user && (
                <div className="user-info">
                  <span>Hello, {authState.user.username}</span>
                  <button onClick={handleLogout} className="logout-button">
                    Sign out
                  </button>
                </div>
              )}
            </div>
            {isLoading && <p className="loading-text">Loading tasks...</p>}
          </header>

          <main className="app-content">
            <TaskForm onAddTask={handleAddTask} />

            <TaskFilter
              currentFilter={filter}
              onFilterChange={handleFilterChange}
              tasksCount={taskCounts}
            />

            <TaskList
              tasks={tasks}
              filter={filter}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onAddSubtask={handleAddSubtask}
              onEditSubtask={handleEditSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onToggleSubtask={handleToggleSubtask}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </main>
        </div>
      ) : (
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </>
  );
}

export default App;
