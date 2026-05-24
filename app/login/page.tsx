"use client"

import { Form, Input, Button, message, Card } from "antd";
import axios from "axios";
import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await axios.post("/api/auth/login", values);
            message.success("ورود موفقیت‌آمیز");
            router.push('/dashboard');
        } catch (err: any) {
            message.error(err.response?.data?.error || "خطا در ورود");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-center">ورود</h2>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="نام کاربری" name="userName" rules={[{ required: true }]}>
                        <Input placeholder="نام کاربری" />
                    </Form.Item>

                    <Form.Item label="رمز عبور" name="password" rules={[{ required: true }]}>
                        <Input.Password placeholder="رمز عبور" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        ورود
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/register" className="!text-blue-600">
                            حساب نداری؟ ثبت‌نام
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}