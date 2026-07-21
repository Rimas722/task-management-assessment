import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!title || !priority || !status || !dueDate) {
      res.status(400).json({ message: 'Title, priority, status, and due date are required.' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const parsedDueDate = new Date(dueDate);

    if (parsedDueDate < today) {
      res.status(400).json({ message: 'Due date cannot be earlier than today.' });
      return;
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority,
        status,
        dueDate: parsedDueDate,
        userId,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error while creating task.' });
  }
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { search, status, priority, sortBy } = req.query;

    const whereClause: any = { userId };

    if (search && typeof search === 'string') {
      whereClause.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status && typeof status === 'string' && status !== 'All') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'All') {
      whereClause.priority = priority;
    }

    let orderByClause: any = { createdAt: 'desc' }; 

    if (sortBy === 'oldest') {
      orderByClause = { createdAt: 'asc' };
    } else if (sortBy === 'dueDate') {
      orderByClause = { dueDate: 'asc' };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Internal server error while fetching tasks.' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Fetch single task error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    const { title, description, priority, status, dueDate } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found or unauthorized.' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        priority: priority !== undefined ? priority : existingTask.priority,
        status: status !== undefined ? status : existingTask.status,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
      },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error while updating task.' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found or unauthorized.' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error while deleting task.' });
  }
});

export default router;