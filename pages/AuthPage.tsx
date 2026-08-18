import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { LOGO_URL_WITH_TEXT, APP_COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      if (email && password) {
        const ok = await login(email, password);
        if (ok) navigate('/');
        else setError('Invalid email or password.');
      } else {
        setError('Please enter email and password.');
      }
    } else {
      if (email && password && name && birthDate) {
        const ok = await signup({ name, email, birthDate, password });
        if (ok) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
          setName(''); setPassword(''); setBirthDate('');
        } else {
          setError('Could not register. Try a different email.');
        }
      } else {
        setError('Please fill all registration fields.');
      }
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const ok = await loginWithGoogle();
    if (ok) navigate('/');
    else setError('Google login failed. Please try again.');
  };

  return (
    <PageWrapper title={isLogin ? "User Login" : "User Registration"} className="flex flex-col items-center justify-center min-h-screen">
      <img src={LOGO_URL_WITH_TEXT} alt="MediSeek Logo" className="w-48 mb-8" />

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 w-full max-w-md text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {!isLogin && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthDate">Birth Date</label>
              <input type="date" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
            </div>
          </>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required autoComplete="email" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3" required autoComplete={isLogin ? "current-password" : "new-password"} />
        </div>
        <div className="flex items-center justify-between mb-6">
          <button type="submit" style={{ backgroundColor: APP_COLORS.primary }} className="text-white font-bold py-2 px-4 rounded hover:opacity-90">
            {isLogin ? 'Sign In' : 'Register'}
          </button>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-bold text-sm text-calm-blue-primary hover:text-calm-blue-primary/80">
            {isLogin ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
        <button type="button" onClick={handleGoogle} style={{ backgroundColor: APP_COLORS.accent }} className="w-full text-white font-bold py-2 px-4 rounded hover:opacity-90 mb-2">
          Login with Google
        </button>
      </form>

      <div className="mt-6 text-center w-full max-w-md">
        <p className="text-gray-600 text-sm mb-2">Are you a healthcare provider?</p>
        <ReactRouterDOM.Link to="/doctor-auth" className="block text-calm-blue-primary hover:underline mb-1">Doctor Login/Register</ReactRouterDOM.Link>
        <ReactRouterDOM.Link to="/pharmacy-auth" className="block text-calm-blue-primary hover:underline">Pharmacy Login/Register</ReactRouterDOM.Link>
      </div>
      <p className="text-center text-gray-500 text-xs mt-8">&copy; {new Date().getFullYear()} MediSeek. All rights reserved.</p>
    </PageWrapper>
  );
};

export default AuthPage;
