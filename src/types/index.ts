export type UserRole = "student" | "counselor" | "admin";

export type Urgency = "low" | "medium" | "high" | "urgent";

export type CounselingRequestStatus = "pending" | "reviewed" | "approved" | "closed";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ResourceCategory = "stress" | "self-care" | "balance" | "support";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserRef = {
  id: number;
  name: string;
  email?: string;
  avatar?: string | null;
};

export type Paginated<T> = {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CounselingRequest = {
  id: number;
  user_id: number;
  category: string;
  description: string;
  urgency: Urgency;
  status: CounselingRequestStatus;
  created_at: string;
  updated_at: string;
  user?: UserRef;
};

export type Appointment = {
  id: number;
  request_id: number | null;
  counselor_id: number;
  student_id: number;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  counselor?: UserRef;
  student?: UserRef;
  request?: Pick<CounselingRequest, "id" | "category" | "status"> | null;
};

export type CounselingRecord = {
  id: number;
  appointment_id: number;
  counselor_id: number;
  student_id: number;
  session_notes: string;
  follow_up_notes: string | null;
  follow_up_date: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
  appointment?: Pick<Appointment, "id" | "scheduled_at" | "status"> | null;
  counselor?: UserRef;
  student?: UserRef;
};

export type WellnessResource = {
  id: number;
  title: string;
  content: string;
  category: ResourceCategory;
  author: string | null;
  is_published: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AppNotification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_type: string | null;
  related_id: number | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  appointment_id: number | null;
  content: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
  updated_at: string;
  sender?: UserRef;
  receiver?: UserRef;
};

export type Conversation = Message & {
  unread_count?: number;
  contact?: UserRef;
};

export type StudentDashboard = {
  upcoming_appointments: Appointment[];
  counseling_requests: CounselingRequest[];
  unread_notifications: number;
  recommended_resources: Pick<WellnessResource, "id" | "title" | "category" | "image_url">[];
};

export type CounselorDashboard = {
  upcoming_appointments: Appointment[];
  pending_requests: CounselingRequest[];
  total_appointments: number;
  total_records: number;
  unread_messages: number;
};

export type AdminDashboard = {
  total_users: number;
  total_counseling_requests: number;
  pending_counseling_requests: number;
  total_appointments: number;
  upcoming_appointments: number;
  total_wellness_resources: number;
};

export type DashboardData = StudentDashboard | CounselorDashboard | AdminDashboard;

export type AdminStats = {
  total_users: number;
  total_students: number;
  total_counselors: number;
  total_admins: number;
  total_counseling_requests: number;
  pending_counseling_requests: number;
  total_appointments: number;
  upcoming_appointments: number;
  total_counseling_records: number;
  total_wellness_resources: number;
  published_wellness_resources: number;
  total_messages: number;
};

export const URGENCIES: Urgency[] = ["low", "medium", "high", "urgent"];
export const RESOURCE_CATEGORIES: ResourceCategory[] = ["stress", "self-care", "balance", "support"];

export const REQUEST_STATUSES: CounselingRequestStatus[] = ["pending", "reviewed", "approved", "closed"];
export const APPOINTMENT_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];