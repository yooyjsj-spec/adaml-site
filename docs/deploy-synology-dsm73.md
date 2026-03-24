# Synology DSM 7.3 — Container Manager 배포 가이드

이 저장소는 **Vite + React**로 빌드되는 **정적 웹사이트**입니다. 빌드 결과물(`dist`)을 **nginx**가 제공하는 Docker 이미지로 묶어, NAS의 **Container Manager**에서 실행하는 절차를 정리합니다.

## 사전 준비

- Synology NAS에 **DSM 7.3** 및 **Container Manager** 패키지 설치
- NAS에서 사용할 **포트** 결정 (예: 호스트 `8080` → 컨테이너 `80`)
- (선택) 외부에서 도메인으로 접속하려면 DSM **제어판 → 로그인 포털 → 고급 → 역방향 프록시** 설정

### 이 가이드가 가정하는 NAS 작업 방식

NAS에는 **SSH로 접속하지 않습니다.** 파일은 **File Station**(웹 또는 데스크톱 앱)으로 올리고, 배포·실행은 **Container Manager** 앱에서만 진행한다고 가정합니다.

로컬 PC에서 Docker 이미지를 만드는 단계(방법 1 등)만 터미널이 필요할 수 있습니다. NAS 쪽은 DSM 화면만으로 끝나도록 적어 두었습니다.

---

## Docker Compose로 배포 (권장)

저장소 루트의 `docker-compose.yml`은 같은 폴더의 `Dockerfile`로 웹 서비스를 빌드하고, 호스트 `8080` → 컨테이너 `80`으로 노출합니다. **단일 서비스**라도 Compose로 두면 포트·재시작 정책을 파일로 고정해 두기 좋습니다.

### `npm run build`와 Docker Compose는 별개입니다

| 동작 | 결과 |
|------|------|
| PC에서 **`npm run build`** | 프로젝트 폴더에 **`dist/`** 만 생깁니다. GitHub Pages 배포나 아래 **방법 2**(nginx에 `dist` 폴더 마운트)에 쓰입니다. |
| **`docker compose up --build`** | 호스트의 `dist`는 **사용하지 않습니다**. `Dockerfile`이 이미지를 만들 때 **컨테이너 빌드 단계 안에서** `npm ci` → `npm run build`를 다시 실행하고, 그때 만들어진 `dist`만 nginx 이미지에 넣습니다. |

그래서 “Compose용 아티팩트가 `npm run build` 후에 따로 생기지 않는다”는 느낌이 드는 것이 정상입니다. **Docker 쪽 빌드는 `docker compose build` 또는 `docker compose up --build`로 하면 됩니다.** 로컬에서 미리 `npm run build`할 필요는 없습니다(해도 현재 Compose/Dockerfile 경로에서는 무시됩니다. `.dockerignore`에 `dist`가 있어 컨텍스트에도 안 실립니다).

### 로컬에서 확인

```bash
cd /path/to/yooyjsj-spec.github.io
docker compose up -d --build
```

브라우저에서 `http://localhost:8080` 으로 확인합니다. 중지는 `docker compose down` 입니다.

포트를 바꾸려면 `docker-compose.yml`의 `"8080:80"` 왼쪽 숫자를 원하는 호스트 포트로 수정합니다.

### Synology: File Station으로 올린 뒤 Container Manager “프로젝트”로 배포

NAS에서는 **File Station**과 **Container Manager**만 사용합니다.

#### 1) PC에서 프로젝트 폴더 준비

배포에 필요한 것은 저장소 **루트 기준**으로 다음이 한 폴더 안에 모여 있으면 됩니다.

- `Dockerfile`, `docker-compose.yml`, `package.json`, `package-lock.json`, `src`, `public`, `vite.config.ts` 등 (클론한 저장소 그대로)

**ZIP으로 올리는 경우:** PC에서 그 폴더를 통째로 압축합니다. DSM에서 압축을 풀면 **한 단계 안에** `docker-compose.yml`과 `Dockerfile`이 보여야 합니다. (압축을 풀었을 때 `…/adam-lab/docker-compose.yml`처럼 바로 보이면 OK. 그 안에 또 폴더만 있고 그 안에 파일이 들어 있으면 Container Manager에서 경로를 잘못 잡기 쉽습니다.)

