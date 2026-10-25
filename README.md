# FollowLens — Instagram Follower Tracker

<p align="center">
  <strong>Track your followers. Understand your connections. See what changed.</strong>
</p>

FollowLens is a full-stack web application that helps users analyze their Instagram follower relationships by importing their official Instagram data exports. It identifies newly detected followers, accounts missing from previous snapshots, mutual followers, and accounts that do not follow the user back.

The application provides a modern dark-themed analytics dashboard, historical snapshot comparisons, CSV exports, and privacy-focused data management.

> **Important:** FollowLens does not require your Instagram password, scrape Instagram, or access private Instagram accounts. It works with data exports downloaded by the account owner.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [How to Use FollowLens](#how-to-use-followlens)
- [Downloading Instagram Data](#downloading-instagram-data)
- [Supported Import Formats](#supported-import-formats)
- [Comparison Logic](#comparison-logic)
- [API Endpoints](#api-endpoints)
- [Security and Privacy](#security-and-privacy)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [License](#license)

---

## Features

### Dashboard

- Total followers and following counts.
- Mutual followers and accounts not following back.
- Newly detected and missing followers.
- Follower and following growth charts.
- Recent changes between saved snapshots.
- Date-based comparison history.
- Empty states when no data has been imported.

### Follower Analysis

**Unfollowers**
- Identifies accounts present in an earlier follower snapshot but absent from the latest snapshot.
- Search, sort, and copy usernames.
- View profile links when available.

**New Followers**
- Identifies accounts newly present in the current follower list.
- Displays the date first detected by FollowLens.
- Does not invent exact follow dates.

**Don't Follow Back**
- Identifies accounts the user follows that are absent from their follower list.
- Supports searching and alphabetical sorting.
- Provides CSV export where implemented.

**Mutual Followers**
- Identifies accounts appearing in both follower and following lists.

**People I Recently Followed**
- Compares multiple following snapshots.
- Identifies newly added and removed following relationships.

**Follower History**
- Stores dated snapshots.
- Tracks follower and following counts over time.
- Displays changes between available snapshots.

### Instagram Data Import

- Upload supported Instagram ZIP exports.
- Upload individual JSON or HTML files.
- Support numbered follower files, such as `followers_1.json` and `followers_2.json`.
- Normalize usernames and remove duplicates.
- Preview imported data before saving.
- Validate files and report malformed or incomplete imports.
- Compare a confirmed snapshot with the previous snapshot.

### Authentication and Privacy

- Email/password registration and login.
- Password hashing and protected API routes.
- User-specific snapshot isolation.
- Input validation and upload restrictions.
- Account and imported-data deletion options.
- No Instagram password collection.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT or the configured secure session solution |
| Import Processing | JSON, HTML and ZIP parsing |
| Testing | Configured frontend and backend test tools |
| Deployment | Vercel, Render, MongoDB Atlas |

The exact installed packages and scripts depend on the generated project configuration.

---

## Project Structure

```text
FollowLens/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tests/
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

Some files may differ depending on your implementation.

---

## Prerequisites

Install the following before running FollowLens:

- Node.js 20 or a compatible version supported by your dependencies.
- npm.
- MongoDB running locally or a MongoDB Atlas account.
- Git, recommended for version control.

Verify your installation:

```bash
node --version
npm --version
git --version
```

---

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd FollowLens
```

Replace `YOUR_REPOSITORY_URL` with your actual repository URL. If you already have the project generated locally, open its root directory instead.

### 2. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` directory using `.env.example` as a reference.

```bash
cp .env.example server/.env
```

If your `.env.example` is located at the project root, check its variable names and place the server-specific values in `server/.env` as required by your application.

Never commit real credentials or secrets.

---

## Environment Variables

Example server configuration:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/followlens

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173

MAX_UPLOAD_SIZE_MB=50
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

Generate a strong random JWT secret rather than using the example value. Keep all credentials private.

If the frontend uses a configurable API URL, create `client/.env` with the variable name expected by your code, for example:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Vite exposes variables prefixed with `VITE_` to browser code. Never place database credentials, JWT signing secrets, or other private server secrets in frontend environment variables.

---

## Running the Application

Start MongoDB first, either locally or through MongoDB Atlas.

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

The backend should start on the configured port, commonly:

```text
http://localhost:5000
```

If the project uses a different script, check `server/package.json`.

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

Open the URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

Register a user, sign in, and open the dashboard.

> A successful server startup does not automatically confirm that MongoDB is connected or that every feature works. Verify the database connection and test the API before importing personal data.

---

## How to Use FollowLens

### Step 1: Create an account

Open the application and register with your email address and a strong password.

Sign in to access your protected dashboard.

### Step 2: Download your Instagram information

1. Open Instagram.
2. Navigate to your profile and open the menu.
3. Go to Accounts Center.
4. Open the information download or export section.
5. Select your Instagram profile.
6. Choose the option to download or export your information.
7. Select Followers and Following.
8. Choose JSON or HTML, depending on the formats supported by your installation.
9. Select an appropriate date range and request the export.
10. Download the ZIP archive when Instagram makes it available.

Instagram may change the names or locations of these settings.

### Step 3: Import your first snapshot

1. Open **Import Data**.
2. Upload the downloaded ZIP file or supported individual files.
3. Wait for parsing and validation to finish.
4. Review the follower and following counts.
5. Confirm and save the snapshot.

Your first successful snapshot establishes the baseline for future comparisons.

### Step 4: Import another snapshot

Download a fresh export later and repeat the import process.

FollowLens can compare the new snapshot with the previous valid snapshot to identify newly detected followers, missing followers, and changes to your following list.

### Step 5: Explore the dashboard

Open the relevant page:

- **Dashboard:** Summary statistics and charts.
- **Unfollowers:** Accounts missing from a previous follower list.
- **New Followers:** Newly detected follower accounts.
- **Don't Follow Back:** Accounts you follow that are absent from your follower list.
- **Mutual Followers:** Accounts appearing in both lists.
- **Follower History:** Historical counts and snapshot comparisons.
- **Settings and Privacy:** Account and data management options.

### Step 6: Export comparison results

Where CSV export is implemented, use the export action on the relevant page to save comparison results for personal analysis.

---

## Supported Import Formats

FollowLens should support the actual export structures produced by Instagram, rather than relying on a single fixed JSON layout.

Example filenames:

```text
instagram-export.zip
├── followers_and_following/
│   ├── followers_1.json
│   ├── followers_2.json
│   └── following.json
```

HTML exports may contain corresponding `.html` files.

The parser should:

- Read all relevant numbered follower files.
- Combine records from multiple files.
- Extract usernames from supported JSON fields and Instagram profile links.
- Parse supported HTML anchor elements.
- Normalize usernames consistently.
- Remove duplicate records.
- Handle missing or unexpected fields.
- Reject malformed files and incomplete imports where necessary.
- Display validation errors before saving a snapshot.

Exact directory names and file layouts may vary by export.

### ZIP upload safety

ZIP extraction must enforce file size, entry count, and decompressed size limits. Archive paths must be validated to prevent path traversal. Temporary files should be deleted after processing, and uploads must not be accepted as valid snapshots until parsing and validation succeed.

---

## Comparison Logic

All comparisons use normalized usernames as identifiers.

Let:

- `previousFollowers` represent the previous valid follower snapshot.
- `currentFollowers` represent the latest valid follower snapshot.
- `currentFollowing` represent the latest valid following snapshot.

### New followers

```text
New Followers = Current Followers − Previous Followers
```

These are usernames appearing in the current follower list but not the previous one.

### Missing followers

```text
Missing Followers = Previous Followers − Current Followers
```

These are usernames appearing in the previous follower list but not the current one.

### Not following back

```text
Not Following Back = Current Following − Current Followers
```

These are accounts the user follows that do not appear in the current follower list.

### Mutual followers

```text
Mutual Followers = Current Following ∩ Current Followers
```

These are accounts present in both lists.

### Following-list changes

```text
Recently Followed = Current Following − Previous Following

Removed From Following = Previous Following − Current Following
```

### Interpretation of results

A missing follower does not necessarily mean the person deliberately unfollowed the user. Account deactivation, username changes, incomplete exports, and other circumstances can affect comparisons.

Likewise, the date first detected is the date the change was observed by FollowLens, not necessarily the actual date the relationship changed.

The first snapshot cannot establish historical changes without an older baseline.

---

## API Endpoints

The following endpoints are intended for the backend. Their actual availability depends on the implementation.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/import/upload` | Upload and validate Instagram data |
| GET | `/api/dashboard` | Retrieve dashboard statistics |
| GET | `/api/followers` | Retrieve follower records |
| GET | `/api/following` | Retrieve following records |
| GET | `/api/changes/unfollowers` | Retrieve missing followers |
| GET | `/api/changes/new-followers` | Retrieve newly detected followers |
| GET | `/api/changes/not-following-back` | Retrieve non-mutual following relationships |
| GET | `/api/changes/mutual-followers` | Retrieve mutual followers |
| GET | `/api/history` | Retrieve historical comparisons |
| GET | `/api/snapshots` | Retrieve saved snapshots |
| DELETE | `/api/snapshots/:id` | Delete an owned snapshot |
| DELETE | `/api/account/data` | Delete imported account data |

Protected endpoints must validate the user's authentication and ownership before returning, modifying, or deleting data. List endpoints should support pagination and input validation.

---

## Security and Privacy

FollowLens is designed around user-provided Instagram exports.

Security requirements include:

- Hash passwords using a suitable password-hashing algorithm such as Argon2id or bcrypt.
- Protect private API routes with verified authentication.
- Validate ownership of every requested snapshot.
- Use secure, unpredictable JWT secrets or a properly configured session system.
- Apply rate limiting to authentication and upload endpoints.
- Validate uploaded file types and enforce upload and decompression limits.
- Prevent ZIP path traversal and unsafe archive extraction.
- Avoid logging usernames, follower lists, passwords, or tokens.
- Delete temporary uploaded files after processing.
- Use HTTPS in production.
- Configure CORS for trusted frontend origins.
- Provide account and imported-data deletion functionality.
- Keep `.env` files and personal exports out of version control.

FollowLens must never request Instagram passwords, collect Instagram session cookies, scrape private accounts, or bypass access controls.

Review the actual implementation before treating these security requirements as satisfied.

---

## Testing

Run the test commands defined in your frontend and backend `package.json` files.

Typical commands, if configured:

```bash
cd server
npm test
```

```bash
cd client
npm test
```

If no test script exists, add and configure an appropriate test runner before running these commands.

### Recommended test cases

- Parse valid JSON follower exports.
- Parse supported HTML exports.
- Handle multiple numbered follower files.
- Reject malformed JSON and invalid ZIP archives.
- Normalize usernames consistently.
- Remove duplicate entries.
- Detect newly added followers.
- Detect missing followers.
- Calculate non-followers and mutual followers.
- Handle empty and incomplete datasets.
- Prevent one user from accessing another user's snapshots.
- Reject unauthenticated access to protected routes.
- Validate upload size and ZIP extraction limits.
- Verify account and imported-data deletion.

Use synthetic test accounts and sample data rather than uploading personal information into test logs.

---

## Deployment

A possible deployment architecture is:

| Component | Suggested service |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| Database | MongoDB Atlas |

Other hosting providers are also suitable.

### Deploy the backend

1. Create a MongoDB Atlas database.
2. Configure the database network access and database user securely.
3. Deploy the `server/` application to your chosen Node.js host.
4. Set the required environment variables in the hosting dashboard.
5. Configure the production frontend origin in `CLIENT_URL`.
6. Verify database connectivity and backend health.

### Deploy the frontend

1. Import the repository into Vercel.
2. Configure the frontend root directory as `client/`, if needed.
3. Set the production API URL using the variable name expected by the frontend.
4. Build and deploy the application.
5. Update backend CORS settings to allow the deployed frontend origin.
6. Test registration, login, imports, comparisons, and deletion in production.

### Production checklist

- [ ] HTTPS is enabled.
- [ ] Production secrets are configured securely.
- [ ] MongoDB access is restricted.
- [ ] CORS allows only trusted origins.
- [ ] Authentication and ownership checks work.
- [ ] Upload and archive limits are enforced.
- [ ] Temporary files are cleaned up.
- [ ] Error messages do not expose secrets.
- [ ] Account deletion and data deletion are verified.
- [ ] Core tests pass.
- [ ] Database backups and retention policies are configured appropriately.

Do not expose MongoDB credentials or JWT secrets in frontend code or public repositories.

---

## Troubleshooting

### MongoDB connection failed

Check that `MONGODB_URI` is correct, the database is running, and Atlas network access permits connections from your backend.

### Frontend cannot connect to the backend

Check the frontend API base URL, backend port, CORS configuration, and whether the server is running.

### Import reports no followers

Check whether the uploaded export includes the correct Followers and Following files and whether the parser supports their structure.

### ZIP upload fails

Confirm the archive is valid, supported, within configured limits, and contains the expected export files.

### Follower changes look incorrect

Check whether all numbered follower files were imported, whether usernames were normalized consistently, and whether both snapshots cover comparable data.

### Dashboard shows empty statistics

Confirm that a valid snapshot has been saved and that the frontend is calling the correct authenticated API endpoint.

### npm run dev fails

Check the `scripts` section of the relevant `package.json`. Add the appropriate development script or use the command documented by the project.

---

## Limitations

- FollowLens does not retrieve Instagram data automatically.
- Users must download and import their own Instagram exports.
- A first snapshot cannot identify earlier unfollowers.
- Comparisons only reflect the imported data.
- Exact follow and unfollow dates generally cannot be inferred from snapshot differences.
- Incomplete exports, account deactivation, username changes, or other account changes may affect results.
- Dashboard charts and percentage changes require sufficient valid historical data.
- Features listed in this README must be implemented and tested in the actual application before they can be considered available.

---

## License

Choose and add a license appropriate for your project before distributing it publicly. For example, the MIT License allows broad reuse subject to its terms.

If you select the MIT License, add a `LICENSE` file containing the full license text and update this section accordingly.

---

**FollowLens — Instagram Follower Tracker**

Built with React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB.

Track changes using your own Instagram data, with privacy and transparency at the center.
