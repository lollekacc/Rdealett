const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const {
  buildBroadbandCartItem,
  buildMobileCartItem,
  getBroadbandOffers,
  getMobileOperatorOffers,
  getMobileRecommendations,
  getPlans,
} = require('./offer-service');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const isInsideRoot = (filePath) => filePath === ROOT || filePath.startsWith(`${ROOT}${path.sep}`);

const sendJson = (response, statusCode, payload) => {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
};

const sendError = (response, error) => {
  sendJson(response, error.statusCode || 500, {
    error: error.message || 'Server error',
  });
};

const readJsonBody = (request) => new Promise((resolve, reject) => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }));
      request.destroy();
    }
  });

  request.on('end', () => {
    if (!body) {
      resolve({});
      return;
    }

    try {
      resolve(JSON.parse(body));
    } catch {
      reject(Object.assign(new Error('Invalid JSON body'), { statusCode: 400 }));
    }
  });

  request.on('error', reject);
});

const requireMethod = (request, response, method) => {
  if (request.method === method) return true;
  response.writeHead(405, { Allow: method });
  response.end('Method not allowed');
  return false;
};

const handleApi = async (request, response, requestUrl) => {
  try {
    const { pathname, searchParams } = requestUrl;

    if (pathname === '/api/health') {
      if (!requireMethod(request, response, 'GET')) return true;
      sendJson(response, 200, { ok: true });
      return true;
    }

    if (pathname === '/api/plans' || pathname === '/api/mobile/plans') {
      if (!requireMethod(request, response, 'GET')) return true;
      sendJson(response, 200, getPlans());
      return true;
    }

    if (pathname === '/api/mobile/operator-offers') {
      if (!requireMethod(request, response, 'GET')) return true;
      sendJson(response, 200, getMobileOperatorOffers(searchParams.get('operator')));
      return true;
    }

    if (pathname === '/api/mobile/cart-item') {
      if (!requireMethod(request, response, 'POST')) return true;
      const body = await readJsonBody(request);
      sendJson(response, 200, buildMobileCartItem(body));
      return true;
    }

    if (pathname === '/api/broadband/offers') {
      if (!requireMethod(request, response, 'GET')) return true;
      sendJson(response, 200, getBroadbandOffers({
        tech: searchParams.get('tech') || 'all',
        minSpeed: searchParams.get('minSpeed') || 0,
        sort: searchParams.get('sort') || 'price',
      }));
      return true;
    }

    if (pathname === '/api/broadband/cart-item') {
      if (!requireMethod(request, response, 'POST')) return true;
      const body = await readJsonBody(request);
      sendJson(response, 200, buildBroadbandCartItem(body));
      return true;
    }

    if (pathname === '/api/recommendations/mobile') {
      if (!requireMethod(request, response, 'POST')) return true;
      const body = await readJsonBody(request);
      sendJson(response, 200, getMobileRecommendations(body.state || body));
      return true;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(response, 404, { error: 'API route not found' });
      return true;
    }

    return false;
  } catch (error) {
    sendError(response, error);
    return true;
  }
};

const sendStaticFile = (request, response, requestUrl) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  if (requestUrl.pathname.startsWith('/backend/')) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.resolve(ROOT, `.${relativePath}`);

  if (!isInsideRoot(filePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const headers = {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': stat.size,
    };

    response.writeHead(200, headers);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
};

const createServer = () => http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
  const handledApi = await handleApi(request, response, requestUrl);
  if (!handledApi) sendStaticFile(request, response, requestUrl);
});

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`Dealett backend running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  createServer,
};
