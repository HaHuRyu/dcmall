import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

// SSL 인증서 및 키 파일 경로 (각자 환경에 맞게 수정)
const httpsOptions = {
  key: fs.readFileSync(path.join(process.cwd(), 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), 'localhost.pem')),
};

const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3001, (err) => {
    if (err) {
      console.error('Error starting server:', err);
      throw err;
    }
    console.log('> Ready on https://localhost:3001');
  });
});
