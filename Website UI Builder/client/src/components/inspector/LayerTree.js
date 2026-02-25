import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useBuilderStore } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';
function LayerItem({ nodeId, depth }) {
    const { project, selectedId, setSelected } = useBuilderStore(useShallow((state) => ({
        project: state.project,
        selectedId: state.selectedId,
        setSelected: state.setSelected
    })));
    const node = project.nodesById[nodeId];
    if (!node)
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: () => setSelected(node.id), className: `flex w-full items-center rounded px-2 py-1 text-left text-xs ${selectedId === node.id ? 'border border-indigo-500/40 bg-indigo-600/20 text-indigo-100' : 'text-textMuted hover:bg-panelSoft'}`, style: { paddingLeft: 8 + depth * 12 }, children: [_jsx("span", { className: "mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-500" }), _jsx("span", { className: "truncate", children: node.name })] }), node.children.map((childId) => (_jsx(LayerItem, { nodeId: childId, depth: depth + 1 }, childId)))] }));
}
export function LayerTree() {
    const rootChildren = useBuilderStore((state) => state.project.nodesById[state.project.rootNodeId].children);
    return (_jsxs("section", { className: "rounded border border-border p-3", children: [_jsx("h3", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-indigo-400" }), "Layer Tree"] }) }), _jsx("div", { className: "max-h-52 overflow-y-auto", children: rootChildren.length ? (rootChildren.map((nodeId) => _jsx(LayerItem, { nodeId: nodeId, depth: 0 }, nodeId))) : (_jsx("p", { className: "text-xs text-textMuted", children: "Belum ada layer." })) })] }));
}
