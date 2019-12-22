import { app } from "../../src/server";
import request from "supertest";
import { createConnectionToDB } from "../../src/utils/db-helper";
import { insertUsers, IUser } from "../utils/insertToDb";
import { removeUsersFromDB } from "../utils/removeFromDb";
import users from "../data/users.json";
import { sign } from "jsonwebtoken";
import setupDB from "../utils/setupDb";
import { promisify } from "util";
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
  await removeUsersFromDB();
  await insertUsers(users as IUser[]);
});

describe("users listing", () => {
  it("should list the correct number of users", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(users.length);
  });

  it("should return 404 on user not found", async () => {
    const id = 50;
    const response = await request(app).get(`/users/${id}`);

    expect(response.status).toBe(404);
  });

  // it("should return the correct valid user", async () => {
  //   const id = 1;
  //   const params = {
  //     id
  //   };
  //   const url = buildUrl("/user/", params);
  //   const response = await request(app).get(url);
  //   expect(response.status).toBe(200);
  //   expect(response.body.user.name).toEqual(users[0].name);
  // });
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
  // it("should fail loging in a non-existing user", async () => {
  //   const response = await request(app)
  //     .post("/users/login")
  //     .send({
  //       email: "blabla@blabla.com",
  //       password: "lmaohs15884fec"
  //     });

  //   expect(response.status).toBe(401);
  // });

  // it("should fail loging in a user with a wrong password", async () => {
  //   const response = await request(app)
  //     .post("/users/login")
  //     .send({
  //       email: users[0].email,
  //       password: "error123548762"
  //     });

  //   expect(response.status).toBe(401);
  // });

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

describe("delete", () => {
  it("should respond with 404 on non-existing user", async () => {
    const email = "random@nonexisting.com";
    const params = {
      email
    };
    const token = sign(users[0].email, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app)
      .delete("/users")
      .query(params)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should reject deletion for users", async () => {
    const email = users[0].email;
    const params = {
      email
    };
    const token = sign(users[0].email, process.env.JWT_USERS_KEY || "");

    const response = await request(app)
      .delete("/users")
      .query(params)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  // it("should succesfully delete a user for admins", async () => {
  //   const email = users[0].email;
  //   const params = {
  //     email
  //   };
  //   const token = sign(admins[0].email, process.env.JWT_ADMINS_KEY || "");

  //   const response = await request(app)
  //     .delete("/users/")
  //     .set("Authorization", `Bearer ${token}`);

  //   expect(response.status).toBe(200);
  // });
});
