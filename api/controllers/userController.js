import User from "../models/user.js";

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
