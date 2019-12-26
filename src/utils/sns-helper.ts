import { SNS } from "aws-sdk";
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
      error: error.toString(),
    });
  }
}

export interface ISNSMessage {
  type: string;
  data: object;
  correlationId: string;
}