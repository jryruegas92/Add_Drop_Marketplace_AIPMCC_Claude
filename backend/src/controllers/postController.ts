import { Request, Response } from 'express';
import pool from '../config/database';
import { Post, PostWithDetails, CreatePostRequest, PostType, PostStatus } from '../types';

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { post_type, class_id, status } = req.query;

    let query = `
      SELECT
        p.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.contact_visible,
        cd.id as cd_id, cd.code as cd_code, cd.title as cd_title, cd.professor as cd_professor, cd.semester as cd_semester,
        cw.id as cw_id, cw.code as cw_code, cw.title as cw_title, cw.professor as cw_professor, cw.semester as cw_semester,
        (SELECT COUNT(*) FROM offers WHERE post_id = p.id) as offer_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN classes cd ON p.class_dropping_id = cd.id
      LEFT JOIN classes cw ON p.class_wanted_id = cw.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (post_type) {
      query += ` AND p.post_type = $${paramIndex}`;
      params.push(post_type);
      paramIndex++;
    }

    if (class_id) {
      query += ` AND (p.class_dropping_id = $${paramIndex} OR p.class_wanted_id = $${paramIndex})`;
      params.push(class_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    } else {
      // Default to active posts only
      query += ` AND p.status = 'ACTIVE'`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);

    const posts: PostWithDetails[] = result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      post_type: row.post_type,
      class_dropping_id: row.class_dropping_id,
      class_wanted_id: row.class_wanted_id,
      notes: row.notes,
      timing: row.timing,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_name: row.user_name,
      user_email: row.contact_visible ? row.user_email : undefined,
      user_phone: row.contact_visible ? row.user_phone : undefined,
      class_dropping: row.cd_id ? {
        id: row.cd_id,
        code: row.cd_code,
        title: row.cd_title,
        professor: row.cd_professor,
        semester: row.cd_semester,
        created_at: row.cd_created_at
      } : undefined,
      class_wanted: row.cw_id ? {
        id: row.cw_id,
        code: row.cw_code,
        title: row.cw_title,
        professor: row.cw_professor,
        semester: row.cw_semester,
        created_at: row.cw_created_at
      } : undefined,
      offer_count: parseInt(row.offer_count) || 0
    }));

    res.json(posts);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        p.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.contact_visible,
        cd.id as cd_id, cd.code as cd_code, cd.title as cd_title, cd.professor as cd_professor, cd.semester as cd_semester,
        cw.id as cw_id, cw.code as cw_code, cw.title as cw_title, cw.professor as cw_professor, cw.semester as cw_semester,
        (SELECT COUNT(*) FROM offers WHERE post_id = p.id) as offer_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN classes cd ON p.class_dropping_id = cd.id
      LEFT JOIN classes cw ON p.class_wanted_id = cw.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const row = result.rows[0];
    const post: PostWithDetails = {
      id: row.id,
      user_id: row.user_id,
      post_type: row.post_type,
      class_dropping_id: row.class_dropping_id,
      class_wanted_id: row.class_wanted_id,
      notes: row.notes,
      timing: row.timing,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_name: row.user_name,
      user_email: row.contact_visible || (req.user && req.user.userId === row.user_id) ? row.user_email : undefined,
      user_phone: row.contact_visible || (req.user && req.user.userId === row.user_id) ? row.user_phone : undefined,
      class_dropping: row.cd_id ? {
        id: row.cd_id,
        code: row.cd_code,
        title: row.cd_title,
        professor: row.cd_professor,
        semester: row.cd_semester,
        created_at: row.cd_created_at
      } : undefined,
      class_wanted: row.cw_id ? {
        id: row.cw_id,
        code: row.cw_code,
        title: row.cw_title,
        professor: row.cw_professor,
        semester: row.cw_semester,
        created_at: row.cw_created_at
      } : undefined,
      offer_count: parseInt(row.offer_count) || 0
    };

    res.json(post);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await pool.query(`
      SELECT
        p.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        cd.id as cd_id, cd.code as cd_code, cd.title as cd_title, cd.professor as cd_professor, cd.semester as cd_semester,
        cw.id as cw_id, cw.code as cw_code, cw.title as cw_title, cw.professor as cw_professor, cw.semester as cw_semester,
        (SELECT COUNT(*) FROM offers WHERE post_id = p.id) as offer_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN classes cd ON p.class_dropping_id = cd.id
      LEFT JOIN classes cw ON p.class_wanted_id = cw.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.userId]);

    const posts: PostWithDetails[] = result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      post_type: row.post_type,
      class_dropping_id: row.class_dropping_id,
      class_wanted_id: row.class_wanted_id,
      notes: row.notes,
      timing: row.timing,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_name: row.user_name,
      user_email: row.user_email,
      user_phone: row.user_phone,
      class_dropping: row.cd_id ? {
        id: row.cd_id,
        code: row.cd_code,
        title: row.cd_title,
        professor: row.cd_professor,
        semester: row.cd_semester,
        created_at: row.cd_created_at
      } : undefined,
      class_wanted: row.cw_id ? {
        id: row.cw_id,
        code: row.cw_code,
        title: row.cw_title,
        professor: row.cw_professor,
        semester: row.cw_semester,
        created_at: row.cw_created_at
      } : undefined,
      offer_count: parseInt(row.offer_count) || 0
    }));

    res.json(posts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { post_type, class_dropping_id, class_wanted_id, notes, timing }: CreatePostRequest = req.body;

    // Validate post type
    if (!Object.values(PostType).includes(post_type)) {
      res.status(400).json({ error: 'Invalid post type' });
      return;
    }

    // Validate required fields based on post type
    if (post_type === PostType.DROPPING_OPEN && !class_dropping_id) {
      res.status(400).json({ error: 'class_dropping_id is required for DROPPING_OPEN posts' });
      return;
    }

    if (post_type === PostType.DROPPING_TARGETED && (!class_dropping_id || !class_wanted_id)) {
      res.status(400).json({ error: 'Both class_dropping_id and class_wanted_id are required for DROPPING_TARGETED posts' });
      return;
    }

    if (post_type === PostType.LOOKING_FOR && !class_wanted_id) {
      res.status(400).json({ error: 'class_wanted_id is required for LOOKING_FOR posts' });
      return;
    }

    const result = await pool.query<Post>(
      `INSERT INTO posts (user_id, post_type, class_dropping_id, class_wanted_id, notes, timing, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.userId, post_type, class_dropping_id || null, class_wanted_id || null, notes || null, timing || null, PostStatus.ACTIVE]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const updatePostStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(PostStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const result = await pool.query<Post>(
      `UPDATE posts SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found or you do not have permission to update it' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({ error: 'Failed to update post status' });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found or you do not have permission to delete it' });
      return;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
