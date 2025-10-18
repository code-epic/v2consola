/**
 * Application Interface - Strong typing for GitHub applications
 * Professional interface for application data management
 */

export interface Application {
  id: number | string;
  name: string;
  description: string;
  owner: string;
  repository: string;
  language: string;
  stars: number;
  forks: number;
  issues_count: number;
  pull_requests: number;
  last_updated: string;
  created_at: string;
  status: 'active' | 'inactive' | 'archived';
  visibility: 'public' | 'private';
  topics: string[];
  homepage?: string;
  license?: string;
  size: number;
  default_branch: string;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
}

/**
 * Raw Application Interface - For incoming data transformation
 * Handles various data formats from different sources
 */
export interface RawApplication {
  id?: number | string;
  name?: string;
  description?: string;
  owner?: string;
  repository?: string;
  language?: string;
  stars?: number;
  forks?: number;
  issues_count?: number;
  pull_requests?: number;
  last_updated?: string;
  created_at?: string;
  status?: string;
  visibility?: string;
  topics?: string[];
  homepage?: string;
  license?: string;
  size?: number;
  default_branch?: string;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  
  // Legacy/alternative field names for compatibility
  full_name?: string;
  html_url?: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  updated_at?: string;
  pushed_at?: string;
  private?: boolean;
}
