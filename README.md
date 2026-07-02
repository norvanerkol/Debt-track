# Debt Track

A tiny local web app for tracking debts between you and other people — who
owes you, who you owe, and the history of debts and payments for each
person.

## Running it

No build step or install needed. Either:

- Open `index.html` directly in a browser, or
- Serve the folder so paths resolve cleanly, e.g. `python3 -m http.server`
  and visit `http://localhost:8000`.

## How it works

- **People**: add a person for anyone you owe or who owes you.
- **Entries**: for each person, log either a new **debt** (they owe you, or
  you owe them) or a **payment** (they paid you back, or you paid them
  back).
- **Balance**: computed automatically from the entry history — positive
  means they owe you, negative means you owe them.
- **History**: every entry is kept with its date, note, amount, and the
  running balance at that point, and can be deleted individually.

All data is stored in your browser's `localStorage` — nothing leaves your
machine, and there's no account or server involved. Clearing your browser
storage for this page will erase the data.
