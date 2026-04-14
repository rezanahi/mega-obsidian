import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    const protectedRoutes = ["/dashboard", "/notes"];

    // اگر وارد route های محافظت‌شده شدیم
    if (protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);

            return NextResponse.next();
        } catch (err) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}
