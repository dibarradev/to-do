import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.scss";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskFilter from "./components/TaskFilter";
import type { Task, FilterType } from "./types";

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
    };

    // Add new task to the beginning of the array
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  /**
   * Toggle task completion status
   */
  const handleToggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
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
        />
      </main>
    </div>
  );
}

export default App;
