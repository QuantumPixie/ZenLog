# Mental Health Tracker

The Mental Health Tracker is a comprehensive application designed to help users track their mental health and wellness activities. It includes features such as mood tracking, journal entries, and activity logs. Sentiment is able to provide a mood score based on journal entries. The dashboard functionality lets a user review their moods, activities and journal entries for the last 7 days.
Users can determine what sort of activities adds to either joy or furstration in their personal lives.

The backend is built using Node.js, Express, TRPC, TypeScript, and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
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
``` npm run migrate:latest
```

5. (Optional) Seed Database
```
 npm run seed
```

6. Run production
```
 npm run test
```

7. Test backend
``` npm run test
```

8. Run test coverage
``` npm run coverage
```





