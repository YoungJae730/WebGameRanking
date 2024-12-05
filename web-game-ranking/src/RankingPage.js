import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RankingPage() {
    const [gameRankings, setGameRankings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchGameRankings = async () => {
        try {
            // API에서 게임별 랭킹 데이터를 가져옵니다.
            const response = await axios.post(process.env.REACT_APP_API_ENDPOINT_URL + '/api/ranking');
            
            // 데이터를 상태에 저장
            setGameRankings(response.data);
            setLoading(false);
        } catch (err) {
            setError('랭킹을 가져오는 중에 오류가 발생했습니다.');
            setLoading(false);
        }
        };
    
        fetchGameRankings();
    }, []); // 컴포넌트가 마운트될 때 한 번만 호출됩니다.
    
    if (loading) {
        return <div>로딩 중...</div>;
    }
    
    if (error) {
        return <div>{error}</div>;
    }
    
    // gameRankings가 undefined나 null인 경우 빈 객체로 대체
    const rankingsData = gameRankings || {};
    
    return (
        <div className="rankings-container">
          <h1>게임별 랭킹</h1>
          {Object.keys(rankingsData).length === 0 ? (
            <div className="no-rankings">게임 랭킹이 없습니다.</div>
          ) : (
            Object.keys(rankingsData).map((gameName) => {
              const rankings = rankingsData[gameName];
    
              return (
                <div className="game-card" key={gameName}>
                  <h2 className="game-title">{gameName}</h2>
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th>순위</th>
                        <th>유저명</th>
                        <th>점수</th>
                        <th>플레이 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((ranking, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{ranking.name}</td>
                          <td>{Math.abs(ranking.score)}</td>
                          <td>{new Date(ranking.played_time).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      );
    };
export default RankingPage;