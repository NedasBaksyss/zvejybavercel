# Vercel deployment

Import `NedasBaksyss/zvejybavercel`, select its `main` branch, and leave the
project Root Directory at the repository root. The root `vercel.json` defines
four services using Vercel Services (currently beta).

- `/`: game client
- `/admin/home`: admin dashboard
- `/auth/sign-in`: admin login
- `/api/*`: Express API
- `/socket.io/*`: multiplayer WebSocket endpoint

Before deploying, add these environment variables in Vercel for the API:

- `MONGO_URI`: a reachable MongoDB connection string, for example MongoDB Atlas.
  The local Docker hostname `mongodb` and `localhost` will not work in Vercel.
- `JWT_SECRET`: a new random secret. Do not use the example development value.

Do not put secrets into this repository. The database is not uploaded by Git;
import the desired game data into your cloud database separately.

The production client connects to the same deployment's `/socket.io` endpoint.
An optional `VITE_SOCKET_URL` can point to a separately hosted multiplayer server.
Enable Fluid Compute/WebSocket support for the multiplayer service when required
by your Vercel account.

## Current limitations

Multiplayer presence is stored in memory. Players on different function instances
may not see each other; reliable shared multiplayer requires an external store
and a Socket.IO adapter. Vercel WebSocket connections also reconnect when a
function reaches its duration limit.

Admin image uploads currently write to the server filesystem. Persistent uploads
need cloud object storage before using those admin actions on Vercel. Existing
images in `api/public` are deployed as static assets.

The daily guest cleanup timer runs only in the local long-running API. Scheduled
cleanup on Vercel needs a separate authenticated cron endpoint.

This configuration is maintained on the local `vercel-deploy` branch and is
pushed only to `NedasBaksyss/zvejybavercel`.
