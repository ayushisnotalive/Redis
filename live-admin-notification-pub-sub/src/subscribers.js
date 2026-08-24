import Redis from "ioredis";

const Subscriber = new Redis({
  host: process.env.REDIS_HOST || "redis://localhost:6379",
});

Subscriber.subscribe("notification", (err) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
    return;
  }
  console.log("Subscribed to notification channel");
});

Subscriber.on("message", (channel, message) => {
  console.log("Recieved on", channel, ":", JSON.parse(message));
  // Here you can add logic to handle the message, e.g., send an email or push notification
});