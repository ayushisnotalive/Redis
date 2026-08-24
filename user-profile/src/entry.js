import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/user/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    await redis.hmset(`user:${id}`, { name, email });
    res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save profile" });
  }
});


app.get("/user/:id/profile", async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await redis.hgetall(`user:${id}`);
    if (Object.keys(profile).length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});


app.post("/user/:id/json",async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    await redis.set(`user:${id}`, JSON.stringify({ name, email }));
    res.status(200).json({ message: "Profile saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save profile" });
  }
});

app.get("/user/:id/json", async (req, res) => {
  const { id } = req.params;

  try {
    const profileData = await redis.get(`user:${id}`);
    if (!profileData) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const profile = JSON.parse(profileData);
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});