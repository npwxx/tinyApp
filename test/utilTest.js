const { generateRandomString } = require("../util");
const assert = require("chai").assert;

describe("generateRandomString", () => {
  it("should generate a new string with each use", () => {
    assert.strictEqual(generateRandomString() === generateRandomString(), false);
  });
});