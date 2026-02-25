const withOpacity = (color, opacityPercent) => {
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
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, opacityPercent)) / 100})`;
};
const mapCommonClasses = (node) => {
    const classes = ['relative'];
    const display = node.style.display;
    if (display === 'flex') {
        classes.push('flex');
        classes.push(node.style.flexDirection === 'column' ? 'flex-col' : 'flex-row');
        classes.push(node.style.justifyContent === 'flex-start'
            ? 'justify-start'
            : node.style.justifyContent === 'center'
                ? 'justify-center'
                : node.style.justifyContent === 'flex-end'
                    ? 'justify-end'
                    : 'justify-between');
        classes.push(node.style.alignItems === 'stretch'
            ? 'items-stretch'
            : node.style.alignItems === 'flex-start'
                ? 'items-start'
                : node.style.alignItems === 'center'
                    ? 'items-center'
                    : 'items-end');
        classes.push(`gap-[${node.style.gap}px]`);
    }
    if (display === 'grid') {
        classes.push('grid');
        classes.push(`grid-cols-${Math.min(Math.max(node.style.gridCols, 1), 6)}`);
        classes.push(`gap-[${node.style.gap}px]`);
    }
    classes.push(`rounded-[${node.style.borderRadius}px]`);
    classes.push(`border-[${node.style.borderWidth}px]`);
    classes.push(`text-[${node.style.fontSize}px]`);
    classes.push(`font-[${node.style.fontWeight}]`);
    classes.push(node.style.textAlign === 'left' ? 'text-left' : node.style.textAlign === 'center' ? 'text-center' : 'text-right');
    return classes;
};
const inlineStyleFromNode = (node) => {
    const p = node.style.padding;
    const m = node.style.margin;
    return [
        `position:absolute`,
        `left:${node.frame.x}px`,
        `top:${node.frame.y}px`,
        `width:${node.frame.width}px`,
        `height:${node.frame.height}px`,
        `background:${withOpacity(node.style.background, node.style.backgroundOpacity)}`,
        `color:${withOpacity(node.style.color, node.style.textOpacity)}`,
        `border-color:${withOpacity(node.style.borderColor, node.style.borderOpacity)}`,
        `border-style:${node.style.borderStyle}`,
        `font-family:${node.style.fontFamily}`,
        `line-height:${node.style.lineHeight}`,
        `letter-spacing:${node.style.letterSpacing}px`,
        `text-transform:${node.style.textTransform}`,
        `box-shadow:${node.style.boxShadow}`,
        `opacity:${node.style.opacity / 100}`,
        `padding:${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`,
        `margin:${m.top}px ${m.right}px ${m.bottom}px ${m.left}px`,
        'overflow:hidden'
    ].join(';');
};
const renderInnerText = (node) => {
    if (node.type === 'input') {
        return `<input class=\"w-full h-full bg-transparent outline-none\" placeholder=\"${node.content.placeholder ?? ''}\" />`;
    }
    if (node.type === 'textarea') {
        return `<textarea class=\"w-full h-full bg-transparent outline-none resize-none\" placeholder=\"${node.content.placeholder ?? ''}\"></textarea>`;
    }
    if (node.type === 'select') {
        const options = (node.content.options ?? ['Option']).map((option) => `<option>${option}</option>`).join('');
        return `<select class=\"w-full h-full bg-transparent outline-none\">${options}</select>`;
    }
    if (node.type === 'image') {
        return `<img src=\"${node.content.src ?? ''}\" alt=\"${node.content.alt ?? ''}\" class=\"w-full h-full object-cover\" />`;
    }
    return (node.content.text ?? '').replace(/\n/g, '<br/>');
};
const renderNodeHtml = (project, nodeId) => {
    const node = project.nodesById[nodeId];
    if (!node) {
        return '';
    }
    const children = node.children.map((childId) => renderNodeHtml(project, childId)).join('\n');
    const inner = `${renderInnerText(node)}${children}`;
    return `<div class=\"${mapCommonClasses(node).join(' ')}\" style=\"${inlineStyleFromNode(node)}\">${inner}</div>`;
};
const renderNodeReact = (project, nodeId, depth = 2) => {
    const node = project.nodesById[nodeId];
    if (!node) {
        return '';
    }
    const indent = '  '.repeat(depth);
    const children = node.children.map((childId) => renderNodeReact(project, childId, depth + 1)).join('\n');
    let body = `{'${(node.content.text ?? '').replace(/'/g, "\\'").replace(/\n/g, ' ')}'}`;
    if (node.type === 'input') {
        body = `<input className=\"w-full h-full bg-transparent outline-none\" placeholder=\"${node.content.placeholder ?? ''}\" />`;
    }
    if (node.type === 'textarea') {
        body = `<textarea className=\"w-full h-full bg-transparent outline-none resize-none\" placeholder=\"${node.content.placeholder ?? ''}\" />`;
    }
    if (node.type === 'select') {
        const options = (node.content.options ?? ['Option'])
            .map((option) => `<option value=\"${option}\">${option}</option>`)
            .join('');
        body = `<select className=\"w-full h-full bg-transparent outline-none\">${options}</select>`;
    }
    if (node.type === 'image') {
        body = `<img src=\"${node.content.src ?? ''}\" alt=\"${node.content.alt ?? ''}\" className=\"w-full h-full object-cover\" />`;
    }
    const style = `{{ position: 'absolute', left: ${node.frame.x}, top: ${node.frame.y}, width: ${node.frame.width}, height: ${node.frame.height}, background: '${withOpacity(node.style.background, node.style.backgroundOpacity)}', color: '${withOpacity(node.style.color, node.style.textOpacity)}', borderColor: '${withOpacity(node.style.borderColor, node.style.borderOpacity)}', borderStyle: '${node.style.borderStyle}', fontFamily: '${node.style.fontFamily.replace(/'/g, "\\\\'")}', lineHeight: ${node.style.lineHeight}, letterSpacing: '${node.style.letterSpacing}px', textTransform: '${node.style.textTransform}', boxShadow: '${node.style.boxShadow.replace(/'/g, "\\\\'")}', opacity: ${node.style.opacity / 100}, padding: '${node.style.padding.top}px ${node.style.padding.right}px ${node.style.padding.bottom}px ${node.style.padding.left}px', margin: '${node.style.margin.top}px ${node.style.margin.right}px ${node.style.margin.bottom}px ${node.style.margin.left}px', overflow: 'hidden' }}`;
    return `${indent}<div className=\"${mapCommonClasses(node).join(' ')}\" style=${style}>\n${indent}  ${body}${children ? `\n${children}` : ''}\n${indent}</div>`;
};
export const exportProject = (project) => {
    const root = project.nodesById[project.rootNodeId];
    const htmlChildren = root.children.map((childId) => renderNodeHtml(project, childId)).join('\n');
    const reactChildren = root.children.map((childId) => renderNodeReact(project, childId)).join('\n');
    return {
        html: `<div class=\"relative w-full min-h-screen bg-[#0f1115]\">\n${htmlChildren}\n</div>`,
        react: `import React from 'react';\n\nexport function GeneratedLayout() {\n  return (\n    <div className=\"relative w-full min-h-screen bg-[#0f1115]\">\n${reactChildren}\n    </div>\n  );\n}\n`
    };
};
