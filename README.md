# Supervisor Payment Approval Dashboard

A React and Vite dashboard for supervisors to review, validate, approve, reject, and move mentor payment claims to finance. The interface helps supervisors inspect claim details, course activity, payment eligibility, and attached eTIMS documents before making a decision.

## Overview

This project is a front-end prototype for a supervisor payment approval workflow. It uses mock claim data to demonstrate how a supervisor can manage payment requests submitted by mentors across different courses, teaching methods, and payment types.

Original Figma design:

https://www.figma.com/design/bSPPnSxXleKj7LKsB5kmYf/Supervisor-Payment-Approval-Dashboard

## Features

- Claims management table with mentor, course, teaching method, payment type, submission date, progress, status, amount, and eTIMS document details
- Filtering by claim status, teaching method, payment type, mentor, and course
- Claim details panel with full payment information and course activity metrics
- Payment eligibility validation:
  - Full payments require 100% course progress
  - Advance payments require at least 30% course progress
- Supervisor actions:
  - Approve eligible pending claims
  - Reject claims with a required rejection reason
  - Move approved claims to finance
- Activity timeline view for tracking claim progress and claim status
- eTIMS document preview modal
- Full eTIMS document view opened in a new browser tab/window
- Responsive dashboard layout built with reusable UI components

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
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

### Prerequisites

Install Node.js and npm before running the project.

Recommended:

- Node.js 18 or newer
- npm 9 or newer

### Installation

Clone the repository:

```bash
git clone https://github.com/kkg-kevin/supervisor-page.git
cd supervisor-page
```

Install dependencies:

```bash
npm install
```

### Run Locally

Start the development server:

```bash
npm run dev
```

Vite will print a local URL in the terminal, usually:

```text
http://localhost:5173/
```

Open that URL in your browser to use the dashboard.

### Build for Production

Create a production build:

```bash
npm run build
```

The compiled output is generated in the `dist/` directory.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the application for production.

## Claim Workflow

1. The supervisor opens the claims management dashboard.
2. Claims can be filtered by status, teaching method, payment type, mentor, or course.
3. Selecting a claim opens the details panel.
4. The dashboard checks whether the claim is eligible for approval.
5. The supervisor can preview or view the eTIMS document.
6. If the claim is valid, the supervisor can approve it.
7. If the claim is invalid or requires correction, the supervisor can reject it and provide a reason.
8. Approved claims can be moved to finance.

## Validation Rules

The payment eligibility rules live in `src/app/utils/claimValidation.ts`.

| Payment Type | Requirement |
| --- | --- |
| Full | Course progress must be 100% |
| Advance | Course progress must be at least 30% |

If a claim does not satisfy its rule, the approval button is disabled and the details panel displays the validation message.

## Mock Data

The app currently uses static mock data from:

```text
src/app/data/mockClaims.ts
```

Each claim includes:

- Mentor name
- Course name
- Teaching method
- Payment type
- Submitted date
- Claim progress
- Claim status
- Amount
- eTIMS document filename
- Course activity metrics
- Optional rejection reason

## eTIMS Documents

The current implementation simulates eTIMS document handling using the claim data.

- `Preview` opens an in-app modal with an eTIMS-style document preview.
- `View` opens a full document-style page in a new browser tab/window.

When real eTIMS files or a backend API are added, the `etimsDocument` field can be expanded into a file URL, storage key, or document metadata object.

## Git and Repository Notes

The repository includes a `.gitignore` configured for a Vite/React project. It excludes:

- `node_modules/`
- `dist/`
- local environment files
- logs
- cache and coverage folders
- editor and OS metadata

`package-lock.json` is intentionally committed so installs are reproducible.

## Future Improvements

- Connect claims to a backend API
- Replace mock eTIMS previews with real uploaded PDF documents
- Add authentication and supervisor roles
- Persist claim status changes in a database
- Add automated tests for validation and claim actions
- Add deployment configuration for GitHub Pages, Vercel, Netlify, or another hosting platform

## License

No license has been specified yet. Add one before distributing or using this project in production.
