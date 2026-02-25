import type React from 'react';
import { componentTemplates, categoryLabels } from '@/lib/componentCatalog';
import { useBuilderStore } from '@/store/builderStore';
import type { ComponentCategory, ComponentType } from '@builder/shared';

const orderedCategories: ComponentCategory[] = [
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

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, type: ComponentType) => {
    event.dataTransfer.setData('application/x-builder-component', type);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-panel">
      <div className="border-b border-border px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded border border-cyan-500/40 bg-cyan-500/15 text-[10px] font-bold text-cyan-300">
            LB
          </span>
          <h2 className="text-sm font-semibold">Component Library</h2>
        </div>
        <p className="text-xs text-textMuted">Drag item ke canvas untuk mulai menyusun layout.</p>
      </div>

      <div className="builder-scroll flex-1 overflow-y-auto px-3 py-3">
        {orderedCategories.map((category) => {
          const items = componentTemplates.filter((item) => item.category === category);
          return (
            <section key={category} className="mb-4">
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-textMuted">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  {categoryLabels[category]}
                </span>
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.type}
                    draggable
                    onDragStart={(event) => handleDragStart(event, item.type)}
                    onDoubleClick={() => addNode(item.type, { x: 40, y: 40 })}
                    className="w-full cursor-grab rounded-md border border-border bg-panelSoft px-3 py-2 text-left text-sm transition-colors hover:border-slate-500 active:cursor-grabbing"
                    type="button"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-textMuted">{item.defaultSize.width} x {item.defaultSize.height}</div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
