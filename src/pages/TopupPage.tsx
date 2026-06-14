import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/Button';

// Add type for Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

export function TopupPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTopup = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Dapatkan Snap Token dari Vercel API
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal membuat transaksi');
      }

      const { token } = await response.json();

      // 2. Tampilkan popup Midtrans
      window.snap.pay(token, {
        onSuccess: function (result: any) {
          console.log('Success:', result);
          alert("Pembayaran berhasil! Poin Anda akan ditambahkan sebentar lagi.");
          // Poin ditambahkan otomatis via Webhook di backend
        },
        onPending: function (result: any) {
          console.log('Pending:', result);
          alert("Menunggu pembayaran Anda.");
        },
        onError: function (result: any) {
          console.error('Error:', result);
          setError("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          console.log('Customer closed the popup without finishing the payment');
        }
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Topup Poin</h2>
          <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Poin Anda saat ini: <strong style={{ color: 'var(--text)' }}>{user?.points || 0}</strong>
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
          Kembali
        </Link>
      </div>

      <div className="page-content" style={{ maxWidth: 640, margin: '0 auto' }}>
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: 20,
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <Wallet size={28} color="var(--primary-light)" />
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Paket Poin</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pilih paket untuk mengaktifkan bot</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text)' }}>Paket Standar</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: 300 }}>
                  Dapatkan <strong>6 Poin</strong> untuk 1x eksekusi task mode Extract Link (Channel Fast).
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'var(--font-heading)' }}>
                  Rp 50.000
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                onClick={handleTopup}
                loading={loading}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Memproses...' : 'Beli Sekarang — Rp 50.000'}
              </Button>
            </div>
          </div>
          
          <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
            * Pembayaran diproses secara aman oleh <strong>Midtrans</strong>.<br/> Poin akan masuk ke akun Anda secara instan setelah pembayaran sukses.
          </div>
        </div>
      </div>
    </>
  );
}
