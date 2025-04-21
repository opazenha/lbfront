# LB SPORTS Frontend

LB Front is a soccer player management application developed for **LB Sports Company**. It provides tools to search, filter, and view detailed player information by integrating with the Transfermarkt API.

## Features

- Search players by name with partial matching
- Filter by position, nationality, age, club
- View player profiles (market value, height, contract details, image)
- Register new players and partners
- Copy player info to clipboard for sharing

## Tech Stack

- Next.js (App Router) & React
- TypeScript
- Transfermarkt API proxy (via Next.js API routes)
- Client-side filtering and pagination
- Fallback mock data for offline development

## Getting Started

### Prerequisites

- Node.js >= 14
- npm or yarn
- Transfermarkt API running locally at `http://localhost:7771`

### Installation

```bash
npm install
# or yarn install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Configuration

- Set `NEXT_PUBLIC_API_URL` in `.env.local` if using a custom API endpoint.
- Default dev proxy points to `http://localhost:7771`.

## Project Structure

```
app/                # Next.js application directory
├── components/     # Shared UI components
├── config/         # API configuration
├── register/       # Player & partner registration pages & components
└── services/       # API service modules
public/             # Static assets (fonts, images)
```

## License

MIT
