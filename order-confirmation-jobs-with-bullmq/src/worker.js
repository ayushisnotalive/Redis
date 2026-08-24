import {Job, Worker} from "bullmq";
import {connection} from "./queue.js";


const emailWorker = new Worker(
    "email",
    
    async (Job) => {
        console.log("processing email job...", Job, Job.name, Job.data),
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log("email job completed", Job.name, Job.data);
    },
    {connection}

);

Worker.on("completed", (job) => {
    console.log(`Job with id ${job.id} has been completed`);
});

Worker.on("failed", (job, err) => {
    console.log(`Job with id ${job.id} has failed with ${err.message}`);
});