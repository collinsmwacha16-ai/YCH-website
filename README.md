# Youth Career Hub (YCH): website, CMS and admin dashboard

Next.js 16 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Vercel · Resend (email).
Versions are pinned in `package-lock.json` (Next 16.4.2, React 19.3.1, Supabase JS 2.118, @supabase/ssr 0.12.7, Zod 4.6, Sharp 0.35).

**What it is:** a public site (Home, About, Events & Activities + detail pages, Mission, Programmes & Projects + detail pages,
Resources & Opportunities + detail pages, Contact, Privacy, 404) plus a protected `/admin` where YCH staff manage everything
without coding: events and photo galleries, programmes, opportunities, team, logo/hero photos, page text, contact enquiries.

## 1. Run it locally
```bash
npm install
cp .env.example .env.local      # fill in the values (steps below)
npm run dev                      # http://localhost:3000
npm test                         # 20 automated tests
npm run typecheck && npm run build
```
Without any `.env` the site still runs: public pages show honest empty states, the contact form says it is *not connected*, and `/admin` explains Supabase is missing.

## 2. Connect Supabase (database, login, photo storage)
1. Create a free project at https://supabase.com. Note **Project URL**, **anon key**, **service_role key** (Project Settings → API).
2. SQL Editor → run, in order: `supabase/migrations/0001_schema.sql` then `0002_storage.sql`.
   (Optional) run `supabase/seed.sql`. It loads the six programme areas from the original website as **drafts**; nothing becomes public until you press Publish.
3. Authentication → Providers → Email: keep enabled. **Disable "Allow new users to sign up"** (Authentication → Sign In / Providers) so only people you invite can ever have an account. Even if someone did sign up they would not be an admin (see below).
4. Put the three values in `.env.local` (and in Vercel). The service-role key is **server only**: never prefix it with `NEXT_PUBLIC_`, never commit it.

## 3. Create the first administrator (securely)
1. Supabase → Authentication → Users → **Add user** → enter the admin's email + a strong password (tick "Auto confirm").
2. SQL Editor, run once (replace the email):
```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'admin@yourdomain.org');
```
3. Sign in at `/admin/login`. Admin rights exist **only** in the database; no one can grant them from the website. Add more admins the same way.

## 4. Contact form delivery
Enquiries are validated on the server, protected by a honeypot, a minimum-fill-time check and a per-visitor limit (5/hour, by hashed IP),
saved in `enquiries` (visible in `/admin/enquiries`) and, if configured, emailed through Resend. The visitor sees "received" **only** if the
enquiry was actually saved or emailed. Configure: `SUPABASE_SERVICE_ROLE_KEY` (storage), and `RESEND_API_KEY` + `CONTACT_TO_EMAIL` + `CONTACT_FROM_EMAIL`
(email; verify a sending domain at resend.com for production; `onboarding@resend.dev` only works for testing). Set `IP_HASH_SALT` to a long random string.

## 5. Deploy to Vercel
1. Push this folder to GitHub (see §7). 2. https://vercel.com → Add New Project → import the repo (framework: Next.js, defaults are right).
3. Settings → Environment Variables: add everything from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your final https address). 4. Deploy.
5. **Custom domain:** Project → Settings → Domains → add `yourdomain.org` and follow the DNS records Vercel shows at your registrar. Then update `NEXT_PUBLIC_SITE_URL` and redeploy.
6. Production check: open `/admin/login`, sign in, publish a test event with a photo, view it publicly, then delete it.

## 6. Security model (how access is enforced)
- **Database (Row Level Security):** public can read only `published` rows; only `is_admin()` can create/edit/delete; `profiles` has no client write policy (nobody can self-promote); `enquiries` has no public policy at all. Tested on a real Postgres (see Testing).
- **Storage:** bucket `media` is public-read; insert/update/delete only for admins; images only (JPG/PNG/WebP), 5 MB max after processing.
- **Server:** every admin page and action calls `requireAdmin()`; the upload API checks admin again; `proxy.ts` redirects signed-out visitors. Hiding the link is *not* the protection.
- **Uploads:** photos are resized in the browser (Vercel limits requests to ~4.5 MB), then re-encoded server-side with Sharp to WebP ≤2000 px; EXIF metadata (including GPS location) is stripped.
- Security headers set in `next.config.ts`; `/admin` and `/api` are `noindex` and disallowed in `robots.txt`; no cookies for ordinary visitors.