#### 2) File Station으로 NAS에 업로드

1. DSM에 로그인한 뒤 **File Station**을 엽니다.
2. Container Manager가 읽을 수 있는 **공유 폴더**를 고릅니다. 예: `docker`, `web` 등 (미리 만들어 두거나 기존 폴더 사용).
3. **업로드**로 ZIP을 올리거나, 폴더째 드래그해 업로드합니다.
4. ZIP이면 File Station에서 **압축 풀기**로 같은 공유 폴더 안에 풉니다.
5. 최종적으로 예를 들어 `docker/adam-lab/docker-compose.yml` 처럼 **Compose 파일이 들어 있는 폴더의 경로**를 기억해 둡니다.

경로에 **한글·공백·특수문자**가 많으면 도구마다 문제가 날 수 있어, 영문·숫자 위주의 짧은 폴더 이름을 권장합니다.

#### 3) Container Manager에서 프로젝트 만들기

1. DSM **메인 메뉴**에서 **Container Manager**를 엽니다.
2. 왼쪽 **프로젝트** → **만들기**(또는 화면에 따라 **추가**).
3. **경로**에서 File Station에 올려 둔 **프로젝트 폴더**를 선택합니다. (`docker-compose.yml`이 있는 바로 그 디렉터리)
4. Compose 파일이 `docker-compose.yml`로 잡혀 있는지 확인합니다.
5. **빌드**가 NAS 안에서 실행됩니다. 모델에 따라 Docker 빌드가 무거울 수 있으니, **Container Manager·Docker 지원 여부**는 Synology 설명을 참고하세요. NAS 빌드가 부담이면 아래 **방법 1**처럼 PC에서 이미지를 만든 뒤 레지스트리에 올리거나 `docker save`한 tar만 File Station으로 옮기고, `docker-compose.yml`에서 `build: .`를 빼고 `image: …`만 두는 방식이 낫습니다.
6. 마법사를 완료하면 프로젝트가 **시작**되고, DSM에 안내된 호스트 포트(기본은 `docker-compose.yml`의 `8080`)로 접속합니다. 브라우저에서 `http://NAS_IP:8080` 형태로 확인합니다.

**첫 프로젝트 빌드는 특히 오래 걸릴 수 있습니다.** `Dockerfile` 첫 줄이 `FROM node:20-alpine`이라, 빌드 시작 시 Docker Hub에서 Node 이미지 전체를 내려받습니다. NAS·회선·Docker Hub 상태에 따라 **10~30분 이상** 걸리거나, 진행률이 안 바뀐 것처럼 보일 수 있습니다. 그때는 아래 **「NAS 프로젝트 빌드가 Step 1에서 안 될 때」**를 참고하세요.

**NAS에서 소스 빌드 없이 이미지만 쓰려면:** PC에서 수정한 `docker-compose.yml`( `build` 제거, `image: 레지스트리/이미지:태그`만 유지)을 File Station으로 다시 덮어쓴 뒤, Container Manager에서 해당 프로젝트를 다시 빌드/배포하면 됩니다. 이 경우 NAS에는 **Compose 파일만** 있는 작은 폴더만 올려도 됩니다.

---

## 방법 1: Dockerfile만으로 이미지 빌드 후 단일 컨테이너 실행

Compose를 쓰지 않고, 이미지를 직접 빌드·가져와 **컨테이너** 탭에서만 다루는 방식입니다.

저장소 루트의 `Dockerfile`이 `npm run build`로 `dist`를 만든 뒤 `nginx:alpine`에 복사합니다.

### 1) 로컬(또는 CI)에서 이미지 빌드

```bash
cd /path/to/yooyjsj-spec.github.io
docker build -t adam-lab-web:latest .
```

태그는 본인 환경에 맞게 바꿉니다 (예: `docker.io/내계정/adam-lab-web:0.1.0`).

### 2) 이미지를 NAS로 전달하는 두 가지 경로

**A. 컨테이너 레지스트리 사용 (업데이트에 유리)**

1. Docker Hub, GitHub Container Registry(GHCR) 등에 로그인 후 푸시  
   `docker tag` / `docker push`
2. NAS **Container Manager** → **레지스트리**에서 해당 레지스트리 계정 등록(필요 시)
3. **이미지** 탭에서 이미지 **다운로드**(pull)

