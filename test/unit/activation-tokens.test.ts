import { createToken } from "../../src/utils/activation-tokens"
import { promisify } from "util";
import setupDb from "../utils/setupDb";
import { createConnectionToDB } from "../../src/utils/db-helper";
import tokens from "../data/activation-tokens.json";
import users from "../data/users.json";
import { removeAllFromDB } from "../utils/removeFromDb";
import { insertActivationTokens, ITestActivationToken, insertUsers, ITestUser } from "../utils/insertToDb";
import moment from "moment";

let sleep = promisify(setTimeout);
let connection;

beforeAll(async () => {
  await setupDb();
  sleep(2000);
  connection = await createConnectionToDB();
});

beforeEach(async () => {
  await removeAllFromDB();
  await insertUsers(users as ITestUser[]);
  await insertActivationTokens(tokens as ITestActivationToken[]);
});

describe("Activation token generation", () => {
  it("Generates a valid token string", () => {
    const result = createToken();
    expect(result.token).toBeTruthy();
    expect(result.token.length).toEqual(16);
    expect(result.expires).toBeInstanceOf(Date);
  });

  it("Generates a token that expires in two hours", () => {
    const result = createToken();
    const now = new Date();
    expect(result.expires.getHours()).toEqual(moment(now).add(2, "hours").hours());
  });
});
