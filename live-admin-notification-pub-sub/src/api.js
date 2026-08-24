import express from 'express';
import Redis from 'redis';

const app = express();

app.use(express.json());

const publisher = new Redis(
    process.env.REDIS_HOST || 'redis://localhost:6379'
);


app.post("/notifications", (req, res) => {
    const payload = {
        title: req.body.title || "Default Title",
        message: req.body.message,
        created_at: new Date().toISOString(),
    };

    const recievers = await publisher.publish("notifications", JSON.stringify(payload));

    res.status(200).json({ message: `notification sent to ${recievers} receivers`, payload });
})


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});