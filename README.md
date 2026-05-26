# Mentor Activity Review and Claim Approval

A React, TypeScript, Vite, and Tailwind front-end prototype for supervisors to review mentor-submitted course claims. The page is designed as a read-only audit workflow: supervisors inspect the mentor's submitted activity, review the attached eTIMS payment reference, then approve or reject the claim.

## Overview

The app models the supervisor side of a mentor claim process. Each course claim includes a mentor, payment summary, submitted date, eTIMS reference, sessions, attendance, assignments, reports, students, and review status.

Supervisors can:

- View all submitted course claims as course cards
- Filter claims by status
- Open a full-page course claim review
- Move through each session in a course
- Inspect attendance, assignment, and report status per student for the selected session
- Preview or view the mentor-submitted eTIMS reference
- Approve eligible claims
- Reject claims with a required comment

All data is mock data and all decisions are stored locally in React state.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/Radix UI components
- Lucide React icons
- date-fns

## Project Structure

```text
.
|-- guidelines/
|   `-- Guidelines.md
|-- src/
|   |-- app/
|   |   |-- components/
|   |   |   |-- ui/
|   |   |   |-- ClaimDetails.tsx
|   |   |   |-- ClaimsList.tsx
|   |   |   |-- CourseActivityTimeline.tsx
|   |   |   |-- FiltersBar.tsx
|   |   |   `-- StatsOverview.tsx
|   |   |-- data/
|   |   |   `-- mockClaims.ts
|   |   |-- utils/
|   |   |   `-- claimValidation.ts
|   |   |-- App.tsx
|   |   `-- types.ts
|   |-- styles/
|   `-- main.tsx
|-- index.html
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
`-- vite.config.ts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173/
```

Build for production:

```bash
npm run build
```

The production output is generated in `dist/`.

## Main Workflow

1. The supervisor lands on the Mentor Activity Review dashboard.
2. Course claims appear as cards with course name, mentor, claim amount, sessions, submission date, and status.
3. The supervisor uses the status tabs to filter claims:
   - All
   - Pending
   - Approved
   - Rejected
4. Clicking a course opens a full-page claim review.
5. The supervisor reviews the claim summary and mentor activity.
6. The supervisor uses the session arrows to move through each course session.
7. For the selected session, the supervisor reviews every student in a table:
   - Attendance
   - Assignment
   - Report
8. The supervisor previews or views the attached eTIMS payment reference.
9. The supervisor approves the claim or rejects it with a comment.

## Claim Cards

`src/app/components/ClaimsList.tsx` renders the supervisor claim cards.

Each card shows:

- Course name
- Course location or delivery mode
- Mentor name
- Claim status
- Completed sessions
- Claim amount
- Submitted date

Clicking a card opens the full review page for that course claim.

## Course Review Page

`src/app/components/ClaimDetails.tsx` renders the full claim review page.

The review page includes:

- Back arrow to return to the claim cards
- Claim status badge
- Course name and mentor name
- Submitted date
- Total earnings
- Advance claimed
- Remaining balance
- Claim amount
- Completion, attendance, assignment, and report metrics
- Session-by-session review table
- eTIMS payment reference section
- Approve and reject actions

The mentor activity is read-only. Supervisors cannot edit sessions, attendance, assignments, reports, students, or eTIMS data.

## Session Review

The session review area lets the supervisor move from session to session with previous and next arrows.

For the selected session, the table lists all students in that course and shows:

- Student initials and name
- Attendance as a read-only present/absent switch
- Assignment status:
  - Not issued
  - Pending
  - Submitted
  - Graded
- Report status:
  - Done
  - Pending

The table is designed so a course with 6 students, or more, can show every student row for that session.

## eTIMS Payment Reference

Each course claim includes an `etimsDocument` value in the mock data.

The supervisor can:

- Preview the eTIMS reference in an in-app dialog
- Open a full mock document view in a new browser tab/window

The eTIMS section appears just above the approve/reject controls so the payment reference is reviewed before the final decision.

## Validation Logic

Validation lives in:

```text
src/app/utils/claimValidation.ts
```

The app computes:

- Course completion percentage
- Attendance percentage
- Assignment grading percentage
- Report completion percentage

Rules:

| Rule | Requirement |
| --- | --- |
| Attendance | Must be at least 90% |
| Assignments | Must be at least 90% |
| Reports | Must be at least 90% |
| Full payment | Course completion must be 100% |
| Advance payment | Course completion must be at least 30% |

If a pending claim does not satisfy the validation rules, the approve button is disabled. The validation logic remains active even though the large incomplete-activity warning banner is not shown.

## Mock Data

Mock course claim data is defined in:

```text
src/app/data/mockClaims.ts
```

The primary exported dataset is:

```ts
INITIAL_COURSES
```

Each course claim includes:

- Course details
- Mentor details
- Payment details
- Claim status
- Submitted date
- eTIMS document filename
- Students
- Sessions
- Attendance records
- Assignments
- Reports
- Optional rejection reason

## Types

Core types live in:

```text
src/app/types.ts
```

Important types include:

- `Course`
- `Student`
- `Session`
- `Attendance`
- `Assignment`
- `Report`
- `ClaimStatus`
- `Mentor`
- `CourseWithMentor`
- `ReviewAction`

## Local State

The app has no backend. Review decisions are stored in React state inside `src/app/App.tsx`.

Approving a claim changes its status to `Approved`.

Rejecting a claim:

- Requires a comment
- Changes its status to `Rejected`
- Stores the rejection comment on the course claim

Refreshing the page resets decisions back to the mock data.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the app for production.

## Future Improvements

- Connect course claims to a backend API
- Persist review decisions in a database
- Replace mock eTIMS documents with real uploaded PDF files
- Add authentication and supervisor roles
- Add audit history for approval and rejection decisions
- Add tests for validation and review actions
- Add pagination or search for large claim volumes

## License

No license has been specified yet. Add one before distributing or using this project in production.
