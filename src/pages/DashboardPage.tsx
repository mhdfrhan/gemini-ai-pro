import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import {
  Zap, TrendingUp, Clock, CheckCircle2, PlusCircle,
  ArrowRight, RefreshCw, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { useTasks } from '../hooks/useTasks';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Task } from '../types';

function BalanceCard({ points, loading }: { points?: number; loading: boolean }) {
  return (
    <div className="card card-gradient-border" style={{ gridColumn: 'span 1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(245,158,11,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={22} color="var(--gold)" fill="var(--gold)" />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Saldo Poin
          </div>
        </div>
      </div>
      {loading ? (
        <div className="skeleton skeleton-title" style={{ width: '60%' }} />
      ) : (
        <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)', lineHeight: 1 }}>
          {points ?? 0}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 8 }}>poin</span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value?: number | string;
  color: string;
  bg: string;
  loading: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={20} color={color} />
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 32, width: 60, marginBottom: 6 }} />
      ) : (
        <div className="stat-value">{value ?? 0}</div>
      )}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function RecentTaskRow({ task }: { task: Task }) {
  return (
    <tr>
      <td>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem' }}>
          {task.display_id || `TASK-${task.task_id || task.id}`}
        </span>
      </td>
      <td style={{ maxWidth: 180 }}>
        <span className="truncate" style={{ display: 'block', fontSize: '0.8rem' }}>
          {task.email || '-'}
        </span>
      </td>
      <td>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {task.task_mode === 'extract_link' ? 'Extract Link' : task.task_mode === 'direct_subscription' ? 'Subscription' : 'Unknown'}
        </span>
      </td>
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '0.8rem', color: task.channel === 'fast' ? 'var(--gold)' : 'var(--text-muted)',
          fontWeight: 600,
        }}>
          {task.channel === 'fast' && <Zap size={12} />}
          {task.channel || '-'}
        </span>
      </td>
      <td><StatusBadge status={task.status} /></td>
      <td>
        <Link
          to="/dashboard/history"
          style={{ fontSize: '0.8rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          Detail <ArrowRight size={12} />
        </Link>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();


  const recentTasks = tasks.slice(0, 5);
  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'processing').length;
  const successCount = tasks.filter((t) => t.status === 'success').length;
  const today = new Date();
  const todaySuccessCount = tasks.filter(t => {
    if (t.status !== 'success' || !t.created_at) return false;
    // Handle both Firestore Timestamp and standard Date/string
    const date = typeof t.created_at.toDate === 'function' ? t.created_at.toDate() : new Date(t.created_at as string | number | Date);
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.07, duration: 0.4 },
    }),
  };

  return (
    <>
      {/* Page header */}
      <div className="topbar">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
            Halo, {user?.displayName?.split(' ')[0]} 👋
          </h2>
          <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Selamat datang di dashboard Anda
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={15} />
            <span className="hide-on-mobile">Refresh</span>
          </button>
          <Link to="/dashboard/submit" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span className="hide-on-mobile">Beli Sekarang</span>
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Stats grid */}
        <motion.div
          className="stats-grid"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          <motion.div variants={fadeUp} custom={0} style={{ gridColumn: 'span 1' }}>
            <BalanceCard points={user?.points ?? 0} loading={false} />
            <div style={{ marginTop: 8 }}>
              <Link to="/dashboard/topup" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <PlusCircle size={15} />
                Topup Poin
              </Link>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={1}>
            <StatCard
              icon={TrendingUp} label="Total Sukses"
              value={successCount}
              color="var(--success)" bg="var(--success-bg)" loading={tasksLoading}
            />
          </motion.div>
          <motion.div variants={fadeUp} custom={2}>
            <StatCard
              icon={Clock} label="Pending Aktif"
              value={pendingCount}
              color="var(--warning)" bg="var(--warning-bg)" loading={tasksLoading}
            />
          </motion.div>
          <motion.div variants={fadeUp} custom={3}>
            <StatCard
              icon={CheckCircle2} label="Sukses Hari Ini"
              value={todaySuccessCount}
              color="var(--primary-light)" bg="var(--primary-glow)" loading={tasksLoading}
            />
          </motion.div>
        </motion.div>

        {/* Quick action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Zap size={18} color="var(--gold)" fill="var(--gold)" />
              <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                Aktifkan Google AI Pro Sekarang
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Proses otomatis dalam 5-60 menit. (Minimal 1 task baru/per 10 menit)
            </p>
          </div>
          <Link to="/dashboard/submit" className="btn btn-primary">
            <PlusCircle size={16} />
            Submit Task Baru
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Recent tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="table-wrapper"
        >
          <div className="table-header">
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Transaksi Terbaru</h3>
            <Link to="/dashboard/history" className="btn btn-ghost btn-sm">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="flex-center" style={{ padding: 48 }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="flex-center" style={{ padding: 60, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '2rem' }}>📭</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Belum ada transaksi</p>
              <Link to="/dashboard/submit" className="btn btn-primary btn-sm">
                <PlusCircle size={14} />
                Submit Task Pertama
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Mode</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <RecentTaskRow key={task.id} task={task} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
