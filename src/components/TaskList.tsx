import type { Task, FilterType } from "../types";
import TaskItem from "./TaskItem";
import "./TaskList.scss";

interface TaskListProps {
  tasks: Task[];
  filter: FilterType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Component that displays the list of tasks
 */
const TaskList = ({ tasks, filter, onToggle, onDelete }: TaskListProps) => {
  // Filter tasks based on the current filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Check if there are no tasks to display
  if (tasks.length === 0) {
    return (
      <div className="empty-message">
        No tasks found. Add one to get started!
      </div>
    );
  }

  // Check if there are no tasks matching the current filter
  if (filteredTasks.length === 0) {
    return <div className="empty-message">No {filter} tasks found.</div>;
  }

  return (
    <div className="task-list-container">
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
