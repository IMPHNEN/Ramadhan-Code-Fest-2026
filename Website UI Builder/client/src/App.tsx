import { useEffect, useState } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { TopBar } from '@/components/editor/TopBar';
import { InspectorPanel } from '@/components/inspector/InspectorPanel';
import { ComponentLibrary } from '@/components/library/ComponentLibrary';
import { useBuilderStore } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';

export function App() {
  const { selectedId, removeNode, duplicateNode, previewMode } = useBuilderStore(
    useShallow((state) => ({
      selectedId: state.selectedId,
      removeNode: state.removeNode,
      duplicateNode: state.duplicateNode,
      previewMode: state.previewMode
    }))
  );
  const [showViewportWarning, setShowViewportWarning] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(340);
  const [activeSplitter, setActiveSplitter] = useState<null | 'left' | 'right'>(null);

  useEffect(() => {
    const isTypingContext = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (target.isContentEditable) return true;
      return Boolean(target.closest('[contenteditable=\"true\"]'));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingContext(event.target)) return;
      const isCommand = (event.ctrlKey || event.metaKey) && !event.altKey;
      if (isCommand && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        useBuilderStore.getState().redo();
        return;
      }
      if (isCommand && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        useBuilderStore.getState().undo();
        return;
      }

      const isZoomCommand = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey;
      if (isZoomCommand && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        useBuilderStore.getState().zoomIn();
        return;
      }
      if (isZoomCommand && event.key === '-') {
        event.preventDefault();
        useBuilderStore.getState().zoomOut();
        return;
      }
      if (isZoomCommand && event.key === '0') {
        event.preventDefault();
        useBuilderStore.getState().resetZoom();
        return;
      }

      if (!selectedId || previewMode) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeNode(selectedId);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateNode(selectedId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [duplicateNode, previewMode, removeNode, selectedId]);

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const small = width < 980;
      const notEnough = width < 1280 || height < 720;
      setIsSmallScreen(small);
      setShowViewportWarning(notEnough);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    document.addEventListener('fullscreenchange', checkViewport);

    return () => {
      window.removeEventListener('resize', checkViewport);
      document.removeEventListener('fullscreenchange', checkViewport);
    };
  }, []);

  useEffect(() => {
    if (!activeSplitter) return;

    const minLeft = 220;
    const maxLeft = 520;
    const minRight = 280;
    const maxRight = 560;

    const onMove = (event: PointerEvent) => {
      if (activeSplitter === 'left') {
        const next = Math.min(maxLeft, Math.max(minLeft, event.clientX));
        setLeftPanelWidth(next);
        return;
      }

      const next = Math.min(maxRight, Math.max(minRight, window.innerWidth - event.clientX));
      setRightPanelWidth(next);
    };

    const onUp = () => {
      setActiveSplitter(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [activeSplitter]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen API failures on unsupported/browser-restricted contexts.
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface text-textMain">
      <TopBar />
      <div className="flex h-[calc(100vh-44px)]">
        <div className="h-full shrink-0" style={{ width: leftPanelWidth }}>
          <ComponentLibrary />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left panel"
          onPointerDown={(event) => {
            event.preventDefault();
            setActiveSplitter('left');
          }}
          className="group relative h-full w-3 shrink-0 cursor-col-resize bg-[#0c1220]"
        >
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-600/70 group-hover:bg-sky-400/80" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-slate-500/50 bg-[#111827] px-1 py-0.5 text-[9px] font-bold text-slate-300 group-hover:border-sky-500/60 group-hover:text-sky-200">
            <span>◂</span>
            <span>▸</span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <Canvas />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize right panel"
          onPointerDown={(event) => {
            event.preventDefault();
            setActiveSplitter('right');
          }}
          className="group relative h-full w-3 shrink-0 cursor-col-resize bg-[#0c1220]"
        >
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-600/70 group-hover:bg-sky-400/80" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-slate-500/50 bg-[#111827] px-1 py-0.5 text-[9px] font-bold text-slate-300 group-hover:border-sky-500/60 group-hover:text-sky-200">
            <span>◂</span>
            <span>▸</span>
          </span>
        </div>

        <div className="h-full shrink-0" style={{ width: rightPanelWidth }}>
          <InspectorPanel />
        </div>
      </div>

      {showViewportWarning ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-amber-500/50 bg-[#111827] p-5 shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-amber-500/40 bg-amber-500/15 text-[10px] font-bold text-amber-300">
                !
              </span>
              <h2 className="text-sm font-semibold text-amber-100">Ukuran Layar Tidak Cukup</h2>
            </div>

            <p className="text-sm text-slate-200">
              Workspace UI Builder membutuhkan area layar lebar agar panel dan canvas dapat tampil dengan optimal.
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
              <li>Gunakan mode fullscreen (F11) agar layout editor tampil penuh.</li>
              <li>Jika akses dari layar kecil/mobile, gunakan perangkat desktop/laptop.</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestFullscreen}
                className="rounded border border-emerald-600/40 bg-emerald-600/15 px-3 py-1.5 text-xs font-medium text-emerald-200"
              >
                Masuk Fullscreen
              </button>
              <button
                type="button"
                onClick={() => setShowViewportWarning(false)}
                className="rounded border border-slate-600 bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-slate-200"
              >
                Tetap Lanjut
              </button>
              {isSmallScreen ? (
                <span className="inline-flex items-center rounded border border-rose-500/40 bg-rose-600/15 px-2 py-1 text-xs text-rose-200">
                  Disarankan gunakan desktop
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
