import { AlertTriangle, X } from 'lucide-react';

export default function LowStockAlert({ stockDetails, onDismiss }) {
  const lowItems = stockDetails.filter(f => f.current > 0 && f.current < 5);
  const emptyItems = stockDetails.filter(f => f.current <= 0);

  if (lowItems.length === 0 && emptyItems.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(5,26,10,0.85)',
      border: '1px solid rgba(251,191,36,0.35)',
      borderLeft: '4px solid #fbbf24',
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
          <AlertTriangle size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem', marginBottom: '10px' }}>
              ⚠️ Stock Alert
            </div>

            {emptyItems.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Out of Stock
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {emptyItems.map(f => (
                    <span key={f._id} className="badge badge-empty" style={{ animation: 'pulseEmpty 1.2s ease-in-out infinite' }}>
                      {f.name}: {f.current.toFixed(1)} Kg
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lowItems.length > 0 && (
              <div>
                <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Low Stock (Below 5 Kg)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lowItems.map(f => (
                    <span key={f._id} className="badge badge-low" style={{ animation: 'pulseLow 2s ease-in-out infinite' }}>
                      {f.name}: {f.current.toFixed(1)} Kg
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86efac', flexShrink: 0 }}>
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
