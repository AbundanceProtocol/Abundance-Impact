import React, { useState } from 'react';

const STORAGE_KEY = 'neynar_authenticated_user';

const FarcasterLoginButton = ({ onSignInSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Get nonce
  const getNonce = async () => {
    const res = await fetch('/api/auth/nonce');
    const data = await res.json();
    return data.nonce;
  };

  // Step 2: Sign in with Farcaster (pseudo-code, replace with actual SDK/AuthKit)
  const signInWithFarcaster = async (nonce) => {
    // TODO: Replace with actual Farcaster Auth Kit logic
    // Example: const { message, signature } = await farcasterSignIn(nonce);
    // return { message, signature };
    alert('Replace this with Farcaster Auth Kit sign-in logic.');
    return { message: '', signature: '' };
  };

  // Step 3: Fetch signers
  const fetchSigners = async (message, signature) => {
    const res = await fetch(`/api/auth/signers?message=${encodeURIComponent(message)}&signature=${signature}`);
    const data = await res.json();
    return data;
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const nonce = await getNonce();
      const { message, signature } = await signInWithFarcaster(nonce);
      if (!message || !signature) throw new Error('No signature returned');
      const data = await fetchSigners(message, signature);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user: data.user, signers: data.signers }));
      if (onSignInSuccess) onSignInSuccess(data);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="frnt-nynr-btn" onClick={handleLogin} disabled={loading} style={{
      color: "white",
      fontSize: "18px",
      fontFamily: "Ariel",
      textAlign: "center",
      padding: "12px 12px 12px 32px",
      fontWeight: 600,
      borderRadius: '14px',
      background: '#8247e5',
      border: 'none',
      cursor: 'pointer',
      minWidth: '220px',
    }}>
      {loading ? 'Connecting...' : 'Connect Farcaster'}
      {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
    </button>
  );
};

export default FarcasterLoginButton;