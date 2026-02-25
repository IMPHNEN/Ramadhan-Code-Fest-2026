import { useBuilderStore } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';

function LayerItem({ nodeId, depth }: { nodeId: string; depth: number }) {
  const { project, selectedId, setSelected } = useBuilderStore(
    useShallow((state) => ({
      project: state.project,
      selectedId: state.selectedId,
      setSelected: state.setSelected
    }))
  );

  const node = project.nodesById[nodeId];
  if (!node) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setSelected(node.id)}
        className={`flex w-full items-center rounded px-2 py-1 text-left text-xs ${
          selectedId === node.id ? 'border border-indigo-500/40 bg-indigo-600/20 text-indigo-100' : 'text-textMuted hover:bg-panelSoft'
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map((childId) => (
        <LayerItem key={childId} nodeId={childId} depth={depth + 1} />
      ))}
    </>
  );
}

export function LayerTree() {
  const rootChildren = useBuilderStore((state) => state.project.nodesById[state.project.rootNodeId].children);

  return (
    <section className="rounded border border-border p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-textMuted">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />Layer Tree</span>
      </h3>
      <div className="max-h-52 overflow-y-auto">
        {rootChildren.length ? (
          rootChildren.map((nodeId) => <LayerItem key={nodeId} nodeId={nodeId} depth={0} />)
        ) : (
          <p className="text-xs text-textMuted">Belum ada layer.</p>
        )}
      </div>
    </section>
  );
}
