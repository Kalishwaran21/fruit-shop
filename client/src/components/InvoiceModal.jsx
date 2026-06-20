import { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function InvoiceModal({ invoice, onClose }) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation after mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Animate out before calling onClose
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        /* Overlay fade */
        background: visible ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
      }}
    >
      {/* Card — slides up + fades in */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(4, 18, 8, 0.97)',
          border: '1px solid rgba(52,211,153,0.35)',
          borderRadius: '22px',
          padding: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(52,211,153,0.08)',
          /* Slide-up spring animation */
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.93)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s ease',
        }}
      >
        {/* ✅ Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px',
            borderRadius: '50%',
            background: 'rgba(52,211,153,0.15)',
            border: '2px solid rgba(52,211,153,0.4)',
            marginBottom: '10px',
            animation: visible ? 'successIconPop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
          }}>
            <CheckCircle size={30} color="#34d399" />
          </div>
          <h2 style={{ color: '#34d399', fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>
            Invoice Generated!
          </h2>
          <p style={{ color: '#86efac', fontSize: '0.82rem', marginTop: '4px', opacity: 0.7 }}>
            Sale recorded successfully 🎉
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(52,211,153,0.15)', marginBottom: '18px' }} />

        {/* Invoice Meta */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'rgba(52,211,153,0.06)',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '0.88rem',
        }}>
          <div>
            <div style={{ color: '#86efac', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice No</div>
            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem' }}>#{invoice.invoiceId}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#86efac', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date & Time</div>
            <div style={{ color: '#f0fdf4', fontWeight: 600 }}>
              {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ color: '#86efac', fontSize: '0.78rem' }}>
              {new Date(invoice.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Items — animated stagger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {invoice.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(52,211,153,0.04)',
              border: '1px solid rgba(52,211,153,0.1)',
              borderRadius: '10px',
              /* Staggered fade-up per row */
              animation: visible ? `invoiceRowIn 0.4s ${0.25 + i * 0.07}s cubic-bezier(0.23,1,0.32,1) both` : 'none',
            }}>
              <div>
                <div style={{ color: '#f0fdf4', fontWeight: 600, fontSize: '0.92rem' }}>🍊 {item.name}</div>
                <div style={{ color: '#86efac', fontSize: '0.78rem' }}>{item.qty.toFixed(2)} Kg × ₹{item.price.toFixed(2)}</div>
              </div>
              <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1rem' }}>₹{item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px',
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.25)',
          borderRadius: '12px',
          marginBottom: '18px',
        }}>
          <span style={{ color: '#86efac', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grand Total</span>
          <span style={{ color: '#34d399', fontWeight: 800, fontSize: '1.8rem' }}>₹{invoice.grandTotal.toFixed(2)}</span>
        </div>

        {/* Thank you note */}
        <div style={{ textAlign: 'center', color: '#86efac', fontSize: '0.8rem', opacity: 0.55, marginBottom: '18px' }}>
          🍎 Thank you! FreshFruits Pro
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1rem', letterSpacing: '0.03em' }}
        >
          ✅ Close Invoice
        </button>

        {/* X icon top-right */}
        <button onClick={handleClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: '50%', width: '34px', height: '34px',
          cursor: 'pointer', color: '#86efac',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <X size={18} />
        </button>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes successIconPop {
          from { transform: scale(0.3) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
        }
        @keyframes invoiceRowIn {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}
