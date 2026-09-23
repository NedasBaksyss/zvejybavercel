const fishModel = require("../models/fishModel");

async function getAll(req, res) {
  try {
    const fishes = await fishModel.findAll();
    res.status(200).json(fishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Nepavyko gauti žuvų",
    });
  }
}

async function getById(req, res) {
  try {
    const fish = await fishModel.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json(fish);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Nepavyko gauti žuvies",
    });
  }
}

async function create(req, res) {
  try {
    const fish = await fishModel.create(req.body);
    res.status(201).json(fish);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Žuvis su tokiu ID jau egzistuoja",
      });
    }

    if (error.message) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko sukurti žuvies",
    });
  }
}

async function update(req, res) {
  try {
    const updatedFish = await fishModel.updateById(req.params.id, req.body);

    if (!updatedFish) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json(updatedFish);
  } catch (error) {
    console.error(error);

    if (error.status === 400 || error.message) {
      return res.status(error.status || 400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Nepavyko atnaujinti žuvies",
    });
  }
}

async function remove(req, res) {
  try {
    const deleted = await fishModel.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Žuvis nerasta",
      });
    }

    res.status(200).json({
      message: "Žuvis sėkmingai ištrinta",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Nepavyko ištrinti žuvies",
    });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
