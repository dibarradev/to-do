import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.scss";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskFilter from "./components/TaskFilter";
import type { Task, FilterType, Subtask } from "./types";

function App() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  // State for current filter
  const [filter, setFilter] = useState<FilterType>("all");

  // Get tasks from localStorage on initial load
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  /**
   * Add a new task
   */
  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: uuidv4(),
      text: text,
      completed: false,
      subtasks: [],
    };

    // Add new task to the beginning of the array
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  /**
   * Toggle task completion status
   * A task can only be completed if all its subtasks are completed
   */
  const handleToggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== id) return task;

        // If trying to mark as completed, check if all subtasks are completed
        if (!task.completed) {
          const hasActiveSubtasks = task.subtasks.some(
            (subtask) => !subtask.completed
          );
          if (hasActiveSubtasks) {
            // Cannot complete a task with active subtasks
            return task;
          }
        }

        return { ...task, completed: !task.completed };
      })
    );
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  /**
   * Edit a task's text
   */
  const handleEditTask = (id: string, newText: string) => {
    // Only update if the new text is not empty
    if (newText.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, text: newText.trim() } : task
        )
      );
    }
  };

  /**
   * Add a subtask to a task
   */
  const handleAddSubtask = (taskId: string, text: string) => {
    if (!text.trim()) return;

    const newSubtask: Subtask = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      )
    );
  };

  /**
   * Edit a subtask's text
   */
  const handleEditSubtask = (
    taskId: string,
    subtaskId: string,
    newText: string
  ) => {
    if (!newText.trim()) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, text: newText.trim() }
            : subtask
        );

        return { ...task, subtasks: updatedSubtasks };
      })
    );
  };

  /**
   * Delete a subtask
   */
  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        const updatedSubtasks = task.subtasks.filter(
          (subtask) => subtask.id !== subtaskId
        );

        return { ...task, subtasks: updatedSubtasks };
      })
    );
  };

  /**
   * Toggle subtask completion status
   * When a subtask is toggled, update the parent task status accordingly
   */
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        // Toggle the specified subtask
        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        // Check if all subtasks are completed
        const allSubtasksCompleted =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((subtask) => subtask.completed);

        // Update task completion status based on subtasks
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted,
        };
      })
    );
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
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };

  return (
    <div className="todo-app">
      <header className="app-header">
        <h1>To-Do</h1>
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
        />
      </main>
    </div>
  );
}

export default App;
