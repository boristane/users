import { app } from "./src/app";
import logger from "logger";
import { createConnectionToDB } from "./src/utils/db-helper";
import { initMessagingService } from "./src/service/messaging";

const port = Number(process.env.PORT || "") || 80;

app.listen(port, async () => {
  await createConnectionToDB();
  initMessagingService();
  logger.info("Users started", { port });
});
