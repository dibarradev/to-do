import { useState } from 'react';
import type { Task, Subtask } from '../types';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newText: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddComment: (taskId: string, comment: string) => void;
  onEditComment: (taskId: string, comment: string) => void;
  onDeleteComment: (taskId: string) => void;
}

/**
 * Component that displays a single task item
 */
const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskText, setEditSubtaskText] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState(task.comment || '');

  // Check if task has active subtasks
  const hasActiveSubtasks = task.subtasks.some(subtask => !subtask.completed);

  const handleEditSubmit = () => {
    if (editText.trim() !== task.text) {
      onEdit(task.id, editText);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      // Cancel editing and restore original text
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  const handleEditSubtaskSubmit = (subtaskId: string) => {
    if (editSubtaskText.trim()) {
      onEditSubtask(task.id, subtaskId, editSubtaskText);
    }
    setEditingSubtaskId(null);
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent, subtaskId: string) => {
    if (e.key === 'Enter') {
      handleEditSubtaskSubmit(subtaskId);
    } else if (e.key === 'Escape') {
      setEditingSubtaskId(null);
    }
  };

  const startEditSubtask = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditSubtaskText(subtask.text);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      if (task.comment) {
        onEditComment(task.id, commentText);
      } else {
        onAddComment(task.id, commentText);
      }
      setIsEditingComment(false);
    }
  };

  const handleDeleteComment = () => {
    onDeleteComment(task.id);
    setCommentText('');
    setShowComment(false);
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommentSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingComment(false);
      setCommentText(task.comment || '');
    }
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-actions-container">
          {hasActiveSubtasks && <span className="task-status-badge">Has active subtasks</span>}
          <div className="task-actions">
            <button
              className="subtasks-toggle"
              onClick={() => setShowSubtasks(!showSubtasks)}
              aria-label={showSubtasks ? 'Hide subtasks' : 'Show subtasks'}
            >
              {showSubtasks ? '▼' : '▶'} {task.subtasks.length}
            </button>

            {!isEditing && !task.completed && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit task"
              >
                Edit
              </button>
            )}

            <button
              className="delete-button"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="task-content">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            disabled={hasActiveSubtasks}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />

          {isEditing ? (
            <input
              type="text"
              className="task-edit-input"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span className="task-text" onDoubleClick={() => !task.completed && setIsEditing(true)}>
              {task.text}
              {/* {hasActiveSubtasks && (
                <span className="task-status-badge">Has active subtasks</span>
              )} */}
            </span>
          )}
        </div>
      </div>

      {/* Subtasks section */}
      {showSubtasks && (
        <div className="subtasks-container">
          <ul className="subtasks-list">
            {task.subtasks.map(subtask => (
              <li
                key={subtask.id}
                className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
              >
                <div className="subtask-content">
                  <input
                    type="checkbox"
                    className="subtask-checkbox"
                    checked={subtask.completed}
                    onChange={() => onToggleSubtask(task.id, subtask.id)}
                    aria-label={subtask.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  />

                  {editingSubtaskId === subtask.id ? (
                    <input
                      type="text"
                      className="subtask-edit-input"
                      value={editSubtaskText}
                      onChange={e => setEditSubtaskText(e.target.value)}
                      onBlur={() => handleEditSubtaskSubmit(subtask.id)}
                      onKeyDown={e => handleSubtaskKeyDown(e, subtask.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="subtask-text"
                      onDoubleClick={() => !subtask.completed && startEditSubtask(subtask)}
                    >
                      {subtask.text}
                    </span>
                  )}
                </div>

                <div className="subtask-actions">
                  {!subtask.completed && editingSubtaskId !== subtask.id && (
                    <button
                      className="edit-button small"
                      onClick={() => startEditSubtask(subtask)}
                      aria-label="Edit subtask"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="delete-button small"
                    onClick={() => onDeleteSubtask(task.id, subtask.id)}
                    aria-label="Delete subtask"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Add new subtask form */}
          <form className="add-subtask-form" onSubmit={handleAddSubtask}>
            <input
              type="text"
              className="subtask-input"
              value={newSubtaskText}
              onChange={e => setNewSubtaskText(e.target.value)}
              placeholder="Add a subtask..."
              aria-label="New subtask description"
            />
            <button
              type="submit"
              className="add-button"
              disabled={!newSubtaskText.trim()}
              aria-label="Add subtask"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Comments section */}
      <div className="task-comment-section">
        <button
          className="comment-toggle"
          onClick={() => setShowComment(!showComment)}
          aria-label={showComment ? 'Hide comment' : 'Show comment'}
        >
          {showComment ? '▼ Comment' : '▶ Comment'}
        </button>

        {showComment && (
          <div className="comment-container">
            {isEditingComment || !task.comment ? (
              <div className="comment-edit">
                <textarea
                  className="comment-textarea"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onBlur={handleCommentSubmit}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Add a comment..."
                  autoFocus
                />
                <div className="comment-actions">
                  <button
                    className="save-button"
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim()}
                  >
                    Save
                  </button>
                  {task.comment && (
                    <button className="delete-button small" onClick={handleDeleteComment}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="comment-display">
                <p className="comment-text">{task.comment}</p>
                <div className="comment-actions">
                  <button className="edit-button small" onClick={() => setIsEditingComment(true)}>
                    Edit
                  </button>
                  <button className="delete-button small" onClick={handleDeleteComment}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default TaskItem;
