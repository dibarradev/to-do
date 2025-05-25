import mongoose from 'mongoose';
import type { Task, Subtask } from '../../types';

const SubtaskSchema = new mongoose.Schema<Subtask>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema<Task>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    subtasks: [SubtaskSchema],
    comment: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

// Create the Task model
const TaskModel = mongoose.model<Task>('Task', TaskSchema);

export default TaskModel;