**B. tar 파일로 옮기기 (레지스트리 없을 때)**

로컬에서:

```bash
docker save -o adam-lab-web.tar adam-lab-web:latest
```

생성된 `adam-lab-web.tar`를 **File Station**으로 원하는 공유 폴더에 업로드한 뒤, **Container Manager** → **이미지** → **추가** → **파일에서 추가**에서 그 경로의 tar를 선택해 가져옵니다.

### 3) Container Manager에서 컨테이너 생성

1. **컨테이너** → **만들기** → 가져온 이미지 선택  
2. **고급 설정**에서 확인할 항목:
   - **포트 설정**: 로컬 포트(예: `8080`) → 컨테이너 포트 `80` / TCP  
   - **볼륨**: 이 방식은 이미지 안에 빌드 결과가 들어 있으므로 **필수 아님**  
   - **환경 변수**: 정적 nginx 제공만이면 **특별히 불필요**  
   - **재시작 정책**: 필요 시 “항상 다시 시작” 등으로 설정  
3. 마친 뒤 컨테이너 **시작**  
4. 브라우저에서 `http://NAS_IP:8080` 형태로 접속해 확인

### 4) 업데이트(새 빌드 반영)

1. 로컬/CI에서 이미지를 다시 빌드하고 **같은 태그로 푸시**하거나 **새 태그**로 푸시  
2. NAS에서 최신 이미지 pull(또는 새 tar 가져오기)  
3. 기존 컨테이너 **중지** → **재설정**에서 이미지를 새 것으로 바꾸거나, 컨테이너를 삭제 후 동일 설정으로 다시 생성

운영 중 다운타임을 줄이려면 포트/이름을 유지한 채 이미지만 갈아끼우는 방식이 일반적입니다.

---

## 방법 2: 빌드만 로컬에서 하고, 공식 nginx 이미지 + 볼륨 마운트

Dockerfile 없이 NAS에서 **nginx 공식 이미지**만 쓰고, **미리 만든 `dist` 폴더**를 마운트하는 방식입니다.

### 1) 로컬에서 정적 파일 생성

```bash
npm ci
npm run build
```

### 2) `dist`를 File Station으로 NAS에 업로드

PC에서 `dist` 폴더를 통째로 ZIP으로 묶거나 폴더 그대로 **File Station**에 올립니다. 예: 공유 폴더 `web` 아래 `adam-lab-dist/dist/` 처럼, 나중에 Container Manager에서 고르기 쉬운 경로에 둡니다.

### 3) Container Manager에서 컨테이너 만들기

- **컨테이너** → **만들기** → **이미지**에서 `nginx:alpine`을 받아 사용합니다.  
- **볼륨**: File Station에 올려 둔 **`dist` 폴더**(내부에 `index.html`이 있는 그 폴더)를 컨테이너 경로 `/usr/share/nginx/html`에 연결합니다(읽기 전용 권장). 경로는 DSM 파일 선택 UI에서 지정합니다.  
- **포트**: 호스트 `8080` → 컨테이너 `80`

이 프로젝트는 `HashRouter`와 `base: './'`를 사용하므로, 서브 경로·단순 정적 호스팅과 잘 맞습니다.

---

## 역방향 프록시로 도메인/HTTPS 연결 (선택)

DSM **제어판 → 로그인 포털 → 고급 → 역방향 프록시**에서:

- **대상**: `http://127.0.0.1:8080` (위에서 연 컨테이너 호스트 포트에 맞게 조정)
- 호스트 이름·인증서는 Let’s Encrypt 또는 기존 인증서로 설정

외부 포트는 443/80을 프록시 전용으로 쓰고, 컨테이너는 로컬 포트만 열어두는 구성이 흔합니다.

---

## 문제 해결

### NAS 프로젝트 빌드가 Step 1(`FROM node:20-alpine`)에서 안 될 때

로그에 `Step 1/11 : FROM node:20-alpine`, `Pulling fs layer`, `Waiting`만 반복되고 `←[1A`, `←[2K` 같은 **깨진 글자**가 섞여 보이는 경우가 많습니다.

