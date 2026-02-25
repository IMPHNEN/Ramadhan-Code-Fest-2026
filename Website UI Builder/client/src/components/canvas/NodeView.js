import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const resizeHandles = [
    'n',
    's',
    'e',
    'w',
    'ne',
    'nw',
    'se',
    'sw'
];
const ribbonTypes = new Set(['container', 'section', 'grid']);
function getRibbonColor(seed) {
    const palettes = [
        { background: '#ef4444', border: '#b91c1c', text: '#ffffff' },
        { background: '#f97316', border: '#c2410c', text: '#ffffff' },
        { background: '#eab308', border: '#a16207', text: '#111827' },
        { background: '#22c55e', border: '#15803d', text: '#052e16' },
        { background: '#06b6d4', border: '#0e7490', text: '#082f49' },
        { background: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
        { background: '#a855f7', border: '#7e22ce', text: '#ffffff' },
        { background: '#ec4899', border: '#be185d', text: '#ffffff' }
    ];
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return palettes[hash % palettes.length];
}
function withOpacity(color, opacityPercent) {
    if (!color.startsWith('#')) {
        return color;
    }
    const raw = color.slice(1);
    const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (hex.length !== 6) {
        return color;
    }
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function getNodeContent(node, previewMode) {
    if (node.type === 'input') {
        if (previewMode) {
            return (_jsx("input", { className: "h-full w-full bg-transparent outline-none", placeholder: node.content.placeholder ?? 'Input', defaultValue: "" }));
        }
        return _jsx("div", { className: "opacity-75", children: node.content.placeholder ?? 'Input' });
    }
    if (node.type === 'textarea') {
        if (previewMode) {
            return (_jsx("textarea", { className: "h-full w-full resize-none bg-transparent outline-none", placeholder: node.content.placeholder ?? 'Textarea', defaultValue: "" }));
        }
        return _jsx("div", { className: "opacity-75", children: node.content.placeholder ?? 'Textarea' });
    }
    if (node.type === 'select') {
        if (previewMode) {
            const options = node.content.options ?? ['Option'];
            return (_jsx("select", { className: "h-full w-full bg-transparent outline-none", children: options.map((option) => (_jsx("option", { value: option, children: option }, option))) }));
        }
        return _jsx("div", { className: "opacity-75", children: (node.content.options ?? ['Option']).join(' | ') });
    }
    if (node.type === 'button' && previewMode) {
        return (_jsx("button", { type: "button", className: "h-full w-full bg-transparent text-inherit", onClick: (event) => event.preventDefault(), children: node.content.text ?? 'Button' }));
    }
    if (node.type === 'dropdown' && previewMode) {
        return (_jsx("button", { type: "button", className: "h-full w-full bg-transparent text-left text-inherit", onClick: (event) => event.preventDefault(), children: node.content.text ?? 'Dropdown' }));
    }
    if (node.type === 'accordion' && previewMode) {
        return (_jsxs("details", { className: "h-full w-full", children: [_jsx("summary", { className: "cursor-pointer", children: node.content.label ?? 'Accordion' }), _jsx("div", { className: "pt-2 text-sm", children: node.content.text ?? 'Accordion content' })] }));
    }
    if (node.type === 'image') {
        return node.content.src ? (_jsx("img", { src: node.content.src, alt: node.content.alt ?? 'image', className: "h-full w-full object-cover", draggable: false })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center text-xs text-textMuted", children: "Image" }));
    }
    const hasText = typeof node.content.text === 'string' && node.content.text.trim().length > 0;
    const allowNameFallback = new Set([
        'heading',
        'paragraph',
        'card',
        'list',
        'hero',
        'navbar',
        'footer',
        'badge',
        'dropdown',
        'accordion',
        'button'
    ]);
    const text = hasText ? node.content.text : allowNameFallback.has(node.type) ? node.name : '';
    if (!text)
        return null;
    return _jsx("span", { className: "whitespace-pre-wrap", children: text });
}
function handlePositionClass(direction) {
    switch (direction) {
        case 'n':
            return 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize';
        case 's':
            return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize';
        case 'e':
            return 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize';
        case 'w':
            return 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize';
        case 'ne':
            return 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize';
        case 'nw':
            return 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize';
        case 'se':
            return 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize';
        default:
            return 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize';
    }
}
export function NodeView({ node, absoluteFrame, selected, previewMode, hideLabel = false, onSelect, onPointerDownMove, onPointerDownResize }) {
    const ribbon = getRibbonColor(`${node.type}:${node.name}`);
    const showRibbon = ribbonTypes.has(node.type) && !previewMode && !hideLabel;
    const ribbonLabel = node.name.trim().length ? node.name : `${node.type}/${node.id.slice(0, 6)}`;
    const style = {
        position: 'absolute',
        isolation: 'isolate',
        left: absoluteFrame.x,
        top: absoluteFrame.y,
        width: absoluteFrame.width,
        height: absoluteFrame.height,
        background: withOpacity(node.style.background, node.style.backgroundOpacity),
        color: withOpacity(node.style.color, node.style.textOpacity),
        borderColor: withOpacity(node.style.borderColor, node.style.borderOpacity),
        borderWidth: node.style.borderWidth,
        borderStyle: node.style.borderStyle,
        borderRadius: node.style.borderRadius,
        boxShadow: node.style.boxShadow,
        opacity: selected && !previewMode ? (node.style.opacity / 100) * 0.82 : node.style.opacity / 100,
        padding: `${node.style.padding.top}px ${node.style.padding.right}px ${node.style.padding.bottom}px ${node.style.padding.left}px`,
        margin: `${node.style.margin.top}px ${node.style.margin.right}px ${node.style.margin.bottom}px ${node.style.margin.left}px`,
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        letterSpacing: `${node.style.letterSpacing}px`,
        textTransform: node.style.textTransform,
        textAlign: node.style.textAlign,
        lineHeight: node.style.lineHeight,
        display: node.style.display,
        flexDirection: node.style.flexDirection,
        justifyContent: node.style.justifyContent,
        alignItems: node.style.alignItems,
        gap: node.style.gap,
        gridTemplateColumns: node.style.display === 'grid' ? `repeat(${node.style.gridCols}, minmax(0, 1fr))` : undefined,
        overflow: previewMode ? 'hidden' : 'visible',
        zIndex: selected ? 2 : 1,
        userSelect: previewMode ? 'auto' : 'none'
    };
    return (_jsxs("div", { "data-node-id": node.id, style: style, className: `group ${selected ? 'ring-1 ring-accent ring-offset-1 ring-offset-[#0b1220]' : ''} ${previewMode ? '' : 'cursor-grab active:cursor-grabbing'}`, onClick: (event) => onSelect(event, node.id), onPointerDown: (event) => {
            if (previewMode)
                return;
            if (event.target.dataset.resizeHandle)
                return;
            onPointerDownMove(event, node.id);
        }, children: [showRibbon ? (_jsx("span", { className: "pointer-events-none absolute left-3 top-0 z-[-1] translate-y-[2px] rounded-b-md border border-t-0 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] opacity-0 transition-[transform,opacity] duration-200 group-hover:translate-y-[-100%] group-hover:opacity-100", style: {
                    background: ribbon.background,
                    borderColor: ribbon.border,
                    color: ribbon.text
                }, children: ribbonLabel })) : null, _jsx("div", { className: "relative z-[2] h-full w-full overflow-hidden", style: { borderRadius: 'inherit' }, children: getNodeContent(node, previewMode) }), !previewMode && selected
                ? resizeHandles.map((direction) => (_jsx("span", { "data-resize-handle": direction, onPointerDown: (event) => onPointerDownResize(event, node.id, direction), className: `absolute z-[3] h-5 w-5 -m-2 flex items-center justify-center rounded-md ${handlePositionClass(direction)}`, children: _jsx("span", { className: "h-3.5 w-3.5 rounded-sm border border-white bg-accent" }) }, direction)))
                : null] }));
}
