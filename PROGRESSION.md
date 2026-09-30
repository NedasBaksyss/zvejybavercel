# Guest progression prototype

- Each browser origin has one guest profile, shared across trips and the current mock login screens.
- Level starts at 1. Every successful catch gives 25 XP and increments total fish caught.
- Each 100 XP advances one level, preserving leftover XP. Lost fish give nothing.
- MongoDB `users.stats` stores the progress. Local storage holds only the guest key and unacknowledged catch IDs.
- Hover the navbar XP display to see the guest name and fish count. In Admin → Users, search that name and click the stats puzzle icon to edit level, XP (0–99), fish count, or coins.
- The game refreshes stats on entering/resuming, window focus, reconnect, and every 15 seconds during play.
- Failed saves remain queued across reloads; retry uses the same receipt, so a lost response cannot award XP twice.
- Clearing browser storage loses access to that guest profile; the database record remains. Different browsers/origins have separate profiles. Real account login is still the existing mock.

## Running

Run `docker compose up -d --build api front admin` from the repository root. MongoDB data stays in its existing volume.
For a local frontend dev server, `/api` proxies to localhost:3000; Docker uses `API_PROXY_TARGET=http://api:3000`.

## Checks

- `node --test front/src/guestProgress.test.js front/src/map/fishing.test.js`
- Set `MONGO_TEST_URI=mongodb://localhost:27017`, then run `node --test api/progression.test.js`. This creates and removes a uniquely named test database, separate from game data.
- Run `npm run build` in both `front` and `admin`.

## Prototype boundaries

Catch outcomes still originate in the browser; the server controls XP amounts but does not verify the fishing minigame. The existing admin API has no authentication middleware. Add real account/admin authorization and server-validated catches before exposing this prototype publicly. Catch receipts are retained on each guest document for retry deduplication; a production system should move them to a dedicated collection.
