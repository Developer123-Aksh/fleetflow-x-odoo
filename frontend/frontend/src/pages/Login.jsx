import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'manager',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">FleetFlow</h1>
        <p className="login-subtitle">
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={4}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="manager">Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="safety">Safety</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
          )}

          <button type="submit" className="primary-btn login-btn" disabled={loading}>
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)} className="toggle-link">
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
