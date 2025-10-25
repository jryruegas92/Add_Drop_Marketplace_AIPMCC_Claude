export enum ProgramType {
  MBA = 'MBA',
  EWMBA = 'EWMBA',
  FTMBA = 'FTMBA',
  BCMBA = 'BCMBA',
  MFE = 'MFE',
  MIDS = 'MIDS',
  MENG = 'MENG',
  OTHER = 'OTHER'
}

export enum PostType {
  DROPPING_OPEN = 'DROPPING_OPEN',
  DROPPING_TARGETED = 'DROPPING_TARGETED',
  LOOKING_FOR = 'LOOKING_FOR'
}

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  TRADE_AGREED = 'TRADE_AGREED',
  CLOSED = 'CLOSED'
}

export enum OfferStatus {
  PENDING = 'PENDING',
  COUNTERED = 'COUNTERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: number;
  email: string;
  name: string;
  graduation_year?: number;
  program_type?: ProgramType;
  phone?: string;
  contact_visible: boolean;
}

export interface Class {
  id: number;
  code: string;
  title: string;
  professor?: string;
  semester: string;
  created_at?: Date;
}

export interface Post {
  id: number;
  user_id: number;
  post_type: PostType;
  class_dropping_id?: number;
  class_wanted_id?: number;
  notes?: string;
  timing?: string;
  status: PostStatus;
  created_at: Date;
  updated_at: Date;
  user_name: string;
  user_email?: string;
  user_phone?: string;
  class_dropping?: Class;
  class_wanted?: Class;
  offer_count?: number;
}

export interface Offer {
  id: number;
  post_id: number;
  offerer_id: number;
  parent_offer_id?: number;
  offered_class_ids: number[];
  message?: string;
  status: OfferStatus;
  created_at: Date;
  updated_at: Date;
  offerer_name: string;
  offerer_email?: string;
  offerer_phone?: string;
  offered_classes: Class[];
  post?: Post;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  graduation_year?: number;
  program_type?: ProgramType;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  post_type: PostType;
  class_dropping_id?: number;
  class_wanted_id?: number;
  notes?: string;
  timing?: string;
}

export interface CreateOfferRequest {
  post_id: number;
  offered_class_ids: number[];
  message?: string;
  parent_offer_id?: number;
}
