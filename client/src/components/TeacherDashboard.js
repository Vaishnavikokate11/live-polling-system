import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { UserContext } from '../contexts/UserContext';
import Chat from './Chat';
import { FaSignOutAlt, FaComments, FaHistory } from 'react-icons/fa';

const TeacherDashboard = () => {
  const socket = useContext(SocketContext);
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activePoll, setActivePoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '',
    options: ['', ''],
    maxTime: 60
  });

  useEffect(() => {
    if (!socket) return;

    // Join as teacher
    socket.emit('teacher-join', { name: user.name });

    // Listen for events
    socket.on('current-poll', setActivePoll);
    socket.on('new-poll', setActivePoll);
    socket.on('poll-results', (results) => {
      setActivePoll(prev => prev ? { ...prev, results: results.results, totalVotes: results.totalVotes } : null);
    });
    socket.on('poll-ended', (poll) => {
      setActivePoll(null);
      fetchPollHistory();
    });
    socket.on('student-kicked', ({ studentId }) => {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      fetchStudents(); // Refresh the student list from the server
    });

    // Fetch initial data
    fetchStudents();
    fetchPollHistory();

    return () => {
      socket.off('current-poll');
      socket.off('new-poll');
      socket.off('poll-results');
      socket.off('poll-ended');
      socket.off('student-kicked');
    };
  }, [socket, user.name]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPollHistory = async () => {
    try {
      const response = await fetch('/api/poll-history');
      const data = await response.json();
      setPollHistory(data);
    } catch (error) {
      console.error('Error fetching poll history:', error);
    }
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (activePoll && !activePoll.isComplete) {
      alert('A poll is already active');
      return;
    }

    const validOptions = pollForm.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    socket.emit('create-poll', {
      question: pollForm.question,
      options: validOptions,
      maxTime: pollForm.maxTime
    });

    setPollForm({
      question: '',
      options: ['', ''],
      maxTime: 60
    });
  };

  const handleEndPoll = () => {
    socket.emit('end-poll');
  };

  const handleKickStudent = (studentId) => {
    if (window.confirm('Are you sure you want to kick this student?')) {
      socket.emit('kick-student', studentId);
    }
  };

  const addOption = () => {
    setPollForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (pollForm.options.length > 2) {
      setPollForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, value) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">Live Polling System</a>
            <div className="user-info">
              <span className="user-name">Teacher: {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Teacher Dashboard</h1>
            <p className="dashboard-subtitle">Create polls and monitor student responses in real-time</p>
          </div>

          <div className="dashboard-grid">
            <div>
              {/* Poll Creation Form */}
              <div className="poll-form">
                <h2 className="mb-4">Create New Poll</h2>
                <form onSubmit={handleCreatePoll}>
                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pollForm.question}
                      onChange={(e) => setPollForm(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Options</label>
                    {pollForm.options.map((option, index) => (
                      <div key={index} className="option-input">
                        <input
                          type="text"
                          className="form-input"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {pollForm.options.length > 2 && (
                          <button
                            type="button"
                            className="remove-option"
                            onClick={() => removeOption(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="add-option" onClick={addOption}>
                      Add Option
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Limit (seconds)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={pollForm.maxTime}
                      onChange={(e) => setPollForm(prev => ({ ...prev, maxTime: parseInt(e.target.value) || 60 }))}
                      min="10"
                      max="300"
                    />
                  </div>

                  <button type="submit" className="btn" disabled={activePoll && !activePoll.isComplete}>
                    {activePoll && !activePoll.isComplete ? 'Poll Active' : 'Create Poll'}
                  </button>
                </form>
              </div>

              {/* Active Poll Results */}
              {activePoll && !activePoll.isComplete && (
                <div className="poll-results">
                  <div className="results-header">
                    <h3 className="results-question">{activePoll.question}</h3>
                    <p className="results-stats">
                      Total Votes: {activePoll.totalVotes} | 
                      Time Remaining: {Math.max(0, Math.ceil((activePoll.endTime - Date.now()) / 1000))}s
                    </p>
                  </div>
                  <div className="results-list">
                    {activePoll.options.map((option, index) => {
                      const votes = activePoll.results[option] || 0;
                      const percentage = activePoll.totalVotes > 0 ? (votes / activePoll.totalVotes) * 100 : 0;
                      return (
                        <div key={index} className="result-item">
                          <div className="result-bar" style={{ width: `${percentage}%` }}></div>
                          <div className="result-content">
                            <span className="result-option">{option}</span>
                            <span className="result-count">{votes} votes ({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="btn btn-danger mt-4" onClick={handleEndPoll}>
                    End Poll
                  </button>
                </div>
              )}

              {/* Poll History */}
              {showHistory && (
                <div className="poll-history">
                  <h3 className="history-header">Poll History</h3>
                  {pollHistory.length === 0 ? (
                    <p>No polls have been conducted yet.</p>
                  ) : (
                    pollHistory.map((poll, index) => (
                      <div key={index} className="history-item">
                        <div className="history-question">{poll.question}</div>
                        <div className="history-stats">
                          Total Votes: {poll.totalVotes} | 
                          Duration: {Math.round((poll.endTime - poll.startTime) / 1000)}s |
                          {formatTime(poll.timestamp)}
                        </div>
                        <div className="history-results">
                          {Object.entries(poll.results).map(([option, votes]) => (
                            <span key={option} className="history-result">
                              {option}: {votes} votes
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              {/* Student List */}
              <div className="student-list">
                <h3 className="student-list-header">Students ({students.length})</h3>
                {students.length === 0 ? (
                  <p>No students connected.</p>
                ) : (
                  students.map(student => (
                    <div key={student.id} className="student-item">
                      <div className="student-info">
                        <div className={`status-indicator ${student.hasAnswered ? 'status-answered' : 'status-pending'}`}></div>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <button
                        className="kick-btn"
                        onClick={() => handleKickStudent(student.id)}
                      >
                        Kick
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="card">
                <h3 className="mb-4">Actions</h3>
                <div className="flex flex-col gap-4">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <FaHistory /> {showHistory ? 'Hide' : 'Show'} Poll History
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => fetchStudents()}
                  >
                    Refresh Student List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Toggle */}
      <button
        className="chat-toggle"
        onClick={() => setShowChat(!showChat)}
      >
        <FaComments />
      </button>

      {/* Chat Component */}
      {showChat && <Chat onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default TeacherDashboard; 