import { describe, expect, it } from "vitest";
import {
    parseSessionCookies,
    resolveSessionFromCookies
} from "../../src/utils/sessionCookies.ts";
import { SessionKeyHash } from "../../src/utils/sessionKeyHash.ts";

describe("parseSessionCookies", () => {
    it("keeps only session_{numericUserId} cookies", () => {
        const parsed = parseSessionCookies({
            session_12: "token-a",
            session_id: "ignored",
            verification_session: "ignored",
            session_3: "token-b"
        });

        expect(parsed).toEqual([
            { userId: 12, sessionKey: "token-a" },
            { userId: 3, sessionKey: "token-b" }
        ]);
    });
});

describe("resolveSessionFromCookies", () => {
    it("rejects requests with no session cookie", async () => {
        const result = await resolveSessionFromCookies({}, async () => null);

        expect(result).toEqual({
            ok: false,
            status: 401,
            message: "Unauthorized: Session cookie not found"
        });
    });

    it("ignores a valid token bound to a different cookie user id", async () => {
        const token = "abc";
        const hash = SessionKeyHash(token);

        const result = await resolveSessionFromCookies(
            { session_1: token },
            async (sessionHash) => {
                if (sessionHash !== hash) {
                    return null;
                }

                return { id: 2, sessionType: "permanent" };
            }
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.message).toBe("Invalid or expired session");
        }
    });

    it("authenticates the matching valid cookie when another cookie is invalid", async () => {
        const token = "good";
        const hash = SessionKeyHash(token);

        const result = await resolveSessionFromCookies(
            {
                session_5: token,
                session_9: "expired-token"
            },
            async (sessionHash) => {
                if (sessionHash !== hash) {
                    return null;
                }

                return { id: 5, sessionType: "permanent" };
            }
        );

        expect(result).toEqual({
            ok: true,
            user: { id: 5, sessionType: "permanent" }
        });
    });

    it("rejects multiple valid sessions for different users", async () => {
        const result = await resolveSessionFromCookies(
            {
                session_1: "a",
                session_2: "b"
            },
            async (sessionHash) => {
                if (sessionHash === SessionKeyHash("a")) {
                    return { id: 1, sessionType: "permanent" };
                }

                if (sessionHash === SessionKeyHash("b")) {
                    return { id: 2, sessionType: "permanent" };
                }

                return null;
            }
        );

        expect(result).toEqual({
            ok: false,
            status: 401,
            message: "Multiple active sessions found"
        });
    });
});
