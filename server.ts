import { app } from "./src/app";
import logger from "logger";
import { createConnectionToDB } from "./src/utils/db-helper";

const port = Number(process.env.PORT || "") || 80;

app.listen(port, async () => {
  await createConnectionToDB();
  logger.info({
    message:`Users started on port ${port}`,
    data: {
      port,
    },
    correlationId: ""
  });
});
