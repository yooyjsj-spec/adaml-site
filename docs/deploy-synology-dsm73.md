# Synology DSM 7.3 — Container Manager 배포 가이드

Vite + React 사이트와 관리자 CMS(API + PostgreSQL)를 NAS에서 함께 실행합니다. nginx가 페이지를 제공하고 `/api`, `/uploads`는 API 컨테이너로 프록시합니다.

권장 방식은 **PC에서 Docker 이미지를 만든 뒤**, File Station / Container Manager로 NAS에 올리는 것입니다. NAS 안에서 `node:20-alpine`을 빌드하지 않습니다.

## 사전 준비

- DSM 7.3, Container Manager
- PC에 Docker Desktop
- NAS 공유 폴더 (예: `docker/smd-lab`)
- 사용할 포트 (기본 `8080`)
- DB 비밀번호, `ADMIN_CRYPTO_KEY`(32자 이상), 관리자 비밀번호(12자 이상)

NAS에는 SSH가 없어도 됩니다.

---

## 1) PC에서 배포 패키지 만들기

저장소 루트에서:

```bash
npm run pack:synology
```

기본 아키텍처는 `linux/amd64`(대부분의 Plus 시리즈)입니다. ARM NAS면:

```bash
set SYNOLOGY_PLATFORM=linux/arm64
npm run pack:synology
```

끝나면 `deploy/synology/`에 다음이 생깁니다.

| 파일 | 용도 |
|------|------|
| `smd-lab-images.tar` | `smd-lab-web`, `smd-lab-api` 이미지 |
| `docker-compose.yml` | Container Manager 프로젝트용 Compose |
| `.env.example` | 운영 환경변수 템플릿 |
| `README.txt` | NAS 쪽 짧은 순서 |

이 tar는 Git에 올리지 않습니다.

---

## 2) File Station으로 NAS에 올리기

1. `deploy/synology` 폴더를 공유 폴더로 업로드합니다. 예: `docker/smd-lab`
2. 폴더 안에 `docker-compose.yml`과 `smd-lab-images.tar`가 **한 단계에** 보여야 합니다.
3. `.env.example`을 복사해 `.env`로 만들고 값을 채웁니다.

```env
POSTGRES_PASSWORD=긴_DB_비밀번호
DATABASE_URL=postgresql://smd:긴_DB_비밀번호@postgres:5432/smd_lab?schema=public
PUBLIC_ORIGIN=http://NAS_IP:8080
COOKIE_SECURE=false
WEB_PORT=8080
ADMIN_CRYPTO_KEY=32자_이상의_랜덤_문자열
ADMIN_USERNAME=admin
ADMIN_PASSWORD=12자_이상의_비밀번호
```

`DATABASE_URL`의 비밀번호는 `POSTGRES_PASSWORD`와 같아야 합니다.

HTTPS 역방향 프록시를 쓰면 `PUBLIC_ORIGIN`을 `https://도메인`으로, `COOKIE_SECURE=true`로 바꿉니다.

경로에는 한글·공백을 넣지 않는 편이 안전합니다.

---

## 3) Container Manager에서 이미지 가져오기

1. **이미지 → 추가 → 다운로드**에서 `postgres:16-alpine`을 받습니다.
2. **이미지 → 추가 → 파일에서 추가**에서 `smd-lab-images.tar`를 선택합니다.
3. 이미지 목록에 `smd-lab-web:latest`, `smd-lab-api:latest`가 보여야 합니다.

프로젝트를 만들기 **전에** 이미지를 넣어야 합니다. Compose에 `build:`가 없어서 NAS가 소스를 빌드하지 않습니다.

---

## 4) 프로젝트 시작

1. **프로젝트 → 만들기**
2. 경로로 `docker-compose.yml`이 있는 폴더를 선택합니다.
3. 시작 후 브라우저에서 `http://NAS_IP:8080` (또는 `WEB_PORT`)으로 확인합니다.

첫 기동 시 API가 마이그레이션을 적용하고, DB가 비어 있으면 기존 사이트 콘텐츠를 시드합니다. 이미 데이터가 있으면 시드는 건너뜁니다.

관리자 계정은 `.env`의 `ADMIN_USERNAME` / `ADMIN_PASSWORD`로 **없을 때만** 만들어집니다.

1. 사이트 오른쪽 아래 **방패 버튼**으로 로그인
2. TOTP 앱에 QR을 등록하고 복구 코드를 저장
3. 첫 로그인 뒤 `.env`에서 `ADMIN_PASSWORD`를 지우고 프로젝트를 다시 시작

`ADMIN_CRYPTO_KEY`는 TOTP 비밀키 암호화에 쓰입니다. 운영 중 바꾸면 기존 OTP를 복호화할 수 없으니 백업에 포함하세요.

---

## 5) (선택) 도메인 / HTTPS

DSM **제어판 → 로그인 포털 → 고급 → 역방향 프록시**:

- 대상: `http://127.0.0.1:8080` (`WEB_PORT`에 맞게)
- 인증서: Let’s Encrypt 또는 기존 인증서
- `.env`의 `PUBLIC_ORIGIN`과 `COOKIE_SECURE=true`를 맞춘 뒤 API 컨테이너를 재시작

---

## 업데이트

PC에서 다시 `npm run pack:synology` → tar와 필요하면 `docker-compose.yml`을 File Station에 덮어쓰기 → Container Manager에서 이미지를 다시 가져온 뒤 프로젝트를 **재빌드/재시작**합니다.

`postgres-data`, `uploads` 볼륨은 그대로 두면 DB와 업로드 파일이 유지됩니다.

---

## 백업

함께 백업할 것:

- `postgres-data` 볼륨 (`pg_dump` 또는 Hyper Backup)
- `uploads` 볼륨
- `.env`의 `ADMIN_CRYPTO_KEY`

---

## 문제 해결

| 증상 | 확인 |
|------|------|
| 프로젝트가 이미지를 못 찾음 | tar를 프로젝트 생성 **전에** 가져왔는지, 태그 `smd-lab-web:latest` / `smd-lab-api:latest` |
| 페이지가 안 열림 | 방화벽, `WEB_PORT`, 컨테이너 실행 여부 |
| 관리자 로그인이 안 됨 | `PUBLIC_ORIGIN`이 브라우저 주소와 같은지, HTTP면 `COOKIE_SECURE=false` |
| HTTPS 로그인 쿠키가 안 붙음 | 역방향 프록시 사용 시 `COOKIE_SECURE=true`, `PUBLIC_ORIGIN=https://도메인` |
| ARM NAS에서 실행 안 됨 | `SYNOLOGY_PLATFORM=linux/arm64`로 다시 패키징 |
| 옛 화면 | 브라우저 캐시, 새 tar로 이미지 교체 여부 |
| 업로드 이미지가 안 보임 | `uploads` 볼륨, `/uploads` 프록시 |

---

## 로컬에서 Compose로 미리 보기

소스 빌드가 되는 PC에서는 저장소 루트에서:

```bash
docker compose up -d --build
```

`http://localhost:8080`으로 확인합니다. 이 Compose는 로컬 DB 접속용으로 Postgres를 `127.0.0.1:15432`에도 엽니다. Synology용 파일은 `docker-compose.synology.yml`이며 Postgres 포트를 NAS 밖으로 열지 않습니다.
