import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe,
  Lock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

const features = [
  {
    icon: Zap,
    title: "Aktivasi Instan",
    desc: 'Sistem otomatis kami memproses pembelian dalam hitungan menit. Channel "Fast" tersedia untuk prioritas tertinggi.',
    color: "var(--gold)",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: Shield,
    title: "Aman & Terenkripsi",
    desc: "Kredensial Anda tidak pernah disimpan permanen. Semua data dienkripsi end-to-end via server kami.",
    color: "var(--success)",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    icon: Globe,
    title: "All Google Account",
    desc: "Mendukung semua akun Google global. Baik personal maupun Workspace.",
    color: "var(--info)",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    icon: Clock,
    title: "Tracking Real-time",
    desc: "Pantau status pembelian Anda secara real-time. Notifikasi otomatis saat selesai.",
    color: "var(--primary-light)",
    bg: "var(--primary-glow)",
  },
  {
    icon: Lock,
    title: "Privacy First",
    desc: "Data Anda tidak dibagikan ke pihak ketiga. Audit log tersedia di dashboard.",
    color: "var(--accent-light)",
    bg: "var(--accent-glow)",
  },
  {
    icon: Star,
    title: "Garansi Berhasil",
    desc: "Poin dikembalikan otomatis jika task gagal. Tidak ada biaya tersembunyi.",
    color: "var(--gold)",
    bg: "rgba(245,158,11,0.1)",
  },
];

const channels = [
  {
    name: "Fast ⚡",
    price: "Rp 50.000",
    unit: "/ task",
    desc: "Prioritas tinggi, proses instan (6 poin)",
    features: [
      "Prioritas antrian",
      "Proses instan",
      "Refund otomatis jika gagal",
      "Tracking real-time",
    ],
    featured: true,
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "rgba(8,8,16,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px var(--primary-glow)",
            }}
          >
            <Cpu size={18} color="white" />
          </div>
          <span
            className="hide-on-mobile"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.05rem",
              background:
                "linear-gradient(135deg, var(--primary-light), var(--accent-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Hanx Gemini Pro
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link to="/auth/register" className="btn btn-primary btn-sm">
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="hero-badge">
              <Zap size={12} fill="currentColor" />
              Hanx Gemini Pro
            </div>
          </motion.div>

          <motion.h1
            className="hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Aktifkan <span className="gradient-text">Google AI Pro</span>
            <br />
            dalam Hitungan Menit
          </motion.h1>

          <motion.p
            className="hero-desc"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Platform pembelian Google AI Pro (Gemini) tercepat dan teraman.
            Proses otomatis, tracking real-time, garansi refund jika gagal.
          </motion.p>

          <motion.div
            className="hero-cta"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <Link
              to="/auth/register"
              className="btn btn-primary btn-xl animate-glow"
            >
              Mulai Sekarang
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="btn btn-secondary btn-xl">
              Sudah Punya Akun
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{
              marginTop: 48,
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["100% Otomatis", "Refund Garansi", "Proses < 15 Menit"].map(
              (t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  <CheckCircle2 size={14} color="var(--success)" />
                  {t}
                </div>
              ),
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
          <motion.div
            className="section-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Keunggulan Kami
          </motion.div>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Kenapa Pilih <span className="gradient-text">Hanx Gemini Pro?</span>
          </motion.h2>
          <motion.p
            className="section-desc"
            style={{ margin: "0 auto" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Dirancang untuk kemudahan, keamanan, dan kecepatan. Tidak perlu
            teknis.
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div
                className="feature-icon"
                style={{ background: f.bg, borderColor: "transparent" }}
              >
                <f.icon size={22} color={f.color} />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <div className="pricing-inner">
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
            <div className="section-label">Harga Channel</div>
            <h2 className="section-title">Pilih Channel Sesuai Kebutuhan</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              Semua transaksi menggunakan jalur prioritas (Fast) dengan garansi
              refund poin jika gagal.
            </p>
          </div>

          <div
            className="pricing-grid"
            style={{
              gridTemplateColumns: "minmax(min(100%, 300px), 400px)",
              justifyContent: "center",
            }}
          >
            {channels.map((ch, i) => (
              <motion.div
                key={ch.name}
                className={`pricing-card ${ch.featured ? "featured" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {ch.featured && (
                  <div className="pricing-badge">⚡ Terpopuler</div>
                )}
                <div className="pricing-name">{ch.name}</div>
                <div className="pricing-price" style={{ fontSize: "2.5rem" }}>
                  {ch.price}{" "}
                  <span style={{ fontSize: "1rem", marginLeft: 4 }}>
                    {ch.unit}
                  </span>
                </div>
                <p className="pricing-desc">{ch.desc}</p>
                <ul className="pricing-features">
                  {ch.features.map((feat) => (
                    <li key={feat}>
                      <CheckCircle2 size={15} color="var(--success)" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to={user ? "/dashboard/submit" : "/auth/register"}
                  className={`btn w-full ${ch.featured ? "btn-primary" : "btn-secondary"}`}
                >
                  Pilih Channel Ini
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "var(--bg)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <motion.div
          style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ marginBottom: 16 }}>
            Siap Aktifkan <span className="gradient-text">Google AI Pro</span>?
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: 32,
              fontSize: "1rem",
            }}
          >
            Daftar sekarang dan aktifkan AI Pro pertamamu dalam hitungan menit.
          </p>
          <Link
            to="/auth/register"
            className="btn btn-primary btn-xl animate-glow"
          >
            Mulai Gratis Sekarang
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Cpu size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>Hanx Gemini Pro</span>
        </div>
        <p>
          © {new Date().getFullYear()} Hanx Gemini Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
