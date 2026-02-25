function edgePoints(frame) {
    return {
        left: frame.x,
        centerX: frame.x + frame.width / 2,
        right: frame.x + frame.width,
        top: frame.y,
        centerY: frame.y + frame.height / 2,
        bottom: frame.y + frame.height
    };
}
export function applySnapAndGuides(project, nodeId, frame, absoluteFrames) {
    const threshold = 6;
    const guides = [];
    let snappedX = frame.x;
    let snappedY = frame.y;
    if (project.settings.snapToGrid) {
        const grid = project.settings.gridSize;
        snappedX = Math.round(snappedX / grid) * grid;
        snappedY = Math.round(snappedY / grid) * grid;
    }
    if (!project.settings.showGuides) {
        return { x: snappedX, y: snappedY, guides };
    }
    const moving = edgePoints({ ...frame, x: snappedX, y: snappedY });
    Object.values(project.nodesById).forEach((node) => {
        if (node.id === nodeId || node.id === project.rootNodeId)
            return;
        const abs = absoluteFrames[node.id];
        if (!abs)
            return;
        const target = edgePoints(abs);
        const xMatches = [
            { a: moving.left, b: target.left },
            { a: moving.centerX, b: target.centerX },
            { a: moving.right, b: target.right }
        ];
        for (const match of xMatches) {
            const distance = Math.abs(match.a - match.b);
            if (distance <= threshold) {
                snappedX += match.b - match.a;
                guides.push({
                    orientation: 'vertical',
                    position: match.b,
                    from: Math.min(frame.y, abs.y),
                    to: Math.max(frame.y + frame.height, abs.y + abs.height)
                });
                break;
            }
        }
        const yMatches = [
            { a: moving.top, b: target.top },
            { a: moving.centerY, b: target.centerY },
            { a: moving.bottom, b: target.bottom }
        ];
        for (const match of yMatches) {
            const distance = Math.abs(match.a - match.b);
            if (distance <= threshold) {
                snappedY += match.b - match.a;
                guides.push({
                    orientation: 'horizontal',
                    position: match.b,
                    from: Math.min(frame.x, abs.x),
                    to: Math.max(frame.x + frame.width, abs.x + abs.width)
                });
                break;
            }
        }
    });
    return {
        x: snappedX,
        y: snappedY,
        guides
    };
}
export function findBestContainerAtPoint(project, point, absoluteFrames, movingNodeId) {
    const candidates = Object.values(project.nodesById)
        .filter((node) => node.id !== project.rootNodeId && node.id !== movingNodeId)
        .filter((node) => ['container', 'section', 'grid', 'card', 'hero', 'sidebar', 'modal'].includes(node.type))
        .filter((node) => {
        const frame = absoluteFrames[node.id];
        if (!frame)
            return false;
        return (point.x >= frame.x &&
            point.x <= frame.x + frame.width &&
            point.y >= frame.y &&
            point.y <= frame.y + frame.height);
    })
        .sort((a, b) => (absoluteFrames[a.id]?.width ?? 0) * (absoluteFrames[a.id]?.height ?? 0) -
        (absoluteFrames[b.id]?.width ?? 0) * (absoluteFrames[b.id]?.height ?? 0));
    return candidates[0]?.id ?? project.rootNodeId;
}
export function buildAbsoluteFrames(project) {
    const frames = {};
    const walk = (nodeId, parentOffset) => {
        const node = project.nodesById[nodeId];
        if (!node)
            return;
        const absolute = {
            x: parentOffset.x + node.frame.x,
            y: parentOffset.y + node.frame.y,
            width: node.frame.width,
            height: node.frame.height
        };
        frames[nodeId] = absolute;
        node.children.forEach((childId) => walk(childId, { x: absolute.x, y: absolute.y }));
    };
    walk(project.rootNodeId, { x: 0, y: 0 });
    return frames;
}
