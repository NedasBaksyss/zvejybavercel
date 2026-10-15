import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import busboy from "busboy";
import { fileURLToPath } from "url";
import { startGuestCleanup } from "./services/guestCleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from "./db.js";

const port = Number(process.env.PORT || 3000);

import authRouter from "./routes/auth.js";
import fishesRouter from "./routes/fishes.js";
import fishingSpotsRouter from "./routes/fishing_spots.js";
import achievementsRouter from "./routes/achievements.js";
import baitsRouter from "./routes/bait.js";
import itemsRouter from "./routes/item.js";
import fishingRodsRouter from "./routes/fishingRod.js";
import usersRouter  from "./routes/users.js";
import progressRouter from "./routes/progress.js";
import User from "./models/user.js";
import Session from "./models/session.js";
import { notFound, apiError } from "./middleware/apiErrors.js";

var app = express();

let databaseReady;
function initializeDatabase() {
  databaseReady ||= connectDB()
    .then(() => Promise.all([User.init(), Session.init()]))
    .catch((error) => { databaseReady = undefined; throw error; });
  return databaseReady;
}

// Functions connect on the first request and reuse the connection afterward.
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await initializeDatabase();
      next();
    } catch (error) {
      console.error("Database unavailable:", error.message);
      res.status(503).json({ error: "Database unavailable" });
    }
  });
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// busboy middleware - for handling file uploads and form data
app.use((req, res, next) => {
  // veikia tik kai multipart/form-data užklausa
  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
    return next();
  }
  if (req.method === 'POST' || req.method === 'PUT') {
    const bb = busboy({ headers: req.headers });

    // nuskaitome laukus
    req.body = {};
    bb.on('field', (name, val) => {
      req.body[name] = val;
    });

    // nuskaitome failus
    req.files = {};
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      // failų įkėlimo apribojimai

      // tinkami failo tipai: image/jpeg, image/png
      if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
        file.resume(); // praleidžiame failą
        return;
      }
      
      let fileSize = 0;
      const fileData = [];
      file.on('data', (data) => {
        
        // failo dydis iki 1MB
        fileSize += data.length;
        if (fileSize > 5 * 1024 * 1024) { // 5MB
          file.resume(); // praleidžiame failą
          return;
        }

        fileData.push(data);
      });
      file.on('end', () => {
        if (fileSize > 5 * 1024 * 1024) { // 5MB
          return;
        }

        req.files[name] = {
          filename,
          encoding,
          mimeType,
          fileSize,
          data: Buffer.concat(fileData)
        };
      });
    });
    bb.on('finish', () => {
      next();
    });
    req.pipe(bb);
  } else {
    next();
  }
});


app.use("/auth", authRouter);
app.use("/fishes", fishesRouter);
app.use("/achievements", achievementsRouter);
app.use("/fishingspots", fishingSpotsRouter);
app.use("/baits", baitsRouter);
app.use("/items", itemsRouter);
app.use("/fishing-rods", fishingRodsRouter);
app.use("/users", usersRouter);
app.use("/progress", progressRouter);
app.use(notFound);
app.use(apiError);

async function startServer() {
  await initializeDatabase();

  startGuestCleanup();

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("API startup failed:", error.message);
    process.exitCode = 1;
  });
}

export default app;
