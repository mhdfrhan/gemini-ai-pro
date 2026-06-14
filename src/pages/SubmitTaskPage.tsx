import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail, Key, Shield, Zap, Clock, AlertTriangle,
  Info, CheckCircle2, ArrowRight, Send,
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useSubmitTask } from '../hooks/useSubmitTask';
import { useAuth } from '../contexts/AuthContext';
import type { TaskMode, TaskChannel } from '../types';

const schema = z.object({
  email: z.string().email('Email Google tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  twofa_url: z
    .string()
    .length(32, 'Secret 2FA harus tepat 32 karakter')
    .regex(/^[A-Z2-7]+=*$/i, 'Secret 2FA hanya boleh berisi karakter Base32'),
  task_mode: z.enum(['extract_link', 'direct_subscription'] as const),
  channel: z.enum(['normal', 'fast'] as const),
  callback_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const COST = 6;

export default function SubmitTaskPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useSubmitTask();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const {
    register, handleSubmit, watch, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { task_mode: 'extract_link', channel: 'fast' },
  });

  const cost = COST;
  const balance = user?.points ?? 0;
  const canAfford = balance >= cost;

  const onSubmit = (data: FormData) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingData) return;
    setConfirmOpen(false);
    try {
      if (!user) throw new Error('Not logged in');
      const result = await mutateAsync({
        payload: {
          ...pendingData,
          callback_url: pendingData.callback_url || undefined,
        },
        uid: user.uid,
      });
      navigate({ to: '/dashboard/history', search: { highlight: String(result.task.id) } });
    } catch {
      // Error handled by mutation hook toast
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Beli Google AI Pro</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Isi form berikut untuk mengaktifkan Google AI Pro
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 'var(--radius)',
          padding: '8px 14px',
        }}>
          <Zap size={16} color="var(--gold)" fill="var(--gold)" />
          <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            {balance}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>poin</span>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 720, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Security notice */}
          <div style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            marginBottom: 28,
          }}>
            <Shield size={18} color="var(--info)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--info)', fontSize: '0.875rem', marginBottom: 4 }}>
                Data Anda Aman
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Kredensial Google Anda diproses melalui server terenkripsi kami dan tidak pernah disimpan permanen setelah task selesai.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Google credentials */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Mail size={18} color="var(--primary-light)" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Kredensial Akun Google</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input
                  id="task-email"
                  label="Email Google"
                  type="email"
                  placeholder="yourname@gmail.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  id="task-password"
                  label="Password Google"
                  type="password"
                  placeholder="Password akun Google Anda"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <div className="form-group">
                  <Input
                    id="task-2fa"
                    label="Secret 2FA (32 karakter)"
                    type="text"
                    placeholder="JBSWY3DPEHPK3PXP..."
                    iconRight={<Key size={16} />}
                    error={errors.twofa_url?.message}
                    hint="Secret key dari aplikasi authenticator Anda (bukan kode 6 digit)"
                    {...register('twofa_url')}
                  />
                </div>
              </div>
            </div>

            {/* Task mode & Channel selection omitted, hardcoded to fast and extract_link */}
            <input type="hidden" {...register('task_mode')} value="extract_link" />
            <input type="hidden" {...register('channel')} value="fast" />

            {/* Optional callback UI removed */}
            <input type="hidden" {...register('callback_url')} value="" />

            {/* Cost summary */}
            <div style={{
              background: canAfford ? 'rgba(34,197,94,0.08)' : 'var(--danger-bg)',
              border: `1px solid ${canAfford ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {canAfford
                  ? <CheckCircle2 size={18} color="var(--success)" />
                  : <AlertTriangle size={18} color="var(--danger)" />}
                <span style={{ fontSize: '0.875rem', color: canAfford ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {canAfford ? 'Saldo mencukupi' : 'Saldo tidak cukup'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Biaya: </span>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                    {cost} poin
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Saldo: </span>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                    {balance} poin
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sisa: </span>
                  <span style={{ fontWeight: 700, color: canAfford ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-heading)' }}>
                    {balance - cost} poin
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canAfford}
              loading={isPending}
            >
              <Send size={18} />
              Submit Task — {cost} Poin
              <ArrowRight size={18} />
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Confirm modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Konfirmasi Submit Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', gap: 10,
          }}>
            <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
              Pastikan data yang Anda masukkan benar. Task tidak dapat dibatalkan setelah disubmit.
            </p>
          </div>

          {[
            { label: 'Email', value: pendingData?.email },
            { label: 'Mode', value: 'Extract Link' },
            { label: 'Channel', value: 'Fast ⚡' },
            { label: 'Biaya', value: `${cost} poin` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{value}</span>
            </div>
          ))}

          <div className="divider" style={{ margin: '8px 0' }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" className="w-full" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" className="w-full" onClick={confirmSubmit} loading={isPending}>
              Ya, Submit Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
