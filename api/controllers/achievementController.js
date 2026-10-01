import fs from "fs";
import Achievement from "../models/achievement.js";

const uploadFile = async (req, field, folder, name) => {
  try {
    if (req.files && req.files[field]) {
      const file = req.files[field].data;
      const fileMime = req.files[field].mimeType;

      const extension = fileMime.split("/")[1];
      const fileName = `${name}.${extension}`;

      await fs.promises.writeFile(
        `public/${folder}/${fileName}`,
        file
      );

      return fileName;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// GET /api/achievements
export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();

    res.status(200).json(achievements);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Nepavyko gauti achievementų",
    });
  }
};

// GET /api/achievements/:id
export const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Neteisingas achievement ID",
    });
  }
};

// POST /api/achievements
export const createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create({
      gamesId: req.body.gamesId,
      name: req.body.name,
      description: req.body.description,
      reward: req.body.reward || [],
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko sukurti achievemento",
    });
  }
};

// PUT /api/achievements/:id
export const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      {
        gamesId: req.body.gamesId,
        name: req.body.name,
        description: req.body.description,
        reward: req.body.reward,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};

// PUT /api/achievements/:id/sprite
export const updateAchievementSprite = async (req, res) => {
  try {
    if (!req.files || !req.files.sprite) {
      return res.status(400).json({
        message: "Nuotrauka nepateikta",
      });
    }

    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        message: "Achievement nerastas",
      });
    }

    const uploadedSprite = await uploadFile(
      req,
      "sprite",
      "images/achievements",
      req.params.id
    );

    if (!uploadedSprite) {
      return res.status(500).json({
        message: "Klaida įkeliant nuotrauką",
      });
    }

    achievement.sprite = uploadedSprite;

    await achievement.save();

    res.status(200).json({
      message: "Nuotrauka įkelta",
      sprite: uploadedSprite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Klaida įkeliant nuotrauką",
    });
  }
};

// DELETE /api/achievements/:id
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    res.status(200).json({
      message: "Achievement sėkmingai ištrintas",
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: "Neteisingas achievement ID",
    });
  }
};

// PUT /api/achievements/:id/requirements
export const updateRequirements = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        error: "Requirements must be an array",
      });
    }

    achievement.requirement = req.body;

    await achievement.save();

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};

// DELETE /api/achievements/:id/requirements
export const deleteRequirements = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    achievement.requirement = [];

    await achievement.save();

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};

// PUT /api/achievements/:id/rewards
export const updateRewards = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        error: "Rewards must be an array",
      });
    }

    achievement.reward = req.body;

    await achievement.save();

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};

// DELETE /api/achievements/:id/rewards
export const deleteRewards = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        error: "Achievement nerastas",
      });
    }

    achievement.reward = [];

    await achievement.save();

    res.status(200).json(achievement);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
};



