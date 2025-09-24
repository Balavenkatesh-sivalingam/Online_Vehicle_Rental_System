import nodemailer from "nodemailer";
import "dotenv/config";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.PASS_USER,  
  },
});


const sendMail = async (to, subject, html, text = "") => {
  const mailOptions = {
    from: '"CarRental" <no-reply@carrental.com>',
    to,
    subject,
    html, 
    text, 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent to:", to);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

export default sendMail;
