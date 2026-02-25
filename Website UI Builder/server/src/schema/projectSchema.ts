import { z } from 'zod';

const spacingSchema = z.object({
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number()
});

const styleSchema = z.object({
  background: z.string(),
  backgroundOpacity: z.number().min(0).max(100),
  color: z.string(),
  textOpacity: z.number().min(0).max(100),
  borderColor: z.string(),
  borderOpacity: z.number().min(0).max(100),
  borderWidth: z.number(),
  borderStyle: z.enum(['solid', 'dashed', 'dotted']),
  borderRadius: z.number(),
  opacity: z.number().min(0).max(100),
  boxShadow: z.string(),
  padding: spacingSchema,
  margin: spacingSchema,
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.number(),
  letterSpacing: z.number(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']),
  textAlign: z.enum(['left', 'center', 'right']),
  lineHeight: z.number(),
  display: z.enum(['block', 'flex', 'grid']),
  flexDirection: z.enum(['row', 'column']),
  justifyContent: z.enum(['flex-start', 'center', 'flex-end', 'space-between']),
  alignItems: z.enum(['stretch', 'flex-start', 'center', 'flex-end']),
  gap: z.number(),
  gridCols: z.number()
});

const nodeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  type: z.string(),
  category: z.string(),
  name: z.string(),
  children: z.array(z.string()),
  frame: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
  style: styleSchema,
  content: z.record(z.any()),
  responsive: z.record(z.any())
});

export const builderProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  createdAt: z.string(),
  updatedAt: z.string(),
  rootNodeId: z.string(),
  nodesById: z.record(nodeSchema),
  settings: z.object({
    snapToGrid: z.boolean(),
    gridSize: z.number().min(2).max(64),
    showGuides: z.boolean(),
    canvasWidth: z.number().min(320),
    canvasHeight: z.number().min(320)
  })
});

export const createOrUpdateProjectSchema = z.object({
  name: z.string().min(1).max(120),
  project: builderProjectSchema
});
