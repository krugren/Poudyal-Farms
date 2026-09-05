"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/admin-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(username, password);
      localStorage.setItem('poudhyal_admin_token', data.token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-forest-dark)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 'var(--space-8)' }}>
        <div className="text-center mb-6">
          <span className="text-3xl">🌿</span>
          <h1 className="mt-2 text-2xl font-heading" style={{ color: 'var(--color-forest-dark)' }}>Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="form-error text-center mb-4 p-2" style={{ background: '#fdf0f0', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn--primary w-full" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
