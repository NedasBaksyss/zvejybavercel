const userModel = require("../models/userModel");

async function getAll(req, res) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get users",
    });
  }
}

async function create(req, res) {
  try {
    const user = await userModel.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
}

module.exports = {
  getAll,
  create,
};
