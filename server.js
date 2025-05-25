// Imports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load credentials from file
let credentials = {};
const credentialsFile = process.env.CREDENTIALS_FILE || 'credentials.json';

try {
  const credentialsPath = path.resolve(__dirname, credentialsFile);
  if (fs.existsSync(credentialsPath)) {
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('✅ Credentials loaded successfully');
  } else {
    console.error(`❌ ERROR: Credentials file ${credentialsFile} not found`);
    console.log('💡 Create a credentials.json file based on credentials.example.json');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ ERROR: Could not load credentials:', error.message);
  process.exit(1);
}

// Build MongoDB URI from credentials
const { user, password, cluster, database, appName } = credentials.mongodb;
const MONGODB_URI = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority&appName=${appName}`;

// Set environment variables for the application
process.env.MONGODB_URI = MONGODB_URI;
if (credentials.jwt && credentials.jwt.secret) {
  process.env.JWT_SECRET = credentials.jwt.secret;
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Verify that MongoDB URI is configured
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined');
  console.log('💡 Verify that your credentials file is correct');
  process.exit(1);
}

console.log('🔄 Connecting to MongoDB...');
// Hide credentials in logs
console.log('📍 URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); 

// Connect to MongoDB with additional options
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔌 Connection status: ${mongoose.connection.readyState}`);
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
    console.log('\n🔍 Possible causes:');
    console.log('   • Incorrect MongoDB URI');
    console.log('   • Invalid credentials');
    console.log('   • IP not whitelisted in MongoDB Atlas');
    console.log('   • Network/firewall issues');
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Define schemas
const SubtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  subtasks: [SubtaskSchema],
  comment: { type: String, required: false }
}, { 
  timestamps: true 
});

// Create the model
const TaskModel = mongoose.model('Task', TaskSchema);

// Health check route to verify connection
app.get('/api/health', async (req, res) => {
  try {
    // Check connection status
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({
        status: 'error',
        message: 'Database not connected',
        mongodb: {
          connected: false,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host || 'Not available'
        }
      });
    }

    // Make a simple query to verify it works
    const taskCount = await TaskModel.countDocuments();
    
    res.json({
      status: 'ok',
      message: 'Server and database working correctly',
      mongodb: {
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        tasksCount: taskCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in health check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying database connection',
      error: error.message
    });
  }
});

// API Routes
app.get('/api/tasks', async (req, res) => {
  try {
    console.log('📖 Getting tasks...');
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    console.log(`✅ ${tasks.length} tasks retrieved`);
    res.json(tasks);
  } catch (error) {
    console.error('❌ Error getting tasks:', error);
    res.status(500).json({ message: 'Error getting tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('➕ Creating new task:', text);
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }
    
    const newTask = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      subtasks: [],
    };
    
    const task = await TaskModel.create(newTask);
    console.log('✅ Task created successfully:', task.id);
    res.status(201).json(task);
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log('📝 Updating task:', id);
    
    const task = await TaskModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await TaskModel.findOneAndDelete({ id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Subtask routes
app.post('/api/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Subtask text is required' });
    }
    
    const task = await TaskModel.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const newSubtask = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
    };
    
    task.subtasks.push(newSubtask);
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ message: 'Error creating subtask' });
  }
});

app.put('/api/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const updates = req.body;
    console.log('📝 Updating subtask:', { taskId, subtaskId, updates });
    
    const task = await TaskModel.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    
    if (subtaskIndex === -1) {
      return res.status(404).json({ message: 'Subtask not found' });
    }
    
    // Get current subtask and maintain its existing properties
    const currentSubtask = task.subtasks[subtaskIndex].toObject();
    console.log('📋 Current subtask:', currentSubtask);
    
    // Update only specified properties, maintaining existing ones
    const updatedSubtask = {
      id: currentSubtask.id,
      text: updates.text !== undefined ? updates.text : currentSubtask.text,
      completed: updates.completed !== undefined ? updates.completed : currentSubtask.completed
    };
    
    console.log('🔄 Updated subtask:', updatedSubtask);
    
    // Replace the subtask
    task.subtasks[subtaskIndex] = updatedSubtask;
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('❌ Error updating subtask:', error);
    res.status(500).json({ message: 'Error updating subtask' });
  }
});

app.delete('/api/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    
    const task = await TaskModel.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Filter subtasks to remove the specified one
    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ message: 'Error deleting subtask' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
