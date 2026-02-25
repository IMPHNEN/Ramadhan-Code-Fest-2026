import { useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';
import { LayerTree } from './LayerTree';

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block leading-tight text-textMuted">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded border border-border bg-panelSoft px-2 py-1 text-right text-xs"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-textMuted">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-textMuted">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
      />
    </label>
  );
}

function normalizeColor(value: string): string {
  if (/^#[0-9A-Fa-f]{3}$/.test(value) || /^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }
  return '#000000';
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-2 text-xs">
      <span className="text-textMuted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-10 rounded border border-border bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded border border-border bg-panelSoft px-2 py-1 text-xs"
          placeholder="#RRGGBB / rgba(...)"
        />
      </div>
    </div>
  );
}

const containerTypeSet = new Set(['container', 'section', 'grid', 'card', 'hero', 'sidebar', 'modal']);

export function InspectorPanel() {
  const {
    project,
    selectedId,
    updateNodeFrame,
    updateNodeName,
    updateNodeStyle,
    updateNodeContent,
    removeNode,
    duplicateNode,
    setNodeParent
  } = useBuilderStore(
    useShallow((state) => ({
      project: state.project,
      selectedId: state.selectedId,
      updateNodeFrame: state.updateNodeFrame,
      updateNodeName: state.updateNodeName,
      updateNodeStyle: state.updateNodeStyle,
      updateNodeContent: state.updateNodeContent,
      removeNode: state.removeNode,
      duplicateNode: state.duplicateNode,
      setNodeParent: state.setNodeParent
    }))
  );

  const node = selectedId ? project.nodesById[selectedId] : null;
  const containerCandidates = useMemo(
    () =>
      Object.values(project.nodesById)
        .filter((item) => containerTypeSet.has(item.type))
        .filter((item) => item.id !== selectedId),
    [project.nodesById, selectedId]
  );

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-panel">
      <div className="border-b border-border px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded border border-fuchsia-500/40 bg-fuchsia-500/15 text-[10px] font-bold text-fuchsia-300">
            IN
          </span>
          <h2 className="text-sm font-semibold">Inspector</h2>
        </div>
        <p className="text-xs text-textMuted">
          {node ? `${node.name} (${node.type})` : 'Pilih komponen untuk edit properti.'}
        </p>
      </div>

      <div className="builder-scroll flex-1 overflow-y-auto px-4 py-3">
        <LayerTree />

        {!node ? (
          <div className="mt-3 rounded border border-dashed border-border px-3 py-4 text-xs text-textMuted">
            Klik elemen di canvas lalu edit style, labeling, typography, dan content di sini.
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Actions</span>
              </h3>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                  type="button"
                  onClick={() => duplicateNode(node.id)}
                >
                  Duplicate
                </button>
                <button
                  className="flex-1 rounded border border-red-800 bg-red-950/40 px-2 py-1.5 text-xs text-red-300"
                  type="button"
                  onClick={() => removeNode(node.id)}
                >
                  Delete
                </button>
              </div>
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" />Labeling</span>
              </h3>
              <div className="space-y-2">
                <TextField label="Layer Name" value={node.name} onChange={(value) => updateNodeName(node.id, value)} />
                <TextField
                  label="Label"
                  value={node.content.label ?? ''}
                  onChange={(value) => updateNodeContent(node.id, { label: value })}
                />
                <TextAreaField
                  label="Text"
                  rows={3}
                  value={node.content.text ?? ''}
                  onChange={(value) => updateNodeContent(node.id, { text: value })}
                />
                <TextField
                  label="Placeholder"
                  value={node.content.placeholder ?? ''}
                  onChange={(value) => updateNodeContent(node.id, { placeholder: value })}
                />
                <TextField
                  label="Select Options"
                  value={(node.content.options ?? []).join(', ')}
                  onChange={(value) =>
                    updateNodeContent(node.id, {
                      options: value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="Option 1, Option 2"
                />
                <TextField
                  label="Image URL"
                  value={node.content.src ?? ''}
                  onChange={(value) => updateNodeContent(node.id, { src: value })}
                />
                <TextField
                  label="Image Alt"
                  value={node.content.alt ?? ''}
                  onChange={(value) => updateNodeContent(node.id, { alt: value })}
                />
              </div>
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Frame</h3>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="X" value={node.frame.x} onChange={(value) => updateNodeFrame(node.id, { x: value }, true)} />
                <NumberField label="Y" value={node.frame.y} onChange={(value) => updateNodeFrame(node.id, { y: value }, true)} />
                <NumberField
                  label="Width"
                  value={node.frame.width}
                  min={24}
                  onChange={(value) => updateNodeFrame(node.id, { width: Math.max(24, value) }, true)}
                />
                <NumberField
                  label="Height"
                  value={node.frame.height}
                  min={24}
                  onChange={(value) => updateNodeFrame(node.id, { height: Math.max(24, value) }, true)}
                />
              </div>
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Auto Layout</h3>
              <label className="mb-2 block text-xs">
                <span className="mb-1 block text-textMuted">Parent Container</span>
                <select
                  value={node.parentId ?? project.rootNodeId}
                  className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                  onChange={(event) => setNodeParent(node.id, event.target.value)}
                >
                  <option value={project.rootNodeId}>Root</option>
                  {containerCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.id.slice(0, 6)})
                    </option>
                  ))}
                </select>
              </label>

              <label className="mb-2 block text-xs">
                <span className="mb-1 block text-textMuted">Display</span>
                <select
                  value={node.style.display}
                  className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                  onChange={(event) => updateNodeStyle(node.id, { display: event.target.value as never })}
                >
                  <option value="block">block</option>
                  <option value="flex">flex</option>
                  <option value="grid">grid</option>
                </select>
              </label>

              {node.style.display === 'flex' ? (
                <div className="space-y-2">
                  <label className="block text-xs">
                    <span className="mb-1 block text-textMuted">Direction</span>
                    <select
                      value={node.style.flexDirection}
                      className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                      onChange={(event) => updateNodeStyle(node.id, { flexDirection: event.target.value as never })}
                    >
                      <option value="row">row</option>
                      <option value="column">column</option>
                    </select>
                  </label>

                  <label className="block text-xs">
                    <span className="mb-1 block text-textMuted">Justify</span>
                    <select
                      value={node.style.justifyContent}
                      className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                      onChange={(event) => updateNodeStyle(node.id, { justifyContent: event.target.value as never })}
                    >
                      <option value="flex-start">flex-start</option>
                      <option value="center">center</option>
                      <option value="flex-end">flex-end</option>
                      <option value="space-between">space-between</option>
                    </select>
                  </label>

                  <label className="block text-xs">
                    <span className="mb-1 block text-textMuted">Align</span>
                    <select
                      value={node.style.alignItems}
                      className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                      onChange={(event) => updateNodeStyle(node.id, { alignItems: event.target.value as never })}
                    >
                      <option value="stretch">stretch</option>
                      <option value="flex-start">flex-start</option>
                      <option value="center">center</option>
                      <option value="flex-end">flex-end</option>
                    </select>
                  </label>

                  <NumberField
                    label="Gap"
                    value={node.style.gap}
                    onChange={(value) => updateNodeStyle(node.id, { gap: Math.max(0, value) })}
                  />
                </div>
              ) : null}

              {node.style.display === 'grid' ? (
                <div className="space-y-2">
                  <NumberField
                    label="Columns"
                    value={node.style.gridCols}
                    min={1}
                    max={12}
                    onChange={(value) => updateNodeStyle(node.id, { gridCols: Math.min(12, Math.max(1, value)) })}
                  />
                  <NumberField
                    label="Gap"
                    value={node.style.gap}
                    onChange={(value) => updateNodeStyle(node.id, { gap: Math.max(0, value) })}
                  />
                </div>
              ) : null}
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Spacing</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Padding Top"
                    value={node.style.padding.top}
                    onChange={(value) => updateNodeStyle(node.id, { padding: { ...node.style.padding, top: value } })}
                  />
                  <NumberField
                    label="Padding Right"
                    value={node.style.padding.right}
                    onChange={(value) => updateNodeStyle(node.id, { padding: { ...node.style.padding, right: value } })}
                  />
                  <NumberField
                    label="Padding Bottom"
                    value={node.style.padding.bottom}
                    onChange={(value) => updateNodeStyle(node.id, { padding: { ...node.style.padding, bottom: value } })}
                  />
                  <NumberField
                    label="Padding Left"
                    value={node.style.padding.left}
                    onChange={(value) => updateNodeStyle(node.id, { padding: { ...node.style.padding, left: value } })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Margin Top"
                    value={node.style.margin.top}
                    onChange={(value) => updateNodeStyle(node.id, { margin: { ...node.style.margin, top: value } })}
                  />
                  <NumberField
                    label="Margin Right"
                    value={node.style.margin.right}
                    onChange={(value) => updateNodeStyle(node.id, { margin: { ...node.style.margin, right: value } })}
                  />
                  <NumberField
                    label="Margin Bottom"
                    value={node.style.margin.bottom}
                    onChange={(value) => updateNodeStyle(node.id, { margin: { ...node.style.margin, bottom: value } })}
                  />
                  <NumberField
                    label="Margin Left"
                    value={node.style.margin.left}
                    onChange={(value) => updateNodeStyle(node.id, { margin: { ...node.style.margin, left: value } })}
                  />
                </div>
              </div>
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Fill & Stroke</h3>
              <div className="space-y-2">
                <ColorField
                  label="Fill"
                  value={node.style.background}
                  onChange={(value) => updateNodeStyle(node.id, { background: value })}
                />
                <NumberField
                  label="Fill Opacity"
                  value={node.style.backgroundOpacity}
                  min={0}
                  max={100}
                  onChange={(value) => updateNodeStyle(node.id, { backgroundOpacity: Math.min(100, Math.max(0, value)) })}
                />
                <ColorField
                  label="Text"
                  value={node.style.color}
                  onChange={(value) => updateNodeStyle(node.id, { color: value })}
                />
                <NumberField
                  label="Text Opacity"
                  value={node.style.textOpacity}
                  min={0}
                  max={100}
                  onChange={(value) => updateNodeStyle(node.id, { textOpacity: Math.min(100, Math.max(0, value)) })}
                />
                <ColorField
                  label="Stroke"
                  value={node.style.borderColor}
                  onChange={(value) => updateNodeStyle(node.id, { borderColor: value })}
                />
                <NumberField
                  label="Stroke Opacity"
                  value={node.style.borderOpacity}
                  min={0}
                  max={100}
                  onChange={(value) => updateNodeStyle(node.id, { borderOpacity: Math.min(100, Math.max(0, value)) })}
                />
                <NumberField
                  label="Stroke Width"
                  value={node.style.borderWidth}
                  min={0}
                  onChange={(value) => updateNodeStyle(node.id, { borderWidth: Math.max(0, value) })}
                />
                <label className="block text-xs">
                  <span className="mb-1 block text-textMuted">Stroke Style</span>
                  <select
                    value={node.style.borderStyle}
                    className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                    onChange={(event) => updateNodeStyle(node.id, { borderStyle: event.target.value as never })}
                  >
                    <option value="solid">solid</option>
                    <option value="dashed">dashed</option>
                    <option value="dotted">dotted</option>
                  </select>
                </label>
                <NumberField
                  label="Radius"
                  value={node.style.borderRadius}
                  min={0}
                  onChange={(value) => updateNodeStyle(node.id, { borderRadius: Math.max(0, value) })}
                />
                <NumberField
                  label="Layer Opacity"
                  value={node.style.opacity}
                  min={0}
                  max={100}
                  onChange={(value) => updateNodeStyle(node.id, { opacity: Math.min(100, Math.max(0, value)) })}
                />
                <TextField
                  label="Shadow"
                  value={node.style.boxShadow}
                  onChange={(value) => updateNodeStyle(node.id, { boxShadow: value || 'none' })}
                  placeholder="none / 0 8px 16px rgba(0,0,0,0.25)"
                />
              </div>
            </section>

            <section className="rounded border border-border p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Typography</h3>
              <div className="space-y-2">
                <TextField
                  label="Font Family"
                  value={node.style.fontFamily}
                  onChange={(value) => updateNodeStyle(node.id, { fontFamily: value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Font Size"
                    value={node.style.fontSize}
                    min={8}
                    onChange={(value) => updateNodeStyle(node.id, { fontSize: Math.max(8, value) })}
                  />
                  <NumberField
                    label="Font Weight"
                    value={node.style.fontWeight}
                    min={100}
                    max={900}
                    step={100}
                    onChange={(value) => updateNodeStyle(node.id, { fontWeight: Math.min(900, Math.max(100, value)) })}
                  />
                  <NumberField
                    label="Line Height"
                    value={node.style.lineHeight}
                    min={0.8}
                    step={0.1}
                    onChange={(value) => updateNodeStyle(node.id, { lineHeight: Math.max(0.8, value) })}
                  />
                  <NumberField
                    label="Letter Spacing"
                    value={node.style.letterSpacing}
                    step={0.1}
                    onChange={(value) => updateNodeStyle(node.id, { letterSpacing: value })}
                  />
                </div>

                <label className="block text-xs">
                  <span className="mb-1 block text-textMuted">Text Align</span>
                  <select
                    value={node.style.textAlign}
                    className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                    onChange={(event) => updateNodeStyle(node.id, { textAlign: event.target.value as never })}
                  >
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                  </select>
                </label>

                <label className="block text-xs">
                  <span className="mb-1 block text-textMuted">Text Transform</span>
                  <select
                    value={node.style.textTransform}
                    className="w-full rounded border border-border bg-panelSoft px-2 py-1.5 text-xs"
                    onChange={(event) => updateNodeStyle(node.id, { textTransform: event.target.value as never })}
                  >
                    <option value="none">none</option>
                    <option value="uppercase">uppercase</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">capitalize</option>
                  </select>
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}
