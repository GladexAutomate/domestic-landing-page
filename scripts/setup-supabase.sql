-- ============================================================
-- Gladex Admin — One-time Supabase setup
-- Paste this in: Supabase Dashboard → SQL Editor → Run
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================


-- ── 1. reviews table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  gdx_reference  text,
  lead_name      text    NOT NULL,
  agent_name     text,
  destination    text,
  rating         integer CHECK (rating BETWEEN 1 AND 5),
  comment        text,
  photos         text[],
  is_hidden      boolean NOT NULL DEFAULT true,
  package_name   text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved (non-hidden) reviews
CREATE POLICY IF NOT EXISTS "public_read_approved_reviews"
  ON public.reviews FOR SELECT
  USING (is_hidden = false);

-- Service role (edge functions, admin) can do everything
CREATE POLICY IF NOT EXISTS "service_role_all_reviews"
  ON public.reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon can insert new reviews (client submissions)
CREATE POLICY IF NOT EXISTS "anon_insert_reviews"
  ON public.reviews FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon can read all reviews (admin needs to see hidden ones too via anon key)
CREATE POLICY IF NOT EXISTS "anon_read_all_reviews"
  ON public.reviews FOR SELECT
  TO anon
  USING (true);

-- Anon can update (hide/unhide) and delete — admin panel uses anon key
CREATE POLICY IF NOT EXISTS "anon_update_reviews"
  ON public.reviews FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_delete_reviews"
  ON public.reviews FOR DELETE
  TO anon
  USING (true);


-- ── 2. vouchers table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vouchers (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  gdx          text    NOT NULL,
  file_name    text    NOT NULL,
  file_url     text    NOT NULL,
  storage_path text    NOT NULL,
  file_type    text,
  file_size    bigint,
  uploaded_by  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vouchers_gdx_idx ON public.vouchers (gdx);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Anyone (client, admin) can read vouchers
CREATE POLICY IF NOT EXISTS "public_read_vouchers"
  ON public.vouchers FOR SELECT
  USING (true);

-- Anon can insert/delete (admin panel uses anon key with VITE_SUPABASE_ANON_KEY)
CREATE POLICY IF NOT EXISTS "anon_insert_vouchers"
  ON public.vouchers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_delete_vouchers"
  ON public.vouchers FOR DELETE
  TO anon
  USING (true);


-- ── 3. vouchers storage bucket ───────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('vouchers', 'vouchers', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read files in the vouchers bucket (clients download their vouchers)
CREATE POLICY IF NOT EXISTS "public_read_vouchers_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vouchers');

-- Anon can upload and delete voucher files
CREATE POLICY IF NOT EXISTS "anon_upload_vouchers_storage"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'vouchers');

CREATE POLICY IF NOT EXISTS "anon_delete_vouchers_storage"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'vouchers');


-- ── 4. review-photos storage bucket ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "public_read_review_photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

CREATE POLICY IF NOT EXISTS "anon_upload_review_photos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'review-photos');


-- ── 5. fusioo_booking_transactions ───────────────────────────
-- (already exists with 124 rows — this is a no-op if already created)
CREATE TABLE IF NOT EXISTS public.fusioo_booking_transactions (
  id         text PRIMARY KEY,
  data       jsonb,
  synced_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fusioo_booking_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "anon_read_fusioo_bookings"
  ON public.fusioo_booking_transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "service_role_all_fusioo_bookings"
  ON public.fusioo_booking_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── 6. fusioo detail tables (needed when sync-fusioo runs) ───
CREATE TABLE IF NOT EXISTS public.fusioo_hotel_details (
  id        text PRIMARY KEY,
  data      jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fusioo_hotel_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon_read_fusioo_hotel"   ON public.fusioo_hotel_details   FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "service_all_fusioo_hotel" ON public.fusioo_hotel_details   FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.fusioo_tour_details (
  id        text PRIMARY KEY,
  data      jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fusioo_tour_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon_read_fusioo_tour"   ON public.fusioo_tour_details   FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "service_all_fusioo_tour" ON public.fusioo_tour_details   FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.fusioo_ticket_details (
  id        text PRIMARY KEY,
  data      jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fusioo_ticket_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon_read_fusioo_ticket"   ON public.fusioo_ticket_details   FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "service_all_fusioo_ticket" ON public.fusioo_ticket_details   FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.fusioo_transfer_details (
  id        text PRIMARY KEY,
  data      jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fusioo_transfer_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon_read_fusioo_transfer"   ON public.fusioo_transfer_details   FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "service_all_fusioo_transfer" ON public.fusioo_transfer_details   FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── Done ─────────────────────────────────────────────────────
-- Verify with:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--   SELECT id, name, public FROM storage.buckets;
