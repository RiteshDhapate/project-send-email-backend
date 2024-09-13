import express from "express";
import cors from "cors";
import { sendEmail } from "./emailSendFunction.js";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const app = express();

app.use(cors({
  allowedHeaders: "*",
  origin:"*",
}));
app.use(express.json());

app.get("/", function (req, res) {
  res.send("ok server is listening 8000");
});

app.post("/send-mail", async (req, res) => {
  try {
    const { message } = req.body;
    console.log(message);
    const { email, emailBody } = req.body;
    console.log({ email, emailBody });
    await sendEmail(email, emailBody);
    res.json({ success: true, message: "email sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "error sending email" });
  }
});

app.post("/message", async (req, res) => {
  // Initialize GoogleAIFileManager with your API_KEY.
  const fileManager = new GoogleAIFileManager(
    "AIzaSyBKZatzIoctt0_arla80wDMgGmZP202jHw"
  );
  const { message } = req.body;
  console.log(message);
  const genAI = new GoogleGenerativeAI(
    "AIzaSyAqdpNncr9BLJvPvS1rOvZfv3Wr5ex6QDQ"
  );

  // Upload the file and specify a display name.
  const uploadResponse = await fileManager.uploadFile("file.pdf", {
    mimeType: "application/pdf",
    displayName: "Gemini 1.5 PDF",
  });

  console.log(
    `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
  );

  // Use the "gemini-1.5-flash" model instead of the deprecated "gemini-pro-vision"
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Generate content using text and the URI reference for the uploaded file.
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    { text: message },
  ]);

  const response = await result.response;
  const text = response.text();
  console.log(text);
  res.json({ result: text });
});

app.listen(8000, () => {
  console.log("server listening on 8000");
});
