import { nanoid } from 'nanoid';
import type { ComponentCategory, ComponentType, NodeStyle, UINode } from '@builder/shared';

export interface ComponentTemplate {
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  defaultSize: { width: number; height: number };
  content?: UINode['content'];
  style?: Partial<NodeStyle>;
}

const spacing = (value = 0) => ({ top: value, right: value, bottom: value, left: value });

export const defaultNodeStyle: NodeStyle = {
  background: '#171a21',
  backgroundOpacity: 100,
  color: '#e5e7eb',
  textOpacity: 100,
  borderColor: '#2a313e',
  borderOpacity: 100,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 8,
  opacity: 100,
  boxShadow: 'none',
  padding: spacing(12),
  margin: spacing(0),
  fontFamily: 'DM Sans, Segoe UI, sans-serif',
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: 0,
  textTransform: 'none',
  textAlign: 'left',
  lineHeight: 1.4,
  display: 'block',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: 8,
  gridCols: 2
};

export const componentTemplates: ComponentTemplate[] = [
  { type: 'container', category: 'layout', name: 'Container', defaultSize: { width: 420, height: 240 }, style: { background: '#161b22' } },
  { type: 'section', category: 'layout', name: 'Section', defaultSize: { width: 520, height: 220 }, style: { background: '#171a21' } },
  { type: 'grid', category: 'layout', name: 'Grid Layout', defaultSize: { width: 520, height: 260 }, style: { display: 'grid', gridCols: 3, gap: 12 } },
  { type: 'spacer', category: 'layout', name: 'Spacer', defaultSize: { width: 120, height: 32 }, style: { background: '#11151c', borderWidth: 0 } },

  { type: 'navbar', category: 'navigation', name: 'Navbar', defaultSize: { width: 820, height: 64 }, content: { text: 'Brand | Home About Contact' } },
  { type: 'sidebar', category: 'navigation', name: 'Sidebar', defaultSize: { width: 240, height: 460 }, content: { text: 'Dashboard\nAnalytics\nSettings' } },
  { type: 'footer', category: 'navigation', name: 'Footer', defaultSize: { width: 820, height: 80 }, content: { text: 'Copyright 2026' } },

  { type: 'hero', category: 'content', name: 'Hero Section', defaultSize: { width: 820, height: 300 }, content: { text: 'Hero Heading\nHero subheading' } },
  { type: 'heading', category: 'content', name: 'Heading', defaultSize: { width: 280, height: 56 }, content: { text: 'Heading Text' }, style: { fontSize: 28, fontWeight: 700, borderWidth: 0, background: 'transparent' } },
  { type: 'paragraph', category: 'content', name: 'Paragraph', defaultSize: { width: 360, height: 92 }, content: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }, style: { borderWidth: 0, background: 'transparent', color: '#cbd5e1' } },
  { type: 'card', category: 'content', name: 'Card', defaultSize: { width: 280, height: 170 }, content: { text: 'Card title\nCard content' } },
  { type: 'list', category: 'content', name: 'List', defaultSize: { width: 240, height: 160 }, content: { text: 'Item one\nItem two\nItem three' } },

  { type: 'button', category: 'form', name: 'Button', defaultSize: { width: 140, height: 44 }, content: { text: 'Click Me' }, style: { background: '#2563eb', borderColor: '#2563eb', textAlign: 'center', fontWeight: 500 } },
  { type: 'input', category: 'form', name: 'Input', defaultSize: { width: 260, height: 44 }, content: { placeholder: 'Type something...' } },
  { type: 'textarea', category: 'form', name: 'Textarea', defaultSize: { width: 320, height: 120 }, content: { placeholder: 'Write details...' } },
  { type: 'select', category: 'form', name: 'Select', defaultSize: { width: 240, height: 44 }, content: { options: ['Option 1', 'Option 2', 'Option 3'] } },

  { type: 'image', category: 'media', name: 'Image', defaultSize: { width: 320, height: 200 }, content: { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', alt: 'Placeholder image' }, style: { padding: spacing(0) } },

  { type: 'modal', category: 'interactive', name: 'Modal', defaultSize: { width: 420, height: 240 }, content: { text: 'Modal title\nModal content' } },
  { type: 'dropdown', category: 'interactive', name: 'Dropdown', defaultSize: { width: 220, height: 44 }, content: { text: 'Dropdown trigger' } },
  { type: 'accordion', category: 'interactive', name: 'Accordion', defaultSize: { width: 360, height: 160 }, content: { text: 'Accordion item 1\nAccordion item 2' } },

  { type: 'divider', category: 'utility', name: 'Divider', defaultSize: { width: 260, height: 8 }, style: { background: '#2a313e', borderWidth: 0, padding: spacing(0), borderRadius: 3 } },
  { type: 'badge', category: 'utility', name: 'Badge', defaultSize: { width: 110, height: 30 }, content: { text: 'Badge' }, style: { background: '#1e40af', borderColor: '#1e40af', textAlign: 'center', fontWeight: 600, borderRadius: 999 } }
];

export const categoryLabels: Record<ComponentCategory, string> = {
  layout: 'Layout',
  navigation: 'Navigation',
  content: 'Content',
  form: 'Form',
  media: 'Media',
  interactive: 'Interactive',
  utility: 'Utility'
};

export const containerTypes = new Set<ComponentType>(['container', 'section', 'grid', 'card', 'hero', 'modal', 'sidebar']);

export function getTemplateByType(type: ComponentType): ComponentTemplate {
  const found = componentTemplates.find((item) => item.type === type);
  if (!found) {
    throw new Error(`Template not found: ${type}`);
  }
  return found;
}

export function buildNodeFromTemplate(
  type: ComponentType,
  position: { x: number; y: number },
  parentId: string | null
): UINode {
  const template = getTemplateByType(type);
  return {
    id: nanoid(),
    parentId,
    type: template.type,
    category: template.category,
    name: template.name,
    children: [],
    frame: {
      x: position.x,
      y: position.y,
      width: template.defaultSize.width,
      height: template.defaultSize.height
    },
    style: {
      ...defaultNodeStyle,
      ...template.style,
      padding: template.style?.padding ?? defaultNodeStyle.padding,
      margin: template.style?.margin ?? defaultNodeStyle.margin
    },
    content: {
      ...(template.content ?? {})
    },
    responsive: {}
  };
}
