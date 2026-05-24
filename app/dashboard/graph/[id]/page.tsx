"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import {useGetAllGraph, useGetGraphById} from "@/apis";
import {useParams, useRouter} from "next/navigation";
import {Spin} from "antd";
import {
    AudioOutlined,
    EditOutlined,
    LoadingOutlined,
    MoreOutlined,
    NodeIndexOutlined,
    ReadOutlined
} from "@ant-design/icons";
import {formatTime} from "@/utils/methods";
import {RecordCircleIcon} from "@/components/icons";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkWikiLink from "remark-wiki-link";

function NoteLinkCount (nodeId: any, links: any) {
    const sourceIdCount = links.filter((link: any) => link.sourceId === nodeId).length
    const targetIdCount = links.filter((link: any) => link.targetId === nodeId).length
    return sourceIdCount + targetIdCount
}

export default function GraphPage() {
    const { id } = useParams();
    const container = useRef<HTMLDivElement>(null);
    const networkRef = useRef<any>(null);
    // const {data: graphData, isSuccess: graphDataIsSuccess} = useGetAllGraph()
    const {data: graphData, isSuccess: graphDataIsSuccess } = useGetGraphById({id: id as string})
    const router = useRouter()


    useEffect(() => {
        if (!graphDataIsSuccess || !container.current) return;

        const nodes = graphData.nodes.map((n:any) => ({ id: n.id, label: n.title, size: 8 + NoteLinkCount(n.id, graphData.links) }));
        const edges = graphData.links.map((l:any) => ({ from: l.sourceId, to: l.targetId }));

        // اگر اولین بار است → شبکه را بساز
        if (!networkRef.current) {
            const data = { nodes, edges };

            const options = {
                interaction: { hover: true },
                nodes: {
                    shape: "dot",
                    size: 16,
                    color: { background: "#4e73df", border: "#1b3baf" },
                    font: { color: "#fff" },
                },
                edges: {
                    color: "#999",
                    arrows: { to: { enabled: true, scaleFactor: 0.6 } },
                },
                physics: {
                    enabled: true,
                    stabilization: { iterations: 200 },
                },
            };

            networkRef.current = new Network(container.current, data, options);

            networkRef.current.on("hoverNode", () => {
                container.current!.style.cursor = "pointer";
            });

            networkRef.current.on("blurNode", () => {
                container.current!.style.cursor = "default";
            });

            networkRef.current.on("click", (params: any) => {
                if (params.nodes.length > 0) {
                    router.push(`/dashboard/note/${params.nodes[0]}`);
                }
            });
        } else {
            // آپدیت نود و لینک‌ها بدون ساختن دوباره شبکه
            const network = networkRef.current;

            network.body.data.nodes.clear();
            network.body.data.nodes.update(nodes);

            network.body.data.edges.clear();
            network.body.data.edges.update(edges);
        }
    }, [graphDataIsSuccess, graphData]);

    return (
        <div className="flex flex-col justify-start gap-3 h-full overflow-y-auto relative">
            {/*<div className={`h-24 z-50! absolute top-0 left-0 right-0 bg-transparent flex justify-start items-center shrink-0 flex gap-1 justify-end items-center px-6`}>*/}
            {/*    <h3 className={'font-bold text-lg'}>Graph View</h3>*/}
            {/*</div>*/}
            <div className="flex-1 px-6 pb-6 grow">
                <div
                    ref={container}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        </div>
    );
}
