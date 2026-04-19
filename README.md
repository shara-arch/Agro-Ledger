# Agro-Ledger
<div>

### *Smart Farm Inventory Management*


 A lightweight, browser-based farm management tool that helps smallholder farmers track crops, monitor supply stock, receive low-stock alerts, and plan ahead — all without needing a smartphone app or internet connection beyond a local server.

</div>
---
## Link to Live Site:
https://shara-arch.github.io/Agr-Ledger/
---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Key Features](#-key-features)
- [Author & Maintainers](#-author--maintainers)
- [Tools & Resources](#-tools--resources)
- [Setup & Installation](#-setup--installation)
- [Usage](#-usage)
- [Behaviour Driven Development (BDD)](#-behaviour-driven-development-bdd)
- [Possible Error Messages & Resolutions](#-possible-error-messages--resolutions)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Data Examples](#-data-examples)
- [Security Practices](#-security-practices)
- [Contributing](#-contributing)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🌱 Project Description

### What it does
**Agro Ledger** is a single-page web application that serves as a digital farm record book. It lets a farm manager:

- Track all active crops — name, type, quantity, growth stage, and expected harvest date
- Manage supply inventory — fertilizers, seeds, pesticides, irrigation equipment — with quantity and minimum-stock levels
- Receive instant visual alerts when any supply falls below its minimum threshold
- Search across both crops and supplies from a single interface
- View a live dashboard with summary statistics for the whole farm

### Why it exists
Smallholder farmers in Kenya and across sub-Saharan Africa often manage complex inventories through paper ledgers or memory alone. Lost records, forgotten reorder dates, and missed harvests cost real money. Agro Ledger replaces the paper ledger with a clean, fast, local-first web tool that runs on any laptop or desktop without requiring cloud infrastructure.

### Key Features

| Feature | Description |
|---|---|
| 🌱 **Crop Inventory** | Add, view, and delete crop records with harvest countdown |
| 🧪 **Supply Ledger** | Track stock levels against minimum thresholds per item |
| 🔔 **Low-Stock Alerts** | Visual notification badge and panel for under-stocked supplies |
| 🔍 **Universal Search** | Filter crops and supplies simultaneously by name, type, or category |
| 📊 **Dashboard Overview** | Four live stat cards — total crops, supply items, alerts, upcoming harvests |
| 🔐 **Login Gate** | Session-based login with attempt limiting and auto-redirect |

---

## 👩🏾‍🌾 Author's Information

| Name | Role | Contact Info |
|---|---|---|
| **Shara** | Creator & Lead Developer | (email)sharamoegi@gmail.com |
>

---

## 🛠 Tools & Resources

| Tool | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Backend runtime |
| [Express.js](https://expressjs.com/) | REST API server |
| [CORS](https://www.npmjs.com/package/cors) | Cross-origin request handling |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | UI typography (Google Fonts) |
| JSON flat files | Lightweight data persistence (no database required) |
| Browser `localStorage` | Session management |

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (bundled with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Step-by-step

```bash
# 1. Clone the repository
git clone https://github.com/shara-arch/Agro-Ledger.git
cd Agro-Ledger

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

### Verify it's running

Open your browser and visit:

```
http://localhost:3000/login.html
```

You should see the Agro Ledger login screen.

> **Default credentials**
> Username: `farmer_shara`
> Password: `iLoveFarming`
> *(See [Security Practices](#-security-practices) for how to change these)*

---

## 🚜 Usage

### Logging In
1. Open `http://localhost:3000/login.html`
2. Enter the credentials above
3. You are redirected to the **Dashboard** (`index.html`)
4. Your session persists in `localStorage` — you won't need to log in again until you explicitly log out

### Dashboard
The dashboard shows four live stat cards:
- **Total Crops** — how many crop records exist
- **Supply Items** — total number of supply entries
- **Low Stock Alerts** — supplies currently below minimum level
- **Upcoming Harvests** — crops with a future harvest date

Recent crops and supply statuses are listed below the cards. A 🔔 bell icon shows the alert count; click it to expand the low-stock notification panel.

### Adding a Crop (`crops.html`)
1. Click **➕ Add Crop**
2. Fill in: name, type, quantity (kg), growth stage, expected harvest date, and optional linked supplies
3. Click **Save Crop** — the table updates immediately

### Adding a Supply (`supply.html`)
1. Click **➕ Add Supply**
2. Fill in: name, category, unit, current stock, minimum level, and optional notes
3. Click **Save Supply** — the table updates and alerts recalculate

### Deleting Records
Click the 🗑️ icon on any crop or supply row and confirm the prompt. The record is removed from both the UI and the JSON data file.

### Searching (`search.html`)
Type any keyword in the search bar. Toggle the **Crops** and **Supplies** checkboxes to filter which dataset is searched. Results update on every keystroke.

---

## 🧪 Behaviour Driven Development (BDD)

### User Stories

```
Feature: Add a new crop
  Scenario: Farmer submits a valid crop form
    Given the farmer is on the Crops page
    When they fill in all required fields and click Save Crop
    Then a new row appears in the crops table
    And a success alert confirms the crop name

  Scenario: Farmer submits an incomplete form
    Given the farmer is on the Crops page
    When they leave the Crop Name field empty and click Save Crop
    Then an alert message says "Crop name is required."
    And no record is saved
```

```
Feature: Low-stock notification
  Scenario: A supply item drops below minimum level
    Given the supply "DAP Fertilizer" has stock 15 and minLevel 30
    When the dashboard or supply page loads
    Then the notification badge shows at least 1
    And the alert panel lists "DAP Fertilizer: only 15 kg remaining"
```

```
Feature: Delete a supply item
  Scenario: Farmer confirms deletion
    Given the supply table is populated
    When the farmer clicks 🗑️ on "Pesticide Mix" and confirms
    Then the row is removed from the table
    And the item is deleted from supply.json via DELETE /api/supply/:id

  Scenario: Farmer cancels deletion
    Given the supply table is populated
    When the farmer clicks 🗑️ and clicks Cancel in the confirm dialog
    Then no change is made to the table or data file
```

### Testing Approach
This project currently uses **manual browser testing**. Recommended frameworks for automated testing:

- **[Jest](https://jestjs.io/)** — unit tests for helper functions (e.g., `escapeHtml`, status logic)
- **[Playwright](https://playwright.dev/)** or **[Cypress](https://www.cypress.io/)** — end-to-end tests for form submission, delete, and search flows

---

## ⚠️ Possible Error Messages & Resolutions

| Error | Cause | Fix |
|---|---|---|
| `Cannot GET /` | Server started but no static serving configured | Ensure `app.use(express.static(__dirname))` is in `server.js` — it is in the fixed version |
| `Error saving crop: Failed to fetch` | `node server.js` is not running | Run `node server.js` in a terminal before opening the app |
| `Server responded with status 404` | DELETE route missing for crops or supply | Fixed in `server.js` — both `DELETE /api/crops/:id` and `DELETE /api/supply/:id` now exist |
| `Crop not found. Please refresh the page.` | Local state is out of sync with the server (e.g., deleted from another tab) | Refresh the page to reload from the JSON file |
| `Error: Cannot find module 'cors'` | Dependencies not installed | Run `npm install` in the project root |
| All supply table values appear in the first column | `supply-status-card` class (with `display:flex`) was applied to `<tr>` elements | Fixed in `supply.js` — class removed from table rows |
| `ReferenceError: div is not defined` | `index.js` referenced an undeclared `div` variable in `displayNotif()` | Fixed — now references the `container` variable |
| Login loop — page keeps refreshing | `window.onload` redirected `index.html` → `index.html` for logged-in users | Fixed — redirect only fires when on `login.html` |
| Search shows `NaN` for supply items | `daysRemainingToHarvest` was computed for supply items without a `harvestDate` | Fixed in `search.js` — days label only rendered for crops with a valid date |

---

## 💻 Technologies Used

| Layer | Technology |
|---|---|
| **Markup** | HTML5 |
| **Styling** | CSS3 (custom properties, Grid, Flexbox, media queries) |
| **Logic** | Vanilla JavaScript (ES2020 — async/await, optional chaining) |
| **Backend** | Node.js + Express.js |
| **Data** | JSON flat files (`data/crops.json`, `data/supply.json`) |
| **Session** | Browser `localStorage` |

---

## 📁 Project Structure

```
Agro-Ledger/
│
├── data/
│   ├── crops.json          # Persistent crop records
│   └── supply.json         # Persistent supply records
│
├── index.html              # Dashboard page
├── index.js                # Dashboard logic, login, notifications
│
├── login.html              # Login page
├── login.css               # Login page styles
│
├── crops.html              # Crops inventory page
├── crops.js                # Crops CRUD logic
├── crops.css               # Crops page styles + media queries
│
├── supply.html             # Supply inventory page
├── supply.js               # Supply CRUD logic
├── supply.css              # Supply page styles + media queries
│
├── search.html             # Search page
├── search.js               # Search logic
├── search.css              # Search page styles + media queries
│
├── style.css               # Global styles (sidebar, layout) + media queries
│
├── server.js               # Express REST API
├── package.json            # Node.js dependencies
└── README.md               # This file
```

---

## 📦 Data Examples

### Crop record (`data/crops.json`)

```json
{
  "id": 1,
  "name": "Maize",
  "type": "Grain",
  "qty": 500,
  "stage": "Maturity",
  "harvestDate": "2026-06-15",
  "supplies": ["NPK Fertilizer", "Water"]
}
```

### Supply record (`data/supply.json`)

```json
{
  "id": 2,
  "name": "DAP Fertilizer",
  "category": "Fertilizer",
  "stock": 15,
  "unit": "kg",
  "minLevel": 30,
  "notes": "Di-ammonium phosphate"
}
```

### API responses

```
GET  /api/crops           → { crops: [ ...crop objects ] }
POST /api/crops           → 201 { id, name, type, qty, stage, harvestDate, supplies }
DELETE /api/crops/:id     → { message: "Crop \"Maize\" deleted.", id: 1 }

GET  /api/supply          → { supply: [ ...supply objects ] }
POST /api/supply          → 201 { id, name, category, stock, unit, minLevel, notes }
DELETE /api/supply/:id    → { message: "Supply \"DAP Fertilizer\" deleted.", id: 2 }
```

---

## 🔐 Security Practices

### Current implementation
- Login credentials are checked client-side in `index.js` and a session flag is stored in `localStorage`
- This is appropriate for a **local-only / offline-first tool** where the device is trusted

### Important warnings

> ⚠️ **Do not expose this application to the public internet without adding server-side authentication.** The current login is client-side only and provides no real security against a network attacker.

### Best practices applied
- Input values are sanitised with `escapeHtml()` before being injected via `innerHTML` to prevent XSS
- All form inputs are validated before being sent to the server
- The `.gitignore` should exclude any future `.env` files containing secrets

### Upgrading credentials
To change the login credentials, edit `index.js`:

```js
const CORRECT_USER = "your_username";
const CORRECT_PASS = "your_password";
```

---

## 🤝 Contributing

Contributions are welcome and appreciated!

### How to contribute

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/Agro-Ledger.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes, then commit
git add .
git commit -m "feat: add [short description of your change]"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```
---

## 🔭 Future Enhancements

### Roadmap

| Priority | Feature | Description |
|---|---|---|
| 🟢 High | **Statistics & Analytics Page** | View analytics on crop health, supply consumption trends, costs, and profitability. Charts showing stock depletion rates, harvest timelines, and per-crop input costs |
| 🟢 High | **Livestock Tracker** | Record farm animals (cattle, goats, poultry, etc.), their health status, feeding schedules, and product output (milk yield, egg count, etc.) |
| 🟡 Medium | **Weather Forecast Integration** | Embed a weather widget (e.g. Open-Meteo API) so farmers can see upcoming rainfall, frost, or drought warnings and plan accordingly for both crops and livestock |
| 🟡 Medium | **Edit Records** | Allow in-place editing of crop and supply records without deleting and re-adding |
| 🟡 Medium | **Export to CSV / PDF** | One-click export of crop or supply table for printing or sharing |
| 🔵 Low | **Multi-user Support** | Allow multiple farm workers to have separate accounts with different permission levels |
| 🔵 Low | **PWA / Offline Mode** | Service worker caching so the app works fully offline after first load |
| 🔵 Low | **Real database** | Replace JSON flat files with SQLite or PostgreSQL for concurrent write safety |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 shara-arch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

See [LICENSE](./LICENSE) for the full text.

---

<div align="center">

Made with  by [Sharon Moegi](https://github.com/shara-arch)

</div>