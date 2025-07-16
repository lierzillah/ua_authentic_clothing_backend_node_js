require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');

const { sequelize } = require('../config');
const {
  Users,
  RefreshTokens,
  Exhibits,
  ExhibitTranslations,
  ExhibitsImages,
} = require('../models');
const { encryptPassword } = require('../app/utils');

const PORT = process.env.TEST_PORT || 4100;
const BASE = `http://localhost:${PORT}`;

const results = [];

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}

async function request(method, endpoint, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(BASE + endpoint, { method, headers, body: payload });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, json };
}

async function waitForServer(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return;
    } catch {
      
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not start on ${BASE} within ${timeoutMs}ms`);
}

async function cleanup(created) {
  try {
    if (created.exhibitId) {
      await ExhibitsImages.destroy({ where: { exhibitId: created.exhibitId } });
      await ExhibitTranslations.destroy({
        where: { exhibitId: created.exhibitId },
      });
      await Exhibits.destroy({ where: { id: created.exhibitId } });
    }

    const userIds = [created.userId, created.adminId].filter(Boolean);
    if (userIds.length) {
      await RefreshTokens.destroy({ where: { userId: userIds } });
      await Users.destroy({ where: { id: userIds } });
    }
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

async function runTests() {
  const created = { userId: null, adminId: null, exhibitId: null };
  const stamp = Date.now();
  const userPassword = 'user_pw_123';
  const adminPassword = 'admin_pw_123';

  try {
    const admin = await Users.create({
      username: `test_admin_${stamp}`,
      password: await encryptPassword(adminPassword),
      role: 'admin',
      active: true,
    });
    created.adminId = admin.id;

    const username = `test_user_${stamp}`;

    console.log('\n[auth] register');
    let r = await request('POST', '/auth/register', {
      body: { username, password: userPassword, role: 'admin' },
    });
    check('register returns 200', r.status === 200, `status ${r.status}`);
    check('register returns access + refresh tokens', r.json?.accessToken && r.json?.refreshToken);
    check('register ignores role from body (forced to user)', r.json?.user?.role === 'user', `role ${r.json?.user?.role}`);
    created.userId = r.json?.user?.id;

    console.log('\n[auth] login');
    r = await request('POST', '/auth/login', {
      body: { username, password: userPassword },
    });
    check('login returns 200', r.status === 200, `status ${r.status}`);
    check('login returns access token', Boolean(r.json?.accessToken));
    let userToken = r.json?.accessToken;
    let userRefresh = r.json?.refreshToken;

    console.log('\n[auth] refresh token');
    r = await request('POST', '/auth/refresh-token', {
      body: { refreshToken: userRefresh },
    });
    check('refresh returns 200', r.status === 200, `status ${r.status}`);
    check('refresh returns new access token', Boolean(r.json?.accessToken));
    userToken = r.json?.accessToken || userToken;

    console.log('\n[user] get current user');
    r = await request('GET', '/user', { token: userToken });
    check('get user returns 200', r.status === 200, `status ${r.status}`);
    check('get user returns correct username', r.json?.username === username, `username ${r.json?.username}`);
    check('get user excludes password', r.json !== null && r.json.password === undefined);

    console.log('\n[user] update current user');
    const newUsername = `test_user_upd_${stamp}`;
    r = await request('PUT', '/user', {
      token: userToken,
      body: { username: newUsername },
    });
    check('update user returns 200', r.status === 200, `status ${r.status}`);
    check('update user changed username', r.json?.username === newUsername, `username ${r.json?.username}`);

    console.log('\n[auth] login as admin');
    r = await request('POST', '/auth/login', {
      body: { username: admin.username, password: adminPassword },
    });
    check('admin login returns 200', r.status === 200, `status ${r.status}`);
    const adminToken = r.json?.accessToken;

    console.log('\n[exhibit] create');
    r = await request('POST', '/exhibits', {
      token: adminToken,
      body: { title: 'Test Exhibit', description: 'desc', author: 'Author' },
    });
    check('create exhibit returns 200', r.status === 200, `status ${r.status}`);
    check('create exhibit returns id', Boolean(r.json?.id));
    check('create exhibit creates ua translation', (r.json?.translations || []).some((t) => t.locale === 'ua' && t.author === 'Author'));
    created.exhibitId = r.json?.id;

    console.log('\n[exhibit] get by id');
    r = await request('GET', `/exhibits/${created.exhibitId}`);
    check('get exhibit returns 200', r.status === 200, `status ${r.status}`);
    check('get exhibit returns correct title', r.json?.title === 'Test Exhibit', `title ${r.json?.title}`);

    console.log('\n[exhibit] list contains created item');
    r = await request('GET', `/exhibits?search=Test Exhibit&limit=50`);
    check('list exhibits returns 200', r.status === 200, `status ${r.status}`);
    check('list contains created exhibit', (r.json?.items || []).some((e) => e.id === created.exhibitId));

    console.log('\n[exhibit] update');
    r = await request('PUT', `/exhibits/${created.exhibitId}`, {
      token: adminToken,
      body: { title: 'Updated Exhibit', author: 'New Author' },
    });
    check('update exhibit returns 200', r.status === 200, `status ${r.status}`);
    r = await request('GET', `/exhibits/${created.exhibitId}`);
    check('update exhibit changed title', r.json?.title === 'Updated Exhibit', `title ${r.json?.title}`);
    check('update exhibit changed translation', (r.json?.translations || []).some((t) => t.author === 'New Author'));

    console.log('\n[exhibit] delete');
    r = await request('DELETE', `/exhibits/${created.exhibitId}`, { token: adminToken });
    check('delete exhibit returns 200', r.status === 200, `status ${r.status}`);
    r = await request('GET', `/exhibits/${created.exhibitId}`);
    check('deleted exhibit is gone (404)', r.status === 404, `status ${r.status}`);
    if (r.status === 404) created.exhibitId = null;
  } finally {
    await cleanup(created);
  }
}

(async () => {
  let server;
  let exitCode = 0;

  try {
    server = spawn('node', [path.join(__dirname, '..', 'server.js')], {
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'ignore',
    });

    await waitForServer();
    await runTests();
  } catch (error) {
    console.error('\nFatal error while running tests:', error.message);
    exitCode = 1;
  } finally {
    if (server) server.kill();
    try {
      await sequelize.close();
    } catch {
      
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log('\n' + '─'.repeat(50));
  if (failed.length === 0 && results.length > 0 && exitCode === 0) {
    console.log(`Tests completed (${passed}/${results.length})`);
  } else {
    console.log(`Tests failed: ${failed.length} out of ${results.length}`);
    failed.forEach((f) => console.log(`   - ${f.name}${f.detail ? ` (${f.detail})` : ''}`));
    exitCode = 1;
  }
  console.log('─'.repeat(50));

  process.exit(exitCode);
})();
