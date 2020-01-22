import AWS, { SNS } from "aws-sdk";
import logger from "logger";

export async function publishToSNS(topicARN: string, message: ISNSMessage, correlationId: string) {
  const region = process.env.SNS_REGION;
  const endpoint = process.env.SNS_ENDPOINT;

  let producer: SNS;

  if (!endpoint) {
    producer = new SNS({
      region,
    });
  } else {
    setAWSCredentials();
    producer = new SNS({
      region,
      endpoint,
    });
  }

  try {
    const result = await producer.publish({
      Message: JSON.stringify(message),
      TopicArn: topicARN,
    }).promise();

    logger.info({
      message: "Message published to SNS.",
      data: {
        topicARN,
        message,
        result: result.MessageId,
      },
      correlationId,
    });
  } catch (error) {
    logger.error({
      message: "Unable to publish message to sns.",
      data: {
        topicARN,
        message,
      },
      correlationId,
      error,
    });
  }
}

export function setAWSCredentials() {
  // This is used in local dev only, as both in prod and uat the credentials are from the task definition
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
}

export interface ISNSMessage {
  type: string;
  data: object;
  correlationId: string;
}