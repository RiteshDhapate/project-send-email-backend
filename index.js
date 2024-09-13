import express from "express";
import cors from "cors";
import { sendEmail } from "./emailSendFunction.js";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(
  "AIzaSyBKZatzIoctt0_arla80wDMgGmZP202jHw"
);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("ok server is listening 8000");
});
let uploadResponse;
const uplopadFile = async () => {
  // Upload the file and specify a display name.
  uploadResponse = await fileManager.uploadFile("file.pdf", {
    mimeType: "application/pdf",
    displayName: "Gemini 1.5 PDF",
  });
  
  console.log(
    `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
  );
};
uplopadFile();
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
  const { message } = req.body;
  console.log(message);
  const genAI = new GoogleGenerativeAI(
    "AIzaSyBKZatzIoctt0_arla80wDMgGmZP202jHw"
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
