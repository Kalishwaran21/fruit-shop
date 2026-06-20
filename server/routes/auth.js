import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Track active sessions: Map of token -> timestamp
const activeSessions = new Map();

// Periodic cleanup of inactive sessions (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  for (const [token, timestamp] of activeSessions.entries()) {
    if (now - timestamp > ONE_HOUR) {
      activeSessions.delete(token);
    }
  }
}, 15 * 60 * 1000); // Check every 15 minutes

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Using simple hardcoded admin credentials or env variables
  const adminUsername = process.env.ADMIN_USERNAME || 'Branch 1';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Start*1';

  if (username === adminUsername && password === adminPassword) {
    // Check concurrent sessions limit
    if (activeSessions.size >= 2) {
      return res.status(403).json({ 
        success: false, 
        message: 'Maximum of 2 active users allowed. Please try again later.' 
      });
    }

    // Generate a dynamic token and add to active sessions
    const token = 'admin-token-' + crypto.randomBytes(16).toString('hex');
    activeSessions.set(token, Date.now());

    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token: token
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

router.post('/logout', (req, res) => {
  const { token } = req.body;
  if (token && activeSessions.has(token)) {
    activeSessions.delete(token);
  }
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;
