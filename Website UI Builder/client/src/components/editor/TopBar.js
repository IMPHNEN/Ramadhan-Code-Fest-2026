import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { exportProject } from '@/lib/exporters';
import { buildProjectFromPreset, getTemplatePresets } from '@/lib/presets';
import { projectApi } from '@/lib/api';
import { useBuilderStore } from '@/store/builderStore';
import { useShallow } from 'zustand/react/shallow';
const modes = ['desktop', 'tablet', 'mobile'];
export function TopBar() {
    const { project, deviceMode, zoomLevel, previewMode, history, setDeviceMode, setZoomLevel, zoomIn, zoomOut, resetZoom, setPreviewMode, updateSettings, setProject, newProject, undo, redo } = useBuilderStore(useShallow((state) => ({
        project: state.project,
        deviceMode: state.deviceMode,
        zoomLevel: state.zoomLevel,
        previewMode: state.previewMode,
        history: state.history,
        setDeviceMode: state.setDeviceMode,
        setZoomLevel: state.setZoomLevel,
        zoomIn: state.zoomIn,
        zoomOut: state.zoomOut,
        resetZoom: state.resetZoom,
        setPreviewMode: state.setPreviewMode,
        updateSettings: state.updateSettings,
        setProject: state.setProject,
        newProject: state.newProject,
        undo: state.undo,
        redo: state.redo
    })));
    const [projectName, setProjectName] = useState(project.name);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [saving, setSaving] = useState(false);
    const presets = getTemplatePresets();
    const refreshProjects = async () => {
        const result = await projectApi.list();
        setProjects(result);
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await projectApi.update(project.id, {
                name: projectName,
                project: { ...project, name: projectName }
            });
            setSelectedProjectId(saved.id);
            await refreshProjects();
        }
        finally {
            setSaving(false);
        }
    };
    useEffect(() => {
        setProjectName(project.name);
    }, [project.name]);
    useEffect(() => {
        void refreshProjects();
    }, []);
    const handleLoad = async () => {
        if (!selectedProjectId)
            return;
        const loaded = await projectApi.get(selectedProjectId);
        setProject(loaded);
        setProjectName(loaded.name);
    };
    const handleApplyPreset = () => {
        if (!selectedPresetId)
            return;
        const presetProject = buildProjectFromPreset(selectedPresetId);
        setProject(presetProject);
        setProjectName(presetProject.name);
        setSelectedProjectId('');
    };
    const handleExport = async () => {
        const result = exportProject({ ...project, name: projectName });
        try {
            await navigator.clipboard.writeText(result.react);
        }
        catch {
            // Clipboard access may fail on non-secure context; file download is the fallback.
        }
        const blob = new Blob([
            `/* HTML + Tailwind */\n${result.html}\n\n/* React Component */\n${result.react}`
        ], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${projectName.replace(/\s+/g, '-').toLowerCase() || 'layout-export'}.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("header", { className: "flex items-center justify-between gap-3 border-b border-border bg-[#141925] px-3 py-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "mr-1 flex h-6 w-6 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/15 text-[10px] font-bold text-sky-300", children: "UI" }), _jsx("h1", { className: "mr-2 text-sm font-semibold text-slate-100", children: "UI Builder" }), _jsx("input", { value: projectName, onChange: (event) => setProjectName(event.target.value), className: "w-48 rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100", placeholder: "Project name" }), _jsx("button", { type: "button", onClick: () => newProject('Untitled Project'), className: "rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100", children: "New" }), _jsx("button", { type: "button", onClick: handleSave, disabled: saving, className: "rounded border border-emerald-600/40 bg-emerald-600/15 px-2 py-1 text-xs text-emerald-200", children: saving ? 'Saving...' : 'Save' }), _jsx("button", { type: "button", onClick: refreshProjects, className: "rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100", children: "Refresh" }), _jsxs("select", { value: selectedPresetId, onChange: (event) => setSelectedPresetId(event.target.value), className: "w-44 rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100", children: [_jsx("option", { value: "", children: "Template preset..." }), presets.map((preset) => (_jsx("option", { value: preset.id, children: preset.name }, preset.id)))] }), _jsx("button", { type: "button", onClick: handleApplyPreset, className: "rounded border border-violet-600/40 bg-violet-600/15 px-2 py-1 text-xs text-violet-200", children: "Apply Template" }), _jsxs("select", { value: selectedProjectId, onChange: (event) => setSelectedProjectId(event.target.value), className: "w-44 rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100", children: [_jsx("option", { value: "", children: "Load project..." }), projects.map((item) => (_jsx("option", { value: item.id, children: item.name }, item.id)))] }), _jsx("button", { type: "button", onClick: handleLoad, className: "rounded border border-cyan-600/40 bg-cyan-600/15 px-2 py-1 text-xs text-cyan-200", children: "Load" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: undo, disabled: !history.past.length, className: "rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100 disabled:opacity-40", children: "Undo" }), _jsx("button", { type: "button", onClick: redo, disabled: !history.future.length, className: "rounded border border-slate-600 bg-[#111726] px-2 py-1 text-xs text-slate-100 disabled:opacity-40", children: "Redo" }), modes.map((mode) => (_jsx("button", { type: "button", onClick: () => setDeviceMode(mode), className: `rounded border px-2 py-1 text-xs ${deviceMode === mode ? 'border-blue-500 bg-blue-600/20 text-blue-200' : 'border-slate-600 bg-[#111726] text-slate-100'}`, children: mode }, mode))), _jsxs("label", { className: "flex items-center gap-1 rounded border border-amber-600/40 bg-amber-600/10 px-2 py-1 text-xs text-amber-200", children: [_jsx("input", { type: "checkbox", checked: project.settings.snapToGrid, onChange: (event) => updateSettings({ snapToGrid: event.target.checked }) }), "Snap"] }), _jsxs("label", { className: "flex items-center gap-1 rounded border border-teal-600/40 bg-teal-600/10 px-2 py-1 text-xs text-teal-200", children: [_jsx("input", { type: "checkbox", checked: project.settings.showGuides, onChange: (event) => updateSettings({ showGuides: event.target.checked }) }), "Guides"] }), _jsxs("div", { className: "flex items-center gap-1 rounded border border-slate-600 bg-[#111726] px-1 py-1 text-xs text-slate-100", children: [_jsx("button", { type: "button", onClick: zoomOut, className: "rounded border border-slate-600 px-1.5 py-0.5 leading-none", children: "-" }), _jsx("input", { type: "number", min: 40, max: 200, step: 10, value: Math.round(zoomLevel * 100), onChange: (event) => setZoomLevel(Number(event.target.value) / 100), className: "w-12 rounded border border-slate-600 bg-[#0b1220] px-1 py-0.5 text-center text-[11px]" }), _jsx("span", { className: "text-[11px] text-slate-300", children: "%" }), _jsx("button", { type: "button", onClick: zoomIn, className: "rounded border border-slate-600 px-1.5 py-0.5 leading-none", children: "+" }), _jsx("button", { type: "button", onClick: resetZoom, className: "rounded border border-slate-600 px-1.5 py-0.5 text-[11px]", children: "100" })] }), _jsx("button", { type: "button", onClick: () => setPreviewMode(!previewMode), className: `rounded border px-2 py-1 text-xs ${previewMode ? 'border-fuchsia-500 bg-fuchsia-600/20 text-fuchsia-200' : 'border-slate-600 bg-[#111726] text-slate-100'}`, children: previewMode ? 'Exit Preview' : 'Preview' }), _jsx("button", { type: "button", onClick: handleExport, className: "rounded border border-indigo-600/40 bg-indigo-600/15 px-2 py-1 text-xs text-indigo-200", children: "Export" })] })] }));
}
