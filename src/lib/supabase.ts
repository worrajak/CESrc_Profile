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
