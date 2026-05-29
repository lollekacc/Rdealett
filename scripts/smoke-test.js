#!/usr/bin/env node

const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { createServer } = require('../backend/server');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, HOST, () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

const commandPath = (command) => {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
};

const findChrome = () => {
  const candidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    commandPath('google-chrome'),
    commandPath('chromium'),
    commandPath('chromium-browser'),
  ].filter(Boolean);

  const chrome = candidates.find((candidate) => fs.existsSync(candidate));
  if (!chrome) {
    throw new Error('Chrome/Chromium was not found. Set CHROME_BIN to run smoke tests.');
  }

  return chrome;
};

const waitForHttp = async (url, timeoutMs = 10000) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The process may still be starting.
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const isInsideRoot = (filePath) => filePath === ROOT || filePath.startsWith(`${ROOT}${path.sep}`);

const parseByteRange = (rangeHeader, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;

  const [, startText, endText] = match;
  if (!startText && !endText) return { invalid: true };

  let start = startText ? Number(startText) : null;
  let end = endText ? Number(endText) : null;

  if (start === null) {
    const suffixLength = end;
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
      return { invalid: true };
    }

    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    if (!Number.isInteger(start) || start < 0) {
      return { invalid: true };
    }

    end = end === null ? size - 1 : Math.min(end, size - 1);
  }

  if (!Number.isInteger(end) || start >= size || end < start) {
    return { invalid: true };
  }

  return { start, end };
};

const pipeFile = (filePath, response, options = {}) => {
  const stream = fs.createReadStream(filePath, options);
  stream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(500);
    }

    response.end('Could not read file');
  });
  stream.pipe(response);
};

const sendStaticFile = (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.resolve(ROOT, `.${relativePath}`);

  if (!isInsideRoot(filePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const headers = {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Content-Length': stat.size,
    };

    const range = parseByteRange(request.headers.range, stat.size);
    if (range?.invalid) {
      response.writeHead(416, {
        ...headers,
        'Content-Range': `bytes */${stat.size}`,
      });
      response.end();
      return;
    }

    if (request.method === 'HEAD') {
      response.writeHead(200, headers);
      response.end();
      return;
    }

    if (range) {
      response.writeHead(206, {
        ...headers,
        'Content-Length': range.end - range.start + 1,
        'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`,
      });
      pipeFile(filePath, response, range);
      return;
    }

    response.writeHead(200, headers);
    pipeFile(filePath, response);
  });
};

const startStaticServer = async () => {
  if (process.env.SMOKE_BASE_URL) {
    return {
      baseUrl: process.env.SMOKE_BASE_URL.replace(/\/$/, ''),
      stop: () => {},
    };
  }

  const port = await getFreePort();
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, resolve);
  });

  await waitForHttp(`http://${HOST}:${port}/index.html`);

  return {
    baseUrl: `http://${HOST}:${port}`,
    stop: () => server.close(),
  };
};

const startChrome = async () => {
  const debugPort = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dealett-smoke-'));
  const chrome = spawn(findChrome(), [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ], { stdio: 'ignore' });

  const debugBase = `http://${HOST}:${debugPort}`;
  await waitForHttp(`${debugBase}/json/version`);

  return {
    debugBase,
    stop: () => {
      chrome.kill();

      try {
        fs.rmSync(userDataDir, {
          recursive: true,
          force: true,
          maxRetries: 3,
          retryDelay: 100,
        });
      } catch {
        // Chrome can briefly keep profile files open after shutdown.
      }
    },
  };
};

class CdpPage {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    this.exceptions = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (event) => {
      this.handleMessage(JSON.parse(event.data));
    });
  }

  handleMessage(message) {
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }

    if (message.method === 'Runtime.exceptionThrown') {
      this.exceptions.push(
        message.params.exceptionDetails?.exception?.description ||
        message.params.exceptionDetails?.text ||
        'Runtime exception'
      );
    }

    const listeners = this.events.get(message.method) || [];
    this.events.set(message.method, listeners.filter((listener) => {
      listener.resolve(message.params);
      return false;
    }));
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitForEvent(method, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const listener = {
        resolve: (params) => {
          clearTimeout(timer);
          resolve(params);
        },
      };

      this.events.set(method, [...(this.events.get(method) || []), listener]);
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });

    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        'Evaluation failed'
      );
    }

    return result.result?.value;
  }

  async waitFor(expression, timeoutMs = 8000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const value = await this.evaluate(expression);
      if (value) return value;
      await delay(100);
    }

    throw new Error(`Timed out waiting for expression: ${expression}`);
  }

  close() {
    this.ws.close();
  }
}

