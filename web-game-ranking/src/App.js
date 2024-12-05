import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import SignupPage from "./SignupPage";
import ProfilePage from "./ProfilePage";
import RankingPage from "./RankingPage";
import Game1Page from "./games/Game_1";

function App() {
  const [user, setUser] = useState(null); // 로그인 상태 관리
  const [token, setToken] = useState(null); // JWT 토큰 관리

  // 로컬 저장소에서 사용자 및 토큰 데이터 로드
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try{
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);
  // 로그아웃 핸들러
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage user={user} onLogout={handleLogout} />} />
        <Route
          path="/login"
          element={<LoginPage setUser={setUser} setToken={setToken} />}
        />
        <Route
          path="/signup"
          element={<SignupPage />}
        />
        <Route
          path="/profile"
          element={<ProfilePage user={user} />}
        />
        <Route
          path="/ranking"
          element={<RankingPage />}
        />
        <Route
          path="/game_1"
          element={<Game1Page user={user}/>}
        />
      </Routes>
    </Router>
  );
}

export default App;
