import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const Queue_name = 'queue:emails';

app.post("/email", async(req,res)=>{
    const job = {
        to : req.body.to,
        subject : req.body.subject || "no_subject",
        body : req.body.body || "no_content",
        createdAt : new Date().toISOString()
    };

    await redis.lpush(Queue_name, JSON.stringify(job));

    res.status(200).json({"queued": true, message : "Email job added to queue", job});


});

app.get("/email/process-one", async(req,res)=>{
    const rawJob = await redis.rpop(Queue_name);

    if(!rawJob){
        return res.status(404).json({message : "No email jobs in queue"});
    }
    const job = JSON.parse(rawJob);
    // simulating sending email
    console.log(`Sending email to ${job.to} with subject "${job.subject}" and body "${job.body}"`);

    res.status(200).json({message : "Email job retrieved from queue", job});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});




