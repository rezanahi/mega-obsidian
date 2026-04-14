import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import prisma from '../../../../lib/prisma'
import jwt, { SignOptions } from "jsonwebtoken";
import {StringValue} from "ms";


export async function POST(req: Request) {
    try {
        const {userName, password} = await req.json()
        const user = await prisma.user.findUnique({ where: {userName} })
        if (!user) {
            return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return NextResponse.json({ error: "رمز عبور اشتباه است" }, {status: 400})
        }

        const secret = process.env.JWT_SECRET as jwt.Secret;
        const options: SignOptions = {
            expiresIn: process.env.JWT_EXPIRES_IN as StringValue || "7d" as StringValue ,
        };
        const token = jwt.sign(
            { userId: user.id, userName: user.userName },
            secret,
            options
        );

        // ساختن پاسخ همراه با کوکی HttpOnly
        const response = NextResponse.json({
            message: "ورود موفقیت آمیز",
            userId: user.id,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 روز
        });

        return response;

    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
    }
}