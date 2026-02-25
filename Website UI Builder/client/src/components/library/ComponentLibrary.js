import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { componentTemplates, categoryLabels } from '@/lib/componentCatalog';
import { useBuilderStore } from '@/store/builderStore';
const orderedCategories = [
    'layout',
    'navigation',
    'content',
    'form',
    'media',
    'interactive',
    'utility'
];
export function ComponentLibrary() {
    const addNode = useBuilderStore((state) => state.addNode);
    const handleDragStart = (event, type) => {
        event.dataTransfer.setData('application/x-builder-component', type);
        event.dataTransfer.effectAllowed = 'copy';
    };
    return (_jsxs("aside", { className: "flex h-full w-full flex-col border-r border-border bg-panel", children: [_jsxs("div", { className: "border-b border-border px-4 py-3", children: [_jsxs("div", { className: "mb-1 flex items-center gap-2", children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded border border-cyan-500/40 bg-cyan-500/15 text-[10px] font-bold text-cyan-300", children: "LB" }), _jsx("h2", { className: "text-sm font-semibold", children: "Component Library" })] }), _jsx("p", { className: "text-xs text-textMuted", children: "Drag item ke canvas untuk mulai menyusun layout." })] }), _jsx("div", { className: "builder-scroll flex-1 overflow-y-auto px-3 py-3", children: orderedCategories.map((category) => {
                    const items = componentTemplates.filter((item) => item.category === category);
                    return (_jsxs("section", { className: "mb-4", children: [_jsx("h3", { className: "mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-textMuted", children: _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-sky-400" }), categoryLabels[category]] }) }), _jsx("div", { className: "space-y-2", children: items.map((item) => (_jsxs("button", { draggable: true, onDragStart: (event) => handleDragStart(event, item.type), onDoubleClick: () => addNode(item.type, { x: 40, y: 40 }), className: "w-full cursor-grab rounded-md border border-border bg-panelSoft px-3 py-2 text-left text-sm transition-colors hover:border-slate-500 active:cursor-grabbing", type: "button", children: [_jsx("div", { className: "font-medium", children: item.name }), _jsxs("div", { className: "text-xs text-textMuted", children: [item.defaultSize.width, " x ", item.defaultSize.height] })] }, item.type))) })] }, category));
                }) })] }));
}
