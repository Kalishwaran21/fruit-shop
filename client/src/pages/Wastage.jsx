import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Shimmer from '../components/Shimmer';
import LowStockAlert from '../components/LowStockAlert';
import { toast } from '../components/Toast';

export default function Wastage() {
  const [fruits, setFruits] = useState([]);
  const [wastageLogs, setWastageLogs] = useState([]);
  const [form, setForm] = useState({ fruitId: '', qty: '' });
  const [currentStock, setCurrentStock] = useState({});
  const [stockDetails, setStockDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [fRes, wRes, sRes, saleRes] = await Promise.all([
      fetch('https://fruit-shop-bhxj.onrender.com/api/fruits'),
      fetch('https://fruit-shop-bhxj.onrender.com/api/wastage'),
      fetch('https://fruit-shop-bhxj.onrender.com/api/stock'),
      fetch('https://fruit-shop-bhxj.onrender.com/api/sales'),
    ]);
    const [fruitsData, wastageData, stockData, salesData] = await Promise.all([
      fRes.json(), wRes.json(), sRes.json(), saleRes.json(),
    ]);
    setFruits(fruitsData.sort((a, b) => a.name.localeCompare(b.name)));
    setWastageLogs(wastageData.slice(0, 20));

    const details = fruitsData.map(fruit => {
      let inward = 0, sold = 0, wasted = 0;
      stockData.forEach(l => { if (l.fruitId === fruit._id) inward += l.qty; });
      wastageData.forEach(l => { if (l.fruitId === fruit._id) wasted += l.qty; });
      salesData.forEach(b => b.items.forEach(i => { if (i.name === fruit.name) sold += i.qty; }));
      return { ...fruit, current: inward - sold - wasted };
    });
    setStockDetails(details);

    const stockMap = {};
    details.forEach(d => stockMap[d._id] = d.current);
    setCurrentStock(stockMap);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFruit = fruits.find(f => f._id === form.fruitId);
    const qty = parseFloat(form.qty);
    if (!selectedFruit || isNaN(qty) || qty <= 0) return;

    const avail = currentStock[selectedFruit._id] || 0;
    if (qty > avail) {
      toast(`⚠️ Cannot report more than ${avail.toFixed(2)} Kg available!`, 'warning');
      return;
    }

    setSubmitting(true);
    await fetch('https://fruit-shop-bhxj.onrender.com/api/wastage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fruitId: selectedFruit._id, name: selectedFruit.name, qty }),
    });

    toast(`📋 Wastage of ${qty.toFixed(2)} Kg ${selectedFruit.name} logged.`, 'success');
    setForm({ fruitId: '', qty: '' });
    setSubmitting(false);
    loadData();
  };

  return (
    <PageTransition>
      <h2 className="page-title" style={{ fontSize: '1.5rem' }}>🗑️ Wastage / Damage</h2>

      {/* Low Stock Alert */}
      {!loading && <LowStockAlert stockDetails={stockDetails} />}

      {/* Report Form */}
      <div className="glass-card flip-card-enter" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', color: '#f87171', marginBottom: '16px' }}>🚨 Report Damaged Goods</h3>
        {loading ? <Shimmer rows={3} /> : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>🍑 Select Fruit</label>
              <select value={form.fruitId} onChange={e => setForm({ ...form, fruitId: e.target.value })} required>
                <option value="">-- Choose Fruit --</option>
                {fruits.map(f => {
                  const avail = currentStock[f._id] || 0;
                  return (
                    <option key={f._id} value={f._id} disabled={avail <= 0}>
                      {f.name} — Avail: {avail.toFixed(1)} Kg {avail <= 0 ? '🔴 Empty' : avail < 15 ? '🟡' : '✅'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="input-group">
              <label>⚖️ Quantity Lost (Kg)</label>
              <input
                type="number" step="0.01" min="0.1"
                value={form.qty}
                onChange={e => setForm({ ...form, qty: e.target.value })}
                required placeholder="Enter wasted kg..."
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="btn"
              style={{ width: '100%', marginTop: '8px', background: '#ef4444', color: 'white', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? '⏳ Logging...' : '🗑️ Submit Wastage'}
            </button>
          </form>
        )}
      </div>

      {/* Wastage Logs - Mobile Cards */}
      <div className="glass-card flip-card-enter">
        <h3 style={{ fontSize: '1rem', color: '#f87171', marginBottom: '14px' }}>🕒 Recent Wastage Logs</h3>
        {loading ? <Shimmer rows={4} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {wastageLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#86efac', opacity: 0.5 }}>No wastage logged yet ✨</div>
            ) : wastageLogs.map((log, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(248,113,113,0.05)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderLeft: '3px solid #f87171',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ color: '#f0fdf4', fontWeight: 600 }}>🗑️ {log.name}</div>
                  <div style={{ color: '#86efac', fontSize: '0.8rem', marginTop: '2px' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ color: '#f87171', fontWeight: 800, fontSize: '1.1rem' }}>-{log.qty.toFixed(2)} Kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
