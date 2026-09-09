db = db.getSiblingDB("zvejyba");

db.achievements.insertOne({
  _id: "first_fish",
  name: "First Catch",
  description: "Catch your first fish",
  requirement: {
    type: "fishCaught",
    amount: 1,
  },
  reward: {
    coins: 10,
  },
});

db.fish.insertOne({
  _id: "salmon",
  name: "Salmon",
  rarity: "common",
  minWeight: 1.0,
  maxWeight: 5.0,
  baseValue: 10,
  experienceReward: 5,
  coin_value: 10,
});

db.fishing_spots.insertOne({
  name: "Lake",
  mapId: "main_map",
  position: {
    x: 500,
    y: 300,
  },
  possibleFish: ["salmon", "carp", "trout"],
});

db.players.insertOne({
  _id: new ObjectId(),
  username: "test",
  passwordHash: "...",
  googleId: null,
  isGuest: false,

  coins: 10,
  level: 1,
  experience: 0,

  stats: {
    totalFishCaught: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  },

  createdAt: new Date(),
  lastLogin: new Date(),
});
