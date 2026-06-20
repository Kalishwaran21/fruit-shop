import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Shimmer from '../components/Shimmer';
import { toast } from '../components/Toast';

export default function StockEntry() {
  const [fruits, setFruits] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [form, setForm] = useState({ fruitId: '', qty: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [fRes, sRes] = await Promise.all([
      fetch('https://fruit-shop-bhxj.onrender.com/api/fruits'),
      fetch('https://fruit-shop-bhxj.onrender.com/api/stock'),
    ]);
    const [fruitsData, stockData] = await Promise.all([fRes.json(), sRes.json()]);
    setFruits(fruitsData.sort((a, b) => a.name.localeCompare(b.name)));
    setStockLogs(stockData.slice(0, 20)); // Show last 20
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFruit = fruits.find(f => f._id === form.fruitId);
    const qty = parseFloat(form.qty);
    if (!selectedFruit || isNaN(qty) || qty <= 0) return;

    setSubmitting(true);
    await fetch('https://fruit-shop-bhxj.onrender.com/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fruitId: selectedFruit._id, name: selectedFruit.name, qty }),
    });

    toast(`✅ +${qty.toFixed(2)} Kg of ${selectedFruit.name} added!`, 'success');
    setForm({ fruitId: '', qty: '' });
    setSubmitting(false);
    loadData();
  };

  return (
    <PageTransition>
      <h2 className="page-title" style={{ fontSize: '1.5rem' }}>📦 Stock Inward Entry</h2>

      {/* Add Form */}
      <div className="glass-card flip-card-enter" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', color: '#34d399', marginBottom: '16px' }}>📥 Log New Batch</h3>
        {loading ? <Shimmer rows={3} /> : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>🍑 Select Fruit</label>
              <select value={form.fruitId} onChange={e => setForm({ ...form, fruitId: e.target.value })} required>
                <option value="">-- Choose Fruit --</option>
                {fruits.map(f => <option key={f._id} value={f._id}>{f.name} — Buy: ₹{f.buyPrice}/Kg</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>⚖️ Quantity Received (Kg)</label>
              <input
                type="number" step="0.01" min="0.1"
                value={form.qty}
                onChange={e => setForm({ ...form, qty: e.target.value })}
                required placeholder="Enter quantity..."
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
              {submitting ? '⏳ Adding...' : '📥 Add Stock Batch'}
            </button>
          </form>
        )}
      </div>

      {/* Recent Logs - Mobile Cards */}
      <div className="glass-card flip-card-enter">
        <h3 style={{ fontSize: '1rem', color: '#34d399', marginBottom: '14px' }}>🕒 Recent Inward Logs</h3>
        {loading ? <Shimmer rows={4} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stockLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#86efac', opacity: 0.5 }}>No stock logs yet 📭</div>
            ) : stockLogs.map((log, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(52,211,153,0.05)',
                border: '1px solid rgba(52,211,153,0.1)',
                borderLeft: '3px solid #34d399',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ color: '#f0fdf4', fontWeight: 600 }}>🍊 {log.name}</div>
                  <div style={{ color: '#86efac', fontSize: '0.8rem', marginTop: '2px' }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem' }}>+{log.qty.toFixed(2)} Kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
