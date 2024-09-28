# ZenLog

ZenLog is a comprehensive mental health tracking application designed to help users monitor their emotional well-being and daily activities. With features like mood tracking, journaling, and activity logging, ZenLog empowers users to gain insights into their mental health patterns and identify factors that contribute to their joy or frustration.

Zenlog is currently hosted with Heroku, feel free to check it out :)
https://zenlog-b49a02b5774a.herokuapp.com/

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [To Dos](#to-dos)

## Features

- User Authentication: Secure signup and login with JWT and http-only cookies
- Mood Tracking: Log and visualize your daily moods
- Journaling: Record your thoughts and experiences
- Activity Logging: Keep track of your daily activities
- Sentiment Analysis: Get mood scores based on your journal entries
- Dashboard: Review your moods, activities, and journal entries

## Tech Stack:

- Backend: Node.js, Express, tRPC, TypeScript, PostgreSQL
- Frontend: Vue 3
- Security: bcrypt for password hashing, JWT for authentication
- Containerization: Docker
- CI/CD: GitHub Actions
- Deployment: Heroku

## Installation

1. Clone the repository:

```bash
git clone https://github.com/QuantumPixie/ZenLog.git
cd ZenLog
npm install
```

2. Create a PostgreSQL database with your username and password
3. Create .env file with with .env.example suggestions in server:

```
DATABASE_URL=postgres://username:password@localhost:5432/database_name
JWT_SECRET=your_secret_key
```

4. Run migrations

```
cd packages/server
npm run migrate:latest
```

5. Start the development servers:

```
cd packages/server
npm run dev

cd packages/client/mental-health-frontend
npm run dev
```

6. Testing

```
cd packages/server
npm run test
```

6. Run test coverage

```
npm run coverage
```

## Usage

My application is currently hosted with Heroku, feel free to check it out :)
https://zenlog-b49a02b5774a.herokuapp.com/

## To-Dos

1. Input sanitization
2. Generating Insights
3. Pagination
4. Logging system
5. Sleep and Nutrition tracking
