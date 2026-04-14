import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            console.log("Herrrrrrrre")
            return NextResponse.json({ user: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        return NextResponse.json({ user: decoded });
    } catch (err) {
        console.log("api - me err = ", err)
        return NextResponse.json({ user: null });
    }
}
