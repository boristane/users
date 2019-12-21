import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { ActivationToken } from "../model/ActivationToken";
import { User } from "../model/User";
import logger from "logger";

export default async function createConnectionToDB(): Promise<Connection> {
  const connectionOptions: ConnectionOptions = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, ActivationToken]
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