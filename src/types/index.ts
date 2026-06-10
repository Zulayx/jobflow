export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Application {
  id: string;
  userId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  jobUrl?: string | null;
  location?: string | null;
  salary?: string | null;
  notes?: string | null;
  tags?: string | null;
  createdAt: Date;
  updatedAt: Date;
  timeline?: TimelineEntry[];
}

export interface TimelineEntry {
  id: string;
  applicationId: string;
  status: string;
  note?: string | null;
  createdAt: Date;
}

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted";

export interface Resume {
  id: string;
  userId: string;
  fileName?: string | null;
  filePath?: string | null;
  data?: string | null;
  hasTextContent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
}

export interface AIRequest {
  jobDescription: string;
  resumeData?: string;
  companyName?: string;
  position?: string;
  provider: "opencodeZen" | "nvidia";
  apiKey: string;
}

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}