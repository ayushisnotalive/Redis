import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function generateOTP(phoneNumber) {
    return `otp:${phoneNumber}`;
}

app.post("/otp", async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    const otpKey = generateOTP(phoneNumber);
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await redis.set(otpKey, otpValue, "EX",300); // Set OTP with a 5-minute expiration

    res.status(200).json({ message: "OTP generated successfully", otp: otpValue });

})

app.post("/otp/verify", async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
    }

    const storedOtp = await redis.get(generateOTP(phoneNumber));

    if(!storedOtp) {
        return res.status(400).json({ error: "OTP has expired or does not exist" });
    }

    if (storedOtp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    await redis.del(generateOTP(phoneNumber)); // Delete OTP after successful verification

    res.status(200).json({ message: "OTP verified successfully" });
})

app.get("/otp/:phoneNumber/TTL",async(req,res)=>{
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    const ttl = await redis.ttl(generateOTP(phoneNumber));

    if (ttl === -2) {
        return res.status(404).json({ error: "OTP does not exist" });
    }

    res.status(200).json({ phoneNumber, ttl });
    
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});