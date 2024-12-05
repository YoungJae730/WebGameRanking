const express = require("express");
const multer = require('multer');
const AWS = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const bodyParser = require("body-parser");
const mysql = require('mysql2/promise');
const Redis = require('ioredis');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,  // S3 버킷 이름
    acl: 'public-read',          // 파일에 대한 권한 설정 (필요에 따라 조정)
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // S3에 업로드할 파일 이름 설정 (timestamp + 원본 파일 확장자)
      cb(null, Date.now().toString() + path.extname(file.originalname));
    }
  })
});

const db = mysql.createPool({
  host: process.env.DB_ENDPOINT,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const redis = new Redis({
  host: process.env.REDIS_ENDPOINT,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// JWT 시크릿 키
const SECRET_KEY =  process.env.JWT_SECRET_KEY;

// 로그인 엔드포인트
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Redis 캐시에서 사용자 데이터 조회
    const cachedUser = await redis.get(`user:${email}`);
    let user = JSON.parse(cachedUser);
    if (user){
      if (user.password !== password) {
        return res.status(404).json({ message: '로그인 실패 : 이메일 또는 비밀번호를 확인하세요.' });
      }
    } else {
      // RDS에서 사용자 데이터 조회
      const [rows] = await db.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: '로그인 실패 : 이메일 또는 비밀번호를 확인하세요.' });
      }
  
      user = rows[0];
  
      // Redis 캐시에 사용자 데이터 저장 (TTL: 5분)
      await redis.set(`user:${email}`, JSON.stringify(user), 'EX', 300);
    }

    // 토큰 생성
    const token = jwt.sign({ email: user.email, name: user.name }, SECRET_KEY, {
      expiresIn: "1h", // 1시간 유효
    });

    // 성공 응답
    res.json({
      user: { email: user.email, name: user.name },
      token: token,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 회원가입 엔드포인트
app.post("/api/signup", async (req, res) => {
  const { email, password, name } = req.body;

  const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
  // 중복 이메일 체크
  if (rows.length > 0) {
    return res.status(400).json({ message: "회원가입 실패 : 이미 존재하는 이메일입니다." });
  }
  try{
    await db.query('INSERT INTO user(email, name, password, profile_image_url) VALUE(?, ?, ?, null);', [email, name, password]);
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).json({ error: '서버 오류' });
  }
  res.json({ message: "회원가입이 완료되었습니다." });
});

// 프로필 정보 가져오기
app.post("/api/changeProfile", upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '이미지를 업로드해야 합니다.' });
  }

  // 파일 업로드 성공 시 응답
  res.status(200).json({ 
    message: '파일 업로드 성공', 
    fileUrl: req.file.location // S3에 업로드된 파일 URL 반환
  });
  await db.promise().query('UPDATE user SET profile_image_url = ? WHERE email = ?', [req.file.location, req.email])
});

// 랭킹 가져오기
app.post("/api/ranking", async (req, res) => {
  try {
    // game_list에서 game_id 목록을 가져옵니다.
    const [gameListRows] = await db.query('SELECT game_id, game_name FROM game_list');
    
    // 각 game_id에 대해 랭킹을 계산합니다.
    let gameRankings = {};

    for (let i = 0; i < gameListRows.length; i++) {
      const gameId = gameListRows[i].game_id;
      const gameName = gameListRows[i].game_name;
      
      // 해당 game_id에 대한 유저 점수 가져오기
      const [rankingRows] = await db.query(`
        SELECT u.name, s.score, s.played_time
        FROM score s
        JOIN user u ON s.user_id = u.user_id
        WHERE s.game_id = ?
        ORDER BY s.score DESC
        LIMIT 10;
      `, [gameId]);

      // 결과를 JSON 형태로 저장
      gameRankings[`${gameName}`] = rankingRows;
    }

    // 결과를 JSON 형식으로 반환
    res.json(gameRankings);

  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 게임 목록
app.post("/api/gameList", async (req, res) => {
  try {
    // game_list에서 game_id 목록을 가져옵니다.
    const gameList = await db.query('SELECT game_id, game_name FROM game_list');
    res.json(gameList);
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 게임 점수
app.post("/api/gameScore", async (req, res) => {
  const params = req.body
  try {
    await db.query('INSERT INTO score (user_id, game_id, score, played_time) SELECT u.user_id, ?, ?, NOW() FROM user u WHERE u.email = ?;', [params.game, params.score, params.userEmail]);
    res.json({message : "게임 승리, 등록 완료"});
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 임시 삭제
app.post("/api/delete", async (req, res) => {
  await redis.del('user:asd@asd.com');
  await redis.del('user:asdqwe@asd.com');
  res.json({message: "굳"})
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
