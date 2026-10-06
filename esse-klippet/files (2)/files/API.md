# Backend-kontrakt för Esse Klippet

Frontend anropar endast `api.js`. Sätt `API_BASE` i `config.js` så används dessa endpoints (JSON, cookies skickas med `credentials: include`, aktivera CORS med credentials om domänerna skiljer sig).

## Publika
**GET `/api/availability?date=YYYY-MM-DD`** → `200`
```json
{ "Ciina": ["09:00","09:30"], "Kerstin": [] }
```
Upptagna tider per frisör. Returnera inga kunduppgifter.

**POST `/api/bookings`**
```json
{ "date":"2026-10-15","time":"10:30","staff":"Ciina","service":"Damklippning","name":"Anna","phone":"040123456" }
```
→ `201 {"id":"..."}` · `409` om tiden är tagen · `400` vid ogiltig data.

## Admin (kräver session)
- **POST `/api/admin/login`** `{ "password": "..." }` → `200` + sessionscookie, annars `401`
- **GET `/api/admin/bookings?from=YYYY-MM-DD`** → `200` lista av bokningar `{id,date,time,staff,service,name,phone}`, annars `401`
- **DELETE `/api/admin/bookings/:id`** → `204`, annars `401`

## Krav
- Unikt index på `(date, time, staff)` så dubbelbokning är omöjlig (returnera 409).
- Validera allt på servern: giltigt datum/tid inom öppettider, frisör finns, längdgränser, inte i det förflutna.
- Rate limiting på POST `/api/bookings` och login. Hasha admin-lösenord.
- Rekommenderat: bekräftelse via SMS/e-post och påminnelse dagen före.
- Tabell: `bookings(id, date, time, staff, service, name, phone, created_at)`.
