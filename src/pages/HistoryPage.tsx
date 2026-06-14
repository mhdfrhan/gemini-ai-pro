import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Zap, Search, Filter, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useTasks } from '../hooks/useTasks';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Task, TaskStatus } from '../types';

function formatDate(dateVal: any) {
  if (!dateVal) return '—';
  
  let d: Date;
  if (typeof dateVal?.toMillis === 'function') {
    d = new Date(dateVal.toMillis());
  } else if (dateVal.seconds || dateVal._seconds) {
    d = new Date((dateVal.seconds || dateVal._seconds) * 1000);
  } else {
    d = new Date(dateVal);
  }

  if (isNaN(d.getTime())) return 'Invalid Date';

  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_FILTERS: Array<{ label: string; value: TaskStatus | 'all' }> = [
  { label: 'Semua', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Diproses', value: 'processing' },
  { label: 'Sukses', value: 'success' },
  { label: 'Gagal', value: 'failed' },
];

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }} className="hover:bg-slate-800/50 transition-colors">
      <td>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text)' }}>
          {task.display_id || `TASK-${task.task_id || task.id}`}
        </span>
      </td>
      <td>
        <span style={{ fontSize: '0.82rem' }} className="truncate">
          {task.email || '-'}
        </span>
      </td>
      <td>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {task.task_mode === 'extract_link' ? '🔗 Extract Link' : task.task_mode === 'direct_subscription' ? '⚡ Direct Sub' : 'Unknown'}
        </span>
      </td>
      <td>
        <span style={{
          fontWeight: 600, fontSize: '0.82rem',
          color: task.channel === 'fast' ? 'var(--gold)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {task.channel === 'fast' && <Zap size={12} />}
          {task.channel || '-'}
        </span>
      </td>
      <td>
        <span style={{ fontWeight: 600, color: 'var(--primary-light)', fontSize: '0.82rem' }}>
          {task.points_cost || '-'} poin
        </span>
      </td>
      <td><StatusBadge status={task.status} /></td>
      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {formatDate(task.created_at)}
      </td>
      <td>
        {task.result_link ? (
          <a
            href={task.result_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Buka Link
          </a>
        ) : (task.status === 'failed' || task.status === 'refunded') ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
              {task.error_message || 'Gagal'}
            </span>
            <Link 
              to="/dashboard/submit"
              search={{ email: task.email || undefined }}
              className="btn btn-sm"
              style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--primary-glow)', color: 'var(--primary-light)', border: '1px solid var(--primary-light)' }}
            >
              <RefreshCw size={10} style={{ marginRight: 4 }} />
              Jalankan Ulang
            </Link>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
        )}
      </td>
    </tr>
  );
}

export default function HistoryPage() {
  const { tasks, loading } = useTasks();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const navigate = useNavigate();

  // Polling otomatis untuk task yang belum selesai
  useEffect(() => {
    const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'processing');
    if (activeTasks.length === 0) return;

    const interval = setInterval(() => {
      activeTasks.forEach(async (task) => {
        try {
          await fetch(`/api/tasks/status?task_id=${task.task_id || task.id}`);
        } catch (err) {
          console.error('Auto-poll error:', err);
        }
      });
    }, 10000); // Cek setiap 10 detik

    return () => clearInterval(interval);
  }, [tasks]);

  const handleCheckStatus = async () => {
    if (!selectedTask) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/tasks/status?task_id=${selectedTask.task_id || selectedTask.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengecek status');
      
      toast.success(data.message || 'Status berhasil di-refresh');
      // Update selectedTask locally just in case onSnapshot is slow
      setSelectedTask(prev => prev ? { ...prev, ...data.task } : null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memanggil API Pixel');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleRequeue = () => {
    if (!selectedTask) return;
    navigate({
      to: '/dashboard/submit',
      search: { email: selectedTask.email },
    });
  };

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === 'all' || 
                        t.status === statusFilter || 
                        (statusFilter === 'failed' && t.status === 'refunded');
    const matchSearch = !search ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      String(t.id).includes(search) ||
      (t.display_id && t.display_id.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Riwayat Transaksi</h2>
          <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {tasks.length} total transaksi
          </p>
        </div>
        <Link to="/dashboard/submit" className="btn btn-primary btn-sm">
          + Beli Baru
        </Link>
      </div>

      <div className="page-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="table-wrapper"
        >
          {/* Filters */}
          <div className="table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--text-muted)" />
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="input-wrapper" style={{ width: 220 }}>
              <input
                className="form-input"
                placeholder="Cari email / ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '8px 36px 8px 12px', fontSize: '0.82rem' }}
              />
              <span className="input-icon-right">
                <Search size={15} />
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding: 60 }}>
              <Loader2 size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-center" style={{ padding: 60, flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '2.5rem' }}>📭</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {search || statusFilter !== 'all' ? 'Tidak ada hasil yang cocok' : 'Belum ada transaksi'}
              </p>
              {!search && statusFilter === 'all' && (
                <Link to="/dashboard/submit" className="btn btn-primary btn-sm">
                  Submit Task Pertama
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email Google</th>
                    <th>Mode</th>
                    <th>Channel</th>
                    <th>Biaya</th>
                    <th>Status</th>
                    <th>Waktu</th>
                    <th>Hasil</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((task) => (
                    <TaskRow key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* MODAL DETAIL TASK */}
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '480px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Detail Transaksi</h3>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>ID Transaksi</div>
                <div style={{ fontWeight: 600 }}>{selectedTask.display_id || `TASK-${selectedTask.task_id || selectedTask.id}`}</div>
                
                <div style={{ color: 'var(--text-muted)' }}>Email Google</div>
                <div>{selectedTask.email || '-'}</div>
                
                <div style={{ color: 'var(--text-muted)' }}>Status</div>
                <div><StatusBadge status={selectedTask.status} /></div>
                
                <div style={{ color: 'var(--text-muted)' }}>Biaya</div>
                <div style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{selectedTask.points_cost || '-'} poin</div>
                
                <div style={{ color: 'var(--text-muted)' }}>Dibuat Pada</div>
                <div>{formatDate(selectedTask.created_at)}</div>
              </div>

              {(selectedTask.error_message || selectedTask.status === 'failed' || selectedTask.status === 'refunded') && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>Pesan Error:</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--danger)' }}>
                    {selectedTask.error_message || 'Task gagal diproses oleh server.'}
                  </p>
                  {(selectedTask.refunded || selectedTask.status === 'refunded') && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ Poin telah di-refund ke saldo Anda.</p>
                  )}
                </div>
              )}

              {selectedTask.result_link && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>Hasil:</p>
                  <a href={selectedTask.result_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--success-light)', wordBreak: 'break-all', display: 'block', marginTop: 4 }}>
                    {selectedTask.result_link}
                  </a>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={handleCheckStatus} disabled={checkingStatus} className="btn btn-ghost btn-sm">
                {checkingStatus ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                Cek Status Manual
              </button>
              
              {(selectedTask.status === 'failed' || selectedTask.status === 'refunded') && (
                <button onClick={handleRequeue} className="btn btn-primary btn-sm">
                  Jalankan Ulang <ArrowRight size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
