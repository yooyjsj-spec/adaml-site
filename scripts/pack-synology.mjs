import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const isWindows = process.platform === 'win32';
const platform = process.env.SYNOLOGY_PLATFORM ?? 'linux/amd64';
const outDir = path.resolve('deploy/synology');

// Versioned tags (instead of :latest) so Container Manager can import the new
// image while the old one is still running, without an "image in use" conflict.
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const tag =
  process.env.SYNOLOGY_IMAGE_TAG ??
  `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const webImage = `smd-lab-web:${tag}`;
const apiImage = `smd-lab-api:${tag}`;

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });

const docker = isWindows ? 'docker.exe' : 'docker';

await mkdir(outDir, { recursive: true });

console.log(`Building Synology images for ${platform} (tag: ${tag})...`);
await run(docker, ['build', '--platform', platform, '-t', webImage, '.']);
await run(docker, ['build', '--platform', platform, '-t', apiImage, '-f', 'server/Dockerfile', '.']);
const tarPath = path.join(outDir, 'smd-lab-images.tar');
console.log(`Saving images to ${tarPath}...`);
await run(docker, ['save', '-o', tarPath, webImage, apiImage]);

await copyFile('docker-compose.synology.yml', path.join(outDir, 'docker-compose.yml'));
await copyFile('.env.synology.example', path.join(outDir, '.env.example'));

// Pin the compose file to this build's versioned tags instead of :latest.
const composePath = path.join(outDir, 'docker-compose.yml');
const compose = await readFile(composePath, 'utf8');
await writeFile(
  composePath,
  compose.replace('image: smd-lab-web:latest', `image: ${webImage}`).replace('image: smd-lab-api:latest', `image: ${apiImage}`),
  'utf8'
);

await writeFile(
  path.join(outDir, 'README.txt'),
  [
    'Synology DSM 7.3 배포 패키지',
    `이미지 태그: ${tag} (매 빌드마다 새 태그가 붙어 :latest 충돌 없이 기존 배포 위에 덮어쓸 수 있습니다)`,
    '',
    '[최초 배포]',
    '1) File Station에서 이 폴더를 docker/smd-lab 로 업로드합니다.',
    '2) .env.example을 .env로 복사하고 POSTGRES_PASSWORD, DATABASE_URL, PUBLIC_ORIGIN, ADMIN_CRYPTO_KEY, ADMIN_PASSWORD를 바꿉니다.',
    '   DATABASE_URL의 비밀번호는 POSTGRES_PASSWORD와 같아야 합니다.',
    '3) Container Manager → 이미지 → 추가 → 다운로드에서 postgres:16-alpine 을 받습니다.',
    '4) Container Manager → 이미지 → 추가 → 파일에서 추가 → smd-lab-images.tar',
    '5) Container Manager → 프로젝트 → 만들기 → 이 폴더(docker-compose.yml이 있는 경로) 선택',
    '6) http://NAS_IP:WEB_PORT 로 접속한 뒤 우측 하단 방패 버튼으로 관리자 로그인을 완료하고 TOTP를 등록합니다.',
    '7) 첫 로그인 후 .env에서 ADMIN_PASSWORD를 지우고 프로젝트를 다시 시작하세요.',
    '',
    '[기존 배포 업데이트] — 컨테이너/프로젝트를 삭제할 필요 없습니다. DB(postgres-data)와 업로드(uploads) 볼륨은 그대로 유지됩니다.',
    '1) File Station에서 기존 docker/smd-lab 폴더의 docker-compose.yml, .env.example을 이 폴더 것으로 덮어씁니다.',
    '   (.env는 기존 값 유지 — 새로 추가된 SMTP_*/ADMIN_NOTIFY_EMAIL 항목만 .env.example 참고해서 채워주세요)',
    '2) Container Manager → 이미지 → 추가 → 파일에서 추가 → smd-lab-images.tar (새 태그라 기존 이미지와 충돌 없이 추가됩니다)',
    '3) Container Manager → 프로젝트 → smd-lab → 동작 → 빌드(재구성)',
    '   → docker-compose.yml의 image 태그가 바뀐 것을 감지해 web/api 컨테이너만 새로 만듭니다. postgres는 그대로 재사용됩니다.',
    '',
  ].join('\n'),
  'utf8'
);

console.log(`Synology pack ready: ${outDir}`);
console.log('Upload that folder with smd-lab-images.tar to File Station.');
