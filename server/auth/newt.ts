export * from "./verifySession";
export * from "./unauthorizedResponse";

import {
    encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { Newt, newts, newtSessions, NewtSession } from "@server/db/schema";
import db from "@server/db";
import { eq } from "drizzle-orm";
import config from "@server/config";
import { extractBaseDomain } from "@server/utils/extractBaseDomain";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_EXPIRES = 1000 * 60 * 60 * 24 * 30;
export const SECURE_COOKIES = config.server.secure_cookies;
export const COOKIE_DOMAIN = "." + extractBaseDomain(config.app.base_url);

export async function createNewtSession(
    token: string,
    newtId: string,
): Promise<NewtSession> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    const session: NewtSession = {
        sessionId: sessionId,
        newtId,
        expiresAt: new Date(Date.now() + SESSION_COOKIE_EXPIRES).getTime(),
    };
    await db.insert(newtSessions).values(session);
    return session;
}

export async function validateNewtSessionToken(
    token: string,
): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
    );
    const result = await db
        .select({ newt: newts, session: newtSessions })
        .from(newtSessions)
        .innerJoin(newts, eq(newtSessions.newtId, newts.newtId))
        .where(eq(newtSessions.sessionId, sessionId));
    if (result.length < 1) {
        return { session: null, newt: null };
    }
    const { newt, session } = result[0];
    if (Date.now() >= session.expiresAt) {
        await db
            .delete(newtSessions)
            .where(eq(newtSessions.sessionId, session.sessionId));
        return { session: null, newt: null };
    }
    if (Date.now() >= session.expiresAt - (SESSION_COOKIE_EXPIRES / 2)) {
        session.expiresAt = new Date(
            Date.now() + SESSION_COOKIE_EXPIRES,
        ).getTime();
        await db
            .update(newtSessions)
            .set({
                expiresAt: session.expiresAt,
            })
            .where(eq(newtSessions.sessionId, session.sessionId));
    }
    return { session, newt };
}

export async function invalidateNewtSession(sessionId: string): Promise<void> {
    await db.delete(newtSessions).where(eq(newtSessions.sessionId, sessionId));
}

export async function invalidateAllNewtSessions(newtId: string): Promise<void> {
    await db.delete(newtSessions).where(eq(newtSessions.newtId, newtId));
}

export type SessionValidationResult =
    | { session: NewtSession; newt: Newt }
    | { session: null; newt: null };
