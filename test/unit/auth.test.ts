import { User } from "../../src/entity/User";
import users from "../data/users.json";
import admins from "../data/admins.json";
import { getTokenPayload, verify, adminAuth } from "../../src/auth/auth";
import { sign } from "jsonwebtoken";
import { Admin } from "../../src/entity/Admin";
require("dotenv").config();


it("should return the correct payload for the authentication token for users", () => {
  const user = new User();
  user.surname = "Surname";
  user.forename = "Forename";
  user.id = 1;
  user.email = "email@email.email";
  const payload = getTokenPayload(user);
  expect(payload).toEqual({
    surname: user.surname,
    forename: user.forename,
    email: user.email,
    id: user.id,
  });
});

it("should return the correct payload for the authentication token for admins", () => {
  const admin = new Admin();
  admin.username = "Username";
  admin.id = 1;
  admin.email = "email@email.email";
  const payload = getTokenPayload(admin);
  expect(payload).toEqual({
    username: admin.username,
    email: admin.email,
    id: admin.id,
  });
});

describe("Token verification", () => {
  it("should appropriately verify the token for users", () => {
    const token = sign("email@email.com", process.env.JWT_USERS_KEY || "");
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toBeTruthy();
  });
  it("should reject a fake token for users", () => {
    const token = "fake-efubvfnvefk";
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toThrow();
  });
  it("should reject a valid ADMIN token for user", () => {
    const token = sign("email@email.com", process.env.JWT_ADMINS_KEY || "");
    const userVerification = () => verify(token, "USER");
    expect(userVerification).toThrow();
  });

  it("should appropriately verify the token for admin", () => {
    const token = sign("email@email.com", process.env.JWT_ADMINS_KEY || "");
    const userVerification = () => verify(token, "ADMIN");
    expect(userVerification).toBeTruthy();
  });
  it("should reject a fake token for users", () => {
    const token = "fake-efubvfnvefk";
    const userVerification = () => verify(token, "ADMINS");
    expect(userVerification).toThrow();
  });
  it("should reject a valid USER token for admin", () => {
    const token = sign("email@email.com", process.env.JWT_USERS_KEY || "");
    const userVerification = () => verify(token, "ADMIN");
    expect(userVerification).toThrow();
  });
});
