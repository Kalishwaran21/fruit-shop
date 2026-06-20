import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import LowStockAlert from '../components/LowStockAlert';

export default function CurrentStock() {
  const [stockDetails, setStockDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [fRes, wRes, sRes, saleRes] = await Promise.all([
        fetch('https://fruit-shop-bhxj.onrender.com/api/fruits'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/wastage'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/stock'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/sales')
      ]);

      const fruitsData = await fRes.json();
      const wastageData = await wRes.json();
      const stockData = await sRes.json();
      const salesData = await saleRes.json();

      const details = fruitsData.map(fruit => {
        let inward = 0, sold = 0, wasted = 0;
        
        stockData.forEach(l => { if (l.fruitId === fruit._id) inward += l.qty; });
        wastageData.forEach(l => { if (l.fruitId === fruit._id) wasted += l.qty; });
        salesData.forEach(b => b.items.forEach(i => { if (i.name === fruit.name) sold += i.qty; }));
        
        const current = inward - sold - wasted;
        return { ...fruit, inward, sold, wasted, current };
      });

      setStockDetails(details);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <PageTransition>
      <h2 className="page-title" style={{ fontSize: '1.5rem' }}>📦 Live Stock</h2>

      {/* Low Stock Alert */}
      {!loading && <LowStockAlert stockDetails={stockDetails} />}

      {/* Mobile card layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {stockDetails.map(fruit => {
          let badgeClass = 'badge-good', badgeText = '✅ Good';
          if (fruit.current <= 0) { badgeClass = 'badge-empty'; badgeText = '🔴 Out of Stock'; }
          else if (fruit.current < 15) { badgeClass = 'badge-low'; badgeText = '🟡 Low Stock'; }

          return (
            <div key={fruit._id} className="glass-card glow-card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ color: '#f0fdf4', fontSize: '1.05rem' }}>🍊 {fruit.name}</strong>
                <span className={`badge ${badgeClass}`}>{badgeText}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Inward', value: fruit.inward.toFixed(1), color: '#34d399' },
                  { label: 'Sold', value: fruit.sold.toFixed(1), color: '#60a5fa' },
                  { label: 'Wasted', value: fruit.wasted.toFixed(1), color: '#f87171' },
                  { label: 'Available', value: fruit.current.toFixed(1), color: fruit.current <= 0 ? '#f87171' : fruit.current < 15 ? '#fbbf24' : '#34d399' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(52,211,153,0.05)', borderRadius: '8px' }}>
                    <div style={{ color: stat.color, fontWeight: 700, fontSize: '1rem' }}>{stat.value}</div>
                    <div style={{ color: '#86efac', fontSize: '0.7rem', marginTop: '2px' }}>{stat.label} Kg</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
