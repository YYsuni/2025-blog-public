import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ENV_FILE = '.env.docker';
const CONTAINER_NAME = '2025-blog';
const IMAGE_TAG = '2025-blog:latest';

// 从 .env.docker 中解析 PORT 值
let PORT = '2025';
if (existsSync(ENV_FILE)) {
  const text = readFileSync(ENV_FILE, 'utf-8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    if (key === 'PORT') {
      PORT = line.slice(eqIdx + 1).trim();
      break;
    }
  }
}

console.log(`PORT=${PORT} (from ${ENV_FILE})`);

// 1. 构建镜像
execSync('docker build -t ' + IMAGE_TAG + ' .', { stdio: 'inherit' });

// 2. 删除同名旧容器（忽略错误）
try {
  execSync('docker rm -f ' + CONTAINER_NAME, { stdio: 'ignore' });
} catch {
  // 容器不存在或已停止，忽略
}

// 3. 启动新容器
const cmd = [
  'docker run -d',
  '--name ' + CONTAINER_NAME,
  '-p ' + PORT + ':' + PORT,
  '--env-file ' + ENV_FILE,
  '--restart unless-stopped',
  IMAGE_TAG,
].join(' ');

execSync(cmd, { stdio: 'inherit' });

console.log('Container started at http://localhost:' + PORT);
