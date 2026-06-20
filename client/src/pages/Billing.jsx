import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import PageTransition from '../components/PageTransition';
import Shimmer from '../components/Shimmer';
import InvoiceModal from '../components/InvoiceModal';
import LowStockAlert from '../components/LowStockAlert';
import { toast } from '../components/Toast';

export default function Billing() {
  const [fruits, setFruits] = useState([]);
  const [currentStock, setCurrentStock] = useState({});
  const [stockDetails, setStockDetails] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ fruitName: '', qty: '' });
  const [loading, setLoading] = useState(true);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [invoiceId, setInvoiceId] = useState('000001');
  const [recentSales, setRecentSales] = useState([]);

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
    setRecentSales(salesData);

    // Calculate sequential Invoice ID starting from 000001
    const nextInvoiceNum = salesData.length > 0 
      ? Math.max(...salesData.map(s => parseInt(s.invoiceId, 10) || 0)) + 1 
      : 1;
    setInvoiceId(String(nextInvoiceNum).padStart(6, '0'));

    // Stock map by name
    const stockMap = {};
    fruitsData.forEach(f => stockMap[f.name] = 0);
    stockData.forEach(s => stockMap[s.name] = (stockMap[s.name] || 0) + s.qty);
    wastageData.forEach(w => stockMap[w.name] = (stockMap[w.name] || 0) - w.qty);
    salesData.forEach(bill => bill.items.forEach(item => {
      if (stockMap[item.name] !== undefined) stockMap[item.name] -= item.qty;
    }));
    setCurrentStock(stockMap);

    // Stock details for low stock alert
    const details = fruitsData.map(fruit => {
      let inward = 0, sold = 0, wasted = 0;
      stockData.forEach(l => { if (l.fruitId === fruit._id) inward += l.qty; });
      wastageData.forEach(l => { if (l.fruitId === fruit._id) wasted += l.qty; });
      salesData.forEach(b => b.items.forEach(i => { if (i.name === fruit.name) sold += i.qty; }));
      return { ...fruit, current: inward - sold - wasted };
    });
    setStockDetails(details);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addToCart = (e) => {
    e.preventDefault();
    const selectedFruit = fruits.find(f => f.name === form.fruitName);
    const qty = parseFloat(form.qty);
    if (!selectedFruit || isNaN(qty) || qty <= 0) return;

    const available = currentStock[selectedFruit.name] || 0;
    const existing = cart.find(item => item.name === selectedFruit.name);
    const cumQty = qty + (existing ? existing.qty : 0);

    if (cumQty > available) {
      toast(`⚠️ Only ${available.toFixed(2)} Kg available for ${selectedFruit.name}!`, 'warning');
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.name === selectedFruit.name
        ? { ...item, qty: cumQty, total: cumQty * item.price } : item));
    } else {
      setCart([...cart, {
        name: selectedFruit.name, price: selectedFruit.price,
        buyPrice: selectedFruit.buyPrice, qty, total: qty * selectedFruit.price,
      }]);
    }
    setForm({ fruitName: '', qty: '' });
  };

  const grandTotal = cart.reduce((s, i) => s + i.total, 0);

  const fireConfetti = () => {
    const end = Date.now() + 2000;
    const colors = ['#34d399','#fbbf24','#f87171','#a78bfa','#60a5fa'];
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const checkout = async () => {
    if (cart.length === 0) return toast('🛒 Cart is empty!', 'warning');
    for (let item of cart) {
      if ((currentStock[item.name] || 0) < item.qty)
        return toast(`⚠️ Stock for ${item.name} changed mid-session!`, 'error');
    }

    const invoicePayload = { invoiceId, items: cart, grandTotal, date: new Date().toISOString() };
    await fetch('https://fruit-shop-bhxj.onrender.com/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoicePayload),
    });

    fireConfetti();
    setCompletedInvoice(invoicePayload); // 📄 Show invoice modal
    setCart([]);
    loadData();
  };

  return (
    <PageTransition>
      {/* Invoice Modal - shows after successful checkout */}
      {completedInvoice && (
        <InvoiceModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}

      <h2 className="page-title" style={{ fontSize: '1.5rem' }}>🧾 New Invoice</h2>

      {/* Low Stock Alert */}
      {!loading && <LowStockAlert stockDetails={stockDetails} />}

      {/* Add Item Form */}
      {loading ? <Shimmer rows={3} /> : (
        <div className="glass-card flip-card-enter" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(52,211,153,0.1)', fontSize: '0.9rem' }}>
            <span style={{ color: '#86efac' }}>📅 {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>#{invoiceId}</span>
          </div>

          <form onSubmit={addToCart}>
            <div className="input-group">
              <label>🍑 Select Fruit</label>
              <select value={form.fruitName} onChange={e => setForm({ ...form, fruitName: e.target.value })} required>
                <option value="">-- Choose Fruit --</option>
                {fruits.map(f => (
                  <option key={f._id} value={f.name}>
                    {f.name} — ₹{f.price}/Kg
                    {(currentStock[f.name] || 0) <= 0 ? ' 🔴 Out' : (currentStock[f.name] || 0) < 15 ? ` 🟡 ${(currentStock[f.name]||0).toFixed(1)}Kg` : ` ✅ ${(currentStock[f.name]||0).toFixed(1)}Kg`}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>⚖️ Quantity (Kg)</label>
              <input type="number" step="0.01" min="0.1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} required placeholder="Enter kg..." />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              ➕ Add to Cart
            </button>
          </form>
        </div>
      )}

      {/* Cart */}
      <div className="glass-card flip-card-enter">
        <h3 style={{ marginBottom: '14px', fontSize: '1rem', color: '#34d399' }}>🛒 Current Bill</h3>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#86efac', opacity: 0.5, fontSize: '1rem' }}>
            🍽️ No items added yet
          </div>
        ) : (
          <>
            {/* Mobile-friendly card layout instead of table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: 'rgba(52,211,153,0.05)',
                  border: '1px solid rgba(52,211,153,0.1)', borderRadius: '10px',
                }}>
                  <div>
                    <div style={{ color: '#f0fdf4', fontWeight: 600 }}>🍊 {item.name}</div>
                    <div style={{ color: '#86efac', fontSize: '0.82rem' }}>
                      {item.qty.toFixed(2)} Kg × ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{item.total.toFixed(2)}</span>
                    <button className="btn" style={{ background: 'var(--danger-color)', color: 'white', padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={() => setCart(cart.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid rgba(52,211,153,0.15)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#86efac', fontSize: '1rem' }}>Grand Total</span>
                <span style={{ color: '#34d399', fontWeight: 800, fontSize: '1.8rem' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }} onClick={checkout}>
                🎊 Complete Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🧾 Recent Invoices Section */}
      <div className="glass-card flip-card-enter" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '14px', fontSize: '1.1rem', color: '#34d399', fontWeight: 600 }}>🧾 Recent Invoices</h3>
        {loading ? <Shimmer rows={3} /> : recentSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#86efac', opacity: 0.5, fontSize: '0.9rem' }}>No sales yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentSales.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((sale, i) => (
              <div key={i} 
                onClick={() => setCompletedInvoice(sale)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(52,211,153,0.04)',
                  border: '1px solid rgba(52,211,153,0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(52,211,153,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(52,211,153,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.1)';
                }}
              >
                <div>
                  <div style={{ color: '#f0fdf4', fontWeight: 600, fontSize: '0.9rem' }}>#{sale.invoiceId}</div>
                  <div style={{ color: '#86efac', fontSize: '0.78rem', marginTop: '2px' }}>
                    {new Date(sale.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.05rem' }}>₹{sale.grandTotal.toFixed(2)}</span>
                  <span style={{ fontSize: '0.8rem', color: '#86efac', opacity: 0.7 }}>👁️ View</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
