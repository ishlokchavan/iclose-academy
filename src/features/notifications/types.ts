export type NotificationType =
  | "inquiry_submitted"
  | "inquiry_assigned"
  | "inquiry_status_changed"
  | "topic_in_review"
  | "topic_published"
  | "topic_archived"
  | "new_user_registered"
  | "role_changed"

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationType
  title: string
  body: string
  entity_type: string | null
  entity_id: string | null
  entity_url: string | null
  read_at: string | null
  created_at: string
}
