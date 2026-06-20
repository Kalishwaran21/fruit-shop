import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Leaf, LayoutDashboard, ShoppingCart, Apple, Archive, AlertTriangle, List, Lock } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import './animations.css';
import FruitParticles from './components/FruitParticles';
import SplashScreen from './components/SplashScreen';
import { ToastProvider } from './components/Toast';

import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Menu from './pages/Menu';
import StockEntry from './pages/StockEntry';
import CurrentStock from './pages/CurrentStock';
import Wastage from './pages/Wastage';

import Login from './pages/Login';

const NAV_ITEMS = [
  { to: '/', end: true, icon: LayoutDashboard, label: 'Dashboard', short: 'Home' },
  { to: '/billing',       icon: ShoppingCart,  label: 'Billing',       short: 'Bill' },
  { to: '/menu',          icon: List,           label: 'Menu',          short: 'Menu' },
  { to: '/stock-entry',   icon: Archive,        label: 'Stock Entry',   short: 'Stock' },
  { to: '/current-stock', icon: Apple,          label: 'Curr. Stock',   short: 'Levels' },
  { to: '/wastage',       icon: AlertTriangle,  label: 'Wastage',       short: 'Waste' },
];

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Leaf size={24} />
        FreshFruits Pro
      </div>
      <div className="nav-links">
        {NAV_ITEMS.map(({ to, end, icon: Icon, label, short }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}
          >
            <Icon size={18} />
            {/* Show short label on mobile, full label on desktop */}
            <span className="nav-label-desktop">{label}</span>
            <span className="nav-label-mobile">{short}</span>
          </NavLink>
        ))}
        <button className="nav-btn" onClick={onLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Lock size={18} />
          <span className="nav-label-desktop">Logout</span>
          <span className="nav-label-mobile">Out</span>
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <Router>
        <ToastProvider />
        <FruitParticles count={20} />
        {isAuthenticated ? (
          <>
            <Navbar onLogout={() => setIsAuthenticated(false)} />
            <div className="container">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/stock-entry" element={<StockEntry />} />
                  <Route path="/current-stock" element={<CurrentStock />} />
                  <Route path="/wastage" element={<Wastage />} />
                </Routes>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;
