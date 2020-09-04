const { getUser, getUserByEmail, urlsForUser } = require("../db");
const assert = require("chai").assert;

describe("getUser", () => {
  it("should return the user in the current session", () => {
    const fakeRequest = { session: { userId: "userRandomID" } };
    const user = getUser(fakeRequest);
    assert.strictEqual(user.id, "userRandomID");
  });
  it("should return undefined if there is no user", () => {
    const fakeRequest = { session: {} };
    const user = getUser(fakeRequest);
    assert.strictEqual(user, undefined);
  });
});

describe("getUserByEmail", () => {
  it("should return the user if the email exists", () => {
    const user = getUserByEmail("user@example.com");
    assert.strictEqual(user.id, "userRandomID");
  });
  it("should return undefined if the email doesn't exist", () => {
    const user = getUserByEmail("1@1.ca");
    assert.strictEqual(user, undefined);
  });
});

describe("urlsForUser", () => {
  it("should return array of URLs for the logged in user", () => {
    const urlArr = urlsForUser("userRandomID");
    assert.deepEqual(urlArr, ["b2xVn2"]);
  });
});