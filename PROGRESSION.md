# Guest progression prototype

- Each browser origin has one guest profile, shared across guest trips. Registered accounts have their own progress, loaded after login on any browser.
- Level starts at 1. Every successful catch gives 25 XP and increments total fish caught.
- Each 100 XP advances one level, preserving leftover XP. Lost fish give nothing.
- MongoDB `users.stats` stores the progress. Local storage holds only the guest key and unacknowledged catch IDs.
- Hover the navbar XP display to see the guest name and fish count. In Admin → Users, search that name and click the stats puzzle icon to edit level, XP (0–99), fish count, or coins.
- The game refreshes stats on entering/resuming, window focus, reconnect, and every 15 seconds during play.
- Failed saves remain queued across reloads; retry uses the same receipt, so a lost response cannot award XP twice.
- Clearing browser storage loses access to that guest profile; the database record remains. Guest progress is separate from account progress and is not automatically transferred at registration.

## Running

Run `docker compose up -d --build api front admin` from the repository root. MongoDB data stays in its existing volume.
For a local frontend dev server, `/api` proxies to localhost:3000; Docker uses `API_PROXY_TARGET=http://api:3000`.

## Checks

- `node --test front/src/guestProgress.test.js front/src/map/fishing.test.js`
- Set `MONGO_TEST_URI=mongodb://localhost:27017`, then run `node --test api/progression.test.js`. This creates and removes a uniquely named test database, separate from game data.
- Run `npm run build` in both `front` and `admin`.

## Prototype boundaries

Catch outcomes still originate in the browser; the server controls XP amounts but does not verify the fishing minigame. Game accounts now use session authentication, but the existing admin API still has no authentication middleware. Add admin authorization and server-validated catches before exposing this prototype publicly. Catch receipts are retained on each user document for retry deduplication; a production system should move them to a dedicated collection.

## Registration and login

- New trip → account card → Register. Usernames use 3–30 letters, digits or underscores (stored lowercase); passwords use 8–128 characters; an email is required.
- Passwords are stored as salted scrypt hashes, never plaintext. The parameters follow [OWASP's password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- A random session cookie lasts seven days, is HTTP-only and SameSite=Strict, and has a hashed token stored in MongoDB. Logout revokes it. Set `NODE_ENV=production` behind HTTPS to enable Secure cookies, following [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- Login/register allow 30 attempts per IP per 15 minutes in this single-process prototype. State-changing account requests require a custom header and JSON; CORS is not enabled.
- Account catch queues are isolated by user ID. Logging out leaves unsaved catches queued for that same account on its next login.
- Existing seed users with placeholder password hashes cannot log in. Create a real account through registration. Email verification and password reset are not implemented.
- Routes are in `api/routes/auth.js`; handlers in `api/controllers/authController.js`; session checks in `api/middleware/auth.js`; password/session helpers in `api/services/`.
- With `MONGO_TEST_URI` set, run `node --test api/auth.test.js api/progression.test.js` for database integration tests.
