import { publishToSNS } from "./sns-helper";

export function createToken(): { token: string; expires: Date } {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let t = "";
  for (let i = 16; i > 0; --i) {
    t += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  const validForHours = 2;
  const expires = new Date();
  expires.setHours(expires.getHours() + validForHours);

  const token = {
    expires,
    token: t
  };
  return token;
}

export async function sendTokenEmail(email: string, token: string, expires: Date, correlationId: string) {
  const message = { emailType: "ACTIVATION_TOKEN", data: { email, token, expires: expires.toUTCString() } }
  const topicArn = process.env.EMAIL_SNS_TOPIC_ARN || "";
  await publishToSNS(topicArn, message, correlationId);
}