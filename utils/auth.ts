import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getUserFromToken() {
    const cookieStorage = await cookies()
    const token = cookieStorage.get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
        id: Number(payload.userId),
        userName: payload.userName as string,
    };
}
