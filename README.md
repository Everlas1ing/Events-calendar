# Teknisk Dokumentasjonsrapport: Visit Events System

## 1. Prosjektoversikt

Dette prosjektet er en webapplikasjon for hendelseshåndtering ("Event Management System"). Systemet lar brukere registrere seg, logge inn, opprette arrangementer, se en oversikt over kommende hendelser, og filtrere disse basert på kategorier, dato og søkeord. Applikasjonen inkluderer også funksjonalitet for å legge til steder (venues) via et interaktivt kart.

### Hovedfunksjoner

* **Autentisering:** Brukerregistrering og innlogging med JWT (JSON Web Tokens).
* **Hendelser (Events):** CRUD-operasjoner (Create, Read, Update, Delete) for arrangementer.
* **Steder (Venues):** Opprettelse av nye lokasjoner ved hjelp av kartintegrasjon (OpenStreetMap/Leaflet).
* **Frontend:** Responsivt brukergrensesnitt med dynamisk lasting av data.

## 2. Teknologistack

### Backend
* **Kjøremiljø:** Node.js
* **Rammeverk:** Express.js
* **Sikkerhet:** `bcryptjs` (passordhashing), `jsonwebtoken` (sesjonshåndtering), `cors` (Cross-Origin Resource Sharing).
* **Database-driver:** `pg` (node-postgres).

### Database
* **System:** PostgreSQL.

### Frontend
* **Kjerne:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Kart:** Leaflet.js (med OpenStreetMap tiles).
* **Geokoding:** Nominatim API (for å hente adresse fra koordinater).

## 3. Databaseanalyse og Skjema

Basert på SQL-spørringene i koden (`pool.query`), er databasen strukturert rundt følgende relasjonelle tabeller. Her er en rekonstruksjon av skjemaet:

### Tabeller

* **users**
    * Brukes til autentisering.
    * **Kolonner:** `id` (PK), `username`, `email` (unik), `password_hash`.

* **venues**
    * Lagrer informasjon om steder arrangementer holdes.
    * **Kolonner:** `id` (PK), `name`, `address`, `city`.
    * *Merk: Koden refererer til `lat` og `lng` i input, men SQL-spørringen i `createVenue` setter foreløpig bare inn name, address, city.*

* **categories**
    * Kategorisering av hendelser (f.eks. Konsert, Sport).
    * **Kolonner:** `id` (PK), `name`.

* **events**
    * Hovedtabellen for systemet.
    * **Kolonner:** `id` (PK), `title`, `description`, `event_date`, `image_url`, `creator_id` (FK -> `users.id`), `venue_id` (FK -> `venues.id`).

* **event_categories**
    * Koblingstabell for mange-til-mange forhold (eller en-til-mange) mellom events og kategorier.
    * **Kolonner:** `event_id` (FK), `category_id` (FK).

## 4. Kodianalyse: Backend (Node.js/Express)

Backend er strukturert etter MVC-prinsippet (Model-View-Controller), selv om "View" her er en separat frontend-fil, og SQL-spørringer ligger direkte i kontrollerne (ingen separat ORM/Model-lag).

### 4.1 Autentisering (authController)

* **Registrering (`register`):**
    * Sjekker om e-posten allerede eksisterer.
    * Hasher passordet med `bcrypt.genSalt(10)` og `bcrypt.hash`. Dette er "best practice" for passordlagring.
    * Lagrer brukeren i databasen.

* **Innlogging (`login`):**
    * Henter bruker basert på e-post.
    * Sammenligner passord med `bcrypt.compare`.
    * Utsteder en JWT-token som inneholder `id` og `username`, signert med `process.env.JWT_SECRET`. Tokenet utløper om 1 time.

### 4.2 Hendelseshåndtering (eventController)

* **Transaksjoner:** Funksjonen `createEvent` bruker database-transaksjoner (`BEGIN`, `COMMIT`, `ROLLBACK`). Dette er utmerket praksis. Det sikrer at hvis opprettelsen av en hendelse lykkes, men koblingen til kategorien feiler, vil hele operasjonen rulles tilbake for å hindre korrupte data.
* **Henting av data (`getAllEvents`):**
    * Bruker `LEFT JOIN` for å hente data fra `venues`, `event_categories` og `categories` i samme spørring.
    * Inkluderer en dedupliserings-logikk (`map` og `uniqueEvents`) i JavaScript. *Notat: Dette kan optimaliseres med `GROUP BY` eller `DISTINCT` direkte i SQL for bedre ytelse.*
