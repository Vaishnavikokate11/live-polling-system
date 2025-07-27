const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active polls and users
let activePoll = null;
let students = new Map();
let teachers = new Map();
let pollHistory = [];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('teacher-join', (teacherData) => {
    teachers.set(socket.id, {
      id: socket.id,
      name: teacherData.name,
      socket: socket
    });
    socket.join('teachers');
    socket.emit('teacher-joined', { success: true });
    
    // Send current poll status to teacher
    if (activePoll) {
      socket.emit('current-poll', activePoll);
    }
  });

  // Student joins
  socket.on('student-join', (studentData) => {
    students.set(socket.id, {
      id: socket.id,
      name: studentData.name,
      hasAnswered: false,
      socket: socket
    });
    socket.join('students');
    socket.emit('student-joined', { success: true });
    
    // Send current poll to student if active
    if (activePoll && !activePoll.isComplete) {
      socket.emit('current-poll', activePoll);
    }
  });

  // Teacher creates a new poll
  socket.on('create-poll', (pollData) => {
    if (activePoll && !activePoll.isComplete) {
      socket.emit('poll-error', { message: 'A poll is already active' });
      return;
    }

    const pollId = uuidv4();
    activePoll = {
      id: pollId,
      question: pollData.question,
      options: pollData.options,
      maxTime: pollData.maxTime || 60,
      startTime: Date.now(),
      endTime: Date.now() + (pollData.maxTime || 60) * 1000,
      isComplete: false,
      results: {},
      totalVotes: 0
    };

    // Reset student answer status
    students.forEach(student => {
      student.hasAnswered = false;
    });

    // Broadcast new poll to all clients
    io.emit('new-poll', activePoll);
    
    // Set timer to end poll
    setTimeout(() => {
      if (activePoll && activePoll.id === pollId) {
        endPoll(pollId);
      }
    }, activePoll.maxTime * 1000);
  });

  // Student submits answer
  socket.on('submit-answer', (answerData) => {
    const student = students.get(socket.id);
    if (!student) {
      socket.emit('error', { message: 'Student not found' });
      return;
    }

    if (!activePoll || activePoll.isComplete) {
      socket.emit('error', { message: 'No active poll' });
      return;
    }

    if (student.hasAnswered) {
      socket.emit('error', { message: 'You have already answered this poll' });
      return;
    }

    // Record the answer
    if (!activePoll.results[answerData.option]) {
      activePoll.results[answerData.option] = 0;
    }
    activePoll.results[answerData.option]++;
    activePoll.totalVotes++;
    student.hasAnswered = true;

    // Broadcast updated results
    io.emit('poll-results', {
      pollId: activePoll.id,
      results: activePoll.results,
      totalVotes: activePoll.totalVotes
    });

    // Check if all students have answered
    const allStudentsAnswered = Array.from(students.values()).every(s => s.hasAnswered);
    if (allStudentsAnswered) {
      endPoll(activePoll.id);
    }
  });

  // Teacher ends poll manually
  socket.on('end-poll', () => {
    if (activePoll && !activePoll.isComplete) {
      endPoll(activePoll.id);
    }
  });

  // Teacher kicks student
  socket.on('kick-student', (studentId) => {
    const student = students.get(studentId);
    if (student) {
      student.socket.emit('kicked', { message: 'You have been kicked by the teacher' });
      student.socket.disconnect();
      students.delete(studentId);
      io.emit('student-kicked', { studentId, studentName: student.name });
    }
  });

  // Chat messages
  socket.on('send-message', (messageData) => {
    const user = students.get(socket.id) || teachers.get(socket.id);
    if (user) {
      const message = {
        id: uuidv4(),
        sender: user.name,
        senderId: socket.id,
        senderType: students.has(socket.id) ? 'student' : 'teacher',
        message: messageData.message,
        timestamp: Date.now()
      };
      io.emit('new-message', message);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    students.delete(socket.id);
    teachers.delete(socket.id);
    
    // If teacher disconnects, end active poll
    if (teachers.size === 0 && activePoll && !activePoll.isComplete) {
      endPoll(activePoll.id);
    }
  });
});

// Function to end a poll
function endPoll(pollId) {
  if (activePoll && activePoll.id === pollId && !activePoll.isComplete) {
    activePoll.isComplete = true;
    activePoll.endTime = Date.now();
    
    // Add to history
    pollHistory.push({
      ...activePoll,
      timestamp: Date.now()
    });
    
    // Broadcast poll end
    io.emit('poll-ended', activePoll);
    
    // Reset active poll
    activePoll = null;
  }
}

// API Routes
app.get('/api/poll-history', (req, res) => {
  res.json(pollHistory);
});

app.get('/api/active-poll', (req, res) => {
  res.json(activePoll);
});

app.get('/api/students', (req, res) => {
  const studentList = Array.from(students.values()).map(s => ({
    id: s.id,
    name: s.name,
    hasAnswered: s.hasAnswered
  }));
  res.json(studentList);
});

const path = require('path');

// Serve React frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route to serve React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});