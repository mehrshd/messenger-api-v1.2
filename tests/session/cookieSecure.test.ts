import { afterEach, describe, expect, it } from "vitest";
import { cookieSecureFlag } from "../../src/utils/cookieOptions.ts";

describe("cookieSecureFlag", () => {
    const original = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = original;
    });

    it("is true in production", () => {
        process.env.NODE_ENV = "production";
        expect(cookieSecureFlag()).toBe(true);
    });

    it("is false in development", () => {
        process.env.NODE_ENV = "development";
        expect(cookieSecureFlag()).toBe(false);
    });

    it("is false when NODE_ENV is unset", () => {
        delete process.env.NODE_ENV;
        expect(cookieSecureFlag()).toBe(false);
    });
});
