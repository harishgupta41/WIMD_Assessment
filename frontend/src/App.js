import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/dashboard', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json()) 
      .then((data) => {
        if (data.status === 'success') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);
  

  if (isLoading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
        } />

        {/* Register Route (always accessible) */}
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Route */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
}

export default App;
