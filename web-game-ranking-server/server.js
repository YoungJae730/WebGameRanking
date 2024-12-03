const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 사용자 데이터 예제 (DB 대신 사용)
const users = [
  {
    email: "test@example.com",
    password: bcrypt.hashSync("password123", 10), // 비밀번호는 암호화된 상태로 저장
    name: "홍길동"
  }
];

const insertUser = ({email, hashedPassword, name}) => {
    users.push({ email, password: hashedPassword, name });
}

// JWT 시크릿 키
const SECRET_KEY = "mysecretkey";

// 로그인 엔드포인트
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // 이메일 확인
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: "로그인 실패 : 이메일을 확인하세요." });
  }

  // 비밀번호 검증
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "로그인 실패 : 이메일 또는 비밀번호를 확인하세요." });
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
});

// 회원가입 엔드포인트
app.post("/api/signup", (req, res) => {
  const { email, password, name } = req.body;

  // 중복 이메일 체크
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: "회원가입 실패 : 이미 존재하는 이메일입니다." });
  }

  // 새 사용자 추가
  const hashedPassword = bcrypt.hashSync(password, 10);
  insertUser({ email, hashedPassword, name });

  res.json({ message: "회원가입이 완료되었습니다." });
});

// 프로필 정보 가져오기
app.post("/api/profileInfo", (req, res) => {
  
});

// 랭킹 가져오기
app.post("/api/profileInfo", (req, res) => {
  
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
