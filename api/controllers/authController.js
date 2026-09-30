import User from "../models/user.js";
import { hashPassword, verifyPassword } from "../services/passwords.js";
import { startSession, endSession } from "../services/sessions.js";

const publicUser = (user) => ({ id: String(user._id), user: user.username, role: user.role });
const findUsername = (username) => User.findOne({ username }).collation({ locale: "en", strength: 2 });

export async function register(req, res) {
  const { username, password, email } = req.body;
  if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
    return res.status(400).json({ error: "Username must contain 3–30 letters, numbers or underscores" });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must contain 8–128 characters" });
  }
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }
  try {
    const name = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();
    if (await findUsername(name) || await User.exists({ email: mail })) {
      return res.status(409).json({ error: "Username or email is already registered" });
    }
    const user = await User.create({ username: name, email: mail,
      passwordHash: await hashPassword(password), role: "user", lastLogin: new Date() });
    await startSession(req, res, user);
    res.status(201).json(publicUser(user));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Username or email is already registered" });
    console.error(error);
    res.status(500).json({ error: "Could not register account" });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (typeof username !== "string" || username.length > 30 ||
    typeof password !== "string" || password.length > 128) {
    return res.status(400).json({ error: "Enter your username and password" });
  }
  try {
    const user = await findUsername(username.trim()).select("+passwordHash");
    const valid = await verifyPassword(password, user?.passwordHash);
    if (!valid || user.role === "guest") {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    user.lastLogin = new Date();
    await user.save();
    await startSession(req, res, user);
    res.json(publicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not log in" });
  }
}

export function getSession(req, res) { res.json(publicUser(req.user)); }

export async function logout(req, res) {
  try {
    await endSession(req, res);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not log out. Please retry." });
  }
}
import {
  body,
  validationResult,
  matchedData,
} from "express-validator";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import User from "../models/user.js";

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET nėra nustatytas .env faile!");
}

/*
|--------------------------------------------------------------------------
| Passport JWT Strategy
|--------------------------------------------------------------------------
*/

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },

    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

export const registerValidator = () => [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];


export const loginValidator = () => [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
|
| POST /api/auth/register
|
*/

export const register = async (req, res, next) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      res.status(400);

      return next({
        message: "Validation error",
        errors: validation.array(),
      });
    }

    const data = matchedData(req);

    const {
      username,
      email,
      password,
    } = data;

    /*
     * Check whether username already exists.
     */
    const existingUsername = await User.findOne({
      username,
    });

    if (existingUsername) {
      res.status(409);

      return next({
        message: "Username already exists",
      });
    }

    /*
     * Check whether email already exists.
     */
    const existingEmail = await User.findOne({
      email,
    });

    if (existingEmail) {
      res.status(409);

      return next({
        message: "Email already exists",
      });
    }

    /*
     * Hash password.
     */
    const passwordHash = await bcryptjs.hash(
      password,
      10
    );

    /*
     * Create user.
     *
     * IMPORTANT:
     * We explicitly choose which fields can be created.
     *
     * The client cannot register as admin or modify stats.
     */
    const user = await User.create({
      username,
      email,
      passwordHash,
      role: "user",
    });

    /*
     * Return safe user data.
     *
     * passwordHash is never returned.
     */
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      stats: user.stats,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    /*
     * MongoDB duplicate-key error.
     */
    if (error.code === 11000) {
      res.status(409);

      return next({
        message: "Username or email already exists",
      });
    }

    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
|
| POST /api/auth/login
|
*/

export const login = async (req, res, next) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      res.status(400);

      return next({
        message: "Validation error",
        errors: validation.array(),
      });
    }

    const data = matchedData(req);

    const {
      email,
      password,
    } = data;

    /*
     * Find user by email.
     */
    const user = await User.findOne({
      email,
    });

    /*
     * Use the same error for a missing user
     * and an incorrect password.
     */
    if (!user) {
      res.status(401);

      return next({
        message: "Invalid email or password",
      });
    }

    /*
     * Google-only accounts may not have a password.
     */
    if (!user.passwordHash) {
      res.status(401);

      return next({
        message: "This account does not have a password",
      });
    }

    /*
     * Compare password with stored hash.
     */
    const passwordMatches = await bcryptjs.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401);

      return next({
        message: "Invalid email or password",
      });
    }

    /*
     * Update last login.
     */
    user.lastLogin = new Date();

    await user.save();

    /*
     * Create JWT.
     */
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /*
     * Safe user object.
     */
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      stats: user.stats,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error(error);

    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
|
| Checks whether the request contains a valid JWT.
|
| Authorization:
| Authorization: Bearer <token>
|
*/

export const isAuth = (req, res, next) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },

    (error, user) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        res.status(401);

        return next({
          message: "Unauthorized",
        });
      }

      /*
       * Make authenticated user available
       * to controllers through req.user.
       */
      req.user = user;

      return next();
    }
  )(req, res, next);
};

/*
|--------------------------------------------------------------------------
| Admin Middleware
|--------------------------------------------------------------------------
|
| Requires:
| 1. Valid JWT
| 2. role === "admin"
|
*/

export const isAdmin = (req, res, next) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },

    (error, user) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        res.status(401);

        return next({
          message: "Unauthorized",
        });
      }

      if (user.role !== "admin") {
        res.status(403);

        return next({
          message: "Forbidden",
        });
      }

      req.user = user;

      return next();
    }
  )(req, res, next);
};

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
|
| GET /api/auth/me
|
*/

export const me = async (req, res, next) => {
  try {
    /*
     * req.user was populated by isAuth.
     */
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);

      return next({
        message: "User not found",
      });
    }

    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      stats: user.stats,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      status: "success",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    return next(error);
  }
};
