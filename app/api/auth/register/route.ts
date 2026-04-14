import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import prisma from '../../../../lib/prisma'
import { redirect } from "next/navigation";


export async function POST (req: Request) {
    try {
        const { userName, password } = await req.json()
        if (!userName || !password) {
            return NextResponse.json({ error: "طلاعات ناقص است" }, { status: 400 })
        }
        const exist = await prisma.user.findUnique({ where: {userName} })
        if (exist) {
            return NextResponse.json({ error: "این ایمیل قبلا ثبت شده است" }, { status: 400 })
        }
        const hashed = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: { userName: userName, password: hashed}
        })
        return NextResponse.json( { message: 'ثبت نام موفقیت آمیز بود' })
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
    }
}