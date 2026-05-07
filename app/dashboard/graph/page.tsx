"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import {useGetAllGraph} from "@/apis";
import {useRouter} from "next/navigation";

function NoteLinkCount (nodeId: any, links: any) {
    const sourceIdCount = links.filter((link: any) => link.sourceId === nodeId).length
    const targetIdCount = links.filter((link: any) => link.targetId === nodeId).length
    return sourceIdCount + targetIdCount
}

export default function GraphPage() {
    const container = useRef<HTMLDivElement>(null);
    const networkRef = useRef<any>(null);
    const {data: graphData, isSuccess: graphDataIsSuccess} = useGetAllGraph()
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
        <div className="flex-1 px-6 pb-6 grow">
            <div
                ref={container}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </div>
    );
}
