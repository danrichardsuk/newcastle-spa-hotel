# Newcastle Spa Hotel Map

A mobile-friendly interactive database of **78 researched hotel-spa candidates** within approximately a three-hour drive of Newcastle upon Tyne.

The site deliberately separates **completeness** from **recommendation quality**:

- **24 recommended high-quality spa hotels** (research score 84+)
- **15 value / high-secondary alternatives**
- further secondary, leisure-led and niche candidates retained for completeness
- **Matfen Hall / Aurelius Spa** shown as forthcoming and deliberately unranked until post-opening evidence exists
- **Gleneagles** retained as a three-hour boundary case rather than included in the strict ranking

## Features

- Ranked Leaflet / OpenStreetMap map with numbered pins for the top 24
- Complete 78-property research database
- Search across hotel, region, facilities, tags and category
- Combinable filters for quality tier, region, drive time and spa features
- Feature filters for spa-first, nearby, couples, adults-focused, family, golf, city, coast, lakes, nature, value and deal-led stays
- Sorting by recommended order, research score, drive time, review score or name
- Distinct map/card styling for recommended, value, secondary/leisure/niche, forthcoming and boundary candidates
- Indicative spa-break pricing, booking guidance and operational warnings where research supported them
- Direct Google Maps directions from Newcastle
- Official-site links where verified and Tripadvisor search fallback for independent reviews
- Responsive Android / iPhone layout with safe-area handling
- Graceful map fallback if Leaflet/CDN loading fails

## Data model

`spa-data.js` contains the **24 ranked recommendations plus Matfen Hall**.

`spa-candidates.js` contains the **53 additional audited candidates**, including value, secondary, leisure-led, niche and boundary properties.

The two files combine at runtime in `app.js`, giving **78 total records**.

Research current to **2 September 2026**. Prices are indicative and dynamic. Drive times and map coordinates are planning aids rather than live navigation data.

## Latest research score weighting

The exhaustive audit revised the comparison framework to better separate spa quality from hotel review volume:

- 30% spa depth and facilities
- 25% independent guest evidence
- 15% hotel quality
- 10% spa integration and serenity
- 10% value for the total experience
- 5% Newcastle accessibility
- 5% evidence / operational confidence

Score bands:

- **90+** exceptional destination spa
- **84–89** high-quality recommended shortlist
- **78–83** good/value alternative
- **below 78** primarily leisure/value-led
- forthcoming properties remain unscored until meaningful guest evidence exists

## Why all 78 are retained

The first version of the research was too top-down and could miss hotels marketed primarily as golf resorts, country hotels, leisure clubs or deal properties. The exhaustive audit therefore enumerates the whole plausible market first, then filters and scores it.

This is why hotels such as Westerwood, Redworth Hall, Hall Garth, Harrogate Majestic, Wynyard Hall and many Lake District leisure/spa hotels remain visible even where they do not make the premier ranking.

## Run locally

Open `index.html` directly, or serve the directory with any static HTTP server.

## GitHub Pages

The included Pages workflow publishes the site automatically from `main`.
