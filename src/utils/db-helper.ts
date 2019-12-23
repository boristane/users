import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { ActivationToken } from "../entity/ActivationToken";
import { User } from "../entity/User";
import logger from "logger";
import { Admin } from "../entity/Admin";

export async function createConnectionToDB(): Promise<Connection> {
  const connectionOptions: ConnectionOptions = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, ActivationToken, Admin]
  };
  try {
    const connection = await createConnection(connectionOptions);
    return connection;
  } catch (err) {
    logger.error({
      message: "Unable to connect to database",
      data: connectionOptions,
      correlationId: "",
      error: err.toString(),
    });
    process.exit(1);
  }
}