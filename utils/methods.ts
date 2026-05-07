export const extractWikiLinks = (content: string) => {
    const regex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        links.push(match[1].trim());
    }

    return links;
};

export function formatTime(seconds: number) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0")
    const s = String(seconds % 60).padStart(2, "0")
    return `${m}:${s}`
}



