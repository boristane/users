import { app } from "./src/server";
import logger from "logger";
import { createConnectionToDB } from "./src/utils/db-helper";
import serverless from "serverless-http";

const handler = serverless(app);

export const server = async (event: any, context: any) => {
  await createConnectionToDB();
  logger.info({
    message: "Users started",
    data: {
      event,
    },
    correlationId: ""
  })
  return handler(event, context);
}

