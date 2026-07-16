-- Migration: add needs_approval column to reviews
-- Run once in: Supabase Dashboard → SQL Editor → Run
--
-- Separates "pending admin approval" (auto-flagged) from "manually hidden" (admin action).
-- After this migration, the sidebar badge and Pending tab only show auto-flagged reviews.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS needs_approval BOOLEAN NOT NULL DEFAULT false;

-- Back-fill: any existing hidden review is assumed to be pending approval
UPDATE public.reviews SET needs_approval = true WHERE is_hidden = true;
