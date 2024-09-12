import  express from "express";
import cors from "cors";
import  { sendEmail } from "./emailSendFunction.js";

const app= express();

app.use(cors());
app.use(express.json());


app.get('/', function (req, res) {
    res.send("ok server is listening 8000");
})

app.post("/send-mail", async(req, res) => {
    try {
        const { email, emailBody } = req.body;
        console.log({ email, emailBody });
        await sendEmail(email, emailBody);
        res.json({ success: true, message: "email send" });
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:"error sending email"});
    }
})

app.listen(8000,()=>{
    console.log("server listening on 8000");

})