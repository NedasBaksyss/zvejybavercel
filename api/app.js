import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import busboy from "busboy";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from "./db.js";

const port = 3000;

import authRouter from "./routes/auth.js";
import fishesRouter from "./routes/fishes.js";
import fishingSpotsRouter from "./routes/fishing_spots.js";
import usersRouter  from "./routes/users.js";
import progressRouter from "./routes/progress.js";
import User from "./models/user.js";
import Session from "./models/session.js";
import { notFound, apiError } from "./middleware/apiErrors.js";

var app = express();

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
app.use("/fishingspots", fishingSpotsRouter);
app.use("/users", usersRouter);
app.use("/progress", progressRouter);
app.use(notFound);
app.use(apiError);

async function startServer() {
  await connectDB();
  await Promise.all([User.init(), Session.init()]);

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

startServer();

export default app;
