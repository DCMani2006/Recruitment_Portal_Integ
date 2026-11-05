# Backend integration — what the code actually does
Read from the backend developer's zip (Express + Prisma + MongoDB). The folder `docs/ARCHITECTURE_AND_PROGRESS.md`
is OUT OF DATE: it describes Google OAuth (`/api/auth/google`, `/api/signup`). Those routes do not exist.
Source of truth = `backend/src/routes/*` and `recruitment-frontend/src/api.ts`.

## 0. Things to settle with the backend dev BEFORE building
1. **Email domain is hard-coded to `@vitstudent.ac.in`** (`backend/src/config.ts`, used by signup, login, OTP and every
   authenticated request). Registration numbers must match `^\d{2}[A-Z]{3}\d{4,5}$` (e.g. 24BCE1234) and phones
   must be Indian mobiles (`validators.ts`). The upstream repo is `TAM-VIT/Recruitment_Portal`. If your applicants are
   students, EVERY signup returns 403 `EMAIL_NOT_ALLOWED` until the backend dev changes
   `STUDENT_EMAIL_DOMAIN` and the `regNumber` regex. Confirm which college this recruitment is for.
2. **Production email:** OTP codes are sent by email. With no `EMAIL_USER`/`EMAIL_APP_PASSWORD` and
   `NODE_ENV=production`, `request-otp` returns 503 `EMAIL_NOT_CONFIGURED`. Signup is impossible until that is set.
3. **Test flags:** `render.yaml` is a TEST blueprint with `ENABLE_TEST_TOOLS=true` and `SHOW_OTP_CODES=true`
   (OTP shown on screen). Make sure the live deployment has both off. Our frontend must never call `/api/test/*`.
4. **Backend URL** for `BACKEND_URL` (Render host). Seed data (questions, deadline) is placeholder until the club supplies real ones.

## 1. Domains (backend enum -> newspaper)
| Backend value | Label | Flipbook page |
|---|---|---|
| DESIGN | Design | 3 (Domain 1) |
| MARKETING | Marketing | 4 (Domain 2) |
| R_AND_D | R&D (call it Research) | 5 (Domain 3) |
| MANAGEMENT | Management | 6 (Domain 4) |
| EDITORIAL | Editorial | 7 (Domain 5) |
| TECHNICAL | Technical (call it Tech) | 8 (Domain 6) |
A candidate can apply to several domains; each is its own application with its own stage and submit.

## 2. Endpoints (all JSON; errors are `{ error, code, details? }`; auth = `Authorization: Bearer <jwt>`, 7 days)
| Method + path | Auth | Body / query | Returns |
|---|---|---|---|
| GET /api/config | no | | `{ isOpen, formDeadline, serverTime, msRemaining }` |
| GET /api/domains | no | | `{ domains: [{ domain, label, subsections[] }] }` |
| POST /api/auth/request-otp | no | `{ email, purpose: "signup"\|"reset" }` | `{ sent, otpToken }` (limit 3 per 10 min per email) |
| POST /api/auth/signup | no | `{ email, otpToken, otp, password(8-72), name, phone, regNumber, domains[] }` | `201 { token, user, applications }` |
| POST /api/auth/login | no | `{ email, password }` | `{ token, user }` |
| POST /api/auth/reset-password | no | `{ email, otpToken, otp, password }` | `{ reset: true }` |
| GET /api/me | yes | | `{ registered, user, applications[] }` |
| PUT /api/me | yes | partial `{ name, phone, regNumber, domains[] }` | `{ user, applications }` |
| GET /api/form | yes | | per-domain questions, saved answers, `editable`, `progress` |
| PUT /api/form/answers | yes | `{ questionId, text }` | `{ questionId, savedAt }` |
| POST /api/form/submit | yes | `{ domain }` | `{ submitted, domain }` (locks that domain) |
| GET /api/status | yes | | stage flowchart data per domain |
| GET /api/slots/calendar | yes | `?domain=&month=YYYY-MM` | `{ month, days[] }` |
| GET /api/slots | yes | `?domain=&date=YYYY-MM-DD` | `{ date, slots[] }` |
| GET/POST/DELETE /api/slots/book | yes | POST `{ slotId }`; DELETE `?bookingId=` | bookings / `{ booking, meetingLink }` / `{ cancelled }` |

Stages: FORM_FILLING -> SHORTLISTED -> SLOT_CHOOSING -> INTERVIEW -> SELECTED (or REJECTED). Admins move candidates
between stages; slots only open at SHORTLISTED or later. Times are shown in IST. Cancel blocked within 12h of the slot.

Error codes worth designing for: EMAIL_NOT_ALLOWED, ALREADY_REGISTERED, RATE_LIMITED, OTP_INVALID, DUPLICATE (reg number
or email taken), FORM_CLOSED, DEADLINE_PASSED, ALREADY_SUBMITTED, INCOMPLETE_FORM (details.missing[]), NOT_SHORTLISTED,
SLOT_FULL, SLOT_PAST, ALREADY_BOOKED, CANCEL_TOO_LATE, CONTENTION, VALIDATION_ERROR (details = field errors).

