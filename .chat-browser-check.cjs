const { chromium } = require('C:/Users/kalix/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    async function player(name) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/**', route => {
        const url = route.request().url();
        if (url.includes('/auth/session')) return route.fulfill({ status: 401, json: { error: 'No session' } });
        if (url.includes('/progress/guest')) return route.fulfill({ json: { username: name, xpPerLevel: 100, xpPerCatch: 10, stats: { level: 1, experience: 0, coins: 0, totalFishCaught: 0 } } });
        return route.fulfill({ status: 404, json: { error: 'Unexpected test API request' } });
      });
      await page.goto('http://localhost:5700');
      await page.getByRole('button', { name: 'New trip', exact: true }).click();
      await page.locator('#ask-go').click();
      await page.getByRole('button', { name: 'Chat', exact: true }).waitFor({ timeout: 20000 });
      await page.waitForFunction(async () => (await import('/src/multiplayer/socket.js')).socket.connected);
      await page.getByRole('button', { name: 'Chat', exact: true }).click();
      await page.getByText('Online', { exact: true }).waitFor();
      return { page, errors };
    }
    const a = await player('ChatCheck A');
    const b = await player('ChatCheck B');
    await a.page.getByRole('textbox', { name: 'Message', exact: true }).fill('Hello from A');
    await a.page.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
    await b.page.getByRole('log').getByText('Hello from A', { exact: true }).waitFor();
    await b.page.getByRole('textbox', { name: 'Message', exact: true }).fill('Hello from B');
    await b.page.getByRole('textbox', { name: 'Message', exact: true }).press('Enter');
    await a.page.getByRole('log').getByText('Hello from B', { exact: true }).waitFor();
    console.log('PASS: two browsers exchange live messages');
    await a.page.evaluate(async () => {
      const { socket } = await import('/src/multiplayer/socket.js');
      window.chatMoves = [];
      socket.onAnyOutgoing((event, data) => { if (event === 'player:move') window.chatMoves.push(data); });
    });
    await a.page.getByRole('textbox', { name: 'Message', exact: true }).pressSequentially('wasd e  = -', { delay: 100 });
    await a.page.waitForTimeout(250);
    assert.equal(await a.page.evaluate(() => window.chatMoves.some(move => move.moving)), false);
    await a.page.getByRole('textbox', { name: 'Message', exact: true }).press('Escape');
    assert.equal(await a.page.locator('#player-chat-panel').count(), 0);
    assert.equal(await a.page.locator('#map-canvas').evaluate(el => document.activeElement === el), true);
    console.log('PASS: typing does not move player; Escape closes chat and returns game focus');
    const c = await player('ChatCheck C');
    await c.page.getByRole('log').getByText('Hello from A', { exact: true }).waitFor();
    await c.page.getByRole('log').getByText('Hello from B', { exact: true }).waitFor();
    const validation = await c.page.evaluate(async () => {
      const { socket } = await import('/src/multiplayer/socket.js');
      const send = body => new Promise(resolve => socket.emit('chat:send', body, resolve));
      return [await send({ text: '   ' }), await send({ text: 'x'.repeat(201) }), await send({ text: '<b>Literal text</b>', name: 'Spoofed' }), await send({ text: 'Spam' })];
    });
    assert.deepEqual(validation.map(reply => reply.error || reply.ok), ['empty', 'invalid', true, 'cooldown']);
    await b.page.getByRole('log').getByText('<b>Literal text</b>', { exact: true }).waitFor();
    assert.equal(await b.page.getByRole('log').locator('b').count(), 0);
    assert.ok((await b.page.getByRole('log').innerText()).includes('ChatCheck C:'));
    console.log('PASS: join history, real server validation, cooldown, name spoof rejection, literal HTML display');
    await b.page.screenshot({ path: path.join(process.env.TEMP, 'zvejyba-chat.png') });
    for (const client of [a, b, c]) assert.deepEqual(client.errors, []);
    console.log('PASS: no browser runtime errors; screenshot saved');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
