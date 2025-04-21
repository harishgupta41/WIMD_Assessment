import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral]= useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, phone, password, referral }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Registered! Please log in.');
      navigate('/');
    } else {
      alert(data.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create your Rewardly account</h2>
      <input
        type='text'
        placeholder='UserName'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Referral Code"
        value={referral}
        onChange={(e) => setReferral(e.target.value)}
      />
      <button onClick={handleRegister}>Sign Up</button>
      <p>
        Already have an account? <span onClick={() => navigate('/')}>Login</span>
      </p>
    </div>
  );
};

export default Register;
