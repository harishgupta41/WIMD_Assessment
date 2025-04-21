import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("http://localhost:5000/check-session", {
        credentials: "include"
      });
      const data = await res.json();

      if (data.status !== "success") {
        navigate("/login");
      } else {
        const userRes = await fetch("http://localhost:5000/dashboard", {
          credentials: "include"
        });
        const userData = await userRes.json();
        if (userRes.ok && userData.status === "success") {
          setUser(userData.user);
          setReferrals(userData.referrals);
          setRewards(userData.rewards);
          setRedemptions(userData.redemptions);
        } else {
          setError("Error loading data");
        }
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();

    if (data.status === "success") {
      navigate("/");
    } else {
      alert("Logout failed");
    }
  };

  const handleResetReferralCode = async () => {
    const res = await fetch("http://localhost:5000/reset-referral", {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();

    if (data.status === "success") {
      setUser((prevUser) => ({
        ...prevUser,
        referral_code: data.referral_code,
      }));
      alert("Referral code has been reset!");
    } else {
      alert("Failed to reset referral code");
    }
  };

  const handleRedeemReward = async (rewardId) => {
    const res = await fetch(`http://localhost:5000/redeem/${rewardId}`, {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      alert(`You have redeemed the ${data.reward.name} reward.`);
      // Update the user points and redemption history
      setUser((prevUser) => ({
        ...prevUser,
        points: prevUser.points - data.reward.points_required,
      }));
      setRedemptions((prevRedemptions) => [
        ...prevRedemptions,
        `Redeemed ${data.reward.name}`,
      ]);
    } else {
      alert(data.message);
    }
  };

  function redumption() =>
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {user ? (
        <>
          <h1>Dashboard</h1>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <p>Points: {user.points}</p>
          <p>Referral Code: {user.referral_code}</p>

          <button onClick={handleLogout}>Logout</button>
          <button onClick={handleResetReferralCode}>Reset Referral Code</button>

          <h3>Your Referrals</h3>
          <h3>Available Rewards</h3>
          <div>
            Free E-Book
            30 Points
            <b onclick="redemption()"> Redeme</b>
          </div>
          <div>
            Amazon Coupon Worth RS 100
            100 Points
            <b onclick="redemption()"> Redeme</b>
          </div>
          <h3>Redemption History</h3>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
