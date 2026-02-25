import { nanoid } from 'nanoid';
import { defaultNodeStyle } from './componentCatalog';
const spacing = (top, right = top, bottom = top, left = right) => ({ top, right, bottom, left });
const typeCategoryMap = {
    container: 'layout',
    section: 'layout',
    grid: 'layout',
    spacer: 'layout',
    navbar: 'navigation',
    sidebar: 'navigation',
    footer: 'navigation',
    hero: 'content',
    heading: 'content',
    paragraph: 'content',
    card: 'content',
    list: 'content',
    button: 'form',
    input: 'form',
    textarea: 'form',
    select: 'form',
    image: 'media',
    modal: 'interactive',
    dropdown: 'interactive',
    accordion: 'interactive',
    divider: 'utility',
    badge: 'utility'
};
const presets = [
    {
        id: 'saas-landing',
        name: 'SaaS Landing',
        description: 'Landing page produk SaaS modern dengan section pricing dan CTA.'
    },
    {
        id: 'portfolio-creator',
        name: 'Portfolio Creator',
        description: 'Layout portfolio personal dengan project cards dan profile block.'
    },
    {
        id: 'storefront-shop',
        name: 'Storefront Shop',
        description: 'Homepage toko online dengan hero promo dan product grid.'
    },
    {
        id: 'auth-login',
        name: 'Login Page',
        description: 'Template halaman login lengkap dengan panel branding dan form auth.'
    },
    {
        id: 'auth-register',
        name: 'Register Page',
        description: 'Template halaman registrasi dengan form multi-field dan CTA.'
    }
];
function createNode(params) {
    return {
        id: params.id,
        parentId: params.parentId,
        type: params.type,
        category: typeCategoryMap[params.type],
        name: params.name,
        children: params.children ?? [],
        frame: params.frame,
        style: {
            ...defaultNodeStyle,
            ...params.style,
            padding: { ...defaultNodeStyle.padding, ...(params.style?.padding ?? {}) },
            margin: { ...defaultNodeStyle.margin, ...(params.style?.margin ?? {}) }
        },
        content: params.content ?? {},
        responsive: {}
    };
}
function createProjectShell(name) {
    const now = new Date().toISOString();
    return {
        id: nanoid(),
        name,
        createdAt: now,
        updatedAt: now,
        rootNodeId: 'root',
        nodesById: {
            root: {
                id: 'root',
                parentId: null,
                type: 'container',
                category: 'layout',
                name: 'Root',
                children: [],
                frame: { x: 0, y: 0, width: 1440, height: 1800 },
                style: {
                    ...defaultNodeStyle,
                    background: 'transparent',
                    borderWidth: 0,
                    padding: spacing(0)
                },
                content: {},
                responsive: {}
            }
        },
        settings: {
            snapToGrid: true,
            gridSize: 8,
            showGuides: true,
            canvasWidth: 1440,
            canvasHeight: 1800
        }
    };
}
function applyTypographyScale(node) {
    const nodeName = node.name.toLowerCase();
    const isHeroTitle = nodeName.includes('hero heading') ||
        nodeName.includes('register title') ||
        nodeName.includes('login title') ||
        nodeName.includes('product title') ||
        nodeName.includes('features title');
    const isSectionTitle = nodeName.includes('title') ||
        nodeName.includes('heading') ||
        nodeName.includes('projects title') ||
        nodeName.includes('brand heading');
    // H1 scale
    if (node.type === 'heading' && isHeroTitle) {
        node.style.padding = spacing(0);
        node.style.fontSize = 42;
        node.style.fontWeight = 700;
        node.style.lineHeight = 1.1;
        node.style.letterSpacing = -0.2;
        return;
    }
    // H2 scale
    if (node.type === 'heading' && isSectionTitle) {
        node.style.padding = spacing(0);
        node.style.fontSize = 34;
        node.style.fontWeight = 700;
        node.style.lineHeight = 1.15;
        node.style.letterSpacing = -0.1;
        return;
    }
    // Body / paragraph scale
    if (node.type === 'paragraph' || node.type === 'list') {
        node.style.padding = spacing(0);
        node.style.fontSize = node.frame.height >= 48 ? 16 : 14;
        node.style.fontWeight = 400;
        node.style.lineHeight = 1.45;
        node.style.letterSpacing = 0;
        return;
    }
    // Form scale
    if (node.type === 'input' || node.type === 'textarea' || node.type === 'select') {
        node.style.fontSize = 14;
        node.style.fontWeight = 400;
        node.style.lineHeight = 1.35;
        node.style.letterSpacing = 0;
        return;
    }
    // Button / badge scale
    if (node.type === 'button') {
        node.style.fontSize = 15;
        node.style.fontWeight = Math.max(node.style.fontWeight, 600);
        node.style.lineHeight = 1.2;
        node.style.letterSpacing = 0;
        return;
    }
    if (node.type === 'badge') {
        node.style.padding = spacing(0);
        node.style.fontSize = 16;
        node.style.fontWeight = Math.max(node.style.fontWeight, 700);
        node.style.lineHeight = 1.9;
        node.style.letterSpacing = 0.3;
        node.style.textAlign = 'center';
        return;
    }
    // Small utility text scale (navbar/footer)
    if (node.type === 'navbar' || node.type === 'footer' || node.type === 'divider') {
        node.style.fontSize = 15;
        node.style.fontWeight = Math.max(node.style.fontWeight, 500);
        node.style.lineHeight = 1.3;
        node.style.letterSpacing = 0;
    }
}
function estimateWrappedLines(text, width, fontSize) {
    const safeWidth = Math.max(80, width);
    const charsPerLine = Math.max(8, Math.floor(safeWidth / (fontSize * 0.56)));
    const blocks = text.split('\n');
    return blocks.reduce((total, block) => {
        const content = block.trim();
        if (!content.length)
            return total + 1;
        return total + Math.max(1, Math.ceil(content.length / charsPerLine));
    }, 0);
}
function ensureTextNodeHeight(node) {
    const lineHeightPx = node.style.fontSize * node.style.lineHeight;
    const text = (node.content.text ?? node.content.placeholder ?? node.content.label ?? '').trim();
    const estimatedLines = estimateWrappedLines(text || 'A', node.frame.width, node.style.fontSize);
    const verticalPadding = node.style.padding.top + node.style.padding.bottom;
    if (node.type === 'heading' || node.type === 'paragraph' || node.type === 'list' || node.type === 'navbar' || node.type === 'footer') {
        const minHeight = Math.ceil(estimatedLines * lineHeightPx + Math.max(6, verticalPadding));
        node.frame.height = Math.max(node.frame.height, minHeight);
    }
    if (node.type === 'button') {
        const minHeight = Math.ceil(Math.max(42, lineHeightPx + Math.max(12, verticalPadding)));
        node.frame.height = Math.max(node.frame.height, minHeight);
    }
    if (node.type === 'input' || node.type === 'select') {
        node.frame.height = Math.max(node.frame.height, 44);
    }
    if (node.type === 'textarea') {
        node.frame.height = Math.max(node.frame.height, 96);
    }
}
function polishTemplate(project, rootBackground) {
    const next = JSON.parse(JSON.stringify(project));
    const root = next.nodesById[next.rootNodeId];
    if (root) {
        root.style.background = rootBackground;
        root.style.backgroundOpacity = 100;
        root.style.borderWidth = 0;
        root.style.padding = spacing(0);
    }
    Object.values(next.nodesById).forEach((node) => {
        if (node.id === next.rootNodeId)
            return;
        node.style.fontFamily = 'DM Sans, Segoe UI, sans-serif';
        node.style.borderStyle = node.style.borderStyle || 'solid';
        node.style.opacity = Math.min(100, Math.max(88, node.style.opacity));
        applyTypographyScale(node);
        ensureTextNodeHeight(node);
        if (node.type === 'card' && node.style.boxShadow === 'none') {
            node.style.boxShadow = '0 10px 24px rgba(2,6,23,0.28)';
        }
        if (node.type === 'button' && node.style.boxShadow === 'none') {
            node.style.boxShadow = '0 8px 16px rgba(15,23,42,0.24)';
            node.style.fontWeight = Math.max(node.style.fontWeight, 600);
        }
        if (node.type === 'section' || node.type === 'container') {
            node.style.borderOpacity = Math.min(node.style.borderOpacity, 88);
        }
    });
    return next;
}
function buildSaasLanding() {
    const project = createProjectShell('Template - SaaS Landing');
    const nodes = [
        createNode({
            id: 'nav',
            type: 'navbar',
            name: 'Top Navbar',
            parentId: 'root',
            frame: { x: 60, y: 32, width: 1320, height: 72 },
            style: {
                background: '#111827',
                borderColor: '#374151',
                borderRadius: 14,
                padding: spacing(20, 24),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 600
            },
            content: { text: 'ArcFlow   Features Pricing Docs Sign In' }
        }),
        createNode({
            id: 'hero',
            type: 'hero',
            name: '',
            parentId: 'root',
            frame: { x: 60, y: 132, width: 1320, height: 420 },
            style: {
                background: '#0f172a',
                borderColor: '#1d4ed8',
                borderWidth: 1,
                borderRadius: 18,
                padding: spacing(40),
                color: '#e2e8f0'
            },
            content: { text: '' }
        }),
        createNode({
            id: 'heroHeading',
            type: 'heading',
            name: 'Hero Heading',
            parentId: 'hero',
            frame: { x: 40, y: 38, width: 700, height: 68 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1.1,
                color: '#f8fafc'
            },
            content: { text: 'Scale your workflow' }
        }),
        createNode({
            id: 'heroSub',
            type: 'paragraph',
            name: 'Hero Subtext',
            parentId: 'hero',
            frame: { x: 40, y: 122, width: 620, height: 52 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#cbd5e1',
                fontSize: 18,
                lineHeight: 1.4
            },
            content: { text: 'Design, prototype, and ship faster with ArcFlow.' }
        }),
        createNode({
            id: 'cta',
            type: 'button',
            name: 'Primary CTA',
            parentId: 'hero',
            frame: { x: 40, y: 260, width: 180, height: 48 },
            style: {
                background: '#2563eb',
                borderColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                textAlign: 'center',
                borderRadius: 10
            },
            content: { text: 'Start Free Trial', label: 'CTA Button' }
        }),
        createNode({
            id: 'featuresTitle',
            type: 'heading',
            name: 'Features Title',
            parentId: 'root',
            frame: { x: 60, y: 592, width: 1320, height: 56 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 34,
                fontWeight: 700,
                color: '#f8fafc',
                textAlign: 'left'
            },
            content: { text: 'Everything your team needs in one place' }
        }),
        createNode({
            id: 'featuresGrid',
            type: 'grid',
            name: 'Feature Grid',
            parentId: 'root',
            frame: { x: 60, y: 664, width: 1320, height: 320 },
            style: {
                display: 'grid',
                gridCols: 3,
                gap: 18,
                background: 'transparent',
                borderWidth: 0,
                padding: spacing(0)
            }
        }),
        createNode({
            id: 'feature1',
            type: 'card',
            name: 'Feature Card 1',
            parentId: 'featuresGrid',
            frame: { x: 0, y: 0, width: 420, height: 280 },
            style: {
                background: '#111827',
                borderColor: '#334155',
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                padding: spacing(20)
            },
            content: { text: 'Live Collaboration\nWork with your team in real-time.' }
        }),
        createNode({
            id: 'feature2',
            type: 'card',
            name: 'Feature Card 2',
            parentId: 'featuresGrid',
            frame: { x: 450, y: 0, width: 420, height: 280 },
            style: {
                background: '#111827',
                borderColor: '#334155',
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                padding: spacing(20)
            },
            content: { text: 'Responsive Preview\nDesktop, tablet, and mobile in one click.' }
        }),
        createNode({
            id: 'feature3',
            type: 'card',
            name: 'Feature Card 3',
            parentId: 'featuresGrid',
            frame: { x: 900, y: 0, width: 420, height: 280 },
            style: {
                background: '#111827',
                borderColor: '#334155',
                borderRadius: 14,
                boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                padding: spacing(20)
            },
            content: { text: 'Export Ready\nClean HTML + Tailwind + React output.' }
        }),
        createNode({
            id: 'footer',
            type: 'footer',
            name: 'Footer',
            parentId: 'root',
            frame: { x: 60, y: 1030, width: 1320, height: 86 },
            style: {
                background: '#0b1220',
                borderColor: '#1f2937',
                borderRadius: 12,
                padding: spacing(24),
                color: '#94a3b8'
            },
            content: { text: 'ArcFlow © 2026 - Built for modern teams' }
        })
    ];
    nodes.forEach((node) => {
        project.nodesById[node.id] = node;
        if (node.parentId) {
            project.nodesById[node.parentId]?.children.push(node.id);
        }
    });
    return polishTemplate(project, '#0a0f1a');
}
function buildPortfolioCreator() {
    const project = createProjectShell('Template - Portfolio Creator');
    const nodes = [
        createNode({
            id: 'nav',
            type: 'navbar',
            name: 'Portfolio Navbar',
            parentId: 'root',
            frame: { x: 80, y: 30, width: 1280, height: 64 },
            style: {
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing(18, 24)
            },
            content: { text: 'Nadya Studio   Work About Contact' }
        }),
        createNode({
            id: 'profile',
            type: 'section',
            name: '',
            parentId: 'root',
            frame: { x: 80, y: 124, width: 540, height: 420 },
            style: {
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#c7d2fe',
                borderOpacity: 90,
                borderRadius: 16,
                padding: spacing(28),
                boxShadow: '0 12px 28px rgba(30,41,59,0.14)'
            },
            content: { text: '' }
        }),
        createNode({
            id: 'avatar',
            type: 'image',
            name: 'Avatar',
            parentId: 'profile',
            frame: { x: 28, y: 28, width: 120, height: 120 },
            style: {
                borderRadius: 999,
                borderColor: '#818cf8',
                borderWidth: 2,
                padding: spacing(0)
            },
            content: {
                src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
                alt: 'Designer portrait'
            }
        }),
        createNode({
            id: 'introButton',
            type: 'button',
            name: 'Hire Me Button',
            parentId: 'profile',
            frame: { x: 28, y: 340, width: 160, height: 46 },
            style: {
                background: '#4f46e5',
                borderColor: '#6366f1',
                color: '#ffffff',
                fontWeight: 600,
                textAlign: 'center',
                borderRadius: 10
            },
            content: { text: 'Hire Me' }
        }),
        createNode({
            id: 'profileHeading',
            type: 'heading',
            name: 'Profile Heading',
            parentId: 'profile',
            frame: { x: 170, y: 42, width: 330, height: 56 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#111827',
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.15
            },
            content: { text: 'Hi, I am Nadya' }
        }),
        createNode({
            id: 'profileRole',
            type: 'paragraph',
            name: 'Profile Role',
            parentId: 'profile',
            frame: { x: 170, y: 104, width: 330, height: 54 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#475569',
                fontSize: 15,
                lineHeight: 1.35
            },
            content: { text: 'Product Designer & Frontend Developer' }
        }),
        createNode({
            id: 'projectsTitle',
            type: 'heading',
            name: 'Projects Title',
            parentId: 'root',
            frame: { x: 650, y: 124, width: 710, height: 56 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 32,
                fontWeight: 700,
                color: '#ffffff'
            },
            content: { text: 'Selected Projects' }
        }),
        createNode({
            id: 'projectsGrid',
            type: 'grid',
            name: 'Project Grid',
            parentId: 'root',
            frame: { x: 650, y: 196, width: 710, height: 540 },
            style: {
                display: 'grid',
                gridCols: 2,
                gap: 16,
                borderWidth: 0,
                background: 'transparent',
                padding: spacing(0)
            }
        }),
        createNode({
            id: 'project1',
            type: 'card',
            name: 'Project Card 1',
            parentId: 'projectsGrid',
            frame: { x: 0, y: 0, width: 347, height: 260 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 14,
                padding: spacing(18),
                color: '#1f2937'
            },
            content: { text: 'Fintech Dashboard\nUX + Frontend Implementation' }
        }),
        createNode({
            id: 'project2',
            type: 'card',
            name: 'Project Card 2',
            parentId: 'projectsGrid',
            frame: { x: 363, y: 0, width: 347, height: 260 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 14,
                padding: spacing(18),
                color: '#1f2937'
            },
            content: { text: 'Travel App\nDesign System + Prototyping' }
        }),
        createNode({
            id: 'project3',
            type: 'card',
            name: 'Project Card 3',
            parentId: 'projectsGrid',
            frame: { x: 0, y: 276, width: 347, height: 260 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 14,
                padding: spacing(18),
                color: '#1f2937'
            },
            content: { text: 'Healthcare Portal\nResearch-driven UI Redesign' }
        }),
        createNode({
            id: 'project4',
            type: 'card',
            name: 'Project Card 4',
            parentId: 'projectsGrid',
            frame: { x: 363, y: 276, width: 347, height: 260 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 14,
                padding: spacing(18),
                color: '#1f2937'
            },
            content: { text: 'E-learning Platform\nComponent Library + QA' }
        })
    ];
    nodes.forEach((node) => {
        project.nodesById[node.id] = node;
        if (node.parentId) {
            project.nodesById[node.parentId]?.children.push(node.id);
        }
    });
    return polishTemplate(project, '#f3f6fb');
}
function buildStorefrontShop() {
    const project = createProjectShell('Template - Storefront Shop');
    const nodes = [
        createNode({
            id: 'nav',
            type: 'navbar',
            name: 'Store Navbar',
            parentId: 'root',
            frame: { x: 56, y: 28, width: 1328, height: 70 },
            style: {
                background: '#ffffff',
                color: '#111827',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing(18, 24)
            },
            content: { text: 'NeonMart   New Arrivals Collections Cart' }
        }),
        createNode({
            id: 'hero',
            type: 'section',
            name: '',
            parentId: 'root',
            frame: { x: 56, y: 122, width: 1328, height: 300 },
            style: {
                background: '#ffffff',
                borderColor: '#93c5fd',
                borderOpacity: 100,
                borderRadius: 16,
                padding: spacing(32),
                color: '#0f172a'
            },
            content: { text: '' }
        }),
        createNode({
            id: 'heroTitle',
            type: 'heading',
            name: 'Hero Promo Title',
            parentId: 'hero',
            frame: { x: 30, y: 34, width: 640, height: 54 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#0f172a',
                fontSize: 34,
                fontWeight: 700
            },
            content: { text: 'Spring Sale Up to 40% Off' }
        }),
        createNode({
            id: 'heroSub',
            type: 'paragraph',
            name: 'Hero Promo Sub',
            parentId: 'hero',
            frame: { x: 30, y: 90, width: 480, height: 36 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#475569',
                fontSize: 15
            },
            content: { text: 'New drops available now.' }
        }),
        createNode({
            id: 'buyButton',
            type: 'button',
            name: 'Shop Now Button',
            parentId: 'hero',
            frame: { x: 32, y: 210, width: 150, height: 44 },
            style: {
                background: '#0891b2',
                borderColor: '#06b6d4',
                textAlign: 'center',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 10
            },
            content: { text: 'Shop Now' }
        }),
        createNode({
            id: 'productTitle',
            type: 'heading',
            name: 'Product Title',
            parentId: 'root',
            frame: { x: 56, y: 454, width: 1328, height: 56 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 34,
                fontWeight: 700,
                color: '#ffffff'
            },
            content: { text: 'Popular Products' }
        }),
        createNode({
            id: 'products',
            type: 'grid',
            name: 'Products Grid',
            parentId: 'root',
            frame: { x: 56, y: 524, width: 1328, height: 620 },
            style: {
                display: 'grid',
                gridCols: 4,
                gap: 14,
                borderWidth: 0,
                padding: spacing(0),
                background: 'transparent'
            }
        }),
        createNode({
            id: 'product1',
            type: 'card',
            name: 'Product Card 1',
            parentId: 'products',
            frame: { x: 0, y: 0, width: 321, height: 300 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                padding: spacing(16),
                color: '#1f2937'
            },
            content: { text: 'Urban Sneaker\n$129.00' }
        }),
        createNode({
            id: 'product2',
            type: 'card',
            name: 'Product Card 2',
            parentId: 'products',
            frame: { x: 336, y: 0, width: 321, height: 300 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                padding: spacing(16),
                color: '#1f2937'
            },
            content: { text: 'Everyday Backpack\n$89.00' }
        }),
        createNode({
            id: 'product3',
            type: 'card',
            name: 'Product Card 3',
            parentId: 'products',
            frame: { x: 672, y: 0, width: 321, height: 300 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                padding: spacing(16),
                color: '#1f2937'
            },
            content: { text: 'Noise-cancel Headset\n$179.00' }
        }),
        createNode({
            id: 'product4',
            type: 'card',
            name: 'Product Card 4',
            parentId: 'products',
            frame: { x: 1008, y: 0, width: 321, height: 300 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                padding: spacing(16),
                color: '#1f2937'
            },
            content: { text: 'Smart Watch\n$239.00' }
        }),
        createNode({
            id: 'footer',
            type: 'footer',
            name: 'Store Footer',
            parentId: 'root',
            frame: { x: 56, y: 1180, width: 1328, height: 84 },
            style: {
                background: '#ffffff',
                borderColor: '#dbe3f0',
                borderRadius: 12,
                padding: spacing(24),
                color: '#64748b'
            },
            content: { text: 'NeonMart © 2026 - Fast shipping worldwide' }
        })
    ];
    nodes.forEach((node) => {
        project.nodesById[node.id] = node;
        if (node.parentId) {
            project.nodesById[node.parentId]?.children.push(node.id);
        }
    });
    return polishTemplate(project, '#f8fafc');
}
function buildAuthLogin() {
    const project = createProjectShell('Template - Login Page');
    const nodes = [
        createNode({
            id: 'shell',
            type: 'section',
            name: 'Auth Shell',
            parentId: 'root',
            frame: { x: 220, y: 110, width: 1000, height: 620 },
            style: {
                background: '#0f172a',
                borderColor: '#334155',
                borderRadius: 20,
                borderStyle: 'solid',
                borderWidth: 1,
                boxShadow: '0 24px 48px rgba(2,6,23,0.45)',
                padding: spacing(0)
            }
        }),
        createNode({
            id: 'brandPanel',
            type: 'section',
            name: 'Brand Panel',
            parentId: 'shell',
            frame: { x: 0, y: 0, width: 430, height: 620 },
            style: {
                background: '#1e293b',
                backgroundOpacity: 95,
                color: '#e2e8f0',
                borderWidth: 0,
                borderRadius: 20,
                padding: spacing(40),
                boxShadow: 'inset -1px 0 0 rgba(148,163,184,0.25)'
            },
            content: { text: '' }
        }),
        createNode({
            id: 'brandBadge',
            type: 'badge',
            name: 'Brand Badge',
            parentId: 'brandPanel',
            frame: { x: 40, y: 44, width: 116, height: 34 },
            style: {
                background: '#0ea5e9',
                borderColor: '#38bdf8',
                color: '#082f49',
                fontWeight: 700,
                textAlign: 'center'
            },
            content: { text: 'ARC STUDIO' }
        }),
        createNode({
            id: 'brandHeading',
            type: 'heading',
            name: 'Brand Heading',
            parentId: 'brandPanel',
            frame: { x: 40, y: 106, width: 330, height: 68 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#f8fafc',
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.1
            },
            content: { text: 'Welcome Back' }
        }),
        createNode({
            id: 'brandSub',
            type: 'paragraph',
            name: 'Brand Subtext',
            parentId: 'brandPanel',
            frame: { x: 40, y: 180, width: 330, height: 60 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#cbd5e1',
                fontSize: 15,
                lineHeight: 1.35
            },
            content: { text: 'Manage your design workflow in one place.' }
        }),
        createNode({
            id: 'loginPanel',
            type: 'card',
            name: '',
            parentId: 'shell',
            frame: { x: 460, y: 70, width: 480, height: 480 },
            style: {
                background: '#111827',
                borderColor: '#334155',
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 16,
                padding: spacing(28),
                color: '#e5e7eb',
                boxShadow: '0 14px 30px rgba(2,6,23,0.35)'
            }
        }),
        createNode({
            id: 'loginTitle',
            type: 'heading',
            name: 'Login Title',
            parentId: 'loginPanel',
            frame: { x: 28, y: 28, width: 420, height: 52 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.15,
                color: '#f8fafc'
            },
            content: { text: 'Sign in to your account' }
        }),
        createNode({
            id: 'emailInput',
            type: 'input',
            name: 'Email Input',
            parentId: 'loginPanel',
            frame: { x: 28, y: 122, width: 424, height: 48 },
            style: {
                background: '#0b1220',
                borderColor: '#334155',
                borderRadius: 10,
                padding: spacing(12, 14),
                color: '#cbd5e1'
            },
            content: { label: 'Email', placeholder: 'you@company.com' }
        }),
        createNode({
            id: 'passwordInput',
            type: 'input',
            name: 'Password Input',
            parentId: 'loginPanel',
            frame: { x: 28, y: 186, width: 424, height: 48 },
            style: {
                background: '#0b1220',
                borderColor: '#334155',
                borderRadius: 10,
                padding: spacing(12, 14),
                color: '#cbd5e1'
            },
            content: { label: 'Password', placeholder: '••••••••' }
        }),
        createNode({
            id: 'rememberText',
            type: 'paragraph',
            name: 'Remember Text',
            parentId: 'loginPanel',
            frame: { x: 28, y: 248, width: 424, height: 30 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#94a3b8',
                fontSize: 13
            },
            content: { text: 'Remember me • Forgot password?' }
        }),
        createNode({
            id: 'loginButton',
            type: 'button',
            name: 'Login Button',
            parentId: 'loginPanel',
            frame: { x: 28, y: 300, width: 424, height: 48 },
            style: {
                background: '#2563eb',
                borderColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 700,
                boxShadow: '0 10px 20px rgba(37,99,235,0.35)'
            },
            content: { text: 'Sign In' }
        }),
        createNode({
            id: 'socialButton',
            type: 'button',
            name: 'Google Button',
            parentId: 'loginPanel',
            frame: { x: 28, y: 362, width: 424, height: 44 },
            style: {
                background: '#0b1220',
                borderColor: '#334155',
                color: '#cbd5e1',
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 600
            },
            content: { text: 'Continue with Google' }
        }),
        createNode({
            id: 'signupHint',
            type: 'paragraph',
            name: 'Signup Hint',
            parentId: 'loginPanel',
            frame: { x: 28, y: 420, width: 424, height: 30 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#94a3b8',
                textAlign: 'center',
                fontSize: 13
            },
            content: { text: "Don't have an account? Create one" }
        })
    ];
    nodes.forEach((node) => {
        project.nodesById[node.id] = node;
        if (node.parentId) {
            project.nodesById[node.parentId]?.children.push(node.id);
        }
    });
    return polishTemplate(project, '#0b1020');
}
function buildAuthRegister() {
    const project = createProjectShell('Template - Register Page');
    const nodes = [
        createNode({
            id: 'registerWrap',
            type: 'section',
            name: '',
            parentId: 'root',
            frame: { x: 240, y: 90, width: 960, height: 680 },
            style: {
                background: '#0f172a',
                borderColor: '#334155',
                borderRadius: 18,
                borderStyle: 'solid',
                borderWidth: 1,
                boxShadow: '0 24px 46px rgba(2,6,23,0.4)',
                padding: spacing(28)
            }
        }),
        createNode({
            id: 'registerTitle',
            type: 'heading',
            name: 'Register Title',
            parentId: 'registerWrap',
            frame: { x: 30, y: 24, width: 900, height: 56 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.1,
                color: '#f8fafc'
            },
            content: { text: 'Create your workspace account' }
        }),
        createNode({
            id: 'registerSubtitle',
            type: 'paragraph',
            name: 'Register Subtitle',
            parentId: 'registerWrap',
            frame: { x: 30, y: 88, width: 900, height: 42 },
            style: {
                background: 'transparent',
                borderWidth: 0,
                color: '#94a3b8',
                fontSize: 15,
                lineHeight: 1.35
            },
            content: { text: 'Start building, prototyping, and exporting production-ready layouts.' }
        }),
        createNode({
            id: 'formCard',
            type: 'card',
            name: 'Register Form Card',
            parentId: 'registerWrap',
            frame: { x: 30, y: 132, width: 900, height: 500 },
            style: {
                background: '#111827',
                borderColor: '#334155',
                borderRadius: 14,
                borderStyle: 'solid',
                borderWidth: 1,
                padding: spacing(24),
                boxShadow: '0 16px 30px rgba(2,6,23,0.3)'
            }
        }),
        createNode({
            id: 'nameInput',
            type: 'input',
            name: 'Full Name',
            parentId: 'formCard',
            frame: { x: 24, y: 24, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14) },
            content: { label: 'Full Name', placeholder: 'Jane Doe' }
        }),
        createNode({
            id: 'emailInputReg',
            type: 'input',
            name: 'Work Email',
            parentId: 'formCard',
            frame: { x: 466, y: 24, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14) },
            content: { label: 'Work Email', placeholder: 'jane@company.com' }
        }),
        createNode({
            id: 'passInputReg',
            type: 'input',
            name: 'Password',
            parentId: 'formCard',
            frame: { x: 24, y: 88, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14) },
            content: { label: 'Password', placeholder: 'Create password' }
        }),
        createNode({
            id: 'confirmInputReg',
            type: 'input',
            name: 'Confirm Password',
            parentId: 'formCard',
            frame: { x: 466, y: 88, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14) },
            content: { label: 'Confirm Password', placeholder: 'Repeat password' }
        }),
        createNode({
            id: 'companyInput',
            type: 'input',
            name: 'Company Name',
            parentId: 'formCard',
            frame: { x: 24, y: 152, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14) },
            content: { label: 'Company', placeholder: 'Acme Inc.' }
        }),
        createNode({
            id: 'roleSelect',
            type: 'select',
            name: 'Role Select',
            parentId: 'formCard',
            frame: { x: 466, y: 152, width: 410, height: 48 },
            style: { background: '#0b1220', borderColor: '#334155', borderRadius: 10, padding: spacing(12, 14), color: '#cbd5e1' },
            content: { options: ['Designer', 'Frontend Dev', 'Product Manager'] }
        }),
        createNode({
            id: 'termsText',
            type: 'paragraph',
            name: 'Terms Text',
            parentId: 'formCard',
            frame: { x: 24, y: 220, width: 852, height: 40 },
            style: { background: 'transparent', borderWidth: 0, color: '#94a3b8', fontSize: 13, lineHeight: 1.35 },
            content: { text: 'By creating an account, you agree to Terms & Privacy Policy.' }
        }),
        createNode({
            id: 'registerButton',
            type: 'button',
            name: 'Create Account Button',
            parentId: 'formCard',
            frame: { x: 24, y: 268, width: 852, height: 52 },
            style: {
                background: '#7c3aed',
                borderColor: '#8b5cf6',
                color: '#ffffff',
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 700,
                boxShadow: '0 12px 24px rgba(124,58,237,0.32)'
            },
            content: { text: 'Create Account' }
        }),
        createNode({
            id: 'signinHint',
            type: 'paragraph',
            name: 'Signin Hint',
            parentId: 'formCard',
            frame: { x: 24, y: 336, width: 852, height: 36 },
            style: { background: 'transparent', borderWidth: 0, color: '#94a3b8', textAlign: 'center', lineHeight: 1.35 },
            content: { text: 'Already have an account? Sign in' }
        })
    ];
    nodes.forEach((node) => {
        project.nodesById[node.id] = node;
        if (node.parentId) {
            project.nodesById[node.parentId]?.children.push(node.id);
        }
    });
    return polishTemplate(project, '#0a1020');
}
export function getTemplatePresets() {
    return presets;
}
export function buildProjectFromPreset(presetId) {
    if (presetId === 'saas-landing')
        return buildSaasLanding();
    if (presetId === 'portfolio-creator')
        return buildPortfolioCreator();
    if (presetId === 'storefront-shop')
        return buildStorefrontShop();
    if (presetId === 'auth-login')
        return buildAuthLogin();
    if (presetId === 'auth-register')
        return buildAuthRegister();
    return buildSaasLanding();
}
