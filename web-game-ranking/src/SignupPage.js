import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const apiUrl = process.env.REACT_APP_API_ENDPOINT_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");  // 비밀번호 불일치 오류
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 비밀번호 확인 체크
    if (password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setPasswordError(""); // 비밀번호가 일치하면 오류 메시지 초기화

    try {
      const response = await fetch(apiUrl + "/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      navigate("/login");
      alert(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-section">
        <h1>회원가입</h1>
        <form onSubmit={handleSignup}>
          <div>
            <p>이메일</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <p>닉네임</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <p>비밀번호</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <p>비밀번호 확인</p>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button className="login-button" type="submit">회원가입</button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
