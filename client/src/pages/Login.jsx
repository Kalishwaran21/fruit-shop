import { useState } from 'react';
import { Leaf, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../components/Toast';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast('Login successful', 'success');
        onLogin(data.token);
      } else {
        toast(data.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      toast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Leaf size={48} color="#34d399" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '1.8rem', color: '#34d399' }}>FreshFruits Pro</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Username
            </label>
            <input 
              type="text" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
