"use client"

import { Form, Input, Button, message, Card } from "antd";
import axios from "axios";
import Link from "next/link";
import {useState} from "react";
import {redirect} from "next/navigation";
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [loading, setLoading] = useState<boolean>()
    const router = useRouter();
    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            const res = await axios.post("/api/auth/register", values)
            message.success("ثبت نام با موفقیت انجام شد")
            router.push('/login');
        } catch (err: any) {
            message.error(err.response?.data?.error || "خطا در ثبت نام")
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-center">ثبت‌نام</h2>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="نام کاربری" name="userName" rules={[{ required: true }]}>
                        <Input placeholder="نام کاربری" />
                    </Form.Item>

                    <Form.Item label="رمز عبور" name="password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password placeholder="رمز عبور" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        ثبت‌نام
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-blue-600">
                            قبلاً ثبت‌نام کردی؟ ورود
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    )
}