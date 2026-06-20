import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Shimmer from '../components/Shimmer';
import { toast } from '../components/Toast';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

export default function Menu() {
  const [fruits, setFruits] = useState([]);
  const [form, setForm] = useState({ name: '', buyPrice: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadFruits = async () => {
    const res = await fetch('https://fruit-shop-bhxj.onrender.com/api/fruits');
    const data = await res.json();
    setFruits(data.sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  };

  useEffect(() => { loadFruits(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (editId) {
      await fetch(`https://fruit-shop-bhxj.onrender.com/api/fruits/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast(`✅ ${form.name} updated successfully!`, 'success');
      setEditId(null);
    } else {
      await fetch('https://fruit-shop-bhxj.onrender.com/api/fruits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast(`🍊 ${form.name} added to catalog!`, 'success');
    }
    setForm({ name: '', buyPrice: '', price: '' });
    setShowForm(false);
    setSubmitting(false);
    loadFruits();
  };

  const deleteFruit = async (id, name) => {
    if (!window.confirm(`Delete ${name} from the catalog?`)) return;
    await fetch(`https://fruit-shop-bhxj.onrender.com/api/fruits/${id}`, { method: 'DELETE' });
    toast(`🗑️ ${name} removed from catalog.`, 'success');
    loadFruits();
  };

  const startEdit = (fruit) => {
    setEditId(fruit._id);
    setForm({ name: fruit.name, buyPrice: fruit.buyPrice, price: fruit.price });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>📋 Fruit Catalog</h2>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', buyPrice: '', price: '' }); }}
        >
          <PlusCircle size={16} /> {showForm ? 'Cancel' : 'Add Fruit'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-card flip-card-enter" style={{ marginBottom: '20px', borderLeft: `4px solid ${editId ? '#fbbf24' : '#34d399'}` }}>
          <h3 style={{ fontSize: '1rem', color: editId ? '#fbbf24' : '#34d399', marginBottom: '16px' }}>
            {editId ? '✏️ Edit Fruit' : '➕ New Fruit'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Fruit Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Mango" disabled={!!editId} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label>Buy Price (₹/Kg)</label>
                <input type="number" step="0.01" min="0" value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} required placeholder="0.00" />
              </div>
              <div className="input-group">
                <label>Sell Price (₹/Kg)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
              </div>
            </div>
            {/* Profit preview */}
            {form.buyPrice && form.price && (
              <div style={{ padding: '8px 12px', background: 'rgba(52,211,153,0.06)', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', color: (form.price - form.buyPrice) >= 0 ? '#34d399' : '#f87171' }}>
                Profit Margin: ₹{(parseFloat(form.price || 0) - parseFloat(form.buyPrice || 0)).toFixed(2)}/Kg
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
              {submitting ? '⏳ Saving...' : editId ? '✅ Update Fruit' : '➕ Add to Catalog'}
            </button>
          </form>
        </div>
      )}

      {/* Fruit Cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => <Shimmer key={i} rows={2} />)}
        </div>
      ) : fruits.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#86efac', opacity: 0.6 }}>
          No fruits added yet. Click "Add Fruit" to start! 🍎
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fruits.map(fruit => {
            const margin = fruit.price - fruit.buyPrice;
            const marginPct = fruit.buyPrice > 0 ? ((margin / fruit.buyPrice) * 100).toFixed(1) : 0;
            return (
              <div key={fruit._id} className="glass-card glow-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '1.1rem' }}>🍊 {fruit.name}</div>
                    <div style={{ color: margin >= 0 ? '#34d399' : '#f87171', fontSize: '0.82rem', marginTop: '2px', fontWeight: 600 }}>
                      {margin >= 0 ? '📈' : '📉'} ₹{margin.toFixed(2)}/Kg margin ({marginPct}%)
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', padding: '6px 12px' }}
                      onClick={() => startEdit(fruit)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn"
                      style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', padding: '6px 12px' }}
                      onClick={() => deleteFruit(fruit._id, fruit.name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px' }}>
                    <div style={{ color: '#86efac', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buy Price</div>
                    <div style={{ color: '#f0fdf4', fontWeight: 700, fontSize: '1.05rem' }}>₹{fruit.buyPrice.toFixed(2)}/Kg</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px' }}>
                    <div style={{ color: '#86efac', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sell Price</div>
                    <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>₹{fruit.price.toFixed(2)}/Kg</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
