# JobFlow - Job Application Tracker

## Concept & Vision

JobFlow is a premium job application tracking platform designed for professionals who take their career seriously. It combines the sophistication of a personal CRM with the intelligence of AI-powered tools to help users manage, tailor, and track their job search with precision and style. The experience should feel like using a luxury productivity tool — powerful yet effortless, data-rich yet visually calm.

## Design Language

### Aesthetic Direction
**"Midnight Atelier"** — A sophisticated dark-mode interface with deep navy backgrounds, soft luminous gradients, and glass-morphism effects. Inspired by high-end fintech dashboards and premium SaaS tools like Linear and Notion. The aesthetic communicates professionalism, focus, and success.

### Color Palette
```
--bg-primary: #0a0e1a          /* Deep midnight blue */
--bg-secondary: #111827        /* Dark slate */
--bg-tertiary: #1a2035         /* Elevated surface */
--glass: rgba(255,255,255,0.03) /* Glass effect background */
--glass-border: rgba(255,255,255,0.08) /* Glass borders */
--accent-primary: #6366f1       /* Indigo - primary actions */
--accent-secondary: #8b5cf6    /* Violet - AI features */
--accent-tertiary: #06b6d4     /* Cyan - highlights */
--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)
--text-primary: #f8fafc        /* Bright white */
--text-secondary: #94a3b8      /* Muted slate */
--text-tertiary: #64748b       /* Subtle hints */
--success: #10b981             /* Emerald */
--warning: #f59e0b             /* Amber */
--error: #ef4444               /* Red */
--border: rgba(255,255,255,0.06)
```

### Typography
- **Display**: "Clash Display" (from Fontshare CDN) — Bold, geometric, modern
- **Headings**: "Satoshi" (from Fontshare CDN) — Clean, professional
- **Body**: "Inter" (from Google Fonts) — Highly legible, versatile
- **Monospace**: "JetBrains Mono" — For technical content, stats

### Spatial System
- Base unit: 4px
- Section padding: 64px-96px vertical, responsive
- Card padding: 24px-32px
- Border radius: 16px (cards), 12px (buttons), 8px (inputs), 24px (modals)
- Max content width: 1400px

### Motion Philosophy
- **Entrance**: Fade up with stagger (opacity 0→1, translateY 20px→0, 500ms ease-out, 50ms stagger)
- **Hover**: Scale 1.02, shadow elevation, 200ms spring
- **State changes**: Smooth color transitions 150ms
- **Loading**: Pulsing gradient shimmer effect
- **Page transitions**: Fade with subtle scale
- **Micro-interactions**: Button press (scale 0.98), input focus glow

### Visual Assets
- **Icons**: Phosphor Icons (duotone style) — distinctive, modern
- **Imagery**: Abstract gradient blobs for backgrounds, professional portraits for testimonials
- **Decorative**: Floating gradient orbs, subtle grid patterns, glass-morphism cards
- **Empty states**: Illustrated with simple line art + gradient accents

## Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│  Top Navigation Bar (glass, sticky, blur backdrop)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Logo    Dashboard  Applications  AI Studio  │ Auth │ ░░░ │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Main Content Area (centered, max-width 1400px)                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  Page content with dynamic layouts                       │    │
│  │  (Dashboard: grid, Applications: list/kanban, etc.)     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Footer (minimal, glass)                                       │
│  Stats summary │ Quick links │ © 2024 JobFlow                  │
└─────────────────────────────────────────────────────────────────┘
```

### Page Structures

**1. Landing/Auth Page**
- Split layout: left side gradient hero, right side auth forms
- Floating gradient orbs animation
- Smooth tab transition between Sign In / Sign Up

**2. Dashboard**
- Hero stats row (4 cards): Total Applications, Active, Interviews, Offers
- Recent activity timeline
- Upcoming interviews calendar strip
- Quick actions floating button
- Application status distribution chart (doughnut)

**3. Applications Page**
- View toggle: Grid / List / Kanban
- Filter bar (status, date, company, position)
- Search with instant results
- Drag-and-drop for kanban status updates
- Bulk actions toolbar

**4. Application Detail Modal**
- Full application info
- Timeline of status changes
- Notes section
- AI tools quick access (tailor resume, generate cover letter)
- Action buttons (edit, archive, delete)

**5. AI Studio**
- Tab interface: Resume Tailor | Cover Letter | Interview Prep
- Job description input (paste or upload)
- Current resume display (parsed)
- AI suggestions panel with diff view
- One-click apply to document

**6. Profile/Settings**
- Resume upload zone (drag & drop)
- Connected accounts (Google, etc.)
- AI API key configuration (Opencode Zen, Nvidia NIMs)
- Theme preferences

### Responsive Strategy
- Desktop (1200px+): Full layout with sidebar
- Tablet (768px-1199px): Collapsible sidebar, adjusted grid
- Mobile (< 768px): Bottom navigation, stacked cards, full-width forms

## Features & Interactions

### Authentication System
- Email/password registration and login
- Session management with JWT
- Password reset flow
- Multiple users can create accounts, each with their own data
- Family access: shared view option after account creation

### Job Application Management
**Create Application:**
- Quick add modal (company, position, link, notes)
- Full form with all fields
- Auto-suggest from LinkedIn/Indeed links (if provided)
- Status defaults to "Applied"
- Tags for categorization

**Application Fields:**
- Company name, logo (auto-fetched if possible)
- Position/title
- Job URL (link to posting)
- Status: Wishlist → Applied → Screening → Interview → Offer → Rejected → Accepted
- Salary range (optional)
- Location (remote/hybrid/onsite + city)
- Notes (rich text)
- Contacts (hiring manager, recruiter)
- Timeline (auto-tracked status changes)
- Documents (uploaded files)
- Tags

**Interactions:**
- Click card → detail modal
- Drag card → status change
- Swipe (mobile) → quick actions
- Hover → preview tooltip with key info
- Double-click → inline edit

### Resume Management
- Upload resume (PDF, DOCX) — drag & drop zone
- Parse resume to extract: name, email, experience, skills, education
- Store parsed data in database
- Preview resume in-app
- Download resume anytime
- Multiple resume versions support

### AI Integration

**Opencode Zen API:**
- Endpoint: Configurable in settings
- Used for: Resume tailoring, cover letter generation

**Nvidia NIMs API:**
- Endpoint: https://integrate.api.nvidia.com/v1
- Models: llama-3.1-nemotron-ultra-instruct (free tier available)
- Used for: Interview prep, job description analysis

**Resume Tailoring:**
1. User pastes job description OR uploads JD file
2. System retrieves stored resume
3. AI analyzes JD requirements vs resume
4. Outputs: Suggested changes, keyword highlights, match score
5. One-click to apply changes to resume document

**Cover Letter Generation:**
1. Select target job application
2. AI generates cover letter based on resume + JD
3. User reviews and edits in rich text editor
4. Download as PDF

### PDF Generation
- Client-side PDF generation using @react-pdf/renderer
- Templates: Modern, Classic, Minimal
- Includes: Tailored resume, cover letter
- Branding options (optional logo, color accent)

### Notifications (UI-only for MVP)
- Application status reminders
- Follow-up prompts
- New AI feature announcements
- Toast notifications for actions

## Component Inventory

### Navigation Bar
- **Default**: Glass background (rgba(10,14,26,0.8)), blur backdrop, subtle bottom border
- **Scrolled**: Enhanced shadow, slightly more opaque
- **Logo**: Gradient text "JobFlow" with subtle animation on hover
- **Nav items**: Text links with underline animation on hover, active state with accent underline
- **User menu**: Avatar dropdown with profile, settings, sign out

### Stats Card
- **Default**: Glass card, gradient border (1px), large number, label, trend indicator
- **Hover**: Scale 1.02, shadow elevation, border glow intensifies
- **Loading**: Shimmer effect across surface

### Application Card
- **Default**: Glass card, company logo area, title, company, status badge, date
- **Hover**: Lift effect, border glow, quick action icons appear
- **Active/Selected**: Accent border, checkmark overlay
- **Dragging**: Elevated shadow, slight rotation, opacity 0.9
- **Status badges**: Color-coded (indigo=applied, amber=screening, cyan=interview, emerald=offer, red=rejected)

### Button
- **Primary**: Gradient background, white text, subtle shadow
- **Secondary**: Glass background, border, white text
- **Ghost**: Transparent, text only, underline on hover
- **Danger**: Red gradient for destructive actions
- **States**: Hover (brighten), Active (press scale 0.98), Disabled (opacity 0.5), Loading (spinner)
- **Sizes**: sm (32px), md (40px), lg (48px)

### Input Field
- **Default**: Glass background, subtle border, placeholder text
- **Focus**: Border glow (accent color), label animation up
- **Error**: Red border, shake animation, error message below
- **Disabled**: Reduced opacity, no interactions

### Modal/Dialog
- **Backdrop**: Dark overlay with blur
- **Container**: Glass card, 24px radius, slide-up + fade entrance
- **Header**: Title, close button
- **Content**: Scrollable if needed
- **Footer**: Action buttons

### Toast Notification
- **Success**: Emerald left border, check icon
- **Error**: Red left border, x icon
- **Info**: Indigo left border, info icon
- **Animation**: Slide in from right, auto-dismiss after 4s

### Empty State
- Centered illustration
- Heading and subtext
- CTA button

### Loading States
- Spinner: Gradient rotating ring
- Skeleton: Shimmer effect cards
- Progress: Gradient bar with shimmer

## Technical Approach

### Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS custom properties
- **Database**: SQLite with Prisma ORM (easily upgradeable to PostgreSQL)
- **Authentication**: NextAuth.js with Credentials provider
- **File Storage**: Local filesystem (uploads folder)
- **PDF Generation**: @react-pdf/renderer (client-side)
- **State Management**: React hooks + Context

### Project Structure
```
job-tracker-app/
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/          # User uploaded files
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── applications/
│   │   │   ├── ai-studio/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── applications/
│   │   │   ├── resume/
│   │   │   └── ai/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx (landing)
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   └── features/     # Feature-specific components
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── ai.ts
│   └── types/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### API Design

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/signin` - Login (handled by NextAuth)
- `POST /api/auth/signout` - Logout

**Applications:**
- `GET /api/applications` - List user's applications (with filters)
- `POST /api/applications` - Create application
- `GET /api/applications/[id]` - Get single application
- `PUT /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application

