import express from "express";
import cors from "cors";
import { sendEmail } from "./emailSendFunction.js";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";



const app = express();

app.use(
  cors({
    allowedHeaders: "*",
    origin: [
      "https://project-email-send-frontend.vercel.app",
      "http://localhost:3000",
    ],
  })
);
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

// app.post("/message", async (req, res) => {
//   try {
//     // Initialize GoogleAIFileManager with your API_KEY.
//     const fileManager = new GoogleAIFileManager(
//       "AIzaSyD515QtP-mxiOaXhDyCkwTwrbuOL6FIgbI"
//     );
//     const { message } = req.body;
//     console.log(message);
//     const genAI = new GoogleGenerativeAI(
//       "AIzaSyD515QtP-mxiOaXhDyCkwTwrbuOL6FIgbI"
//     );

//     // Upload the file and specify a display name.
//     const uploadResponse = await fileManager.uploadFile("file.pdf", {
//       mimeType: "application/pdf",
//       displayName: "Gemini 1.5 PDF",
//     });

//     console.log(
//       `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
//     );

//     // Use the "gemini-1.5-flash" model instead of the deprecated "gemini-pro-vision"
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Generate content using text and the URI reference for the uploaded file.
//     const result = await model.generateContent([
//       {
//         fileData: {
//           mimeType: uploadResponse.file.mimeType,
//           fileUri: uploadResponse.file.uri,
//         },
//       },
//       { text: message },
//     ]);

//     const response = await result.response;
//     const text = response.text();
//     console.log(text);
//     res.json({ result: text });
//   } catch (error) {
//     res.status(500).json({success:false});
//     console.log(error);
//   }
// });
app.post("/message", async (req, res) => {
  try {
    const fileManager = new GoogleAIFileManager(
      "AIzaSyD515QtP-mxiOaXhDyCkwTwrbuOL6FIgbI"
    );
    const { message } = req.body;

    // Sanitize or modify the message if needed
    console.log(message);
    const genAI = new GoogleGenerativeAI(
      "AIzaSyD515QtP-mxiOaXhDyCkwTwrbuOL6FIgbI"
    );

    const uploadResponse = await fileManager.uploadFile("file.pdf", {
      mimeType: "application/pdf",
      displayName: "Gemini 1.5 PDF",
    });

    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: message },
    ]);

    const response = result.response;

    // Check for safety issues
    if (response.safetyBlocked) {
      res
        .status(403)
        .json({
          success: false,
          message: "Content was blocked due to safety filters",
        });
    } else if (response.candidates && response.candidates.length > 0) {
      const text = response.text();
      res.json({ result: text });
    } else {
      res
        .status(500)
        .json({ success: false, message: "No candidates returned" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error processing the request" });
  }
});


app.listen(8000, () => {
  console.log("server listening on 8000");
});
