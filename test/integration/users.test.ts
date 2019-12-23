import { app } from "../../src/server";
import request from "supertest";
import { createConnectionToDB } from "../../src/utils/db-helper";
import { insertUsers, ITestUser, insertActivationTokens, ITestActivationToken, insertAdmins, ITestAdmin } from "../utils/insertToDb";
import { removeAllFromDB } from "../utils/removeFromDb";
import users from "../data/users.json";
import admins from "../data/admins.json";
import tokens from "../data/activation-tokens.json";
import { sign } from "jsonwebtoken";
import setupDB from "../utils/setupDb";
import { promisify } from "util";
import { getRepository, getTreeRepository } from "typeorm";
import { User } from "../../src/entity/User";
require("dotenv").config();

jest.setTimeout(15000);

let sleep = promisify(setTimeout);
let connection;

beforeAll(async () => {
  await setupDB();
  sleep(2000);
  connection = await createConnectionToDB();
});

beforeEach(async () => {
  await removeAllFromDB();
  await insertUsers(users as ITestUser[]);
  await insertActivationTokens(tokens as ITestActivationToken[]);
  await insertAdmins(admins as ITestAdmin[]);
});

describe("users listing", () => {
  it("should list the correct number of users", async () => {
    const token = sign(users[0].email, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app).get("/users").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(users.length);
  });

  it("should not list users if you're not admin", async () => {
    const response = await request(app).get("/users").set("Authorization", `Bearer random-token`);
    expect(response.status).toBe(401);
  });

  it("should return 404 on user not found", async () => {
    const id = 50;
    const token = sign(users[0].email, process.env.JWT_USERS_KEY || "");
    const response = await request(app).get(`/users/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should fail if you're not logged in", async () => {
    const id = 1;
    const response = await request(app).get(`/users/${id}`);
    expect(response.status).toBe(401);
  });

  it("should return the correct valid user", async () => {
    const id = 1;
    const token = sign(users[0].email, process.env.JWT_USERS_KEY || "");
    const response = await request(app).get(`/users/${id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toEqual(users[0].email);
  });
});

describe("signup", () => {
  it("should signup a new user", async () => {
    const user = {
      forename: "ddb",
      surname: "oi",
      password: "lmao12345aa8",
      email: "jake@london.com"
    };

    const response = await request(app)
      .post("/users/signup")
      .send(user);

    expect(response.status).toBe(201);
  });

  it("should reject double signup", async () => {
    const response = await request(app)
      .post("/users/signup")
      .send(users[0]);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User already created");
  });

  it("should reject invalid email signup", async () => {
    const user = {
      name: "ddb",
      password: "lmao",
      email: "jake.cm"
    };

    const response = await request(app)
      .post("/users/signup")
      .send(user);

    expect(response.status).toBe(400);
  });
});

describe("login", () => {
  it("should fail loging in a non-existing user", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: "blabla@blabla.com",
        password: "lmaohs15884fec"
      });

    expect(response.status).toBe(401);
  });

  it("should fail loging in a user with a wrong password", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: users[0].email,
        password: "error123548762"
      });

    expect(response.status).toBe(401);
  });

  it("should succesfully login a user", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: users[0].email,
        password: users[0].password
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Authentication successful.");
    expect(response.body.token).toBeTruthy();
  });
});

describe("activation token", () => {
  it("should activate a user", async () => {
    const token = tokens[0];
    const user = await getRepository(User).findOneOrFail({ id: token.user });
    expect(user.activated).toBeFalsy();
    const response = await request(app).get(`/users/activate/${token.token}`);
    const activatedUser = await getRepository(User).findOneOrFail({ id: token.user });
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(token.user);
    expect(activatedUser.activated).toBeTruthy();
  });

  it("should reject an expired token", async () => {
    const token = tokens.find((t) => t.expires);
    if (!token) throw new Error("The test data should have at least one expired token");
    const user = await getRepository(User).findOneOrFail({ id: token.user });
    expect(user.activated).toBeFalsy();
    const response = await request(app).get(`/users/activate/${token.token}`);
    const activatedUser = await getRepository(User).findOneOrFail({ id: token.user });
    expect(response.status).toBe(410);
    expect(activatedUser.activated).toBeFalsy();
  });

  it("should ignore a fake activation token", async () => {
    const token = "123456789abethsk";
    const response = await request(app).get(`/users/activate/${token}`);
    expect(response.status).toBe(404);
  });
});

describe("edit", () => {
  it("should fail if the schema is not validated", async () => {
    const body = {
      forename: "Arnold",
      email: users[0].email,
    }

    const response = await request(app).patch("/users/one").send(body);
    expect(response.status).toEqual(400);
  });

  it("should reject editing if you're not logged in", async () => {
    const id = 1;
    const body = {
      forename: "Arnold",
      email: users[0].email,
    }

    const response = await request(app).patch(`/users/${id}`).send(body);
    expect(response.status).toEqual(401);
  });

  it("should fail if a different user tries to edit you", async () => {
    const id = 1;
    const body = {
      forename: "Arnold",
      email: users[1].email,
    }
    const token = sign(users[0].email, process.env.JWT_USERS_KEY || "");
    const response = await request(app).patch(`/users/${id}`).send(body).set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(401);
  });

  it("should edit a user accrodingly", async () => {
    const id = 1;
    const body = {
      forename: "Arnold",
      optInMarketing: true,
      email: users[0].email,
    }
    const token = sign(users[1].email, process.env.JWT_USERS_KEY || "");
    const response = await request(app).patch(`/users/${id}`).send(body).set("Authorization", `Bearer ${token}`);

    const user = await getRepository(User).findOneOrFail({ id });
    expect(response.status).toEqual(200);
    expect(user.forename).toEqual(body.forename);
    expect(user.optInMarketing).toEqual(body.optInMarketing);
  });
});

describe("delete", () => {
  it("should respond with 404 on non-existing user", async () => {
    const id = 12554;
    const token = sign(users[0].email, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app)
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should reject deletion for users", async () => {
    const id = 1
    const token = sign(users[0].email, process.env.JWT_USERS_KEY || "");

    const response = await request(app)
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should succesfully delete a user for admins", async () => {
    const id = 1;
    const token = sign(admins[0].email, process.env.JWT_ADMINS_KEY || "");

    const response = await request(app)
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
