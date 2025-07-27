import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { UserContext } from '../contexts/UserContext';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const Chat = ({ onClose }) => {
  const socket = useContext(SocketContext);
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', { message: newMessage.trim() });
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-title">Class Chat</span>
        <button className="close-chat" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="text-center" style={{ color: '#666', marginTop: '20px' }}>
            <p>No messages yet</p>
            <p>Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.senderId === socket?.id ? 'own' : 'other'}`}
            >
              <div className="message-sender">
                {message.sender} ({message.senderType})
              </div>
              <div>{message.message}</div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={200}
        />
        <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat; 