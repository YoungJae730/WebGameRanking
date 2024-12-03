import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function LoginPage({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setUser(data.user);
      setToken(data.token);

      // 로컬 저장소에 사용자 정보 및 토큰 저장
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <form onSubmit={handleLogin}>
          <div>
            <p>이메일</p><br/>
            <input className="login-input" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <br />
          <div>
            <p>비밀번호</p><br/>
            <input className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <br />
          <button className="login-button" type="submit">로그인</button>
        </form>
        <p onClick={handleSignup} style={{cursor:'pointer'}}>회원가입</p>
      </div>
    </div>
  );
}

export default LoginPage;
