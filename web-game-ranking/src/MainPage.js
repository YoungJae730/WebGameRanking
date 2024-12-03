import React from "react";
import { useNavigate } from 'react-router-dom';
import "./App.css";

function MainPage({ user, onLogout }) {
  const navigate = useNavigate();

  console.log(user);
  // 로그인 핸들러
  const handleLogin = () => {
    navigate('/login');
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    onLogout();
  };

  // 로그인 핸들러
  const handleSignup = () => {
    navigate('/signup');
  };

  const handleProfile = () => {
    if(!user){
      navigate('/login');
    } else {
      navigate('/profile');
    }
  }

  const handleRanking = () => {
    navigate('/ranking');
  }

  return (
    <div className="app-container">
    {/* 왼쪽 패널 */}
    <aside className="left-panel">
      <div className="auth-profile-section">
        {user ? (
          <div className="profile-section">
            <div className="profile-picture">{user.profilePicture}</div>
            <div className="profile-name">{user.name}</div>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="auth-section">
            <button className="login-button" onClick={handleLogin}>
              로그인
            </button>
            <br />
            <button className="signup-button" onClick={handleSignup}>회원가입</button>
          </div>
        )}
      </div>

      <ul>
        <li>
          <p onClick={handleProfile}>프로필</p>
        </li>
        <li>
          <p onClick={handleRanking}>랭킹</p>
        </li>
        <li>
          <p >게임 목록</p>
          <ul>
            <li><p onClick={handleLogout}>게임 1</p></li>
            <li><p>게임 2</p></li>
            <li><p>게임 3</p></li>
            <li><p>게임 4</p></li>
          </ul>
        </li>
      </ul>
    </aside>

      <main className="main-content">
        <h1>게임 리스트</h1>
        <div className="content-grid">
          <div className="content-box">박스 1</div>
          <div className="content-box">박스 2</div>
          <div className="content-box">박스 3</div>
          <div className="content-box">박스 4</div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