## 3. What changes in the spec (supersedes NEWSPAPER_SPEC.md sections 3 and 6 where they differ)
The first spec had ONE "Apply" back-cover form. The real flow is: sign up with email code -> pick domains -> answer
per-domain questions (up to 2000 characters EACH, saved per question) -> submit per domain -> status tracker ->
book an interview slot. None of that fits a fixed-size flipbook page. So:

- **The Edition (flipbook, `/`)** = the recruiting pitch. Pages 1-8 as domain pages, Page 9 as classified-ad coupon, Page 10 as Thank You back cover.
  "SUBSCRIBE TO APPLY" with a live countdown from /api/config and one button into the desk.
- **The Subscriber's Desk (`/desk/*`)** = normal scrolling routes, same paper/ink/type system, no flipbook.
  Newspaper-styled forms: classified-ad boxes, rubber stamps, ruled textareas.
  - `/desk/login`  tabs: Log in / Sign up (3 steps: email -> 6-digit code -> details, password, domains) / Forgot password
  - `/desk`        "Your Dispatch": status per domain as a typeset timeline (stage stamps); links to the other pages
  - `/desk/form`   domain tabs, questions grouped by subsection, per-question Save + char counter, Submit with confirm
  - `/desk/slots`  month calendar of available days, slot list, book / cancel, show meeting link after booking
  - `/desk/profile` edit name, phone, reg number, domains (backend blocks removing a submitted domain)
- Auth: token in localStorage under `recruitment-token`, guard `/desk/*`, send 401/403 users back to login with the message.
- Do not build quiz logic: question sets come from the API (placeholder seed today).

## 4. Revised prompts (replace old Prompts 5, 6, 7; run after Prompt 4)
### Prompt 5 — Achievements page and Apply coupon
"Build the coupon page (Page 9) with countdown ticker, and Page 10 as Thank You back cover.
classified-ad coupon with a dashed cut line, header 'CLIP & SUBSCRIBE', a live countdown to the application deadline
using api.config() (msRemaining; fall back to 'Dates to be announced' on error; re-sync with serverTime, don't trust
the device clock), and a single button 'Open the Subscriber's Desk' linking to /desk/login (or /desk if a token exists)."

### Prompt 6 — API client and proxy
"Copy lib/api.ts and next.config.mjs from the kit unchanged into the project. Add .env.local with
BACKEND_URL=<backend host>. Do not edit api.ts beyond imports. Add a small React hook useLoad(fn) that returns
{data, error, reload}. Create a Session context that loads api.me() when a token exists, exposes user, applications,
refresh(), logout(), and on a 401/403 clears the token and routes to /desk/login with the error message."

### Prompt 7 — Login, signup, reset
"Build /desk/login with three modes (login, signup, reset) in the newspaper style, mirroring the logic of the
reference demo's Login.tsx: signup and reset are two-step flows (request-otp, then enter 6-digit code plus details/new
password); 30-second resend timer; client-side checks for email domain (isStudentEmail), password length 8-72 and
matching confirmation; load api.domains() for the signup domain checklist (show labels: Technical->Tech,
R_AND_D->Research); show errorText(e) from api.ts for every failure; map RATE_LIMITED, ALREADY_REGISTERED and
EMAIL_NOT_ALLOWED to friendly messages. On success store the token via setToken and go to /desk."

### Prompt 8 — Dispatch, form, slots, profile
"Build /desk (status), /desk/form, /desk/slots, /desk/profile following the behaviour of the reference demo's
Status.tsx, Form.tsx, Slots.tsx, Profile.tsx. Form: tabs per domain, questions grouped by subsection (with 'General'
for none), textarea per question with maxLength, per-question Save (disabled unless changed), 'saved at' time,
required-progress bar, Submit button that confirms in a styled modal (not window.confirm) and surfaces INCOMPLETE_FORM
missing questions. Read-only states for submitted / deadlinePassed / closed. Slots: only enabled when canChooseSlots;
calendar from api.calendar, slots from api.daySlots, book/cancel, show the meeting link after booking, show times in IST
using fmtDateTime/fmtTime. Never call any /api/test route."

### Prompt 9 — Mobile, accessibility, deploy
(Old Prompt 7 + 8.) Also: confirm every /desk page works at 360px, keyboard focus is visible, status is conveyed by text
not just colour, set BACKEND_URL in Vercel project settings, run the production build, and give the Vercel CLI commands.

## 5. Order of work for a few-hours deadline
Prompts 0-4 (edition) -> 6 -> 7 -> 8 (the product actually recruits) -> 5 -> 9.
Cut ornaments before cutting any of 6-8. A pretty site that cannot take an application has failed.
