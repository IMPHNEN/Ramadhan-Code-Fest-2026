import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { createOrUpdateProjectSchema } from '../schema/projectSchema';
import { projectService } from '../services/projectService';

export const projectRoutes = Router();

projectRoutes.get('/', async (_request, response, next) => {
  try {
    const projects = await projectService.list();
    response.json(projects);
  } catch (error) {
    next(error);
  }
});

projectRoutes.get('/:id', async (request, response, next) => {
  try {
    const project = await projectService.get(request.params.id);
    if (!project) {
      response.status(404).json({ message: 'Project not found' });
      return;
    }
    response.json(project);
  } catch (error) {
    next(error);
  }
});

projectRoutes.post('/', async (request, response, next) => {
  try {
    const parsed = createOrUpdateProjectSchema.parse(request.body);
    const id = parsed.project.id || randomUUID();
    const summary = await projectService.upsert(id, parsed.name, {
      ...parsed.project,
      id,
      name: parsed.name
    });
    response.status(201).json(summary);
  } catch (error) {
    next(error);
  }
});

projectRoutes.put('/:id', async (request, response, next) => {
  try {
    const parsed = createOrUpdateProjectSchema.parse(request.body);
    const id = request.params.id;
    const summary = await projectService.upsert(id, parsed.name, {
      ...parsed.project,
      id,
      name: parsed.name
    });
    response.json(summary);
  } catch (error) {
    next(error);
  }
});

projectRoutes.delete('/:id', async (request, response, next) => {
  try {
    const ok = await projectService.remove(request.params.id);
    if (!ok) {
      response.status(404).json({ message: 'Project not found' });
      return;
    }
    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
