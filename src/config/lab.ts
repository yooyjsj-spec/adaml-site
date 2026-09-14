/**
 * 랩 브랜딩 설정.
 * 표시 이름을 바꾸려면 아래 `name`만 수정하면 됩니다.
 *
 * 반영 위치: 페이지 타이틀, 히어로, About, 푸터 카피라이트,
 * People 직함, Community/시드 문구.
 *
 * 서버 메일/OTP issuer는 server/src/lab.ts 도 같은 값으로 맞춰 주세요.
 * index.html 의 초기 <title> 도 함께 바꿔 주세요.
 */
export const LAB = {
  name: 'SEOL',
} as const;

export const LAB_NAME = LAB.name;
