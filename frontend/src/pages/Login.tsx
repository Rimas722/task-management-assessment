import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@test.com'); 
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      login(token, user);

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to connect to the server. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage your tasks effectively</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 transition cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 border border-blue-100 text-center">
          <strong>Default Admin Credentials:</strong><br />
          Email: <span className="font-mono">admin@test.com</span> | Password: <span className="font-mono">123456</span>
        </div>
      </div>
    </div>
  );
}