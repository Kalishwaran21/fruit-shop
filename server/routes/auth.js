import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Using simple hardcoded admin credentials or env variables
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUsername && password === adminPassword) {
    // Return a dummy token to satisfy the client
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token: 'admin-auth-token-123'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

export default router;
