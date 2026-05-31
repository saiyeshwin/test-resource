require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 🔒 SECURITY UPDATE: Lock CORS back down to the React frontend URL
// const io = new Server(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL || "http://localhost:3000",
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });

// Temporarily allow ALL origins so our local HTML file can connect
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[+] React client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`[-] React client disconnected: ${socket.id}`);
    });
});

// 🔒 SECURITY MIDDLEWARE
const verifyApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    
    if (!providedKey || providedKey !== process.env.INTERNAL_API_KEY) {
        console.warn(`[!] Unauthorized access attempt blocked.`);
        return res.status(403).json({ success: false, error: 'Forbidden: Invalid or missing API Key' });
    }
    
    next(); // Key is valid, proceed to the route
};

// MICROSERVICE ENDPOINTS (Protected)(using api key)

app.post('/api/notify/task-assigned', verifyApiKey, (req, res) => {

    console.log("TASK ASSIGNED RECEIVED");
    console.log(req.body);

    const { taskId, developerId, title } = req.body;

    io.emit('taskAssigned', {
        taskId,
        developerId,
        message: `New task assigned: ${title}`
    });

    res.status(200).json({
        success: true,
        message: 'Broadcasted securely'
    });
});
app.post('/api/notify/task-status', verifyApiKey, (req, res) => {
    const { taskId, status } = req.body;
    io.emit('taskStatusUpdated', { taskId, status, message: `Task ${taskId} moved to ${status}` });
    res.status(200).json({ success: true, message: 'Broadcasted securely' });
});

app.post('/api/notify/feedback', verifyApiKey, (req, res) => {
    const { developerId, managerId, comments } = req.body;
    io.emit('managerFeedbackAdded', { developerId, managerId, message: 'New feedback received' });
    res.status(200).json({ success: true, message: 'Broadcasted securely' });
});

app.post('/api/notify/prediction', verifyApiKey, (req, res) => {
    const { projectId, delay_probability, status } = req.body;
    io.emit('predictionGenerated', { projectId, delay_probability, status, message: `Risk updated: ${status}` });
    res.status(200).json({ success: true, message: 'Broadcasted securely' });
});

app.post('/api/notify/deadline', verifyApiKey, (req, res) => {
    const { sprintId, daysRemaining } = req.body;
    io.emit('sprintDeadlineAlert', { sprintId, daysRemaining, message: `Sprint ends in ${daysRemaining} days!` });
    res.status(200).json({ success: true, message: 'Broadcasted securely' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Notification Service is actively running.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Secured Notification Service running on port ${PORT}`);
});
