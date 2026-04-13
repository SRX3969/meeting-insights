# Notemind — AI-Powered Meeting Notes & Insights

Transform raw meeting transcripts into clean summaries, action items, key decisions, and productivity insights — all powered by AI.

## ✨ Features

- **AI Meeting Notes** — Paste a transcript and get structured summaries, action items, decisions, and tasks
- **Sentiment & Productivity Scoring** — AI rates each meeting's tone and productivity (0–100)
- **Participation Insights** — See who spoke most, speaker count, and engagement level
- **Live Voice Transcription** — Record meetings directly via the Web Speech API
- **Analytics Dashboard** — Charts showing meetings over time, productivity trends, and sentiment distribution
- **Command Palette (⌘K)** — Quick navigation and actions from anywhere
- **Real-Time Updates** — Meetings sync live across tabs via database subscriptions
- **Dark / Light / System Theme** — Toggle with persistence
- **Personalized Greeting** — Time-based greeting using your profile name
- **Export & Share** — Download notes as Markdown or copy to clipboard

## 🛠 Tech Stack

- **Frontend:** React 18, Vite 5, TypeScript 5
- **Styling:** Tailwind CSS v3, shadcn/ui, Recharts
- **Backend:** Lovable Cloud (Supabase)
- **AI:** Lovable AI Gateway (Gemini / GPT models)
- **Auth:** Email/password + Google OAuth
- **Validation:** Zod

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Environment Variables

The `.env` file is auto-configured by Lovable Cloud:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks (auth, theme, meetings, profile)
├── integrations/     # Supabase client & types (auto-generated)
├── lib/              # Utilities, types, validation schemas
├── pages/            # Route pages (Dashboard, Meetings, Settings, etc.)
supabase/
├── functions/        # Edge functions (AI note generation)
├── migrations/       # Database migrations
```

## 📄 License

MIT
