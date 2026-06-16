import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('maya@example.com');
  const [password, setPassword] = useState('Test1234!@#$');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#f8f7ff]">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient items-center justify-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-60px] left-[-60px] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-40px] right-[-40px] w-72 h-72 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white text-center px-12 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-glow">
            CL
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Where Creators<br />Meet Brands ✨
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            The professional trust layer for the creator economy. Build your verified reputation, discover campaigns, and grow together.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Creators', value: '50K+' },
              { label: 'Brands', value: '8K+' },
              { label: 'Collabs', value: '200K+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 px-2">
                <div className="text-2xl font-black">{value}</div>
                <div className="text-white/70 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center font-black text-white text-lg">
              CL
            </div>
            <span className="text-xl font-extrabold">
              <span className="gradient-text">Creator</span>
              <span className="text-slate-700">Link</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back 👋</h2>
          <p className="text-slate-500 text-sm mb-8">Log in to your CreatorLink account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 text-slate-800 placeholder-slate-400 transition-all text-sm shadow-soft"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 text-slate-800 placeholder-slate-400 transition-all text-sm shadow-soft"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-2xl text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-white font-bold py-3.5 rounded-2xl hover:opacity-90 shadow-glow transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Logging in...
                </span>
              ) : 'Log In →'}
            </button>
          </form>

          {/* Quick login hint */}
          <div className="mt-5 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 text-xs text-slate-600">
            <span className="font-bold text-brand-600">Demo credentials pre-filled</span> — just click Log In to explore ✨
          </div>

          <p className="mt-6 text-sm text-center text-slate-500">
            No account?{' '}
            <Link to="/register" className="font-bold gradient-text hover:opacity-80">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
