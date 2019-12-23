import { createConnectionToDB } from "../../src/utils/db-helper";
import users from "../data/users.json";
import tokens from "../data/activation-tokens.json";
import { insertUsers, insertActivationTokens } from "./insertToDb";

async function populateDB() {
  await insertUsers(users);
  await insertActivationTokens(tokens);
}

export default async function setupDb() {
  const connection = await createConnectionToDB();
  await connection.synchronize(true);
  console.log("Database initialised.");
  await populateDB();
  console.log("Database populated.");
  await connection.close();
}
