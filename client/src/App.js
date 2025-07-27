import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { SocketContext } from './contexts/SocketContext';
import { UserContext } from './contexts/UserContext';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import KickedPage from './components/KickedPage';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Check for existing user in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('pollingUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('pollingUser', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('pollingUser');
  };

  if (!isConnected) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Connecting to server...</p>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      <UserContext.Provider value={{ user, loginUser, logoutUser }}>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/" 
                element={
                  user ? (
                    user.role === 'teacher' ? 
                      <Navigate to="/teacher" /> : 
                      <Navigate to="/student" />
                  ) : (
                    <LandingPage />
                  )
                } 
              />
              <Route 
                path="/teacher" 
                element={
                  user && user.role === 'teacher' ? 
                    <TeacherDashboard /> : 
                    <Navigate to="/" />
                } 
              />
              <Route 
                path="/student" 
                element={
                  user && user.role === 'student' ? 
                    <StudentDashboard /> : 
                    <Navigate to="/" />
                } 
              />
              <Route 
                path="/kicked" 
                element={<KickedPage />} 
              />
            </Routes>
          </div>
        </Router>
      </UserContext.Provider>
    </SocketContext.Provider>
  );
}

export default App; 