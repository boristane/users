import { Messaging } from "messaging";
import { User } from "../entity/User";
import logger from "logger";

export function initMessagingService() {
  Messaging.getInstance({
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

async function signalSignup(user: User, token: string, expires: Date) {
  const message = { type: eventType.signup, data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId: logger.getCorrelationId() }
  await Messaging.getInstance().publish(message);
}

async function signalPasswordResetToken(user: User, token: string, expires: Date) {
  const message = { type: eventType.resetPassword, data: { user: getEmailUser(user), token, expires: expires.toISOString() }, correlationId: logger.getCorrelationId() }
  await Messaging.getInstance().publish(message);
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