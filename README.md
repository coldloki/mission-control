# Mission Control (Next.js)

Custom tooling home for Copyshop workflow.

## Tools included

1. **Release Radar**
   - Reads git status from `Haris Code Project/Copyshop App SMAG`
   - Shows branch, dirty state, last commit, ahead/behind summary

2. **Secrets & Config Doctor**
   - Scans project files for common secret patterns
   - Compares `.env.example` keys with `.env` keys in backend

3. **TestFlight QA Board**
   - Quick QA logging for builds/testers/results/notes
   - Uses localStorage for simple local persistence
   - Includes optional API endpoint for JSON-file persistence (`/api/qa-entries`)

## Run

```bash
cd mission-control
npm install
npm run dev
```

Open: http://localhost:3000

## Notes

- This app is optimized for practical hobby workflow and fast iteration.
- Release discipline reminder: Security -> Bugs -> Features.
- Merge to `main` only after explicit confirmation.
