# Youth Career Hub website

This is a responsive public website for Youth Career Hub (YCH), designed for students and graduates in Tanzania. It is a static front-end package with working public interactions. It is **not yet a deployed full-stack CMS**; the secure CMS hand-off is documented below rather than misrepresented as working.

## Open locally

Open `index.html` in a current web browser. No build tools or installation are required.

## Pages

- `index.html` — Home
- `about.html` — About YCH
- `mission.html` — Mission, vision and commitments
- `programmes.html` — Programme framework
- `events.html` — Searchable and filterable activity gallery
- `event.html?id=…` — Activity detail page with photo lightbox and sharing controls
- `resources.html` — Searchable career reflection, application and safety guides
- `contact.html` — Contact and enquiry form
- `privacy.html` — Current privacy notice
- `404.html` — Custom not-found page

## Working interactions

- Responsive mobile navigation with keyboard-accessible controls.
- Programme-area and career-guide search/filter controls with clear empty states.
- Event gallery search, category/year/status filters, Load More control and a clear count.
- Event detail view with an accessible modal photo gallery, captions, sharing control and back-to-top button.
- Form validation, consent acknowledgement and a transparent mail-client handoff; it does not pretend to submit a form to a backend.

All event records in `data.js` are explicitly labelled sample content. They exist only to demonstrate the gallery. They must be replaced with confirmed YCH records and authorised photography before public publication.

## Before publishing

1. Confirm the email address, telephone number and location in `contact.html` and across the footer. They were preserved from the supplied source file; confirm they are the organisation's current public details.
2. The contact form deliberately opens the visitor's email application. It does not send or store messages itself. Connect a secure form service or backend before claiming online submissions are delivered.
3. Add only confirmed event dates, programmes, partners, opportunity listings and impact figures. The design intentionally does not invent these facts.
4. Add official social-profile URLs if and when they are available. No placeholder social links were included.
5. The page uses externally hosted editorial images from Unsplash. For a production launch, replace them with licensed, authentic YCH/Tanzanian photography and include appropriate permissions and image credits.
6. Review and replace `privacy.html` with an organisation-approved privacy notice before collecting any personal data through a third-party form service or user accounts.

## Secure CMS hand-off

The package includes a Supabase schema, RLS policies, private image-storage policy, environment-variable template and a deployment/testing guide:

- `.env.example`
- `supabase/migrations/20261023_ych_content_schema.sql`
- `docs/CMS-DEPLOYMENT.md`

No migration has been applied and no Supabase or email credentials have been created. The CMS, secure `/admin` dashboard, persistent uploads and server-side contact submission must be completed in a YCH-owned Supabase/Vercel project. Follow `docs/CMS-DEPLOYMENT.md`; it explains the first-admin setup, security model, required accounts and verification checklist.

## Design and technical notes

- `styles.css` includes desktop and mobile layouts, a keyboard-visible skip link, responsive navigation, and reduced-motion support.
- `script.js` controls the public interactions and no data is stored in browser localStorage.
- The resource page does not pretend to have live jobs or scholarships. It offers evergreen career guidance and explains how to evaluate third-party listings safely.
- The site uses externally hosted editorial imagery from Unsplash. The images are illustrative stock images, not YCH activities; use consented and licensed YCH photography in production.

