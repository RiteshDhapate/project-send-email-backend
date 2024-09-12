import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  // port: 587,
  auth: {
    user: "rieshdhapatepatil@gmail.com",
    pass: "qivfhfxkjjftcjwa",
  },
});

export async function sendEmail(toEmail, emailBody) {
  try {
    const info = await transporter.sendMail({
      from: 'ritesh@gmail.com', // sender address
      to: toEmail, // list of receivers
      subject: "SwiftDeploy otp", // Subject line
      text: "Hello from SwiftTalk", // plain text body
      html: `
        ${emailBody}
      `, // html body
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}
