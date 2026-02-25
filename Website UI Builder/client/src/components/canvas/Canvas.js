import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { applySnapAndGuides, buildAbsoluteFrames, findBestContainerAtPoint } from '@/lib/alignment';
import { useBuilderStore, viewportSizeForMode } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';
import { NodeView } from './NodeView';
export function Canvas() {
    const { project, selectedId, previewMode, deviceMode, zoomLevel, alignmentGuides, setSelected, addNode, updateNodeFrame, setNodeParent, setAlignmentGuides, clearAlignmentGuides } = useBuilderStore(useShallow((state) => ({
        project: state.project,
        selectedId: state.selectedId,
        previewMode: state.previewMode,
        deviceMode: state.deviceMode,
        zoomLevel: state.zoomLevel,
        alignmentGuides: state.alignmentGuides,
        setSelected: state.setSelected,
        addNode: state.addNode,
        updateNodeFrame: state.updateNodeFrame,
        setNodeParent: state.setNodeParent,
        setAlignmentGuides: state.setAlignmentGuides,
        clearAlignmentGuides: state.clearAlignmentGuides
    })));
    const containerRef = useRef(null);
    const interactionRef = useRef(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [interactionCursor, setInteractionCursor] = useState('default');
    const [isResizing, setIsResizing] = useState(false);
    const visibleNodes = useMemo(() => Object.values(project.nodesById).filter((node) => node.id !== project.rootNodeId), [project.nodesById, project.rootNodeId]);
    const absoluteFrames = useMemo(() => buildAbsoluteFrames(project), [project]);
    const viewportWidth = viewportSizeForMode(deviceMode);
    const visualGridSize = project.settings.gridSize * 4;
    const getCanvasPoint = (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect)
            return { x: 0, y: 0 };
        return {
            x: (event.clientX - rect.left) / zoomLevel,
            y: (event.clientY - rect.top) / zoomLevel
        };
    };
    const parentAbsolute = (nodeId) => {
        const parentId = project.nodesById[nodeId]?.parentId;
        if (!parentId)
            return { x: 0, y: 0 };
        const frame = absoluteFrames[parentId];
        if (!frame)
            return { x: 0, y: 0 };
        return { x: frame.x, y: frame.y };
    };
    const onPointerMove = (event) => {
        const active = interactionRef.current;
        if (!active)
            return;
        const deltaX = (event.clientX - active.startX) / zoomLevel;
        const deltaY = (event.clientY - active.startY) / zoomLevel;
        if (active.kind === 'move') {
            const distance = Math.hypot(deltaX, deltaY);
            const dragThreshold = 4;
            if (!active.moved && distance < dragThreshold) {
                return;
            }
            active.moved = true;
            const startAbsolute = active.startFrame;
            const nextAbsolute = {
                ...startAbsolute,
                x: startAbsolute.x + deltaX,
                y: startAbsolute.y + deltaY
            };
            const snapped = applySnapAndGuides(project, active.nodeId, nextAbsolute, absoluteFrames);
            const parentAbs = parentAbsolute(active.nodeId);
            updateNodeFrame(active.nodeId, { x: snapped.x - parentAbs.x, y: snapped.y - parentAbs.y });
            setAlignmentGuides(snapped.guides);
            const dropContainer = findBestContainerAtPoint(project, { x: snapped.x + nextAbsolute.width / 2, y: snapped.y + Math.min(nextAbsolute.height / 2, 40) }, absoluteFrames, active.nodeId);
            setDropTargetId(dropContainer !== project.rootNodeId ? dropContainer : null);
        }
        if (active.kind === 'resize') {
            const frame = { ...active.startFrame };
            const minSize = 24;
            if (active.direction.includes('e')) {
                frame.width = Math.max(minSize, active.startFrame.width + deltaX);
            }
            if (active.direction.includes('s')) {
                frame.height = Math.max(minSize, active.startFrame.height + deltaY);
            }
            if (active.direction.includes('w')) {
                frame.width = Math.max(minSize, active.startFrame.width - deltaX);
                frame.x = active.startFrame.x + deltaX;
            }
            if (active.direction.includes('n')) {
                frame.height = Math.max(minSize, active.startFrame.height - deltaY);
                frame.y = active.startFrame.y + deltaY;
            }
            if (project.settings.snapToGrid) {
                const g = project.settings.gridSize;
                frame.width = Math.round(frame.width / g) * g;
                frame.height = Math.round(frame.height / g) * g;
                frame.x = Math.round(frame.x / g) * g;
                frame.y = Math.round(frame.y / g) * g;
            }
            const parentAbs = parentAbsolute(active.nodeId);
            updateNodeFrame(active.nodeId, {
                x: frame.x - parentAbs.x,
                y: frame.y - parentAbs.y,
                width: frame.width,
                height: frame.height
            });
        }
    };
    const onPointerUp = () => {
        const active = interactionRef.current;
        if (!active)
            return;
        if (active.kind === 'move') {
            if (active.moved) {
                const node = project.nodesById[active.nodeId];
                if (node) {
                    updateNodeFrame(active.nodeId, node.frame, true);
                }
                if (dropTargetId) {
                    setNodeParent(active.nodeId, dropTargetId);
                }
            }
        }
        else {
            const node = project.nodesById[active.nodeId];
            if (node) {
                updateNodeFrame(active.nodeId, node.frame, true);
            }
        }
        interactionRef.current = null;
        clearAlignmentGuides();
        setDropTargetId(null);
        setInteractionCursor('default');
        setIsResizing(false);
    };
    useEffect(() => {
        document.body.style.cursor = interactionCursor;
        return () => {
            document.body.style.cursor = 'default';
        };
    }, [interactionCursor]);
    const onDrop = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/x-builder-component');
        if (!type)
            return;
        const absolutePoint = getCanvasPoint(event);
        const parentId = findBestContainerAtPoint(project, absolutePoint, absoluteFrames);
        const parentAbs = absoluteFrames[parentId] ?? { x: 0, y: 0, width: 0, height: 0 };
        addNode(type, {
            x: absolutePoint.x - parentAbs.x,
            y: absolutePoint.y - parentAbs.y
        }, parentId);
    };
    return (_jsxs("main", { className: "flex h-full flex-1 flex-col bg-surface", children: [_jsx("div", { className: "border-b border-border bg-[#101722] px-4 py-2 text-xs text-textMuted", children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded border border-blue-500/40 bg-blue-500/15 text-[9px] font-bold text-blue-300", children: "CV" }), "Canvas mode: ", previewMode ? 'Preview' : 'Edit', " | Viewport: ", deviceMode, " (", viewportWidth, "px) | Zoom:", ' ', Math.round(zoomLevel * 100), "%"] }) }), _jsx("div", { className: "builder-scroll flex-1 overflow-auto p-4", children: _jsx("div", { ref: containerRef, className: "relative mx-auto border border-border bg-[#11151c]", style: {
                        width: viewportWidth * zoomLevel,
                        minHeight: project.settings.canvasHeight * zoomLevel,
                        cursor: interactionCursor
                    }, onDragOver: (event) => event.preventDefault(), onDrop: onDrop, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp, onPointerLeave: onPointerUp, onClick: () => {
                        if (!previewMode) {
                            setSelected(null);
                        }
                    }, children: _jsxs("div", { className: "builder-grid absolute left-0 top-0 origin-top-left bg-[#11151c]", style: {
                            width: viewportWidth,
                            minHeight: project.settings.canvasHeight,
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'top left',
                            backgroundSize: `${visualGridSize}px ${visualGridSize}px`
                        }, children: [visibleNodes.map((node) => (_jsx(NodeView, { node: node, absoluteFrame: absoluteFrames[node.id] ?? node.frame, selected: selectedId === node.id, previewMode: previewMode, hideLabel: isResizing, onSelect: (event, nodeId) => {
                                    event.stopPropagation();
                                    if (!previewMode) {
                                        setSelected(nodeId);
                                    }
                                }, onPointerDownMove: (event, nodeId) => {
                                    event.stopPropagation();
                                    if (previewMode)
                                        return;
                                    const absolute = absoluteFrames[nodeId];
                                    if (!absolute)
                                        return;
                                    interactionRef.current = {
                                        kind: 'move',
                                        nodeId,
                                        startX: event.clientX,
                                        startY: event.clientY,
                                        startFrame: { ...absolute },
                                        moved: false
                                    };
                                    setInteractionCursor('grabbing');
                                    setIsResizing(false);
                                }, onPointerDownResize: (event, nodeId, direction) => {
                                    event.stopPropagation();
                                    if (previewMode)
                                        return;
                                    const absolute = absoluteFrames[nodeId];
                                    if (!absolute)
                                        return;
                                    interactionRef.current = {
                                        kind: 'resize',
                                        nodeId,
                                        direction,
                                        startX: event.clientX,
                                        startY: event.clientY,
                                        startFrame: { ...absolute }
                                    };
                                    setIsResizing(true);
                                    if (direction === 'n' || direction === 's') {
                                        setInteractionCursor('ns-resize');
                                    }
                                    else if (direction === 'e' || direction === 'w') {
                                        setInteractionCursor('ew-resize');
                                    }
                                    else if (direction === 'nw' || direction === 'se') {
                                        setInteractionCursor('nwse-resize');
                                    }
                                    else {
                                        setInteractionCursor('nesw-resize');
                                    }
                                } }, node.id))), alignmentGuides.map((guide, index) => (_jsx("span", { className: "pointer-events-none absolute z-[80] bg-accent/90", style: guide.orientation === 'vertical'
                                    ? {
                                        left: guide.position,
                                        top: guide.from,
                                        width: 1,
                                        height: guide.to - guide.from
                                    }
                                    : {
                                        top: guide.position,
                                        left: guide.from,
                                        height: 1,
                                        width: guide.to - guide.from
                                    } }, `${guide.orientation}-${guide.position}-${index}`))), dropTargetId && absoluteFrames[dropTargetId] ? (_jsx("div", { className: "pointer-events-none absolute border border-dashed border-accent", style: {
                                    left: absoluteFrames[dropTargetId].x,
                                    top: absoluteFrames[dropTargetId].y,
                                    width: absoluteFrames[dropTargetId].width,
                                    height: absoluteFrames[dropTargetId].height
                                } })) : null] }) }) })] }));
}
