# 📅 EventFlow – The Ultimate Event Management Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14-blue.svg)
![Express](https://img.shields.io/badge/Express-v4-lightgrey.svg)

> **EventFlow** er ikke bare en kalender. Det er en komplett, lokasjonsbasert plattform for å oppdage og administrere kulturelle arrangementer. Prosjektet kombinerer moderne backend-arkitektur med et responsivt, kart-drevet brukergrensesnitt.

---

## 📑 Innholdsfortegnelse

1.  [Om Prosjektet](#-om-prosjektet)
2.  [Nøkkelfunksjoner](#-nøkkelfunksjoner)
3.  [Teknisk Arkitektur](#-teknisk-arkitektur)
4.  [Database & Datamodell](#-database--datamodell)
5.  [API Dokumentasjon](#-api-dokumentasjon)
6.  [Installasjon & Oppsett](#-installasjon--oppsett)
7.  [Fremtidig Veikart (Roadmap)](#-fremtidig-veikart)

---

## 📖 Om Prosjektet

Målet med **EventFlow** var å løse utfordringen med statiske arrangementslister. De fleste kalendere viser bare en liste med datoer. EventFlow legger til en **geografisk dimensjon** ved å la arrangører velge nøyaktige steder på et kart, og lar brukere se nøyaktig hvor ting skjer.

Applikasjonen er bygget som en **Single Page Application (SPA)**, som betyr at navigasjon mellom visninger (Login, Dashboard, Detaljer) skjer umiddelbart uten at nettsiden lastes på nytt.

---

## ✨ Nøkkelfunksjoner

### For Brukere (Publikum)
* **Hero Slider:** En dynamisk bildekarusell som fremhever utvalgte "Featured Events" automatisk.
* **Smart Filtrering:** Filtrer arrangementer basert på kategori (Musikk, Sport, Teater), dato eller fritekstsøk i sanntid.
* **Interaktivt Dashboard:** Responsivt rutenett (Grid Layout) som viser hendelser med bilder og nøkkelinfo.
* **Detaljvisning:** Klikk på et arrangement for å se beskrivelse, arrangør, og et integrert kart som viser nøyaktig posisjon.

### For Arrangører (Admin)
* **Sikker Tilgang:** JWT-basert autentisering sikrer at kun registrerte brukere kan opprette innhold.
* **Geo-Tagging:** Integrert **Leaflet.js** kart lar arrangøren klikke hvor som helst i verden for å opprette et nytt "Venue". Systemet henter automatisk adresse og bynavn via OpenStreetMap API.
* **CRUD-operasjoner:** Full kontroll over opprettelse og sletting av egne arrangementer.

---

## 🛠️ Teknisk Arkitektur

Prosjektet er bygget på **MVC (Model-View-Controller)** prinsippet for å sikre separasjon av ansvar (Separation of Concerns).

### Backend (Server-side)
* **Runtime:** Node.js.
* **Rammeverk:** Express.js for ruting og middleware-håndtering.
* **Sikkerhet:**
    * `bcryptjs`: Brukes til å hashe passord med "salt" før de lagres i databasen.
    * `jsonwebtoken`: Genererer signerte tokens for å holde brukere innlogget uten server-sessions.
    * `cors`: Konfigurert for å tillate forespørsler fra godkjente kilder.

### Frontend (Klient-side)
* **Vanilla JS (ES6+):** Ingen tunge rammeverk (som React/Angular). Dette demonstrerer dyp forståelse av DOM-manipulasjon, `fetch`-APIet og asynkron programmering (`async/await`).
* **Leaflet.js:** Bibliotek for rendering av kart.
* **CSS3:** Bruk av CSS Variables (`:root`) og Flexbox/Grid for layout.

### Eksterne API-er
* **Nominatim (OpenStreetMap):** Brukes for "Reverse Geocoding" – konvertering av bredde/lengdegrad til lesbar adresse.

---

## 🗄️ Database & Datamodell

Databasen er en relasjonell **PostgreSQL**-database designet for dataintegritet og effektivitet.

### ER-Diagram (Relasjoner)

* **Users** `1` --- `N` **Events** (En bruker kan opprette mange arrangementer).
* **Venues** `1` --- `N` **Events** (Et sted kan ha mange arrangementer).
* **Events** `N` --- `N` **Categories** (Et arrangement kan tilhøre flere kategorier - *implementert via koblingstabell*).

### Tabellstruktur

1.  **`users`**: Lagrer brukerdata. Passord er kryptert.
2.  **`venues`**: Lagrer fysiske steder. Separasjon fra `events`-tabellen hindrer dataduplisering.
3.  **`categories`**: Statiske kategorier (f.eks. "Music", "Sport").
4.  **`events`**: Hovedtabellen. Inneholder fremmednøkler (`FK`) til `users` og `venues`.

**SQL-transaksjoner:**
Ved opprettelse av et arrangement brukes SQL-transaksjoner (`BEGIN`, `COMMIT`, `ROLLBACK`). Dette sikrer at systemet ikke lagrer et arrangement hvis tilkoblingen til kategorien feiler.

---

## 📡 API Dokumentasjon

Her er en oversikt over de viktigste endepunktene (Endpoints) i API-et.

### Autentisering

| Metode | Endepunkt | Beskrivelse | Body (JSON) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events/auth/register` | Opprett ny bruker | `{ username, email, password }` |
| `POST` | `/api/events/auth/login` | Logg inn bruker | `{ email, password }` |

### Arrangementer (Events)

| Metode | Endepunkt | Beskyttet? | Beskrivelse |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Nei | Henter alle arrangementer med `JOIN` data. |
| `GET` | `/api/events/:id` | Nei | Henter detaljer for ett arrangement. |
| `POST` | `/api/events` | **Ja** 🔒 | Oppretter nytt arrangement. Krever Token. |
| `DELETE`| `/api/events/:id` | **Ja** 🔒 | Sletter et arrangement (kun eier). |

### Støttedata

| Metode | Endepunkt | Beskrivelse |
| :--- | :--- | :--- |
| `GET` | `/api/events/form-data` | Henter lister over kategorier og steder for utfylling av skjema. |
| `POST` | `/api/events/venues` | **Ja** 🔒 Lagrer et nytt sted i databasen. |

---

## 🚀 Installasjon & Oppsett

Følg disse stegene for å kjøre prosjektet lokalt på din maskin.

### 1. Klon Repositoriet
```bash
git clone [https://github.com/ditt-brukernavn/eventflow.git](https://github.com/ditt-brukernavn/eventflow.git)
cd eventflow
