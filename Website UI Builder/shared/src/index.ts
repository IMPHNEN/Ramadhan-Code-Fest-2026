export type ComponentCategory =
  | 'layout'
  | 'navigation'
  | 'content'
  | 'form'
  | 'media'
  | 'interactive'
  | 'utility';

export type ComponentType =
  | 'container'
  | 'section'
  | 'grid'
  | 'spacer'
  | 'navbar'
  | 'sidebar'
  | 'footer'
  | 'hero'
  | 'heading'
  | 'paragraph'
  | 'card'
  | 'list'
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'image'
  | 'modal'
  | 'dropdown'
  | 'accordion'
  | 'divider'
  | 'badge';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface NodeStyle {
  background: string;
  backgroundOpacity: number;
  color: string;
  textOpacity: number;
  borderColor: string;
  borderOpacity: number;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderRadius: number;
  opacity: number;
  boxShadow: string;
  padding: SpacingValue;
  margin: SpacingValue;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  display: 'block' | 'flex' | 'grid';
  flexDirection: 'row' | 'column';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems: 'stretch' | 'flex-start' | 'center' | 'flex-end';
  gap: number;
  gridCols: number;
}

export interface NodeFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeContent {
  text?: string;
  src?: string;
  alt?: string;
  placeholder?: string;
  label?: string;
  options?: string[];
}

export interface NodeResponsiveOverride {
  frame?: Partial<NodeFrame>;
  style?: Partial<NodeStyle>;
  content?: Partial<NodeContent>;
}

export interface UINode {
  id: string;
  parentId: string | null;
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  children: string[];
  frame: NodeFrame;
  style: NodeStyle;
  content: NodeContent;
  responsive: Partial<Record<DeviceMode, NodeResponsiveOverride>>;
}

export interface AlignmentGuide {
  orientation: 'horizontal' | 'vertical';
  position: number;
  from: number;
  to: number;
}

export interface BuilderSettings {
  snapToGrid: boolean;
  gridSize: number;
  showGuides: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export interface BuilderProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rootNodeId: string;
  nodesById: Record<string, UINode>;
  settings: BuilderSettings;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
