import { app } from "../../src/server";
import request from "supertest";
import { createConnectionToDB } from "../../src/utils/db-helper";
import { insertAdmins, ITestAdmin } from "../utils/insertToDb";
import { removeAllFromDB } from "../utils/removeFromDb";
import admins from "../data/admins.json";
import { sign } from "jsonwebtoken";
import setupDB from "../utils/setupDb";
import { promisify } from "util";
import { ICreateRequest } from "../../src/schema/admin";
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
  await insertAdmins(admins as ITestAdmin[]);
});

describe("admins listing", () => {
  it("should list the correct number of admins", async () => {
    const token = sign(admins[0].email, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app).get("/admins").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(admins.length);
  });

  it("should not list admins if you're not admin", async () => {
    const response = await request(app).get("/admins").set("Authorization", `Bearer random-token`);
    expect(response.status).toBe(401);
  });
});

describe("create", () => {
  it("should create a new admin", async () => {
    const superAdmin = admins.find(admin => admin.isSuperAdmin)?.email;
    if (!superAdmin) {
      throw new Error("The test data should have at least one super admin");
    } 
    const token = sign(superAdmin, process.env.JWT_ADMINS_KEY || "");
    const admin : ICreateRequest = {
      username: "ddb",
      password: "lmao12345aa8",
      email: "jake@london.com",
      isSuperAdmin: false,
      superAdmin, 
    };

    const response = await request(app)
      .post("/admins")
      .send(admin)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
  });

  it("should reject double creation", async () => {
    const superAdmin = admins.find(admin => admin.isSuperAdmin)?.email;
    if (!superAdmin) {
      throw new Error("The test data should have at least one super admin");
    } 
    const token = sign(superAdmin, process.env.JWT_ADMINS_KEY || "");
    const admin : ICreateRequest = {
      username: "ddb",
      password: "lmao12345aa8",
      email: superAdmin,
      isSuperAdmin: false,
      superAdmin, 
    };

    const response = await request(app)
      .post("/admins")
      .send(admin)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Admin already created");
  });

  it("should reject invalid email creation", async () => {
    const superAdmin = admins.find(admin => admin.isSuperAdmin)?.email;
    if (!superAdmin) {
      throw new Error("The test data should have at least one super admin");
    }
    const token = sign(superAdmin, process.env.JWT_ADMINS_KEY || "");
    const admin : ICreateRequest = {
      username: "ddb",
      password: "lmao12345aa8",
      email: "whateverfor real",
      isSuperAdmin: false,
      superAdmin, 
    };

    const response = await request(app)
      .post("/admins")
      .send(admin)
      .set("Authorization", `Bearer ${token}`);


    expect(response.status).toBe(400);
  });
});

describe("login", () => {
  it("should fail loging in a non-existing admin", async () => {
    const response = await request(app)
      .post("/admins/login")
      .send({
        email: "blabla@blabla.com",
        password: "lmaohs15884fec"
      });

    expect(response.status).toBe(401);
  });

  it("should fail loging in a admin with a wrong password", async () => {
    const response = await request(app)
      .post("/admins/login")
      .send({
        email: admins[0].email,
        password: "error123548762"
      });

    expect(response.status).toBe(401);
  });

  it("should succesfully login a admin", async () => {
    const response = await request(app)
      .post("/admins/login")
      .send({
        email: admins[0].email,
        password: admins[0].password
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Authentication successful.");
    expect(response.body.token).toBeTruthy();
  });
});

describe("delete", () => {
  it("should respond with 404 on non-existing admin", async () => {
    const email = "random@nonexisting.com";
    const params = {
      email, admin: admins[0].email,
    };
    const token = sign(admins[0].email, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app)
      .delete("/admins")
      .send(params)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should reject deletion for non super admin admins", async () => {
    const email = admins[0].email;
    const params = {
      email, admin: admins[1].email,
    };
    const token = sign(admins[1].email, process.env.JWT_ADMINS_KEY || "");

    const response = await request(app)
      .delete("/admins")
      .send(params)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it("should succesfully delete an admin for super admins", async () => {
    const email = admins[1].email;
    const params = {
      email, admin: admins[0].email,
    };
    const token = sign(admins[0].email, process.env.JWT_ADMINS_KEY || "");

    const response = await request(app)
      .delete("/admins/")
      .send(params)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
