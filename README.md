# ChatStat

**Market sentiment analysis platform.**

## Overview
ChatStat is a tool for analyzing market sentiment using chat data and other sources. It provides insights and analytics for fintech applications.

## Features
- Real-time sentiment analysis
- Data visualization
- Prototype database for development
- Auto-reloading development server

## Directory Structure

| Path/Package            | Description                                      |
|------------------------|--------------------------------------------------|
| `/agents`              | Agent-related code and utilities                 |
| `/api`                 | API endpoints and related logic                  |
| `/app`                 | Main application backend/frontend code           |
| `/assets`              | Static assets (favicons, icons, images, media)   |
| `/config`              | Configuration files                              |
| `/db`                  | Database scripts and utilities                   |
| `/errors`              | Error handling modules                           |
| `/layouts`             | Layout components/templates                      |
| `/logs`                | Log files and logging utilities                  |
| `/middleware`          | Express/Node middleware                         |
| `/migrations`          | Database migration scripts                       |
| `/public`              | Static public files (if present)                 |
| `/rivers`              | Data river/stream processing modules             |
| `/scripts`             | Utility and deployment scripts                   |
| `/search`              | Search-related modules                           |
| `/sentiment_service`   | Python microservice for sentiment analysis       |
| `/services`            | Service layer modules                            |
| `/theme`               | Theme and style resources                        |
| `/users`               | User management modules                          |
| `/utils`               | Utility/helper functions                         |
| `/vendors`             | Third-party vendor code                          |
| `/widgets`             | UI widgets/components                            |
| `package.json`         | NPM dependencies and scripts                     |
| `gulpfile.js`          | Gulp build configuration                         |
| `README.md`            | Project documentation                            |

*Update this table as your project grows. Label new packages/files clearly for collaborators!*

## Installation

1. **Clone the repo:**
   ```bash
   git clone git@github.com:MomsFriendlyDevCo/ChatStat.git
   cd ChatStat
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Build a prototype database:**
   ```bash
   npm run sample:data
   ```

4. **Run the development server (auto-reloads on changes):**
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` — Start the development server with auto-reload
- `npm run sample:data` — Populate the prototype database with sample data
- `npm run build` — Build the project for production
- `npm test` — Run tests
- `npm run agents` — List available agents
- `npm run deploy` — Deploy the application

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

**Please label new files and packages clearly in your PRs for easier collaboration!**

## License
[MIT](LICENSE)

## Contact
For questions or collaboration, open an issue or contact the maintainer.