**Resume:**
- `POST /api/resume/upload` - Upload resume file
- `GET /api/resume` - Get user's resume data
- `PUT /api/resume` - Update resume data

**AI:**
- `POST /api/ai/tailor-resume` - Get tailoring suggestions
- `POST /api/ai/generate-cover-letter` - Generate cover letter
- `POST /api/ai/analyze-jd` - Analyze job description

### Data Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  createdAt     DateTime  @default(now())
  applications  Application[]
  resume        Resume?
}

model Application {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  company     String
  position    String
  status      String   @default("applied")
  jobUrl      String?
  location    String?
  salary      String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  timeline    TimelineEntry[]
}

model TimelineEntry {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id])
  status        String
  note          String?
  createdAt     DateTime    @default(now())
}

model Resume {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  fileName  String?
  filePath  String?
  data      Json?    // Parsed resume data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Environment Variables
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
OPENCODE_ZEN_API_KEY="your-api-key"
OPENCODE_ZEN_API_URL="https://api.opencode.ai/v1"
NVIDIA_API_KEY="your-nvidia-api-key"
```

## Implementation Priority

1. **Phase 1**: Project setup, authentication, basic layout
2. **Phase 2**: Application CRUD, dashboard views
3. **Phase 3**: Resume upload and management
4. **Phase 4**: AI integration (Zen + Nvidia NIMs)
5. **Phase 5**: PDF generation, polish, animations