* **Skjemadata (`getFormData`):**
    * Et hjelpe-endepunkt som henter både `venues` og `categories` samtidig. Dette reduserer antall nettverksforespørsler fra frontend når skjemaet lastes.

### 4.3 Middleware (verifyToken)

* Beskytter ruter som krever innlogging (f.eks. opprette eller slette events).
* Henter token fra `Authorization: Bearer <token>` headeren.
* Verifiserer tokenet og legger dekodet brukerinformasjon til `req.user`.

### 4.4 Konfigurasjon

* Bruker `.env` for å skjule sensitiv informasjon som DB-passord og JWT-hemmeligheter.
* `db.js` bruker en "connection pool" som er effektivt for skalering, da det gjenbruker databasekoblinger.

## 5. Kodianalyse: Frontend (Vanilla JS)

Frontend er bygget som en Single Page Application (SPA)-lignende struktur i én enkelt HTML-fil.

### 5.1 Struktur og Design

* Bruker CSS-variabler (`--primary`, `--accent`) for konsistent tema.
* Layout er responsiv (Grid og Flexbox).
* **Seksjoner:** Bytter mellom "Auth" (innlogging) og "App" (hovedvisning) ved å manipulere CSS-klasser (`display: none/block`), basert på om en JWT-token finnes i `localStorage`.

### 5.2 Interaktivitet

* **Kart (Leaflet):**
    * Brukeren kan klikke på et kart for å velge en lokasjon for et nytt sted (Venue).
    * Integrert med Nominatim API for "Reverse Geocoding" (gjør om koordinater til en lesbar adresse automatisk).
* **Dynamisk HTML:** Funksjonen `renderGrid` genererer HTML-kort for hvert event basert på JSON-data fra backend.
* **Filtrering:** `applyFilters()` kjører på klientsiden. Den filtrerer listen over nedlastede events i sanntid uten å spørre databasen på nytt. Dette gir en rask brukeropplevelse for mindre datasett.

### 5.3 Kommunikasjon

* Bruker `fetch`-APIet for asynkrone kall.
* Bearer-token sendes automatisk med i headeren på beskyttede kall (POST, DELETE).

## 6. API Dokumentasjon

Her er oversikten over de eksponerte endepunktene (Routes):

| Metode | Endepunkt | Beskrivelse | Autentisering |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Registrer ny bruker | Nei |
| POST | `/api/auth/login` | Logg inn og motta token | Nei |
| GET | `/api/events` | Hent alle events (med filterdata) | Nei |
| GET | `/api/events/:id` | Hent detaljer for ett event | Nei |
| GET | `/api/events/form-data` | Hent liste over venues og kategorier | Nei |
| POST | `/api/events` | Opprett nytt event | Ja (JWT) |
| PUT | `/api/events/:id` | Oppdater event | Ja (JWT) |
| DELETE | `/api/events/:id` | Slett event | Ja (JWT) |
| POST | `/api/events/venues` | Opprett nytt sted (Venue) | Ja (JWT) |

## 8. Vurdering og Anbefalinger

### Positivt
* **Sikkerhet:** God bruk av `bcrypt` og parametriserte SQL-spørringer (hindrer SQL Injection).
* **Arkitektur:** Ren separasjon av ruter og logikk.
* **Transaksjoner:** Riktig håndtering av databaseintegritet ved opprettelse av events.
* **Brukervennlighet:** Kartintegrasjon og automatisk adresseoppslag hever kvaliteten betraktelig.

### Områder for forbedring (Next Steps)
* **Validering:** Det mangler input-validering på backend (utover det databasen krever). Biblioteket `express-validator` bør legges til for å sjekke at e-poster er gyldige og felter ikke er tomme før de når databasen.
* **Frontend Sikkerhet:** Lagring av JWT i `localStorage` er utsatt for XSS-angrep (Cross-Site Scripting). For høyere sikkerhet bør token lagres i en `httpOnly` cookie.
* **Feilhåndtering:** Hvis geokoding-APIet (Nominatim) er nede, vil stedsvelgeren feile stille. Legg til en "fallback" hvor brukeren kan skrive adresse manuelt.
* **Søk:** Søk og filtrering skjer nå i nettleseren (`allEvents.filter`). Når databasen vokser til tusenvis av events, vil dette bli tregt. Filtrering bør flyttes til backend (SQL `WHERE` klausuler).

### Konklusjon
Dette er et solid utgangspunkt for et eventsystem. Koden er strukturert, lesbar og bruker moderne prinsipper for asynkron programmering. Med små justeringer på validering og skalering, er dette klart for produksjon i liten skala.
