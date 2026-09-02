# Newcastle Spa Hotel Map

A mobile-friendly interactive map of **20 recommended high-quality hotel spas** within approximately a three-hour drive of Newcastle upon Tyne, plus Matfen Hall's forthcoming Aurelius Spa as a separate unranked record.

## Features

- Ranked Leaflet / OpenStreetMap map with numbered pins
- Search across hotels, areas and facilities
- Filters for nearby stays, spa-first hotels, couples, Scotland, nature, golf, value and forthcoming openings
- Drive-time, indicative price, independent-review and analytical research-score information
- Expandable facility lists and booking guidance
- Direct Google Maps directions from Newcastle
- Official hotel and independent review links
- Responsive Android / iPhone layout with safe-area handling
- Graceful map fallback if Leaflet/CDN loading fails
- Static, dependency-free hosting apart from Leaflet/OpenStreetMap

## Data

Expanded deep research current to **2 September 2026**. Prices are indicative and dynamic. Drive times are planning estimates for normal traffic and may vary substantially on Lake District approaches and around central Edinburgh.

The primary list is intentionally quality-filtered rather than exhaustive. The research universe also considered properties such as Slaley Hall, Feversham Arms, The Daffodil, The Balmoral and Macdonald Cardrona, but they were not promoted into the main 20 because the combined spa depth, independent review evidence, value or current operational proposition was weaker than the cutoff.

Matfen Hall is stored as `status: "forthcoming"` and is not assigned a ranking or analytical score until Aurelius Spa has opened and independent evidence becomes available.

Research score weighting:
- 35% spa breadth and quality
- 20% independent guest rating
- 15% hotel and dining proposition
- 10% setting / wellness experience
- 10% driving convenience
- 5% value / price transparency
- 5% operational confidence

## Run locally

Open `index.html` directly, or serve the directory with any static HTTP server.

## GitHub Pages

The included Pages workflow publishes the site automatically from `main`.
