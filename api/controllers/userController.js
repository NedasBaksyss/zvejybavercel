import User from "../models/user.js";
import bcryptjs from "bcryptjs";


// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to get users",
    });
  }
};


// GET /api/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid user ID",
    });
  }
};


// POST /api/users
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email and password are required",
      });
    }

    // Check username
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    // Check email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      role: "user",
    });

    // Never return passwordHash
    const safeUser = await User.findById(user._id)
      .select("-passwordHash");

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error);

    // MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create user",
    });
  }
};


// PATCH /api/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        error: "Role is required",
      });
    }

    const allowedRoles = ["user", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid user ID",
    });
  }
};


// PATCH /api/users/:id/stats
export const updateUserStats = async (req, res) => {
  try {
    const {
      totalFishCaught,
      coins,
      level,
      experience,
    } = req.body;

    const update = {};

    if (totalFishCaught !== undefined) {
      update["stats.totalFishCaught"] = totalFishCaught;
    }

    if (coins !== undefined) {
      update["stats.coins"] = coins;
    }

    if (level !== undefined) {
      update["stats.level"] = level;
    }

    if (experience !== undefined) {
      update["stats.experience"] = experience;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        error: "No stats provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: update,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};


// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid user ID",
    });
  }
};
// PATCH /api/users/:id/login
export const updateLastLogin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        lastLogin: new Date(),
      },
      {
        new: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Invalid user ID",
    });
  }
};

