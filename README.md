# LuxStay — Hotel Booking Frontend

React frontend for the HotelBookingAPI (.NET backend).

## Quick Start

```bash
npm install
npm start
```

App runs at: http://localhost:3000

---

## Backend URL Configuration

Edit `src/api/axios.js` and set your backend URL:

```js
baseURL: 'http://localhost:5000/api',  // ← change port if needed
```

Your .NET backend should have CORS enabled for `http://localhost:3000` and cookies/credentials allowed.

---

## Expected API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/auth/register    | Register a new user      |
| POST   | /api/auth/login       | Login and set auth cookie|
| POST   | /api/auth/logout      | Clear auth cookie        |
| GET    | /api/auth/me          | Get current user         |
| GET/POST | /api/hotels         | List / Create hotels     |
| GET/PUT/DELETE | /api/hotels/{id} | Get / Update / Delete |
| GET/POST | /api/rooms          | List / Create rooms      |
| GET/PUT/DELETE | /api/rooms/{id}  | Get / Update / Delete |
| GET/POST | /api/guests         | List / Create guests     |
| GET/PUT/DELETE | /api/guests/{id} | Get / Update / Delete |
| GET/POST | /api/reservations   | List / Create reservations |
| GET/PUT/DELETE | /api/reservations/{id} | Get / Update / Delete |
| GET/POST | /api/payments       | List / Create payments   |
| GET/PUT/DELETE | /api/payments/{id} | Get / Update / Delete |

---

## .NET CORS Setup (Program.cs)

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// ...

app.UseCors("ReactApp");
```

## Cookie Auth Setup

Ensure your backend sends cookies with `SameSite=None; Secure` (or `Lax` for local dev), and that `HttpOnly` is set for security.

---

## Pages

| Route          | Page          | Description                       |
|----------------|---------------|-----------------------------------|
| /login         | Login         | Auth — public                    |
| /register      | Register      | Auth — public                    |
| /dashboard     | Dashboard     | Stats overview + quick links      |
| /hotels        | Hotels        | Full CRUD for hotel properties    |
| /rooms         | Rooms         | Full CRUD with hotel association  |
| /guests        | Guests        | Full CRUD for guest profiles      |
| /reservations  | Reservations  | Full CRUD with totals calculator  |
| /payments      | Payments      | Full CRUD with revenue summary    |
