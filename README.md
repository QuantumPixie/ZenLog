# Mental Health Tracker

The Mental Health Tracker is a comprehensive application designed to help users track their mental health and wellness activities. It includes features such as mood tracking, journal entries, and activity logs. Sentiment is able to provide a mood score based on journal entries. The dashboard functionality lets a user review their moods, activities and journal entries for the last 7 days.
Users can determine what sort of activities adds to either joy or furstration in their personal lives.

The backend is built using Node.js, Express, TRPC, TypeScript, and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [To Dos](#to-dos)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication with JWT
- Mood tracking
- Journal entries
- Activity logs
- sentiment mood score from journal entries
- Secure password storage with bcrypt
- User signup and login

## Installation

1. Clone the repository:

```bash
git clone https://github.com/TuringCollegeSubmissions/thuppe-WD.3.3.5.git
cd mental-health-tracker
npm install

cd packages/server
npm run dev
```

2. Create a PostgreSQL database with your username and password

3. Create .env file with with .env.example suggestions in server:
```
DATABASE_URL=postgres://username:password@localhost:5432/database_name
JWT_SECRET=secretpassword
```

4. Run migrations
```
npm run migrate:latest
```

5. Run tests
```
 npm run test
```

6. Run test coverage
```
npm run coverage
```
## Usage

The Mental Health Tracker provides a tRPC panel for easy interaction with the API. This interactive interface allows you to explore and test all available endpoints without writing any code.

### Accessing the tRPC Panel

1. Ensure the server is running:
```
npm run dev
```

2. Open your web browser and navigate to:
```
http://localhost:3005/panel
```

Note: Replace `3005` with the actual port number if you've configured a different port.

### Using the tRPC Panel

The tRPC panel provides a user-friendly interface for interacting with all available procedures:

1. Authentication:
- Use `user.signup` to create a new account
- Use `user.login` to authenticate and receive a JWT token

2. Mood Tracking:
- Use `mood.createMood` to log a new mood entry
- Use `mood.getMoods` to retrieve mood entries

3. Journal Entries:
- Use `journalEntry.createJournalEntry` to create a new journal entry
- Use `journalEntry.getJournalEntries` to retrieve journal entries

4. Activity Logging:
- Use `activity.createActivity` to log a new activity
- Use `activity.getActivities` to retrieve activity logs

5. Dashboard:
- Use `dashboard.getSummary` to get an overview of recent data

6. Date Range Queries:
- Several procedures (e.g., `mood.getMoodsByDateRange`) allow you to retrieve data for specific date ranges

### Authentication

For procedures requiring authentication:

1. Use the `user.login` procedure to obtain a JWT token
2. Click on the "Authentication" button in the top-right corner of the panel
3. Enter `Bearer YOUR_JWT_TOKEN` in the input field
4. Click "Authenticate"

All subsequent requests will include this authentication token.

### Exploring the API

The tRPC panel allows you to:
- See all available procedures
- View input schemas for each procedure
- Test procedures with custom inputs
- See the raw API responses


## API Documentation

Brief overview of main TRPC procedures:
- `user.signup`: Create a new user account
- `user.login`: Authenticate a user
- `mood.createMood`: Log a new mood entry
- `journalEntry.createJournalEntry`: Create a new journal entry
- `activity.createActivity`: Log a new activity


## To-Dos

1. Implementation of refresh token (once token expires)
2. Integration testing using the seed.ts script
3. Evaluating what files need to be shared across Server and Client
4. Rate limiting
5. Pagination
6. Logging system
7. Centralized error handling
