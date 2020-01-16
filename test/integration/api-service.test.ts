import { app } from "../../src/app";
import request from "supertest";
import { createConnectionToDB } from "../../src/utils/db-helper";
import { insertAdmins, ITestAdmin } from "../utils/insertToDb";
import { removeAllFromDB } from "../utils/removeFromDb";
import apiServices from "../data/api-services.json";
import admins from "../data/admins.json";
import { sign } from "jsonwebtoken";
import setupDB from "../utils/setupDb";
import { promisify } from "util";
import { IApiServiceCreateRequest, IApiServiceUpdateRequest } from "../../src/schema/apiService";
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
  await insertAdmins(admins as ITestAdmin[]);
});

describe("api services listing", () => {
  it("should list the correct number of api services", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const response = await request(app).get("/api-services").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(apiServices.length);
  });

  it("should not list api services if you're not admin", async () => {
    const response = await request(app).get("/api-services").set("Authorization", `Bearer random-token`);
    expect(response.status).toBe(401);
  });
});

describe("create", () => {
  it("should create a new api service", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const service: IApiServiceCreateRequest = {
      name: "ddb",
      expires: "2030-04-10",
    };

    const response = await request(app)
      .post("/api-services")
      .send(service)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
  });

  it("should reject double creation", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const service: IApiServiceCreateRequest = {
      name: "notes",
      expires: "2099-04-10",
    };

    const response = await request(app)
      .post("/api-services")
      .send(service)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("API Service already created");
  });
});

describe("update", () => {
  it("should activate a api service", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const service: IApiServiceUpdateRequest = {
      active: true,
    };

    const response = await request(app)
      .patch("/api-services/1")
      .send(service)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.service).toEqual({id: 1, active: true});
  });

  it("should desactivate an api service", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const service: IApiServiceUpdateRequest = {
      active: false,
    };

    const response = await request(app)
      .patch("/api-services/1")
      .send(service)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.service).toEqual({id: 1, active: false});
  });

  it("should respond with 404 if not found", async () => {
    const token = sign({ email: admins[0].email }, process.env.JWT_ADMINS_KEY || "");
    const service: IApiServiceUpdateRequest = {
      active: false,
    };

    const response = await request(app)
      .patch("/api-services/15")
      .send(service)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("should 401 if not logged in", async () => {
    const service: IApiServiceUpdateRequest = {
      active: false,
    };

    const response = await request(app)
      .patch("/api-services/15")
      .send(service)
      .set("Authorization", `Bearer random token`);

    expect(response.status).toBe(401);
  });
});