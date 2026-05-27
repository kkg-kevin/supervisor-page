# Supervisor Mentor Claim Review

A React, TypeScript, Vite, and Tailwind CSS front-end prototype for supervisors who review mentor payment claims. The supervisor can open a mentor course claim, inspect the same activity-style view a mentor submitted, review attendance, assignments, reports, and approve or reject the claim.

This project is currently frontend-only. All claim data is mock data, and all approve/reject decisions are stored locally in React state for the current browser session.

## What This App Does

The app supports a supervisor workflow where mentors submit payment claims for courses they have taught. A supervisor can:

- View submitted mentor course claims in a searchable, filterable table
- Open each claim to see a mentor-style course activity page
- Review course progress, students, sessions, attendance, assignments, and reports
- See the mentor's requested amount beside estimated earnings and estimated advance
- Drill into assignment and report pages by clicking the table headings
- Move backward and forward through sessions
- Preview a mock eTIMS payment reference
- Approve a claim and see that it was moved to admin for processing
- Reject a claim with a required comment

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI / shadcn-style components
- Lucide React icons
- date-fns

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

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

The production build is generated in `dist/`.

## Main Workflow

1. The supervisor lands on the submitted claims table.
2. Claims can be searched and filtered by status.
3. Clicking a claim opens the mentor course claim view.
4. The supervisor reviews:
   - Course progress
   - Amount requested
   - Estimated earnings
   - Estimated advance
   - Payment actions
   - Attendance, assignment, and report activity
   - Claim history and eTIMS reference
5. The supervisor can move between sessions using the session arrows.
6. Clicking the `ASSIGNMENT` heading opens the assignment detail page for the selected session.
7. Clicking the `REPORT` heading opens the report detail page for the selected session.
8. The supervisor approves or rejects the claim.

## Claims Table

`src/app/components/ClaimsList.tsx` renders the main submitted claims table.

Each row shows:

- Course name and location/delivery mode
- Mentor name
- Teaching method
- Completed sessions
- Requested claim amount
- Submission date
- Claim status
- View action

Clicking a row opens the full claim review page.

## Claim Review Page

`src/app/components/ClaimDetails.tsx` renders the main claim review experience.

The top section is organized into three areas:

- Course progress: completed sessions and student count
- Payment summary: amount requested, estimated earnings, and estimated advance
- Payment actions: approve/reject controls and approval processing notification

When a claim is approved, the Payment Actions section shows:

```text
This claim was approved and moved to admin for processing. Admin pays the mentor claims.
```

## Payment Summary

The payment section uses calculated mock values:

- `Amount requested`: the value submitted by the mentor for payment
- `Estimated Earnings`: the full estimated value for the course
- `Estimated advance`: the estimated advance value

The requested amount is calculated from the claim type:

- Full payment request: uses estimated earnings
- Advance request: uses estimated advance

The calculations live in:

```text
src/app/utils/claimValidation.ts
```

## Session Activity View

For non-Google Meet courses, the activity table shows each student for the selected session:

- Student name and initials
- Attendance status
- Assignment status
- Report status

Attendance appears as a read-only present/absent switch.

Assignment status can be:

- Issued
- Submitted
- Graded

Report status can be:

- Pending
- Done

## Assignment Detail View

Clicking the `ASSIGNMENT` column heading opens a session-level assignment page.

The assignment page includes:

- Back button to return to the claim activity view
- Previous and next session arrows
- Session title and date
- Counts for graded, submitted, and issued assignments
- Student assignment progress table
- Download buttons for the frontend mockup

The assignment progress is shown as:

```text
Issued -> Submitted -> Graded
```

## Report Detail View

Clicking the `REPORT` column heading opens a session-level report page.

The report page includes:

- Back button to return to the claim activity view
- Previous and next session arrows
- Session title and date
- Counts for done and pending reports
- Student report status table
- Download buttons for the frontend mockup

## Google Meet Courses

Google Meet claims do not show student attendance, assignments, or reports. They use a session table instead, showing:

- Session number
- Scheduled date and time
- Session status
- Session duration

## Claim History and eTIMS Preview

The claim history panel shows:

- Payment claim title
- Submitted date and time
- Claim status
- Requested amount
- Invoice filename
- Claim note

The eTIMS preview is a mock document generated in the browser. It can be previewed in a dialog or opened in a new browser tab.

## Approving and Rejecting Claims

Approving a pending claim:

- Changes its status to `Approved`
- Shows the admin-processing notification inside Payment Actions
- Stores the decision in local React state

Rejecting a pending claim:

- Requires a rejection comment
- Changes its status to `Rejected`
- Stores the rejection reason on the claim

Refreshing the page resets all decisions because there is no backend persistence yet.

## Mock Data

Mock claims are defined in:

```text
src/app/data/mockClaims.ts
```

Each claim includes:

- Course details
- Mentor details
- Teaching method
- Payment type
- Claim status
- eTIMS document name
- Submitted date
- Students
- Sessions
- Attendance records
- Assignments
- Reports
- Optional rejection reason

## Types

Core TypeScript types live in:

```text
src/app/types.ts
```

Important types include:

- `TeachingMethod`
- `PaymentType`
- `ClaimStatus`
- `Student`
- `Session`
- `Attendance`
- `Assignment`
- `Report`
- `Course`
- `Mentor`
- `CourseWithMentor`
- `ReviewAction`
- `Filters`

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
|   |-- main.tsx
|-- index.html
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
`-- vite.config.ts
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the app for production.

## Current Limitations

- Data is mocked in the frontend
- Decisions are not persisted after refresh
- Download buttons are visual placeholders
- eTIMS preview is a generated mock document
- Authentication, roles, and admin payment processing are not connected yet

## Future Improvements

- Connect claims to a backend API
- Persist approval and rejection decisions
- Connect admin payment processing
- Replace mock eTIMS previews with real uploaded files
- Add authentication and supervisor/admin roles
- Add audit logs for claim decisions
- Add pagination for large claim volumes
- Add tests for payment calculations and review actions
