import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { buildNodeFromTemplate, containerTypes, defaultNodeStyle, getTemplateByType } from '@/lib/componentCatalog';
function createRootProject(name = 'Untitled Project') {
    const now = new Date().toISOString();
    return {
        id: nanoid(),
        name,
        createdAt: now,
        updatedAt: now,
        rootNodeId: 'root',
        nodesById: {
            root: {
                id: 'root',
                parentId: null,
                type: 'container',
                category: 'layout',
                name: 'Root',
                children: [],
                frame: { x: 0, y: 0, width: 1440, height: 1400 },
                style: {
                    ...defaultNodeStyle,
                    background: 'transparent',
                    borderWidth: 0,
                    padding: { top: 0, right: 0, bottom: 0, left: 0 }
                },
                content: {},
                responsive: {}
            }
        },
        settings: {
            snapToGrid: true,
            gridSize: 8,
            showGuides: true,
            canvasWidth: 1440,
            canvasHeight: 1400
        }
    };
}
function cloneProject(project) {
    return JSON.parse(JSON.stringify(project));
}
function normalizeProject(project) {
    const normalized = cloneProject(project);
    Object.values(normalized.nodesById).forEach((node) => {
        node.style = {
            ...defaultNodeStyle,
            ...node.style,
            padding: { ...defaultNodeStyle.padding, ...node.style?.padding },
            margin: { ...defaultNodeStyle.margin, ...node.style?.margin }
        };
        node.content = node.content ?? {};
        node.children = node.children ?? [];
        node.responsive = node.responsive ?? {};
    });
    if (!normalized.nodesById[normalized.rootNodeId]) {
        normalized.nodesById[normalized.rootNodeId] = {
            id: normalized.rootNodeId,
            parentId: null,
            type: 'container',
            category: 'layout',
            name: 'Root',
            children: [],
            frame: { x: 0, y: 0, width: normalized.settings.canvasWidth, height: normalized.settings.canvasHeight },
            style: { ...defaultNodeStyle, background: 'transparent', borderWidth: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
            content: {},
            responsive: {}
        };
    }
    return normalized;
}
function absolutePosition(project, nodeId) {
    let x = 0;
    let y = 0;
    let cursor = nodeId;
    while (cursor) {
        const node = project.nodesById[cursor];
        if (!node)
            break;
        x += node.frame.x;
        y += node.frame.y;
        cursor = node.parentId;
    }
    return { x, y };
}
function appendChild(project, parentId, childId) {
    const parent = project.nodesById[parentId];
    if (!parent) {
        return;
    }
    if (!parent.children.includes(childId)) {
        parent.children.push(childId);
    }
}
function removeChild(project, parentId, childId) {
    const parent = project.nodesById[parentId];
    if (!parent) {
        return;
    }
    parent.children = parent.children.filter((id) => id !== childId);
}
function collectSubtreeIds(project, rootId) {
    const ids = [];
    const stack = [rootId];
    while (stack.length) {
        const current = stack.pop();
        if (!current)
            continue;
        ids.push(current);
        const node = project.nodesById[current];
        if (!node)
            continue;
        stack.push(...node.children);
    }
    return ids;
}
function cloneSubtree(project, rootId) {
    const originalIds = collectSubtreeIds(project, rootId);
    const idMap = new Map();
    originalIds.forEach((id) => idMap.set(id, nanoid()));
    const nodes = {};
    originalIds.forEach((id) => {
        const source = project.nodesById[id];
        if (!source)
            return;
        const nextId = idMap.get(id);
        nodes[nextId] = {
            ...JSON.parse(JSON.stringify(source)),
            id: nextId,
            parentId: source.parentId ? (idMap.get(source.parentId) ?? source.parentId) : source.parentId,
            children: source.children.map((childId) => idMap.get(childId) ?? childId),
            frame: { ...source.frame, x: source.frame.x + 24, y: source.frame.y + 24 }
        };
    });
    return { nodes, rootNewId: idMap.get(rootId) };
}
function withHistory(get, set, action) {
    const current = get().project;
    const next = cloneProject(current);
    action(next);
    next.updatedAt = new Date().toISOString();
    set((state) => {
        const past = [...state.history.past, current].slice(-50);
        return {
            project: next,
            history: {
                past,
                future: []
            }
        };
    });
}
export const useBuilderStore = create((set, get) => ({
    project: createRootProject('Website Builder'),
    selectedId: null,
    deviceMode: 'desktop',
    zoomLevel: 1,
    previewMode: false,
    alignmentGuides: [],
    history: { past: [], future: [] },
    setDeviceMode: (mode) => set({ deviceMode: mode }),
    setZoomLevel: (zoom) => set({ zoomLevel: Math.min(2, Math.max(0.4, zoom)) }),
    zoomIn: () => set((state) => ({ zoomLevel: Math.min(2, Number((state.zoomLevel + 0.1).toFixed(2))) })),
    zoomOut: () => set((state) => ({ zoomLevel: Math.max(0.4, Number((state.zoomLevel - 0.1).toFixed(2))) })),
    resetZoom: () => set({ zoomLevel: 1 }),
    setPreviewMode: (value) => set({ previewMode: value, selectedId: value ? null : get().selectedId }),
    setSelected: (id) => set({ selectedId: id }),
    addNode: (type, position, parentId = null) => {
        withHistory(get, set, (project) => {
            const fallbackParent = project.rootNodeId;
            const targetParent = parentId && project.nodesById[parentId] ? parentId : fallbackParent;
            const parentNode = project.nodesById[targetParent];
            const actualParent = parentNode && containerTypes.has(parentNode.type) ? targetParent : fallbackParent;
            const node = buildNodeFromTemplate(type, position, actualParent);
            project.nodesById[node.id] = node;
            appendChild(project, actualParent, node.id);
        });
    },
    updateNodeFrame: (id, frame, pushHistory = false) => {
        if (pushHistory) {
            withHistory(get, set, (project) => {
                const node = project.nodesById[id];
                if (!node)
                    return;
                node.frame = { ...node.frame, ...frame };
            });
            return;
        }
        set((state) => {
            const project = cloneProject(state.project);
            const node = project.nodesById[id];
            if (!node)
                return {};
            node.frame = { ...node.frame, ...frame };
            return { project };
        });
    },
    updateNodeName: (id, name) => {
        withHistory(get, set, (project) => {
            const node = project.nodesById[id];
            if (!node)
                return;
            node.name = name;
        });
    },
    updateNodeStyle: (id, style) => {
        withHistory(get, set, (project) => {
            const node = project.nodesById[id];
            if (!node)
                return;
            node.style = {
                ...node.style,
                ...style,
                padding: style.padding ?? node.style.padding,
                margin: style.margin ?? node.style.margin
            };
        });
    },
    updateNodeContent: (id, content) => {
        withHistory(get, set, (project) => {
            const node = project.nodesById[id];
            if (!node)
                return;
            node.content = { ...node.content, ...content };
        });
    },
    setNodeParent: (id, parentId) => {
        withHistory(get, set, (project) => {
            const node = project.nodesById[id];
            if (!node || id === project.rootNodeId)
                return;
            const nextParent = parentId && project.nodesById[parentId] ? parentId : project.rootNodeId;
            if (!containerTypes.has(project.nodesById[nextParent].type))
                return;
            if (nextParent === node.id)
                return;
            let cursor = nextParent;
            while (cursor) {
                if (cursor === id)
                    return;
                cursor = project.nodesById[cursor]?.parentId ?? null;
            }
            const absoluteBefore = absolutePosition(project, id);
            if (node.parentId) {
                removeChild(project, node.parentId, id);
            }
            node.parentId = nextParent;
            appendChild(project, nextParent, id);
            const parentAbs = absolutePosition(project, nextParent);
            node.frame.x = absoluteBefore.x - parentAbs.x;
            node.frame.y = absoluteBefore.y - parentAbs.y;
        });
    },
    removeNode: (id) => {
        withHistory(get, set, (project) => {
            if (id === project.rootNodeId)
                return;
            const node = project.nodesById[id];
            if (!node)
                return;
            if (node.parentId) {
                removeChild(project, node.parentId, id);
            }
            const subtreeIds = collectSubtreeIds(project, id);
            subtreeIds.forEach((nodeId) => {
                delete project.nodesById[nodeId];
            });
        });
        const selected = get().selectedId;
        if (selected === id) {
            set({ selectedId: null });
        }
    },
    duplicateNode: (id) => {
        withHistory(get, set, (project) => {
            const node = project.nodesById[id];
            if (!node)
                return;
            const { nodes, rootNewId } = cloneSubtree(project, id);
            Object.entries(nodes).forEach(([newId, clonedNode]) => {
                project.nodesById[newId] = clonedNode;
            });
            const parentId = node.parentId ?? project.rootNodeId;
            const rootClone = project.nodesById[rootNewId];
            rootClone.parentId = parentId;
            appendChild(project, parentId, rootNewId);
        });
    },
    setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
    clearAlignmentGuides: () => set({ alignmentGuides: [] }),
    updateSettings: (settings) => set((state) => ({
        project: {
            ...state.project,
            settings: {
                ...state.project.settings,
                ...settings
            }
        }
    })),
    setProject: (project) => set({ project: normalizeProject(project), selectedId: null, history: { past: [], future: [] } }),
    newProject: (name) => {
        set({
            project: createRootProject(name ?? 'Untitled Project'),
            selectedId: null,
            history: { past: [], future: [] }
        });
    },
    undo: () => set((state) => {
        if (!state.history.past.length)
            return {};
        const previous = state.history.past[state.history.past.length - 1];
        return {
            project: previous,
            selectedId: null,
            history: {
                past: state.history.past.slice(0, -1),
                future: [state.project, ...state.history.future].slice(0, 50)
            }
        };
    }),
    redo: () => set((state) => {
        if (!state.history.future.length)
            return {};
        const [next, ...rest] = state.history.future;
        return {
            project: next,
            selectedId: null,
            history: {
                past: [...state.history.past, state.project].slice(-50),
                future: rest
            }
        };
    })
}));
export function viewportSizeForMode(mode) {
    if (mode === 'mobile')
        return 375;
    if (mode === 'tablet')
        return 768;
    return 1440;
}
export function suggestInitialFrame(type) {
    const template = getTemplateByType(type);
    return {
        x: 24,
        y: 24,
        width: template.defaultSize.width,
        height: template.defaultSize.height
    };
}