| 현상 | 설명 |
|------|------|
| 깨진 문자 | 터미널용 **진행 표시(ANSI)**가 DSM 로그 창에 그대로 찍힌 것이라, **반드시 오류는 아닙니다.** |
| 한참 멈춘 듯함 | Docker Hub에서 **기본 이미지 레이어**를 받는 중입니다. 용량·회선에 따라 **매우 오래** 걸릴 수 있습니다. |
| 끝내 실패 | Docker Hub **속도 제한(무료/익명)** , NAS 방화벽, 레지스트리 차단, 일시 장애 등이 원인일 수 있습니다. |

**시도할 수 있는 순서:**

1. **30~60분 정도 그대로 둬 보기**  
   실제로는 받고 있는데 UI가 갱신이 느린 경우가 있습니다.

2. **이미지를 먼저 따로 받기**  
   **Container Manager** → **이미지** → **추가** → **다운로드**에서 `node:20-alpine`을 검색해 받은 뒤, 같은 방식으로 `nginx:alpine`도 받아 둡니다. 그다음 **프로젝트** 빌드를 다시 실행하면 `FROM` 단계가 로컬 캐시를 쓰는 경우가 많습니다.

3. **NAS에서 Node 빌드를 포기하고 가벼운 방식으로 전환 (가장 확실)**  
   NAS는 **`nginx:alpine`만** 쓰고, PC에서 `npm run build`로 만든 **`dist`만 File Station에 올려서 마운트**하는 **방법 2**로 바꾸면 Docker Hub에서 받는 용량이 크게 줄고, 빌드 단계 자체가 없어집니다. NAS에서 프로젝트 빌드가 계속 막히면 이 방법을 권장합니다.

4. **PC에서 이미지를 만들어서 NAS에는 결과만 올리기**  
   PC(또는 CI)에서 `docker build`로 이미지를 만든 뒤 레지스트리에 푸시하거나 `docker save`한 **tar를 File Station**으로 올려 **이미지 → 파일에서 추가**한 다음, 컨테이너만 띄우는 **방법 1**을 쓰면 NAS는 `node:20-alpine`을 받을 필요가 없습니다.

---

| 증상 | 확인 사항 |
|------|-----------|
| 페이지가 안 열림 | 컨테이너 실행 여부, 방화벽, 포트 매핑(호스트↔80) |
| 옛 화면이 보임 | 브라우저 캐시, 새 이미지로 컨테이너 재생성 여부 |
| 빌드 실패 | `package-lock.json` 유무, 로컬에서 `npm ci` 성공 여부 |
| ARM NAS에서 이미지 오류 | 이미지가 **multi-arch**인지 확인; 로컬 빌드가 amd64만 지원하면 NAS CPU 아키텍처와 맞는 빌드 필요 |

`docker build`는 빌드하는 머신의 플랫폼 기준으로 기본 태그가 잡힙니다. Intel/AMD NAS에 ARM PC에서 빌드한 이미지만 올리면 실행이 안 될 수 있으므로, 그때는 **NAS와 동일 아키텍처에서 빌드**하거나 `docker buildx`로 멀티 플랫폼 이미지를 만드는 것을 검토하세요.

---

## 요약

- **NAS 작업 흐름**: **File Station**으로 프로젝트(또는 `dist`, 이미지 tar)를 공유 폴더에 올린 뒤, **Container Manager**에서 **프로젝트**(Compose) 또는 **이미지/컨테이너**로 실행. SSH 불필요.  
- **권장(Compose)**: 저장소를 File Station에 올리고, Container Manager **프로젝트**에서 `docker-compose.yml`이 있는 폴더를 경로로 지정. 로컬 검증만 할 때는 PC에서 `docker compose up -d --build`.  
- **NAS에서 빌드가 Step 1에서 막히면**: Docker Hub에서 `node:20-alpine` 받기가 원인인 경우가 많음 → **방법 2**(`dist` + `nginx`만) 또는 **방법 1**(PC에서 이미지 빌드 후 tar/레지스트리) 권장.  
- **대안**: PC에서 `docker build` 후 레지스트리/tar로 이미지를 가져와 **컨테이너**만 만들거나, `npm run build` 후 `dist`를 File Station에 올려 `nginx:alpine`에 마운트.  
- 도메인·HTTPS는 DSM **역방향 프록시**로 컨테이너 앞단을 정리하면 됩니다.
