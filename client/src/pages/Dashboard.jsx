import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import Shimmer from '../components/Shimmer';
import LowStockAlert from '../components/LowStockAlert';
import useCountUp from '../hooks/useCountUp';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const FRUIT_COLORS = ['#34d399','#fbbf24','#f87171','#a78bfa','#60a5fa','#fb923c','#34d399','#f472b6','#4ade80','#facc15'];

function StatCard({ label, value, prefix = '₹', color = 'var(--primary-color)', glowClass = '', suffix = '' }) {
  const animated = useCountUp(value);
  return (
    <div className={`glass-card glow-card ${glowClass}`} style={{ borderLeft: `4px solid ${color}`, padding: '18px 20px' }}>
      <h4 style={{ color: '#86efac', marginBottom: '8px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</h4>
      <h2 className="count-up" style={{ fontSize: '1.7rem', color, fontWeight: 800, lineHeight: 1 }}>
        {prefix}{animated.toFixed(2)}{suffix}
      </h2>
    </div>
  );
}

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [stockDetails, setStockDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [sRes, fRes, stRes, wRes, salRes] = await Promise.all([
        fetch('https://fruit-shop-bhxj.onrender.com/api/sales'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/fruits'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/stock'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/wastage'),
        fetch('https://fruit-shop-bhxj.onrender.com/api/sales'),
      ]);
      const [salesData, fruitsData, stockData, wastageData] = await Promise.all([
        sRes.json(), fRes.json(), stRes.json(), wRes.json(),
      ]);
      setSales(salesData);
      setFruits(fruitsData);

      // Compute live stock for alert
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
    fetchAll();
  }, []);

  // Stats calculation
  const now = new Date();
  let dailyGross = 0, dailyProfit = 0, weeklyGross = 0, monthlyGross = 0;
  let itemMap = {};
  sales.forEach(bill => {
    const billDate = new Date(bill.date);
    const diffDays = Math.ceil(Math.abs(now - billDate) / 86400000);
    let billProfit = 0;
    bill.items.forEach(item => {
      billProfit += (item.price - item.buyPrice) * item.qty;
      itemMap[item.name] = (itemMap[item.name] || 0) + item.total;
    });
    if (now.toDateString() === billDate.toDateString()) { dailyGross += bill.grandTotal; dailyProfit += billProfit; }
    if (diffDays <= 7) weeklyGross += bill.grandTotal;
    if (now.getMonth() === billDate.getMonth() && now.getFullYear() === billDate.getFullYear()) monthlyGross += bill.grandTotal;
  });

  // Last 7 days daily revenue chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dailyRevenue = last7Days.map(day =>
    sales.filter(b => new Date(b.date).toDateString() === day.toDateString())
         .reduce((s, b) => s + b.grandTotal, 0)
  );
  const dailyLabels = last7Days.map(d => d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' }));

  const barData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Revenue (₹)',
      data: dailyRevenue,
      backgroundColor: dailyRevenue.map((_, i) => i === 6 ? '#34d399' : 'rgba(52,211,153,0.35)'),
      borderRadius: 10, borderWidth: 0,
    }]
  };

  // Fruit revenue doughnut chart
  const fruitLabels = Object.keys(itemMap);
  const fruitValues = Object.values(itemMap);
  const doughnutData = {
    labels: fruitLabels,
    datasets: [{
      data: fruitValues,
      backgroundColor: FRUIT_COLORS.slice(0, fruitLabels.length),
      borderWidth: 2,
      borderColor: 'rgba(5,26,10,0.9)',
      hoverOffset: 10,
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ₹${ctx.parsed.toFixed(2)}` } } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => '₹' + v, color: '#86efac', font: { size: 11 } }, grid: { color: 'rgba(52,211,153,0.08)' } },
      x: { ticks: { color: '#86efac', font: { size: 10 } }, grid: { display: false } }
    }
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    animation: { animateRotate: true, duration: 1400 },
    plugins: {
      legend: { position: 'bottom', labels: { color: '#86efac', padding: 14, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toFixed(2)}` } }
    },
    cutout: '60%',
  };

  return (
    <PageTransition>
      {/* Hero Banner */}
      <div className="fruit-hero-banner flip-card-enter">
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.9rem', fontWeight: 800 }}>🌿 FreshFruits Pro</h1>
          <p style={{ color: 'rgba(134,239,172,0.75)', marginTop: '6px', fontSize: '0.9rem' }}>Real-Time Inventory & Sales Dashboard</p>
        </div>
        <div className="fruit-hero-emojis" style={{ fontSize: '2.2rem' }}>
          <span>🍎</span><span>🍌</span><span>🥭</span><span>🍇</span>
        </div>
      </div>

      {/* Low Stock Alert */}
      {!loading && <LowStockAlert stockDetails={stockDetails} />}

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <Shimmer key={i} rows={2} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard label="Today's Sales"   value={dailyGross}   color="#34d399" glowClass="" />
          <StatCard label="Today's Profit"  value={dailyProfit}  color="#60a5fa" glowClass="blue" />
          <StatCard label="Weekly Sales"    value={weeklyGross}  color="#fbbf24" glowClass="orange" />
          <StatCard label="Monthly Sales"   value={monthlyGross} color="#a78bfa" glowClass="purple" />
        </div>
      )}

      {/* Daily Revenue Chart (Last 7 Days) */}
      <div className="glass-card glow-card flip-card-enter" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📅 Last 7 Days Revenue
        </h3>
        {loading ? <Shimmer rows={5} /> : (
          <div style={{ height: '220px' }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Fruit Revenue Doughnut Chart */}
      <div className="glass-card glow-card flip-card-enter" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🍊 Revenue by Fruit
        </h3>
        {loading ? <Shimmer rows={5} /> : fruitLabels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#86efac', opacity: 0.6 }}>No sales data yet 🍃</div>
        ) : (
          <div style={{ height: '280px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        )}
      </div>

      {/* Fruit Stock Status Bar Chart */}
      <div className="glass-card glow-card flip-card-enter" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🥝 Current Stock Levels (Kg)
        </h3>
        {loading ? <Shimmer rows={4} /> : (
          <div style={{ height: '220px' }}>
            <Bar
              data={{
                labels: stockDetails.map(f => f.name),
                datasets: [{
                  label: 'Stock (Kg)',
                  data: stockDetails.map(f => Math.max(f.current, 0)),
                  backgroundColor: stockDetails.map(f =>
                    f.current <= 0 ? '#f87171' : f.current < 15 ? '#fbbf24' : '#34d399'
                  ),
                  borderRadius: 8, borderWidth: 0,
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: { ...chartOptions.scales.y, ticks: { callback: v => v + ' Kg', color: '#86efac', font: { size: 11 } } }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Recent Sales Feed */}
      <div className="glass-card flip-card-enter">
        <h3 style={{ marginBottom: '14px', fontSize: '1rem', color: '#34d399' }}>🧾 Recent Invoices</h3>
        {loading ? <Shimmer rows={4} /> : sales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#86efac', opacity: 0.5 }}>No sales yet. Start billing! 🍊</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sales.slice(0, 8).map((sale, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'rgba(52,211,153,0.04)',
                border: '1px solid rgba(52,211,153,0.1)',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ color: '#f0fdf4', fontWeight: 600, fontSize: '0.9rem' }}>#{sale.invoiceId}</div>
                  <div style={{ color: '#86efac', fontSize: '0.78rem', marginTop: '2px' }}>
                    {new Date(sale.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.05rem' }}>₹{sale.grandTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
