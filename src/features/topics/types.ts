import type { Database } from "@/types/db";

export type TopicStatus = Database["public"]["Enums"]["topic_status"];
export type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];

export type Area = {
  id: string;
  slug: string;
  name: string;
  educator_id: string | null;
};

export type PropertyType = {
  id: string;
  slug: string;
  name: string;
};

export type PropertySubtype = {
  id: string;
  type_id: string;
  slug: string;
  name: string;
};

/** Educator as shown on topic cards — now sourced from the educators table */
export type EducatorPreview = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type TopicCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  youtube_id: string | null;
  status: TopicStatus;
  subarea: string | null;
  published_at: string | null;
  updated_at: string;
  area: Pick<Area, "id" | "slug" | "name"> | null;
  type: Pick<PropertyType, "id" | "slug" | "name"> | null;
  subtypes: Array<Pick<PropertySubtype, "id" | "slug" | "name">>;
  educator: EducatorPreview;
  saved: boolean;
};

export type TopicDetail = TopicCard & {
  resources: Array<{
    id: string;
    label: string;
    url: string | null;
    storage_path: string | null;
    kind: string;
  }>;
};

export type TopicFilters = {
  areaSlugs?: string[];
  typeSlugs?: string[];
  subtypeSlugs?: string[];
  subareaQuery?: string;
  q?: string;
};
