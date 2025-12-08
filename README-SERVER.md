# JSON Server Setup

This project uses JSON Server to provide a mock API for the chat functionality.

## Running the JSON Server

To start the JSON server, run:

```bash
npm run server
```

This will start the JSON server on `http://localhost:3001` and watch the `db.json` file for changes.

## Running Both Servers

You'll need to run both the JSON server and the Vite dev server:

1. **Terminal 1** - Start JSON Server:
   ```bash
   npm run server
   ```

2. **Terminal 2** - Start Vite Dev Server:
   ```bash
   npm run dev
   ```

## API Endpoints

The JSON server provides the following endpoints:

- `GET /conversations` - Get all conversations
- `GET /conversations/:id` - Get a specific conversation
- `PATCH /conversations/:id` - Update a conversation (e.g., add messages)

## Data Structure

The `db.json` file contains fake chat data including:
- Conversation list with user information
- Messages for each conversation
- User profiles with ratings and specializations
- Activity history

