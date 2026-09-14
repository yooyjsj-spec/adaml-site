Synology DSM 7.3 배포 패키지
이미지 태그: 20260913-2006 (매 빌드마다 새 태그가 붙어 :latest 충돌 없이 기존 배포 위에 덮어쓸 수 있습니다)

[최초 배포]
1) File Station에서 이 폴더를 docker/smd-lab 로 업로드합니다.
2) .env.example을 .env로 복사하고 POSTGRES_PASSWORD, DATABASE_URL, PUBLIC_ORIGIN, ADMIN_CRYPTO_KEY, ADMIN_PASSWORD를 바꿉니다.
   DATABASE_URL의 비밀번호는 POSTGRES_PASSWORD와 같아야 합니다.
3) Container Manager → 이미지 → 추가 → 다운로드에서 postgres:16-alpine 을 받습니다.
4) Container Manager → 이미지 → 추가 → 파일에서 추가 → smd-lab-images.tar
5) Container Manager → 프로젝트 → 만들기 → 이 폴더(docker-compose.yml이 있는 경로) 선택
6) http://NAS_IP:WEB_PORT 로 접속한 뒤 우측 하단 방패 버튼으로 관리자 로그인을 완료하고 TOTP를 등록합니다.
7) 첫 로그인 후 .env에서 ADMIN_PASSWORD를 지우고 프로젝트를 다시 시작하세요.

[기존 배포 업데이트] — 컨테이너/프로젝트를 삭제할 필요 없습니다. DB(postgres-data)와 업로드(uploads) 볼륨은 그대로 유지됩니다.
1) File Station에서 기존 docker/smd-lab 폴더의 docker-compose.yml, .env.example을 이 폴더 것으로 덮어씁니다.
   (.env는 기존 값 유지 — 새로 추가된 SMTP_*/ADMIN_NOTIFY_EMAIL 항목만 .env.example 참고해서 채워주세요)
2) Container Manager → 이미지 → 추가 → 파일에서 추가 → smd-lab-images.tar (새 태그라 기존 이미지와 충돌 없이 추가됩니다)
3) Container Manager → 프로젝트 → smd-lab → 동작 → 빌드(재구성)
   → docker-compose.yml의 image 태그가 바뀐 것을 감지해 web/api 컨테이너만 새로 만듭니다. postgres는 그대로 재사용됩니다.
