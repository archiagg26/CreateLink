import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [error, setError] = useState('');
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, role);
      alert('Registration successful! Check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-slate-900 border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent tracking-tight text-center">
          Register on CreatorLink
        </h1>
        <p className="text-slate-400 text-xs text-center mb-8 leading-relaxed">
          Create an account to start collaborating and building campaigns.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer select-none">
                <input
                  type="radio"
                  value="creator"
                  checked={role === 'creator'}
                  onChange={() => setRole('creator')}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2"
                />
                Creator
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer select-none">
                <input
                  type="radio"
                  value="brand"
                  checked={role === 'brand'}
                  onChange={() => setRole('brand')}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2"
                />
                Brand
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-all duration-200 text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-all duration-200 text-sm"
              placeholder="Create a password"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Min 12 chars, uppercase, lowercase, digit, special char
            </p>
          </div>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/15 transition-all duration-200 text-sm"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-xs text-center text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 hover:underline font-semibold">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
