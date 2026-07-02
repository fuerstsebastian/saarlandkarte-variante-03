/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * data.js - Handles fetching and caching the archaeological sites data.
 */

// Fallback sample data in case fetch fails
const fallbackData = [
  {
    "id": "befestigung-st-arnual-sonnenberg",
    "name": "Vorgeschichtliche Befestigung St. Arnual/Sonnenberg",
    "gemeinde": "Saarbrücken",
    "lat": 49.207179,
    "lng": 7.01288,
    "beschreibung": "Im Stiftswald bei St. Arnual liegt auf dem Sonnenberg eine vorgeschichtliche Befestigungsanlage, die aus zwei etwa 800 m voneinander entfernten Wällen bestand. Der östliche Hauptwall sicherte den Sporn, während der 2019 untersuchte Vorwall das Plateau an einer Engstelle abriegelte.",
    "zeitstellung": "Hallstatt",
    "kategorie_attraktion": "Bodendenkmal",
    "kategorie_befund": "Befestigung / Ringwall",
    "sichtbarkeit": "eingeschränkt sichtbar",
    "barrierefreiheit": false,
    "oeffnungszeiten": null,
    "eintrittspreis": "Kostenlos",
    "maps_link": "https://maps.google.com/?q=49.207179,7.012880",
    "denkmalschutzstatus": "Archäologisch bekanntes Bodendenkmal",
    "literatur": [
      "Ott, R. / Höpken, C. 2019: Neue Untersuchungen an der prähistorischen Befestigung im Stiftswald von St. Arnual. Denkmalpflege im Saarland 2019, 21–23."
    ],
    "thumbnail": false
  }
];

/**
 * Fetches the archaeological data from `/data/fundstellen.json`
 * @returns {Promise<Array>} List of archaeological sites
 */
export async function loadFundstellen() {
  try {
    const response = await fetch('/data/fundstellen.json');
    if (!response.ok) {
      throw new Error(`Data fetch failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Could not retrieve archaeological data from JSON, loading backup locally.", error);
    return fallbackData;
  }
}