## 7. Move from the old static repo to this project (GitHub)
```bash
git clone https://github.com/collinsmwacha16-ai/YCH-website.git && cd YCH-website
git checkout -b platform-v2
mkdir legacy-static && git mv *.html *.css *.js .env.example legacy-static/ 2>/dev/null   # keep the old site for reference
# copy everything from this project's folder into the repo root (NOT node_modules/.next), then:
git add -A && git commit -m "Next.js + Supabase platform with admin dashboard"
git push -u origin platform-v2          # open a Pull Request on GitHub, review, then merge to main
```
Never commit `.env.local` (already in `.gitignore`).

## 8. Testing
**Automated (`npm test`, 20 tests):** slug/URL/search sanitising, enquiry validation, the contact form's honesty rules (never reports success unless saved/emailed; honeypot; too-fast; provider errors), and that every dropdown option and admin field in `cfg.ts` matches the SQL constraints/columns.
**Done during the build:** `tsc` clean; production build; every public route returns 200, unknown slugs 404, `/admin*` redirects to login, upload API returns 401 when signed out; no secrets in the client bundle; security headers present; migrations + RLS policies run and verified on a real PostgreSQL 16 using a stand-in for Supabase's `auth`/`storage` schemas (anon sees only published rows; a normal user cannot write or self-promote; enquiries are admin-only; storage writes are admin-only).
**Manual checklist after you connect Supabase (please do all):**
- [ ] Sign in/out; wrong password shows an error; a non-admin account is refused.
- [ ] Create event → add 3+ photos (watch progress) → caption/alt → set cover → Publish → appears on /events with filters, detail page, lightbox (keyboard ← → Esc), Load more.
- [ ] Unpublish/archive → disappears publicly; a draft previewed while signed in shows the yellow Preview banner. Delete asks for confirmation and removes the photos.
- [ ] Add a programme and a resource (deadline in the past → shows **Expired**); search, filters and sort work.
- [ ] Site content: replace logo and hero, edit mission text, add social links; empty sections stay hidden.
- [ ] Contact form: submit → appears in /admin/enquiries (and in your inbox if Resend is set); submit with wrong env → shows "NOT sent".
- [ ] Phone check (Android + iPhone): menu, forms, gallery, admin upload from camera roll. Run Lighthouse on the live URL.

## 9. Known limitations (honest list)
- The admin flows (login, save, upload, delete) were **not run against a live Supabase project** here; the SQL/RLS and form logic were tested, the end-to-end click-through is on your checklist above.
- No photo reordering (photos show in upload order); no rich-text editor (paragraphs separated by blank lines); resources are loaded up to 300 per search.
- No newsletter and no user accounts/mentor registration yet (deliberately not faked). The schema/admin pattern makes both easy to add.
- Visitor privacy notice is a plain-language draft; have it reviewed against Tanzania's Personal Data Protection Act before launch.
- Google Fonts load from Google (a visitor IP is shared with Google). Self-host the fonts if that matters to you.
- Mission/vision/history/leadership are blank until you write them: nothing official has been invented.

## 10. External services (accounts / cost)
| Service | Needed for | Cost |
|---|---|---|
| GitHub | source code & backups | free |
| Supabase | database, login, photo storage | free tier to start (500 MB DB, 1 GB files); paid when you outgrow it |
| Vercel | hosting | free "Hobby" tier is for non-commercial use; check if your organisation needs Pro |
| Resend | email notifications | free tier (limited emails/day); needs a verified sending domain |
| Domain name | custom address | yearly registrar fee |
