import { Request, Response } from 'express';
import pool from '../config/database';
import { Offer, OfferWithDetails, CreateOfferRequest, UpdateOfferStatusRequest, OfferStatus, PostStatus } from '../types';

export const getOffersForPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { post_id } = req.params;

    const result = await pool.query(`
      SELECT
        o.*,
        u.name as offerer_name,
        u.email as offerer_email,
        u.phone as offerer_phone,
        u.contact_visible
      FROM offers o
      JOIN users u ON o.offerer_id = u.id
      WHERE o.post_id = $1
      ORDER BY o.created_at DESC
    `, [post_id]);

    const offers: OfferWithDetails[] = await Promise.all(
      result.rows.map(async (row: any) => {
        // Fetch offered classes
        const classesResult = await pool.query(
          'SELECT * FROM classes WHERE id = ANY($1)',
          [row.offered_class_ids]
        );

        return {
          id: row.id,
          post_id: row.post_id,
          offerer_id: row.offerer_id,
          parent_offer_id: row.parent_offer_id,
          offered_class_ids: row.offered_class_ids,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          offerer_name: row.offerer_name,
          offerer_email: row.contact_visible || row.status === OfferStatus.ACCEPTED ? row.offerer_email : undefined,
          offerer_phone: row.contact_visible || row.status === OfferStatus.ACCEPTED ? row.offerer_phone : undefined,
          offered_classes: classesResult.rows
        };
      })
    );

    res.json(offers);
  } catch (error) {
    console.error('Get offers for post error:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

export const getMyOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get offers I made
    const madeResult = await pool.query(`
      SELECT
        o.*,
        u.name as offerer_name,
        u.email as offerer_email,
        u.phone as offerer_phone,
        p.id as post_id,
        p.post_type,
        p.status as post_status,
        pu.name as post_user_name,
        pu.email as post_user_email,
        pu.phone as post_user_phone,
        pu.contact_visible as post_contact_visible,
        cd.id as cd_id, cd.code as cd_code, cd.title as cd_title, cd.professor as cd_professor, cd.semester as cd_semester,
        cw.id as cw_id, cw.code as cw_code, cw.title as cw_title, cw.professor as cw_professor, cw.semester as cw_semester
      FROM offers o
      JOIN users u ON o.offerer_id = u.id
      JOIN posts p ON o.post_id = p.id
      JOIN users pu ON p.user_id = pu.id
      LEFT JOIN classes cd ON p.class_dropping_id = cd.id
      LEFT JOIN classes cw ON p.class_wanted_id = cw.id
      WHERE o.offerer_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.userId]);

    const madeOffers = await Promise.all(
      madeResult.rows.map(async (row: any) => {
        const classesResult = await pool.query(
          'SELECT * FROM classes WHERE id = ANY($1)',
          [row.offered_class_ids]
        );

        return {
          id: row.id,
          post_id: row.post_id,
          offerer_id: row.offerer_id,
          parent_offer_id: row.parent_offer_id,
          offered_class_ids: row.offered_class_ids,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          offerer_name: row.offerer_name,
          offerer_email: row.offerer_email,
          offerer_phone: row.offerer_phone,
          offered_classes: classesResult.rows,
          post: {
            id: row.post_id,
            user_id: row.user_id,
            post_type: row.post_type,
            class_dropping_id: row.class_dropping_id,
            class_wanted_id: row.class_wanted_id,
            notes: row.notes,
            timing: row.timing,
            status: row.post_status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user_name: row.post_user_name,
            user_email: row.post_contact_visible || row.status === OfferStatus.ACCEPTED ? row.post_user_email : undefined,
            user_phone: row.post_contact_visible || row.status === OfferStatus.ACCEPTED ? row.post_user_phone : undefined,
            class_dropping: row.cd_id ? {
              id: row.cd_id,
              code: row.cd_code,
              title: row.cd_title,
              professor: row.cd_professor,
              semester: row.cd_semester
            } : undefined,
            class_wanted: row.cw_id ? {
              id: row.cw_id,
              code: row.cw_code,
              title: row.cw_title,
              professor: row.cw_professor,
              semester: row.cw_semester
            } : undefined
          }
        };
      })
    );

    res.json({ made: madeOffers });
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

export const getReceivedOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get offers on my posts
    const receivedResult = await pool.query(`
      SELECT
        o.*,
        u.name as offerer_name,
        u.email as offerer_email,
        u.phone as offerer_phone,
        u.contact_visible,
        p.id as post_id,
        p.post_type,
        p.status as post_status,
        cd.id as cd_id, cd.code as cd_code, cd.title as cd_title, cd.professor as cd_professor, cd.semester as cd_semester,
        cw.id as cw_id, cw.code as cw_code, cw.title as cw_title, cw.professor as cw_professor, cw.semester as cw_semester
      FROM offers o
      JOIN users u ON o.offerer_id = u.id
      JOIN posts p ON o.post_id = p.id
      LEFT JOIN classes cd ON p.class_dropping_id = cd.id
      LEFT JOIN classes cw ON p.class_wanted_id = cw.id
      WHERE p.user_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.userId]);

    const receivedOffers = await Promise.all(
      receivedResult.rows.map(async (row: any) => {
        const classesResult = await pool.query(
          'SELECT * FROM classes WHERE id = ANY($1)',
          [row.offered_class_ids]
        );

        return {
          id: row.id,
          post_id: row.post_id,
          offerer_id: row.offerer_id,
          parent_offer_id: row.parent_offer_id,
          offered_class_ids: row.offered_class_ids,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          offerer_name: row.offerer_name,
          offerer_email: row.contact_visible || row.status === OfferStatus.ACCEPTED ? row.offerer_email : undefined,
          offerer_phone: row.contact_visible || row.status === OfferStatus.ACCEPTED ? row.offerer_phone : undefined,
          offered_classes: classesResult.rows,
          post: {
            id: row.post_id,
            post_type: row.post_type,
            status: row.post_status,
            class_dropping: row.cd_id ? {
              id: row.cd_id,
              code: row.cd_code,
              title: row.cd_title,
              professor: row.cd_professor,
              semester: row.cd_semester
            } : undefined,
            class_wanted: row.cw_id ? {
              id: row.cw_id,
              code: row.cw_code,
              title: row.cw_title,
              professor: row.cw_professor,
              semester: row.cw_semester
            } : undefined
          }
        };
      })
    );

    res.json({ received: receivedOffers });
  } catch (error) {
    console.error('Get received offers error:', error);
    res.status(500).json({ error: 'Failed to fetch received offers' });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { post_id, offered_class_ids, message, parent_offer_id }: CreateOfferRequest = req.body;

    // Validate post exists and is active
    const postResult = await pool.query(
      'SELECT user_id, status FROM posts WHERE id = $1',
      [post_id]
    );

    if (postResult.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = postResult.rows[0];

    // Can't make offers on your own posts
    if (post.user_id === req.user.userId) {
      res.status(400).json({ error: 'Cannot make offers on your own posts' });
      return;
    }

    // Validate offered classes belong to the user
    if (offered_class_ids && offered_class_ids.length > 0) {
      const enrolledResult = await pool.query(
        'SELECT class_id FROM enrolled_classes WHERE user_id = $1 AND class_id = ANY($2)',
        [req.user.userId, offered_class_ids]
      );

      if (enrolledResult.rows.length !== offered_class_ids.length) {
        res.status(400).json({ error: 'You can only offer classes you are enrolled in' });
        return;
      }
    }

    const status = parent_offer_id ? OfferStatus.COUNTERED : OfferStatus.PENDING;

    const result = await pool.query<Offer>(
      `INSERT INTO offers (post_id, offerer_id, parent_offer_id, offered_class_ids, message, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [post_id, req.user.userId, parent_offer_id || null, offered_class_ids || [], message || null, status]
    );

    // If this is a counter offer, update the parent offer status
    if (parent_offer_id) {
      await pool.query(
        'UPDATE offers SET status = $1 WHERE id = $2',
        [OfferStatus.COUNTERED, parent_offer_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
};

export const updateOfferStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status }: UpdateOfferStatusRequest = req.body;

    if (!Object.values(OfferStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get offer and post details
    const offerResult = await pool.query(`
      SELECT o.*, p.user_id as post_user_id
      FROM offers o
      JOIN posts p ON o.post_id = p.id
      WHERE o.id = $1
    `, [id]);

    if (offerResult.rows.length === 0) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    const offer = offerResult.rows[0];

    // Only the post owner can accept/reject offers
    if (offer.post_user_id !== req.user.userId) {
      res.status(403).json({ error: 'Only the post owner can update offer status' });
      return;
    }

    const result = await pool.query<Offer>(
      'UPDATE offers SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // If accepted, update post status to TRADE_AGREED and make contact info visible
    if (status === OfferStatus.ACCEPTED) {
      await pool.query(
        'UPDATE posts SET status = $1 WHERE id = $2',
        [PostStatus.TRADE_AGREED, offer.post_id]
      );

      // Make both users' contact info visible to each other
      await pool.query(
        'UPDATE users SET contact_visible = true WHERE id IN ($1, $2)',
        [offer.post_user_id, offer.offerer_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update offer status error:', error);
    res.status(500).json({ error: 'Failed to update offer status' });
  }
};
