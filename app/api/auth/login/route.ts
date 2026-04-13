import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { prisma } from '../../../../lib/prisma'

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
        return NextResponse.json({
            message: "ورود موفقیت آمیز",
            userId: user.id
        })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
    }
}