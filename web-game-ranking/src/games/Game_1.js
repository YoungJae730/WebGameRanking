import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Game_1.css';

function Game_1({ user }) {
  const [board, setBoard] = useState([]);
  const [gameWin, setGameWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간
  const [flags, setFlags] = useState(0); // 깃발 개수
  const [startTime, setStartTime] = useState(null); // 게임 시작 시간
  const gridSize = 10; // 게임의 그리드 크기
  const mineCount = 4; // 지뢰의 개수

  // 게임 보드 초기화
  useEffect(() => {
    const initBoard = () => {
      const board = [];
      for (let i = 0; i < gridSize; i++) {
        const row = [];
        for (let j = 0; j < gridSize; j++) {
          row.push({ hasMine: false, isRevealed: false, surroundingMines: 0, hasFlag: false });
        }
        board.push(row);
      }
      placeMines(board);
      calculateSurroundingMines(board);
      setBoard(board);
      setStartTime(new Date()); // 게임 시작 시간 기록
    };
    initBoard();
  }, []);

  useEffect(() => {
    // 게임이 시작되면 경과 시간 업데이트
    if (startTime && !gameOver && !gameWin) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date() - startTime) / 1000)); // 초 단위로 계산
      }, 1000); // 1초마다 경과 시간 업데이트
      return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 제거
    }
  }, [startTime, gameOver, gameWin]);


  const placeMines = (board) => {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!board[row][col].hasMine) {
        board[row][col].hasMine = true;
        minesPlaced++;
      }
    }
  };

  const calculateSurroundingMines = (board) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!board[i][j].hasMine) {
          let count = 0;
          directions.forEach(([dx, dy]) => {
            const x = i + dx, y = j + dy;
            if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && board[x][y].hasMine) {
              count++;
            }
          });
          board[i][j].surroundingMines = count;
        }
      }
    }
  };

  // 주변 셀을 드러내는 함수 (빈 칸 클릭 시 호출)
  const revealAdjacentCells = (row, col) => {
    const updatedBoard = [...board];
    const stack = [[row, col]];

    while (stack.length > 0) {
      const [r, c] = stack.pop();
      if (updatedBoard[r][c].isRevealed) continue;

      updatedBoard[r][c].isRevealed = true;

      // 주변 셀에 지뢰가 없으면 그 주변을 모두 탐색
      if (updatedBoard[r][c].surroundingMines === 0) {
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        directions.forEach(([dx, dy]) => {
          const x = r + dx, y = c + dy;
          if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && !updatedBoard[x][y].isRevealed) {
            stack.push([x, y]);
          }
        });
      }
    }

    setBoard(updatedBoard);
  };

  // 셀 클릭 이벤트
  const handleCellClick = (row, col) => {
    if (gameOver || board[row][col].isRevealed || board[row][col].hasFlag) return;

    if (board[row][col].hasMine) {
      setGameOver(true);
    } else {
      const updatedBoard = [...board];

      // 빈 칸 클릭 시 주변 셀을 드러내기
      if (board[row][col].surroundingMines === 0) {
        revealAdjacentCells(row, col);
      } else {
        updatedBoard[row][col].isRevealed = true;
      }

      setBoard(updatedBoard);
      checkWin(updatedBoard); // 승리 체크
    }
  };

  // 우클릭(깃발 세우기/제거)
  const handleRightClick = (event, row, col) => {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
    if (gameOver || board[row][col].isRevealed) return;

    const updatedBoard = [...board];
    const cell = updatedBoard[row][col];

    // 이미 깃발이 있으면 제거, 없으면 추가
    if (cell.hasFlag) {
      cell.hasFlag = false;
      setFlags(flags - 1); // 깃발 개수 감소
    } else {
      cell.hasFlag = true;
      setFlags(flags + 1); // 깃발 개수 증가
    }

    setBoard(updatedBoard);
    checkWin(updatedBoard);
  };

  // 게임 승리 체크
  const checkWin = (updatedBoard) => {
    let remainingCells = 0;
    updatedBoard.forEach(row => {
      row.forEach(cell => {
        if (!cell.isRevealed) remainingCells++;
      });
    });

    remainingCells -= mineCount;

    // 남은 셀이 모두 지뢰인 경우
    if (remainingCells === 0) {
      setGameWin(true);
      handleVictory();
    }
  };

  // 게임 승리 처리 및 시간 서버로 전송
  const handleVictory = async () => {
    const endTime = new Date();
    const timeElapsed = Math.floor((endTime - startTime) / 1000);

    try {
      const response = await axios.post(process.env.REACT_APP_API_ENDPOINT_URL + '/api/gameScore', {
        userEmail: user.email,
        score: -timeElapsed,
        game: 1
      });

      const data = await response.data;
      window.location.reload();
      alert(data.message);
    } catch (error) {
      console.error('게임 승리 결과 전송 실패:', error);
    }
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.hasMine ? 'mine' : ''} ${cell.hasFlag ? 'flag' : ''}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            onContextMenu={(event) => handleRightClick(event, rowIndex, colIndex)} // 우클릭 이벤트
          >
            {cell.isRevealed ? (cell.hasMine ? '💣' : cell.surroundingMines || '') : (cell.hasFlag ? '🚩' : '')}
          </div>
        ))} 
      </div>
    ));
  };

  return (
    <div className="minesweeper">
      <h2>유저 : {user ? user.name : <></>}</h2>
      <h1>지뢰찾기 게임</h1>
      <div className="time">경과 시간: {elapsedTime}초</div>
      <div className="board">{renderBoard()}</div>
      {gameOver && <div className="game-over">게임 오버</div>}
      {gameWin && <div className="game-over">게임 승리! 최종 시간: {elapsedTime}초</div>}
    </div>
  );
}

export default Game_1;
