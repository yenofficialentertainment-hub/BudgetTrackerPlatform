import React, { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification, // Import this for verification
} from 'firebase/auth';

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To show loading status
  const [message, setMessage] = useState(''); // Success messages

  // Handle Email/Password
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true); // Start loading

    try {
      if (isLogin) {
        // LOGIN LOGIC
        await signInWithEmailAndPassword(auth, email, password);
        // App.tsx handles the redirection automatically upon success
      } else {
        // REGISTER LOGIC
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Send Verification Email
        await sendEmailVerification(userCredential.user);
        setMessage(
          `✅ Account created! We sent a verification link to ${email}. Please check your inbox (or spam).`
        );
        setIsLogin(true); // Switch to login view
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      // Make error messages readable
      let msg = err.message;
      if (msg.includes('auth/invalid-email'))
        msg = 'Mali yung format ng email mo.';
      if (msg.includes('auth/user-not-found'))
        msg = 'Wala pang account na ganyan.';
      if (msg.includes('auth/wrong-password')) msg = 'Mali ang password.';
      if (msg.includes('auth/email-already-in-use'))
        msg = "May gumagamit na ng email na 'yan.";
      setError(msg);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError('Google Login Failed: ' + err.message);
      setIsLoading(false);
    }
  };

  // --- STYLES (Dark Mode Aesthetic) ---
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#121212', // Dark background
    fontFamily: 'Segoe UI, sans-serif',
  };

  const cardStyle = {
    background: '#1e1e1e',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '350px',
    textAlign: 'center' as const,
    color: '#e0e0e0',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#2c2c2c',
    color: 'white',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  };

  const btnStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    background: '#007bff',
    color: 'white',
    fontSize: '1rem',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '20px', color: '#fff' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {/* MESSAGES */}
        {error && (
          <div
            style={{
              background: '#ff444433',
              color: '#ff4444',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div
            style={{
              background: '#00c85133',
              color: '#00c851',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '0.9rem',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />

          <button type="submit" style={btnStyle} disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '15px 0',
            color: '#666',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{ ...btnStyle, background: '#DB4437' }}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'G Login with Google'}
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#aaa' }}>
          {isLogin ? 'No account yet? ' : 'Already have one? '}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setMessage('');
            }}
            style={{
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

