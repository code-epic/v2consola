/**
 * Interface for GitHub Issues
 * Defines the structure of processed GitHub issues
 */
export interface Issue {
  // Core fields
  id: number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed';
  
  // Priority and type
  priority: 'high' | 'medium' | 'low';
  tipo: string;
  
  // Assignment
  assignee: string | null;
  assignee_avatar: string;
  author: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Metadata
  labels: string[];
  comments: number;
  milestone: string | null;
  
  // Legacy fields for compatibility
  body: string;
  user: { login: string };
}

/**
 * Raw issue data structure from API/WebSocket
 */
export interface RawIssue {
  id?: number;
  title?: string;
  description?: string;
  state?: string;
  priority?: string;
  tipo?: string;
  assignee?: string;
  assignee_avatar?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
  labels?: string[];
  comments?: number;
  milestone?: string;
  body?: string;
  [key: string]: any; // Allow additional properties
}
