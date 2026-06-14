import { Link, useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Zap,
  LogOut,
  User,
  Menu,
  X,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';


const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/submit', label: 'Beli Sekarang', icon: PlusCircle },
  { to: '/dashboard/history', label: 'Riwayat', icon: History },
  { to: '/dashboard/tutorial', label: 'Tutorial & FAQ', icon: BookOpen },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="btn btn-ghost sidebar-toggle-btn"
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 70,
          padding: '8px',
        }}
        id="sidebar-toggle"
        onClick={() => setMobileOpen((p) => !p)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 55,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Cpu size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">Hanx Gemini Pro</span>
        </div>

        {/* Balance mini card */}
        <div style={{
          background: 'var(--primary-glow)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Saldo Poin
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={16} color="var(--gold)" fill="var(--gold)" />
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
              {user?.points ?? '—'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon }) => {
            return (
              <Link
                key={to}
                to={to}
                className="sidebar-link"
                activeProps={{ className: 'active' }}
                activeOptions={{ exact: true }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User & logout */}
        <div style={{ marginTop: 'auto' }}>
          <div className="divider" />
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--surface-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={14} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <button
            className="sidebar-link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={logout}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
