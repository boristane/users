import { app } from "./src/server";
import logger from "logger";

const { PORT = 3000 } = process.env;

app.listen(PORT, () => {
  logger.info({
    message: "Server started",
    data: {
      port: PORT,
    },
    correlationId: ""
  })
});

