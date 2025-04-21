import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          email_or_phone: emailOrPhone,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        const sessionCheck = await fetch("http://localhost:5000/check-session", {
          credentials: "include"
        });
        const sessionData = await sessionCheck.json();
        
        if (sessionCheck.ok && sessionData.status === "success") {
          navigate("/dashboard");
        }        
         else {
          alert("Session could not be verified.");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Something went wrong. Try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome to Rewardly</h2>
      <input
        type="text"
        placeholder="Email or Phone"
        value={emailOrPhone}
        onChange={(e) => setEmailOrPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>
        New here? <span onClick={() => navigate('/register')}>Sign Up</span>
      </p>
    </div>
  );
};

export default Login;
