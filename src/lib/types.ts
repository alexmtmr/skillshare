/* ============================================
   SKILLSHARE — TypeScript Types (mirrors DB schema)
   ============================================ */

export type UserRole = "seeker" | "giver" | "both";

export type PostCategory =
  | "plumbing"
  | "electrical"
  | "appliances"
  | "heating"
  | "general";

export type Urgency = "low" | "medium" | "high";

export type PostStatus = "open" | "matched" | "completed" | "closed";

export type TimeSlotStatus = "available" | "booked";

export type SessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TransactionType =
  | "earn"
  | "spend"
  | "purchase"
  | "penalty"
  | "refund";

export type ConnectionRequestStatus = "pending" | "accepted" | "declined";

export type NotificationType =
  | "connection_request"
  | "request_accepted"
  | "request_declined"
  | "session_confirmed"
  | "session_cancelled"
  | "session_reminder"
  | "rating_received"
  | "credits_earned"
  | "credits_purchased";

/* --- Database Row Types --- */

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  skills: PostCategory[];
  rating_avg: number;
  credits_balance: number;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
}

export interface ConnectionRequest {
  id: string;
  post_id: string;
  giver_id: string;
  timeslot_id: string;
  message: string | null;
  status: ConnectionRequestStatus;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: PostCategory;
  urgency: Urgency;
  images: string[];
  status: PostStatus;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  post_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: TimeSlotStatus;
}

export interface Session {
  id: string;
  post_id: string;
  seeker_id: string;
  giver_id: string;
  timeslot_id: string;
  status: SessionStatus;
  max_duration: number;
  started_at: string | null;
  ended_at: string | null;
}

export interface Rating {
  id: string;
  session_id: string;
  rater_id: string;
  rated_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}
