import { NotificationService } from "messaging/lib";
import { User } from "../entity/User";

export function initMessagingService() {
  NotificationService.getInstance({
    region: process.env.SNS_REGION || "",
    endpoint: process.env.SNS_ENDPOINT,
    source: "users",
    topicArn: process.env.SNS_TOPIC_ARN || "",
  });
}

enum eventType {
  signup = "SIGN_UP",
  resetPassword = "RESET_PASSWORD"
}

async function signalSignup(user: User, token: string, expires: Date, correlationId: string) {
  const message = { type: eventType.signup, data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId }
  await NotificationService.getInstance().publish(message);
}

async function signalPasswordResetToken(user: User, token: string, expires: Date, correlationId: string) {
  const message = { type: eventType.resetPassword, data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId }
  await NotificationService.getInstance().publish(message);
}

function getEmailUser(user: User) {
  const result = { ...user };
  result.password = "";
  return result;
}

export default {
  signalPasswordResetToken,
  signalSignup,
}