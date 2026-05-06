'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import ModalRoot from "@/app/components/modals/ModalRoot";
import ReduxProvider from "@/app/store/ReduxProvider";
import {ConfigProvider, theme} from "antd";

export function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    }));

    return (
        <ReduxProvider>
            <QueryClientProvider client={client}>
                <ConfigProvider
                    theme={{
                        algorithm: theme.darkAlgorithm,   // ← دارک مود فعال
                        token: {
                            // colorBgBase: "#000",         // ← اگر می‌خواهی بک‌گراند کامل مشکی شود
                            // colorText: "#fff",
                        },
                    }}
                >
                    {children}
                </ConfigProvider>

                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ReduxProvider>
    );
}
