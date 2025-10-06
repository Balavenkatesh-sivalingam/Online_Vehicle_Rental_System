import { Resend } from "resend";
import "dotenv/config";

// initialize Resend with your API key from Render env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendMail(to, subject, html, text)
 * - to: string email
 * - subject: string
 * - html: string (HTML body)
 * - text: optional plain text
 */
const sendMail = async (to, subject, html, text = "") => {
  try {
    const { data, error } = await resend.emails.send({
      from: "CarRental <onboarding@resend.dev>", // you can change this to a verified domain later
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false, error };
    }

    console.log("✅ Resend message sent. ID:", data?.id);
    return { success: true, id: data?.id, data };
  } catch (err) {
    console.error("❌ Resend send failed:", err);
    return { success: false, error: err };
  }
};

export default sendMail;
