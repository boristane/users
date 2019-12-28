import { publishToSNS } from "./sns-helper";
import { User } from "../entity/User";

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

export async function sendActivationTokenEmail(user: User, token: string, expires: Date, correlationId: string) {
  const message = { type: "ACTIVATE_ACCOUNT", data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId }
  const topicArn = process.env.EMAIL_SNS_TOPIC_ARN || "";
  await publishToSNS(topicArn, message, correlationId);
}

export async function sendPasswordResetTokenEmail(user: User, token: string, expires: Date, correlationId: string) {
  const message = { type: "PASSWORD_RESET_TOKEN", data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId }
  const topicArn = process.env.EMAIL_SNS_TOPIC_ARN || "";
  await publishToSNS(topicArn, message, correlationId);
}

function getEmailUser(user: User) {
  const result = { ...user };
  result.password = "";
  return result;
}
