const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;

// 카카오 로그인 라우터
app.get("/user/kakaoLogin", async (req, res) => {
  const REST_API_KEY = "0e657c26869e964e43fea4445bf397f7"; // 카카오 개발자 사이트에서 받은 REST API 키
  const REDIRECT_URI = "http://localhost:3000/user/kakaoLogin"; // 리다이렉트 URI

  // 카카오 로그인 시, 쿼리스트링으로 전달되는 CODE 값(인가 코드)
  const code = req.query.code;

  // CODE 값이 없으면 카카오 로그인 페이지로 리디렉션
  if (!code) {
    const redirectUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
    return res.redirect(redirectUrl);
  }

  // CODE 값을 Kakao 서버로 전달하여 엑세스 토큰 반환 받기
  try {
    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          grant_type: "authorization_code", // 인가 코드 방식
          client_id: REST_API_KEY, // REST API 키
          redirect_uri: REDIRECT_URI, // 리다이렉트 URI
          code: code, // 클라이언트로부터 받은 인가 코드
        },
      }
    );

    // 카카오 서버에서 반환한 엑세스 토큰
    const { access_token } = response.data;

    // 엑세스 토큰을 이용해 카카오 사용자 정보 가져오기
    const userInfoResponse = await axios.get(
      "https://kapi.kakao.com/v2/user/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // 엑세스 토큰을 Authorization 헤더에 포함
        },
      }
    );

    // 사용자 정보를 클라이언트로 전달
    res.redirect(`https://hongbo.iwinv.net/?userInfo=${encodeURIComponent(JSON.stringify(userInfoResponse.data))}`);
  } catch (error) {
    console.error("카카오 로그인 에러:", error);
    res.status(500).json({ error: "카카오 로그인 중 오류가 발생했습니다." });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
