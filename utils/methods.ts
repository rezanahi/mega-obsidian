export const extractWikiLinks = (content: string) => {
    const regex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        links.push(match[1].trim());
    }

    return links;
};
