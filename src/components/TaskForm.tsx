import { useState } from "react";
import "./TaskForm.scss";

interface TaskFormProps {
  onAddTask: (text: string) => void;
}

/**
 * Component for adding new tasks
 */
const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [taskText, setTaskText] = useState("");

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Trim the input to check if it's empty or just whitespace
    const trimmedText = taskText.trim();

    if (trimmedText) {
      onAddTask(trimmedText);
      setTaskText(""); // Clear the input after adding
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Add a new task..."
        aria-label="Task description"
      />
      <button
        type="submit"
        className="add-button"
        disabled={!taskText.trim()} // Disable if input is empty or just whitespace
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
