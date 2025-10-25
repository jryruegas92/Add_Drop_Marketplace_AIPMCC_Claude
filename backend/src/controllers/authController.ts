import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { RegisterRequest, LoginRequest, AuthResponse, UserResponse, User } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, graduation_year, program_type, phone }: RegisterRequest = req.body;

    // Validate email domain
    const validDomains = ['@haas.berkeley.edu', '@berkeley.edu'];
    const isValidEmail = validDomains.some(domain => email.toLowerCase().endsWith(domain));

    if (!isValidEmail) {
      res.status(400).json({
        error: 'Email must be a valid Haas or Berkeley email address (@haas.berkeley.edu or @berkeley.edu)'
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name, graduation_year, program_type, phone, contact_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, graduation_year, program_type, phone, contact_visible`,
      [email.toLowerCase(), password_hash, name, graduation_year || null, program_type || null, phone || null, false]
    );

    const user = result.rows[0];

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      graduation_year: user.graduation_year,
      program_type: user.program_type,
      phone: user.phone,
      contact_visible: user.contact_visible
    };

    const response: AuthResponse = {
      user: userResponse,
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      graduation_year: user.graduation_year,
      program_type: user.program_type,
      phone: user.phone,
      contact_visible: user.contact_visible
    };

    const response: AuthResponse = {
      user: userResponse,
      token
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await pool.query<User>(
      'SELECT id, email, name, graduation_year, program_type, phone, contact_visible FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      graduation_year: user.graduation_year,
      program_type: user.program_type,
      phone: user.phone,
      contact_visible: user.contact_visible
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, graduation_year, program_type, phone, contact_visible } = req.body;

    const result = await pool.query<User>(
      `UPDATE users
       SET name = COALESCE($1, name),
           graduation_year = COALESCE($2, graduation_year),
           program_type = COALESCE($3, program_type),
           phone = COALESCE($4, phone),
           contact_visible = COALESCE($5, contact_visible)
       WHERE id = $6
       RETURNING id, email, name, graduation_year, program_type, phone, contact_visible`,
      [name, graduation_year, program_type, phone, contact_visible, req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      graduation_year: user.graduation_year,
      program_type: user.program_type,
      phone: user.phone,
      contact_visible: user.contact_visible
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
