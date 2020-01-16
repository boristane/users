import { app } from "../../src/app";
import request from "supertest";
import { insertApiServices, ITestApiService, insertUsers, ITestUser } from "../utils/insertToDb";
import { removeAllFromDB } from "../utils/removeFromDb";
import services from "../data/api-services.json";
import users from "../data/users.json";
import setupDB from "../utils/setupDb";
import { promisify } from "util";
import { createConnectionToDB } from "../../src/utils/db-helper";
require("dotenv").config();


let sleep = promisify(setTimeout);
let connection;

beforeAll(async () => {
  await setupDB();
  sleep(2000);
  connection = await createConnectionToDB();
});

beforeEach(async () => {
  await removeAllFromDB();
  await insertApiServices(services as ITestApiService[]);
  await insertUsers(users as ITestUser[]);
});

describe("get user", () => {
  it("should get an existing user", async () => {
    const token = services[0].token;
    const response = await request(app).get(`/internal/users/${users[0].uuid}`).set("X-TOKEN-AUTH", token);
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({uuid: users[0].uuid});
  });

  it("should respond with 404 for non existing user", async () => {
    const token = services[0].token;
    const response = await request(app).get(`/internal/users/whatever`).set("X-TOKEN-AUTH", token);
    expect(response.status).toBe(404);
  });

  it("should 401 for inactive api token", async () => {
    const token = services.find((service) => service.active === false)?.token;
    if (!token) {
      throw new Error("The test data should have at least one inactive api");
    }
    const response = await request(app).get(`/internal/users/${users[0].uuid}`).set("X-TOKEN-AUTH", token);
    expect(response.status).toBe(401);
  });

  it("should 401 for expired api token", async () => {
    const token = services.find((service) => service.name === "expired-api")?.token;
    if (!token) {
      throw new Error("The test data should have at least one expired api");
    }
    const response = await request(app).get(`/internal/users/${users[0].uuid}`).set("X-TOKEN-AUTH", token);
    expect(response.status).toBe(401);
  });

  it("should not get any user if the API header is invalid", async () => {
    const response = await request(app).get(`/internal/users/whatever`).set("X-TOKEN-AUTH", "randon-token");
    expect(response.status).toBe(401);
  });
});