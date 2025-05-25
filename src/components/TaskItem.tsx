import type { Task } from "../types";
import "./TaskItem.scss";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Component that displays a single task item
 */
const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={
            task.completed ? "Mark as incomplete" : "Mark as complete"
          }
        />
        <span className="task-text">{task.text}</span>
      </div>
      <button
        className="delete-button"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem;
