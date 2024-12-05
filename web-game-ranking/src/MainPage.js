import { React, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css";

function MainPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);

  useEffect(() => {
    // 서버에서 게임 목록을 받아오는 함수
    const fetchGames = async () => {
      try {
        const response = await axios.post(process.env.REACT_APP_API_ENDPOINT_URL + '/api/gameList')
        setGames(response.data[0]); // 게임 목록을 상태로 저장
      } catch (error) {
        console.error("게임 목록을 불러오는 중 오류 발생:", error);
      }
    };

    fetchGames();
  }, []);
  
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
    } else{
      navigate('/profile');
    }
  }

  const handleRanking = () => {
    navigate('/ranking');
  }

  const handleGame = (id) => {
    if(!user){
      navigate('/login');
    } else{
      navigate(`/game_${id}`);
    }
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
            <p>게임 목록</p>
            <ul>
              {games.length === 0 ? (
                <div>게임 목록이 없습니다.</div>  // 게임이 없을 때 메시지 표시
              ) : (
                games.map((game) => (
                  <li key={game.game_name}>
                    <p onClick={() => handleGame(game.game_id)}>{game.game_name}</p>  {/* game_name을 사용 */}
                  </li>
                ))
              )}
            </ul>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>게임 리스트</h1>
        <div className="content-grid">
          {games.length === 0 ? (
            <div>게임 목록이 없습니다.</div>
          ) : (
            games.map((game, index) => (
              <div key={index} className="content-box" onClick={() => handleGame(game.game_id)}>
                <h3>{game.game_name}</h3> {/* game_name을 사용 */}
                <p style={{cursor:'pointer'}}>게임 하러가기 -></p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default MainPage;
