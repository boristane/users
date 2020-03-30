import { createConnectionToDB } from "../../src/utils/db-helper";
import users from "../data/users.json";
import tokens from "../data/activation-tokens.json";
import admins from "../data/admins.json";
import apiServices from "../data/api-services.json";
import { insertUsers, insertActivationTokens, insertAdmins, insertApiServices } from "./insertToDb";

async function populateDB() {
  await insertUsers(users);
  await insertActivationTokens(tokens);
  await insertAdmins(admins);
  await insertApiServices(apiServices);
}

export default async function setupDb() {
  const connection = await createConnectionToDB();
  await connection.synchronize(true);
  console.log("Database initialised.");
  await populateDB();
  console.log("Database populated.");
  await connection.close();
}