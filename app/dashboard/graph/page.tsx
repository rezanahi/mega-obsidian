"use client";
import { useEffect, useState } from "react";
import {useGetAllGraph} from "@/apis";

export default function GraphPage() {
    // const [graphData, setGraphData] = useState<any>(null);
    const {data: graphData, isLoading: graphIsLoading} = useGetAllGraph()


    if (graphIsLoading) return <div className="p-4">درحال لود گراف...</div>;
    if (!graphData) return <div className="p-4">گرافی یافت نشد.</div>;

    return (
        <div className="w-full h-full flex items-center justify-center">
            {/* اینجا بعداً ForceGraph2D اضافه می‌شود */}
            <div className="text-gray-300">
                گراف لود شد — حالا وقت اضافه کردن ForceGraph2D است
            </div>
        </div>
    );
}
