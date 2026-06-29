import { Router } from 'express';
import { authController } from './auth.controller';
import { taskController } from './task.controller';
import { projectController } from './project.controller';

const authRouter = Router();
authRouter.post('/register', (req, res, next) => authController.register(req, res, next));
authRouter.post('/login', (req, res, next) => authController.login(req, res, next));
authRouter.get('/profile', (req, res) => authController.getProfile(req, res));

const taskRouter = Router();
taskRouter.get('/', (req, res) => taskController.list(req, res));
taskRouter.get('/:id', (req, res, next) => taskController.get(req, res, next));
taskRouter.post('/', (req, res, next) => taskController.create(req, res, next));
taskRouter.put('/:id', (req, res, next) => taskController.update(req, res, next));
taskRouter.delete('/:id', (req, res, next) => taskController.delete(req, res, next));
taskRouter.get('/metrics/:projectId', (req, res) => taskController.metrics(req, res));

const projectRouter = Router();
projectRouter.get('/', (req, res) => projectController.list(req, res));
projectRouter.get('/:id', (req, res) => projectController.get(req, res));
projectRouter.post('/', (req, res, next) => projectController.create(req, res, next));
projectRouter.put('/:id', (req, res) => projectController.update(req, res));
projectRouter.post('/:id/archive', (req, res) => projectController.archive(req, res));

export { authRouter, taskRouter, projectRouter };
