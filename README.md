# 📅 Event Manager (Arrangementskalender)

En full-stack webapplikasjon for å oppdage, opprette og administrere arrangementer. Prosjektet bruker et interaktivt kart for stedsvalg, dynamisk filtrering og sikker brukerautentisering.

---

## 🛠️ Teknologier

Prosjektet er bygget med en moderne stack som sikrer ytelse og skalerbarhet:

### Backend (Server)
* **Node.js** & **Express.js**: Håndterer API-forespørsler og serverlogikk.
* **PostgreSQL**: Relasjonsdatabase for lagring av brukere, hendelser og steder.
* **pg (node-postgres)**: Driver for å kommunisere med databasen.
* **JSON Web Tokens (JWT)**: For sikker, statsløs autentisering.
* **Bcryptjs**: For hashing og sikring av passord.

### Frontend (Klient)
* **HTML5, CSS3 & Vanilla JavaScript**: En lettvektig frontend uten store rammeverk.
* **Leaflet.js**: Bibliotek for interaktive kart.
* **Nominatim API (OpenStreetMap)**: Brukes til "Reverse Geocoding" (gjør om kartkoordinater til tekst-adresser).

---

## 📂 Prosjektstruktur og Kodeanalyse

Applikasjonen følger en **MVC-arkitektur** (Model-View-Controller) for å holde koden organisert og vedlikeholdbar.

### 1. Inngangspunkt (`app.js`)
Dette er kjernen i applikasjonen. Filen konfigurerer Express-serveren, setter opp mellomvare (middleware) som `cors` og `express.json`, og kobler ruter til applikasjonen. Den serverer også de statiske frontend-filene fra `public`-mappen.

### 2. Databasetilkobling (`db.js`)
Her opprettes en tilkoblings-pool mot PostgreSQL. Ved å bruke en pool sikrer vi effektiv håndtering av flere samtidige databaseforespørsler. Konfigurasjonen hentes sikkert fra miljøvariabler (`.env`).

### 3. Ruting (`routes/events.js`)
Dette filen fungerer som en trafikkdirigent. Den definerer alle API-endepunktene (`/api/events/...`) og delegerer logikken til riktig kontroller.
* **Beskyttede ruter:** Endepunkter for å opprette/slette data bruker `verifyToken`-middleware for å sikre at kun innloggede brukere får tilgang.

### 4. Kontrollere (`controllers/`)
Her ligger forretningslogikken:
* **`authController.js`**: Håndterer registrering og innlogging. Den sjekker passord mot databasen og utsteder JWT-tokens.
* **`eventController.js`**: Utfører SQL-spørringer.
    * *Transaksjoner:* Ved opprettelse av arrangementer brukes SQL-transaksjoner (`BEGIN`, `COMMIT`) for å sikre at data ikke blir korrupt hvis noe går galt midt i prosessen.
    * *Joins:* `getAllEvents`-funksjonen bruker `LEFT JOIN` for å hente data fra tabellene `users`, `venues` og `categories` i én enkelt spørring.

### 5. Frontend Logikk (`index.html` & Scripts)
Frontend fungerer som en **Single Page Application (SPA)**.
* **Tilstandsstyring:** JavaScript bytter synlighet på seksjoner (Login vs. Dashboard) basert på om brukeren har en token i `localStorage`.
* **Kartintegrasjon:** Når en bruker klikker på kartet i "Nytt sted"-modulen, henter JavaScript bredde- og lengdegrad, sender disse til OpenStreetMap API, og fyller automatisk inn by og adresse i skjemaet.

---

## 🗄️ Database Database-skjema

Systemet bruker følgende relasjonelle tabeller:

* **users**: `id, username, email, password_hash, role`
* **venues**: `id, name, address, city` (Lagrer lokasjonstekst)
* **categories**: `id, name` (F.eks. Musikk, Sport)
* **events**: `id, title, description, date, creator_id, venue_id, image_url`
* **event_categories**: Koblingstabell for many-to-many relasjoner.

---

## 🚀 Installasjon og Oppsett

Følg disse stegene for å kjøre prosjektet lokalt.

### 1. Klon prosjektet
Last ned koden til din maskin.

### 2. Installer avhengigheter
Åpne terminalen i prosjektmappen og kjør:
```bash
npm install
