# Seeding New Locations – Detailed Explanation

## Why We Need a Seed Script
The **TripGenie** platform relies on a rich set of destination data (name, location, category, images, etc.) to power its search, filters, and recommendation UI. Manually entering this data for every city is impractical, so we automate the process with a **seed script** that:
1. **Discovers nearby points of interest** using the Google Maps Places API.
2. **Transforms** the raw API response into the shape expected by our Prisma schema.
3. **Persists** the data (destinations and their photos) into the database.
4. **Keeps the frontend and backend in sync** by using the same category identifiers that the UI expects.

---

## High‑Level Workflow
1. **Select a city** – The script receives a city slug (e.g., `mumbai`). It looks up the city record in the `City` table to obtain latitude, longitude, and the internal `id`.
2. **Define search categories** – A static array maps human‑readable search terms ("Hill Stations", "Beaches", …) to **category values** that match the constants defined in `lib/constants.ts` (`hill_station`, `nature`, `historical`, `spiritual`, `adventure`, `beach`, `wildlife`).
3. **Query Google Places** – For each category we call `searchNearby` with:
   - The city’s coordinates.
   - A radius of ~50 km (large enough to capture relevant attractions).
   - The keyword derived from the search term.
4. **Fetch detailed information** – For every place returned we request full place details (`getPlaceDetails`). This gives us:
   - Name, geometry, photo references, and additional metadata.
5. **Build image URLs** – Photo references are turned into publicly accessible URLs using the **Google Maps API key** (`process.env.GOOGLE_MAPS_API_KEY`). The key is stored securely in `.env` and never hard‑coded.
6. **Create a `Destination` record** – The script inserts a row with:
   - `name`, `slug` (URL‑friendly), latitude/longitude, `category`, a short summary, and the primary `imageUrl`.
   - The `cityId` foreign key links the destination to the selected city.
7. **Store additional photos** – Each photo reference becomes a `DestinationPhoto` entry containing the reference and the generated `photoUrl`.
8. **Repeat** for all categories, accumulating a comprehensive set of destinations for the city.
9. **Finish** – The script logs success, disconnects the Prisma client, and exits.

---

## Important Implementation Details
- **Category Consistency** – The `category` field in the database must exactly match the values used by the frontend filter component (`CATEGORIES`). Changing these values requires updating both `seed-nearby.ts` and the UI constants.
- **Environment Variable** – `GOOGLE_MAPS_API_KEY` is read from `.env`. The script never uses `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (which is undefined in the backend context) to avoid broken image URLs.
- **Idempotency** – The script does **not** check for existing destinations before inserting. Running it multiple times for the same city will create duplicates. In production you may add a uniqueness constraint on `slug` or perform a `upsert`.
- **Rate Limits** – Google Maps imposes quota limits. The script respects a modest radius and sequential request pattern. If you hit limits, consider adding a delay (`await new Promise(r => setTimeout(r, 200))`) between API calls.
- **Error Handling** – Errors are caught at the top level; the script prints a clear message and exits with a non‑zero status, making it easy to integrate into CI pipelines.

---

## How to Run the Seed Script
1. **Prepare the environment**
   - Ensure `.env` contains a valid `GOOGLE_MAPS_API_KEY`.
   - Install dependencies: `bun install` (or `npm install`).
2. **Compile / Execute**
   - The script is plain TypeScript and can be run with `ts-node` (bundled with Bun). Example command:
   ```bash
   bun run ts-node ./seed-nearby.ts mumbai
   ```
   Replace `mumbai` with any city slug present in the `City` table.
3. **Verify**
   - After the script finishes, check the database tables `Destination` and `DestinationPhoto` for new rows.
   - Visit the city page in the UI; the newly seeded destinations should appear and be filterable by the categories defined above.

---

## Future Enhancements (Optional)
- **CLI flags** – Allow customizing radius, max results per category, or selecting a subset of categories.
- **Dry‑run mode** – Print the data that would be inserted without touching the DB, useful for validation.
- **Upserts / uniqueness** – Prevent duplicate entries by upserting on `slug`.
- **Additional metadata** – Store ratings, opening hours, or user‑generated tags for richer destination cards.
- **Parallel API calls** – Introduce controlled concurrency to speed up seeding while respecting rate limits.

---

## Summary
The seed script automates the discovery and storage of destination data for any city, ensuring that the backend data model and frontend filter UI stay perfectly aligned. By following the steps above you can safely add new locations to TripGenie, keep the UI responsive, and maintain data integrity.
