import { createConnection, Connection, ConnectionOptions, getConnection } from "typeorm";
import { ActivationToken } from "../entity/ActivationToken";
import { User } from "../entity/User";
import logger from "logger";
import { Admin } from "../entity/Admin";
import { APIService } from "../entity/APIService";

export async function createConnectionToDB(): Promise<Connection> {
  const connectionOptions: ConnectionOptions = {
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, ActivationToken, Admin, APIService]
  };
  try {
    const connection = await createConnection(connectionOptions);
    return connection;
  } catch (err) {
    logger.error({
      message: "Unable to connect to database",
      data: connectionOptions,
      correlationId: "",
      error: err,
    });
    process.exit(1);
  }
}

export async function pingDB(): Promise<boolean> {
  try {
    await getConnection().query("SELECT 1");
    return true;
  } catch (error) {
    logger.error({
      message: "There was a problem pinging the database",
      error,
      data: {},
      correlationId: "",
    });
    return false;
  }
}