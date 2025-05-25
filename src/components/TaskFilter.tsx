import type { FilterType } from "../types";
import "./TaskFilter.scss";

interface TaskFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  tasksCount: {
    all: number;
    active: number;
    completed: number;
  };
}

/**
 * Component for filtering tasks by status
 */
const TaskFilter = ({
  currentFilter,
  onFilterChange,
  tasksCount,
}: TaskFilterProps) => {
  return (
    <div className="task-filter">
      <h3>Filter tasks</h3>
      <div className="filter-buttons">
        <button
          className={`filter-button ${currentFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          All ({tasksCount.all})
        </button>
        <button
          className={`filter-button ${
            currentFilter === "active" ? "active" : ""
          }`}
          onClick={() => onFilterChange("active")}
        >
          Active ({tasksCount.active})
        </button>
        <button
          className={`filter-button ${
            currentFilter === "completed" ? "active" : ""
          }`}
          onClick={() => onFilterChange("completed")}
        >
          Completed ({tasksCount.completed})
        </button>
      </div>
    </div>
  );
};

export default TaskFilter;
