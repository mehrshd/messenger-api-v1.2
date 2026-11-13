import { SessionKeyHash } from "./sessionKeyHash.ts";

type SessionUser = {
    id: number;
    sessionType: string;
};

type SessionLookup = (sessionKeyHash: string) => Promise<SessionUser | null>;

type SessionCookieCandidate = {
    userId: number;
    sessionKey: string;
};

type ResolveSessionResult =
    | { ok: true; user: SessionUser }
    | { ok: false; status: 401; message: string };

const SESSION_COOKIE_PATTERN = /^session_(\d+)$/;

const parseSessionCookies = (
    cookies: Record<string, unknown> | undefined
): SessionCookieCandidate[] => {
    const candidates: SessionCookieCandidate[] = [];

    for (const [key, value] of Object.entries(cookies ?? {})) {
        const match = SESSION_COOKIE_PATTERN.exec(key);

        if (!match) {
            continue;
        }

        if (typeof value !== "string" || value.length === 0) {
            continue;
        }

        candidates.push({
            userId: Number(match[1]),
            sessionKey: value
        });
    }

    return candidates;
};

const resolveSessionFromCookies = async (
    cookies: Record<string, unknown> | undefined,
    lookup: SessionLookup
): Promise<ResolveSessionResult> => {
    const candidates = parseSessionCookies(cookies);

    if (candidates.length === 0) {
        return {
            ok: false,
            status: 401,
            message: "Unauthorized: Session cookie not found"
        };
    }

    const validSessions: SessionUser[] = [];

    for (const candidate of candidates) {
        const session = await lookup(SessionKeyHash(candidate.sessionKey));

        if (!session) {
            continue;
        }

        if (session.id !== candidate.userId) {
            continue;
        }

        validSessions.push(session);
    }

    if (validSessions.length === 0) {
        return {
            ok: false,
            status: 401,
            message: "Invalid or expired session"
        };
    }

    const uniqueUserIds = new Set(validSessions.map((session) => session.id));

    if (uniqueUserIds.size > 1) {
        return {
            ok: false,
            status: 401,
            message: "Multiple active sessions found"
        };
    }

    return {
        ok: true,
        user: validSessions[0]
    };
};

export {
    parseSessionCookies,
    resolveSessionFromCookies
};

export type {
    SessionUser,
    SessionLookup,
    ResolveSessionResult
};
