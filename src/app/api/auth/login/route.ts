import { NextResponse } from "next/server";
import { lucia } from "~/server/config/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schemas";
import { verifyPassword } from "~/server/utils/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.hashed_password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    let session;
    let sessionCookie;
    try {
        session = await lucia.createSession(user.id, {});
        sessionCookie = lucia.createSessionCookie(session.id);
    } catch (createSessionError) {
        return NextResponse.json(
            { error: "Failed to create user session." },
            { status: 500 }
        );
    }

    const res = NextResponse.json({ message: "Login successful" });
    res.headers.set("Set-Cookie", sessionCookie.serialize());
    return res;
}
