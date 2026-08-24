import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

const bannerKey = "app:banner";

// Set banner
app.post("/banner", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    await redisClient.set(bannerKey, message);

    res.status(200).json({
      message: "Banner message set successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to set banner message",
    });
  }
});

// Get banner
app.get("/banner", async (req, res) => {
  try {
    const message = await redisClient.get(bannerKey);

    if (!message) {
      return res.status(404).json({
        error: "No banner message found",
      });
    }

    res.status(200).json({
      message,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to get banner message",
    });
  }
});

// Delete banner
app.delete("/banner", async (req, res) => {
  try {
    await redisClient.del(bannerKey);

    res.status(200).json({
      message: "Banner message deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to delete banner message",
    });
  }
});

// Check if banner exists
app.get("/banner/exists", async (req, res) => {
  try {
    const exists = await redisClient.exists(bannerKey);

    res.status(200).json({
      exists: Boolean(exists),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to check banner",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});