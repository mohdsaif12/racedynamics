/**
 * How long a story stays up. Shared by the admin page (countdowns) and the
 * purge — kept apart from src/lib/admin/stories.ts because that file pulls in
 * server-only code a Client Component can't import. The public cut-off itself
 * lives in the RLS policy in supabase/migrations/0015_stories.sql; change
 * both together.
 */
export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

export type AdminStory = {
  id: string;
  imagePath: string;
  thumbPath: string | null;
  imageUrl: string;
  createdAt: string;
};
