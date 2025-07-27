# Live Polling System

A real-time polling system built with React, Express.js, and Socket.IO for interactive classroom engagement between teachers and students.

## Features

### Teacher Features
- ✅ Create new polls with custom questions and options
- ✅ Configure maximum time for polls (10-300 seconds)
- ✅ View live polling results in real-time
- ✅ Monitor student participation status
- ✅ Kick students out of the session
- ✅ View poll history (not from localStorage)
- ✅ Chat with students and other teachers
- ✅ End polls manually or automatically

### Student Features
- ✅ Enter unique name (persisted per tab)
- ✅ Participate in live polls
- ✅ 60-second timer (or custom time set by teacher)
- ✅ View real-time poll results
- ✅ Chat with teachers and other students
- ✅ Automatic redirect to results when time expires

### Technical Features
- ✅ Real-time communication with Socket.IO
- ✅ Modern, responsive UI design
- ✅ Tab-based user persistence
- ✅ Live updates without page refresh
- ✅ Cross-browser compatibility

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Teacher-student
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend development server (port 3000).

## Manual Setup

If you prefer to install dependencies separately:

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## Usage

### For Teachers

1. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Select "Teacher" role
   - Enter your name

2. **Create a Poll**
   - Fill in the question
   - Add 2 or more options
   - Set the time limit (default: 60 seconds)
   - Click "Create Poll"

3. **Monitor Results**
   - View live results as students answer
   - See student participation status
   - End poll manually if needed

4. **Manage Students**
   - View connected students
   - Kick students if necessary
   - Use chat for communication

### For Students

1. **Join the Session**
   - Open `http://localhost:3000` in a new tab
   - Select "Student" role
   - Enter your name (unique per tab)

2. **Participate in Polls**
   - Wait for teacher to create a poll
   - Select your answer within the time limit
   - View live results after submitting

3. **Use Chat**
   - Click the chat button to communicate
   - Send messages to teachers and other students

## Project Structure

```
Teacher-student/
├── server/                 # Backend Express.js server
│   ├── index.js           # Main server file with Socket.IO
│   └── package.json       # Server dependencies
├── client/                # React frontend
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── ...
│   └── package.json       # Client dependencies
├── package.json           # Root package.json
└── README.md             # This file
```

## API Endpoints

### Server Routes
- `GET /api/poll-history` - Get poll history
- `GET /api/active-poll` - Get current active poll
- `GET /api/students` - Get connected students list

### Socket.IO Events

#### Teacher Events
- `teacher-join` - Teacher joins the session
- `create-poll` - Create a new poll
- `end-poll` - End current poll
- `kick-student` - Kick a student

#### Student Events
- `student-join` - Student joins the session
- `submit-answer` - Submit poll answer

#### Shared Events
- `send-message` - Send chat message

#### Server Broadcasts
- `new-poll` - New poll created
- `poll-results` - Updated poll results
- `poll-ended` - Poll has ended
- `new-message` - New chat message
- `student-kicked` - Student was kicked

## Deployment

### Backend Deployment
1. Set environment variables:
   ```bash
   PORT=5000
   NODE_ENV=production
   ```

2. Build and start:
   ```bash
   cd server
   npm install
   npm start
   ```

### Frontend Deployment
1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Serve the build folder with a static server or deploy to platforms like:
   - Vercel
   - Netlify
   - GitHub Pages
   - Heroku

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.

---

**Note**: This system is designed for educational purposes and should be used in controlled environments. The teacher has full control over the session and can manage student access as needed. 