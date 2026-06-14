import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, Mail, User, Cpu, Zap, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerFn, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerFn(data.email, data.password, data.displayName);
      toast.success('Akun berhasil dibuat!', { description: 'Selamat datang di Hanx Gemini Pro.' });
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error('Registrasi gagal', { description: msg });
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate({ to: '/dashboard' });
    } catch {
      toast.error('Login Google gagal');
    }
  };

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px var(--accent-glow)',
          }}>
            <Cpu size={32} color="white" />
          </div>
          <h2 style={{ marginBottom: 12 }}>
            Bergabunglah dengan <span className="gradient-text">Hanx Gemini Pro</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.7 }}>
            Ribuan pengguna telah mengaktifkan Google AI Pro dengan mudah dan aman melalui platform kami.
          </p>
          {[
            { icon: Zap, text: 'Gratis daftar, tanpa biaya awal' },
            { icon: Shield, text: 'Privasi data terjamin' },
            { icon: Star, text: 'Dukungan 24/7' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, textAlign: 'left' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--accent-glow)',
                border: '1px solid rgba(168,85,247,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} color="var(--accent-light)" />
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <motion.div
          className="auth-form-wrapper"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-title">Buat Akun Baru</h1>
            <p className="auth-subtitle">Daftar gratis dan mulai beli Google AI Pro</p>
          </div>

          <Button variant="secondary" className="w-full" style={{ marginBottom: 4 }} onClick={handleGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} height={18} alt="Google" />
            Daftar dengan Google
          </Button>

          <div className="auth-divider">atau daftar dengan email</div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              id="reg-name"
              label="Nama Lengkap"
              type="text"
              placeholder="John Doe"
              iconRight={<User size={16} />}
              error={errors.displayName?.message}
              {...register('displayName')}
            />
            <Input
              id="reg-email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              iconRight={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="reg-password"
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="reg-confirm"
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} style={{ marginTop: 8 }}>
              <UserPlus size={17} />
              Buat Akun Sekarang
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sudah punya akun?{' '}
            <Link to="/auth/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
