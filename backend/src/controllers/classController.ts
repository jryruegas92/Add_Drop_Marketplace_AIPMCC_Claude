import { Request, Response } from 'express';
import pool from '../config/database';
import { Class, EnrolledClass } from '../types';

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Class>(
      'SELECT * FROM classes ORDER BY code ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

export const getEnrolledClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await pool.query<Class>(
      `SELECT c.* FROM classes c
       JOIN enrolled_classes ec ON c.id = ec.class_id
       WHERE ec.user_id = $1
       ORDER BY c.code ASC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get enrolled classes error:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled classes' });
  }
};

export const enrollInClass = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { class_id } = req.body;

    if (!class_id) {
      res.status(400).json({ error: 'class_id is required' });
      return;
    }

    // Check if class exists
    const classCheck = await pool.query(
      'SELECT id FROM classes WHERE id = $1',
      [class_id]
    );

    if (classCheck.rows.length === 0) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    // Check if already enrolled
    const enrollmentCheck = await pool.query(
      'SELECT id FROM enrolled_classes WHERE user_id = $1 AND class_id = $2',
      [req.user.userId, class_id]
    );

    if (enrollmentCheck.rows.length > 0) {
      res.status(409).json({ error: 'Already enrolled in this class' });
      return;
    }

    // Enroll in class
    await pool.query(
      'INSERT INTO enrolled_classes (user_id, class_id) VALUES ($1, $2)',
      [req.user.userId, class_id]
    );

    // Return the class details
    const result = await pool.query<Class>(
      'SELECT * FROM classes WHERE id = $1',
      [class_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Enroll in class error:', error);
    res.status(500).json({ error: 'Failed to enroll in class' });
  }
};

export const unenrollFromClass = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { class_id } = req.params;

    const result = await pool.query(
      'DELETE FROM enrolled_classes WHERE user_id = $1 AND class_id = $2 RETURNING id',
      [req.user.userId, class_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    res.json({ message: 'Successfully unenrolled from class' });
  } catch (error) {
    console.error('Unenroll from class error:', error);
    res.status(500).json({ error: 'Failed to unenroll from class' });
  }
};
