import type { Database } from "@/types/db";

export type TrackRow = Database["public"]["Tables"]["tracks"]["Row"];
export type SpecialtyRow = Database["public"]["Tables"]["specialties"]["Row"];
export type TrackLevelRow = Database["public"]["Tables"]["track_levels"]["Row"];
export type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
export type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"];
export type ProgressRow = Database["public"]["Tables"]["progress"]["Row"];
export type LessonResourceRow = Database["public"]["Tables"]["lesson_resources"]["Row"];

export type Chapter = { t: number; label: string };

export type EducatorPreview = {
  full_name: string | null;
  avatar_url: string | null;
};

export type SpecialtyPreview = Pick<SpecialtyRow, "id" | "slug" | "name">;
export type LevelPreview = Pick<TrackLevelRow, "id" | "slug" | "name">;
export type EnrollmentPreview = { id: string; status: string };

export type TrackCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  cover_url: string | null;
  duration_minutes: number | null;
  specialty: SpecialtyPreview | null;
  level: LevelPreview | null;
  educator: EducatorPreview | null;
  enrollment: EnrollmentPreview | null;
  saved: boolean;
  lessonCount: number;
};

export type LessonPreview = Pick<
  LessonRow,
  | "id"
  | "position"
  | "title"
  | "summary"
  | "duration_seconds"
  | "is_preview"
  | "youtube_id"
  | "module_id"
>;

export type ModuleWithLessons = ModuleRow & {
  lessons: LessonPreview[];
};

export type TrackWithContent = TrackCardData & {
  description: string | null;
  outcomes: string[];
  prerequisites: string[];
  modules: ModuleWithLessons[];
};

export type ModuleRailItem = {
  module: Pick<ModuleRow, "id" | "position" | "title">;
  lessons: Array<
    Pick<LessonRow, "id" | "position" | "title" | "duration_seconds" | "is_preview">
  >;
};

export type LessonContext = {
  lesson: LessonRow & { resources: LessonResourceRow[] };
  module: ModuleRow;
  track: Pick<TrackRow, "id" | "slug" | "title">;
  moduleRail: ModuleRailItem[];
  progress: ProgressRow | null;
  enrollment: EnrollmentPreview | null;
};
