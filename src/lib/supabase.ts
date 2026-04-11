import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

// Types matching our SQL schema
export interface Researcher {
  id: string;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  title_en: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  unit_role: 'head' | 'member' | 'advisor';
  position_th: string | null;
  position_en: string | null;
  department: string;
  faculty: string;
  university: string;
  campus: string;
  email: string | null;
  phone: string | null;
  orcid_id: string | null;
  scopus_id: string | null;
  google_scholar: string | null;
  website: string | null;
  expertise: string[];
  bio_th: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Publication {
  id: string;
  title: string;
  title_th: string | null;
  pub_type: string;
  status: string;
  journal_name: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  year: number;
  doi: string | null;
  authors_raw: string;
  scopus_indexed: boolean;
  wos_indexed: boolean;
  tci_indexed: boolean;
  impact_factor: number | null;
  quartile: string | null;
  keywords: string[] | null;
}

export interface Grant {
  id: string;
  title_th: string;
  title_en: string | null;
  contract_number: string | null;
  funding_agency: string;
  funding_agency_en: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  fiscal_year: number | null;
  status: string;
  research_areas: string[] | null;
  description_th: string | null;
}

export interface ResearchArea {
  id: string;
  name_th: string;
  name_en: string;
  sort_order: number;
}

export interface AcademicService {
  id: string;
  title_th: string;
  title_en: string | null;
  service_type: string;
  capacity: string | null;
  system_type: string | null;
  location: string | null;
}

export interface PublicationWithRole extends Publication {
  author_role: string;
  author_order: number;
  is_corresponding: boolean;
  role_display: string;
}

export interface Student {
  id: string;
  student_code: string | null;
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  title_en: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  degree_level: 'bachelor' | 'master' | 'doctoral';
  program_th: string | null;
  program_en: string | null;
  enrollment_year: number | null;
  graduation_year: number | null;
  status: 'active' | 'graduated' | 'withdrawn' | 'on_leave';
  email: string | null;
  phone: string | null;
  researcher_id: string | null;
  avatar_url: string | null;
}

export interface ProjectTopic {
  id: string;
  title_th: string;
  title_en: string | null;
  description_th: string | null;
  description_en: string | null;
  topic_level: 'bachelor' | 'master' | 'doctoral';
  max_students: number;
  advisor_id: string;
  co_advisor_id: string | null;
  research_area_id: string | null;
  academic_year: number | null;
  semester: number | null;
  max_semesters: number;
  required_skills: string[] | null;
  tags: string[] | null;
  status: 'open' | 'reserved' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ProjectGroup {
  id: string;
  topic_id: string;
  project_name_th: string | null;
  project_name_en: string | null;
  start_semester: number | null;
  start_year: number | null;
  expected_end_semester: number | null;
  expected_end_year: number | null;
  actual_end_date: string | null;
  status: 'forming' | 'approved' | 'in_progress' | 'presenting' | 'completed' | 'failed';
  grade: string | null;
  thesis_id: string | null;
}

export interface StudentMilestone {
  id: string;
  thesis_id: string | null;
  project_group_id: string | null;
  category: string;
  title: string;
  description: string | null;
  milestone_date: string;
  publication_id: string | null;
  news_id: string | null;
  is_verified: boolean;
}
