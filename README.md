# Recrutare Studenți — Elite Recruitment Platform

Aplicație full-stack Next.js (App Router) cu design ultra-premium, evaluare AI OpenAI și dashboard securizat. Gata de deploy pe [Railway](https://railway.app).

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4** + glassmorphism dark
- **Framer Motion** — tranziții wizard
- **Prisma** + **PostgreSQL** (Railway)
- **OpenAI API** — evaluare candidați

## Rute

| Rută | Descriere |
|------|-----------|
| `/apply` | Formular public multi-step (3 pași) |
| `/dashboard` | Panou privat cu carduri bento (parolă) |
| `/api/submit` | POST — evaluare AI + salvare DB |
| `/api/candidates` | GET — listă candidați (autentificat) |
| `/api/auth` | POST — login dashboard |

## Variabile de mediu

Copiază `.env.example` în `.env` pentru development local:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/recrutare"
OPENAI_API_KEY="sk-..."
DASHBOARD_PASSWORD="parola-ta-securizata"
PORT=3000
```

### Deploy pe Railway

1. **Creează un proiect nou** pe Railway și conectează acest repository (GitHub) sau deploy din CLI.

2. **Adaugă PostgreSQL**: în proiect → **+ New** → **Database** → **PostgreSQL**. Railway setează automat `DATABASE_URL`.

3. **Variabile de mediu** (Settings → Variables):

   | Variabilă | Descriere |
   |-----------|-----------|
   | `DATABASE_URL` | Setată automat de plugin-ul PostgreSQL |
   | `OPENAI_API_KEY` | Cheia ta de la [platform.openai.com](https://platform.openai.com/api-keys) |
   | `DASHBOARD_PASSWORD` | Parola pentru `/dashboard` |
   | `PORT` | Setată automat de Railway (nu o suprascrie) |

4. **Build & Start** (configurate în `package.json`):
   - `npm run build` — generează Prisma client, aplică schema (`db push`), build Next.js
   - `npm run start` — pornește serverul pe `process.env.PORT` (implicit 3000)

5. După deploy, accesează:
   - Formular: `https://<domeniu-railway>/apply`
   - Dashboard: `https://<domeniu-railway>/dashboard`

## Development local

```bash
npm install
cp .env.example .env
# Editează .env cu DATABASE_URL (PostgreSQL local sau Railway)
npx prisma db push
npm run dev
```

Deschide [http://localhost:3000/apply](http://localhost:3000/apply).

## Evaluare AI

La submit, candidatul este trimis către OpenAI (`gpt-4o-mini`) cu prompt de sistem care verifică:

1. Respectarea regulii celor 3 propoziții
2. Minte analitică/creativă
3. Reacția la scenariul egoului (scaune)
4. Delegare vs panică la criză

Răspuns JSON: `scor_general` (1–100), `verdict` (RECOMANDAT / REZERVĂ / RESPINS), `profil_psihologic`.

## Licență

Privat — uz intern recrutare.