const newPage = async (debugBase, url) => {
  const targetResponse = await fetch(`${debugBase}/json/new?about:blank`, { method: 'PUT' });
  const target = await targetResponse.json();
  const page = new CdpPage(target.webSocketDebuggerUrl);

  await page.send('Runtime.enable');
  await page.send('Page.enable');
  await page.send('Page.navigate', { url });
  await page.waitFor(
    `location.href === ${JSON.stringify(url)} && (document.readyState === 'interactive' || document.readyState === 'complete')`,
    15000
  );

  return page;
};

const clearCartStorage = `
  ['dealettCart','selectedOffer','rewardDistribution','dealettState','dealettCheckout','rewardChoice']
    .forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem('dealettCheckout')
`;

const assertNoExceptions = (page, label) => {
  if (page.exceptions.length) {
    throw new Error(`${label} runtime exceptions: ${page.exceptions.join(' | ')}`);
  }
};

const runSmokeTests = async ({ baseUrl, debugBase }) => {
  const results = [];

  const index = await newPage(debugBase, `${baseUrl}/index.html`);
  await index.evaluate(`localStorage.removeItem('dealettLanguage'); location.reload()`);
  await index.waitForEvent('Page.loadEventFired', 10000).catch(() => {});
  await index.waitFor(`document.documentElement.lang === 'sv'`);
  await index.waitFor(`!!window.DealettNetwork`);
  await index.waitFor(`!!document.querySelector('link[rel="icon"][href="./images/favicon.svg"]')`);

  assertNoExceptions(index, 'index');
  index.close();
  results.push('default language, favicon, and network utility');

  const login = await newPage(debugBase, `${baseUrl}/login.html`);
  await login.evaluate(`localStorage.removeItem('dealett_user'); sessionStorage.removeItem('dealett_user')`);
  await login.waitFor(`document.querySelector('#loginForm')`);
  await login.evaluate(`(() => {
    document.querySelector('#loginEmail').value = 'kund@dealett.se';
    document.querySelector('#loginPassword').value = 'demo1234';
    document.querySelector('#loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await login.waitFor(`location.pathname.endsWith('/account.html')`);
  const loginStorage = await login.evaluate(`({
    sessionUser: !!sessionStorage.getItem('dealett_user'),
    localUser: localStorage.getItem('dealett_user')
  })`);

  if (!loginStorage.sessionUser || loginStorage.localUser !== null) {
    throw new Error(`Unexpected login storage result: ${JSON.stringify(loginStorage)}`);
  }

  assertNoExceptions(login, 'login');
  login.close();
  results.push('demo login uses session storage');

  const bredband = await newPage(debugBase, `${baseUrl}/5g-bredband.html`);
  await bredband.evaluate(clearCartStorage);
  await bredband.waitFor(`document.querySelectorAll('.bredband-offer-card').length > 0`, 10000);
  await bredband.evaluate(`document.querySelector('.bredband-offer-card .bredband-choose-btn').click()`);
  await bredband.waitFor(`!document.querySelector('#continueBtn')?.disabled`);
  await bredband.evaluate(`document.querySelector('#continueBtn').click()`);
  await bredband.waitFor(`document.querySelector('#cartDrawer') && !document.querySelector('#cartDrawer').classList.contains('hidden')`);

  const bredbandCart = await bredband.evaluate(`(() => {
    const cart = JSON.parse(localStorage.getItem('dealettCart') || '[]');
    const state = JSON.parse(localStorage.getItem('dealettState') || '{}');
    return {
      cartLength: cart.length,
      productType: cart[0]?.productType,
      wish: state.wishes?.[0],
      drawerTotal: document.querySelector('#totalPrice')?.textContent || ''
    };
  })()`);

  if (
    bredbandCart.cartLength !== 1 ||
    bredbandCart.productType !== 'broadband' ||
    bredbandCart.wish !== '5G-bredband' ||
    !bredbandCart.drawerTotal.includes('kr')
  ) {
    throw new Error(`Unexpected 5G cart result: ${JSON.stringify(bredbandCart)}`);
  }

  const syncResult = await bredband.evaluate(`(() => {
    DealettCart.clearCart();
    DealettCart.appendItem({
      offerId: 'family-test',
      operator: 'Telia',
      title: '4 abonnemang',
      data: 'Obegransad surf',
      price: 899,
      persons: 4,
      productType: 'family',
      rewards: { Presentkort: 3000 }
    }, {
      state: { persons: 4, data: 'high', operator: 'Telia', wishes: ['Familjabonnemang'] }
    });
    DealettCart.appendItem({
      offerId: 'broadband-test',
      operator: 'Tele2',
      title: '5G-bredband',
      data: '500 Mbit/s',
      price: 399,
      productType: 'broadband',
      rewards: { Presentkort: 2000 }
    }, {
      state: { persons: 1, operator: 'Tele2', wishes: ['5G-bredband'] }
    });
    const cart = DealettCart.readCart();
    DealettCart.removeItem(cart[1].cartItemId);
    const stateAfterRemove = JSON.parse(localStorage.getItem('dealettState') || '{}');
    localStorage.setItem('dealettCheckout', JSON.stringify({ email: 'legacy@example.com' }));
    sessionStorage.setItem('dealettCheckout', JSON.stringify({ email: 'test@example.com' }));
    DealettCart.clearCart();
    return {
      stateAfterRemove,
      cartAfterClear: JSON.parse(localStorage.getItem('dealettCart') || '[]').length,
      localCheckoutAfterClear: localStorage.getItem('dealettCheckout'),
      sessionCheckoutAfterClear: sessionStorage.getItem('dealettCheckout'),
      selectedAfterClear: localStorage.getItem('selectedOffer')
    };
  })()`);

  if (
    syncResult.stateAfterRemove.operator !== 'Telia' ||
    syncResult.stateAfterRemove.persons !== 4 ||
    syncResult.cartAfterClear !== 0 ||
    syncResult.localCheckoutAfterClear !== null ||
    syncResult.sessionCheckoutAfterClear !== null ||
    syncResult.selectedAfterClear !== null
  ) {
    throw new Error(`Unexpected cart sync result: ${JSON.stringify(syncResult)}`);
  }

  assertNoExceptions(bredband, '5g-bredband');
  bredband.close();
  results.push('5G cart flow and shared cart state');

  const family = await newPage(debugBase, `${baseUrl}/familjabonnemang.html`);
  await family.evaluate(clearCartStorage);
  await family.waitFor(`document.querySelectorAll('.offer-card').length >= 5`, 10000);
  await family.evaluate(`document.querySelector('.offer-card .offer-card-action').click()`);
  await family.waitFor(`document.querySelector('[data-persons="4"]')`);
  await family.evaluate(`document.querySelector('[data-persons="4"]').click()`);
  await family.waitFor(`document.querySelector('[data-customer-status="none"]')`);
  await family.evaluate(`document.querySelector('[data-customer-status="none"]').click()`);
  await family.waitFor(`document.querySelectorAll('.offer-card--plan').length > 0`, 10000);
  await family.evaluate(`document.querySelector('.offer-card--plan .offer-card-action').click()`);
  await family.waitFor(`document.querySelector('.reward-choice input')`);
  await family.evaluate(`(() => {
    const total = document.querySelector('#totalReward')?.textContent?.replace(/[^0-9]/g, '') || '0';
    const input = document.querySelector('.reward-choice input');
    input.value = total;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await family.waitFor(`!document.querySelector('#rewardContinueBtn')?.disabled`);
  await family.evaluate(`document.querySelector('#rewardContinueBtn').click()`);
  await family.waitFor(`document.querySelector('#cartDrawer') && !document.querySelector('#cartDrawer').classList.contains('hidden')`);

  const familyCart = await family.evaluate(`(() => {
    const cart = JSON.parse(localStorage.getItem('dealettCart') || '[]');
    const state = JSON.parse(localStorage.getItem('dealettState') || '{}');
    return {
      cartLength: cart.length,
      productType: cart[0]?.productType,
      persons: state.persons,
      wish: state.wishes?.[0]
    };
  })()`);

  if (
    familyCart.cartLength !== 1 ||
    familyCart.productType !== 'family' ||
    familyCart.persons !== 4 ||
    familyCart.wish !== 'Familjabonnemang'
  ) {
    throw new Error(`Unexpected family cart result: ${JSON.stringify(familyCart)}`);
  }

  assertNoExceptions(family, 'familjabonnemang');
  family.close();
  results.push('family cart flow');

  results.forEach((result) => console.log(`PASS ${result}`));
};

(async () => {
  const server = await startStaticServer();
  const chrome = await startChrome();

  try {
    await runSmokeTests({
      baseUrl: server.baseUrl,
      debugBase: chrome.debugBase,
    });
  } finally {
    chrome.stop();
    server.stop();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
