# 🏛️ Archäologische Orte im Saarland | Interaktive Kulturkarte

Eine interaktive, datenschutzfreundliche und barrierearme Web-Applikation zur Visualisierung und Vermittlung öffentlich bekannter archäologischer Denkmäler und Attraktionen im Saarland. Entwickelt als wissenschaftliches Informationsportal in Kooperation mit den Altertumswissenschaften der **Universität des Saarlandes**.

---

## 📌 Projektbeschreibung

Dieses Portal bietet der breiten Öffentlichkeit, Schulen, Familien und Touristinnen einen niedrigschwelligen Einstieg in die reiche Kulturgeschichte des Saarländischen Raums. Über eine interaktive Karte auf Basis von **Leaflet.js** und **OpenStreetMap** können spannende Befunde und naturgetreue historische Rekonstruktionen chronologisch sortiert und gefiltert erkundet werden.

Um maximale digitale Zugänglichkeit (**Barrierearmut**) zu gewähren, verfügt die Anwendung über zwei parallel synchronisierte Darstellungsweisen:
1. Eine hochgradig interaktive Geokarte mit detaillierten Popups für sehende und interaktionserprobte Menschen.
2. Eine vollkommen barrierefreie, screenreader-optimierte **Listengitter-Ansicht** aller gefilterten Orte unmittelbar unter der Karte.

---

## 🚀 Startanleitung

Da diese Anwendung vollständig auf moderne Client-Side-Technologien und statische Assets setzt, benötigt sie kein laufendes Datenbanksystem.

### Lokale Entwicklung
1. Installieren Sie die NPM-Abhängigkeiten im Hauptverzeichnis:
   ```bash
   npm install
   ```
2. Starten Sie den integrierten lokalen Entwicklungsserver unter Verwendung von Vite:
   ```bash
   npm run dev
   ```
3. Öffnen Sie die angezeigte URL (standardmäßig `http://localhost:3000`) in Ihrem bevorzugtem Browser.

### Produktions-Build
Kompilieren und bündeln Sie alle fünf statischen HTML-Einstiegspunkte mitsamt CSS und JS-Modulen in das Verteilungsverzeichnis `dist/`:
```bash
npm run build
```

---

## 📂 Projektstruktur

```text
/
├── assets/
│   ├── css/
│   │   └── styles.css          # Haupt-Stylesheet mit Tailwind v4 und Custom Styles
│   ├── data/
│   │   └── fundstellen.json    # JSON-Datenbasis für die archäologischen Standorte
│   └── js/
│       ├── app.js              # Haupt-Schnittstelle und UI-Koordinator
│       ├── data.js             # Lade- und Fallback-Management der JSON-Daten
│       ├── filters.js          # Kombinierbare Filter-Algorithmen
│       └── map.js              # Map-Controller für Leaflet, Layer und Markers
├── index.html                  # Startseite mit interaktiver Karte & Filter-Dashboard
├── epochen.html                # Bildungsportal über d. archäologischen Epochen
├── projekt.html                # Wissenschaftlicher Projekt-Hintergrund & Schutzethik
├── impressum.html              # Rechtliches Impressum (Musterplatzhalter)
├── datenschutz.html            # Datenschutzerklärung (DSGVO-konform, ohne Cookies)
├── package.json                # Project Manifest & NPM Scripts
├── vite.config.ts              # Vite Konfiguration für Multi-Page-Applikationen
└── README.md                   # Diese Projektdokumentation
```

---

## 📊 Datenmodell (`fundstellen.json`)

Die Datenbasis liegt in `/assets/data/fundstellen.json` und folgt einem streng typisierten, erweiterbaren Schema. Jedes Objekt repräsentiert eine öffentlich bekannte Fundstelle:

```json
{
  "id": "villa-borg",
  "name": "Römische Villa Borg",
  "gemeinde": "Perl",
  "lat": 49.496,
  "lng": 6.463,
  "beschreibung": "Eine detailgetreu rekonstruierte römische Villenanlage...",
  "zeitstellung": "Römerzeit",
  "kategorie_attraktion": "Rekonstruktion",
  "kategorie_befund": "Villa / Gutshof",
  "sichtbarkeit": "vollständig sichtbar",
  "barrierefreiheit": true,
  "oeffnungszeiten": "Di–So 10–18 Uhr, ohne Gewähr",
  "eintrittspreis": "6,00 €, ohne Gewähr",
  "maps_link": "https://www.google.com/maps/search/?api=1&query=49.496,6.463",
  "denkmalschutzstatus": "Eingetragenes geschütztes Baudenkmal...",
  "literatur": [
    "Birringer, B.: Die Römische Villa Borg. Perl-Borg 2012."
  ],
  "bild": "https://images.unsplash.com/photo-1564507592333-c60657eea523...",
  "bildnachweis": "Unsplash / Creative Commons License"
}
```

---

## 🛡️ Wichtiger Hinweis zu sensiblen Fundstellen (Raubgrabungsschutz)

Dieses Portal ist **kein vollständiges oder amtliches Denkmalverzeichnis**. 

Zum Schutz unersetzlicher, im Boden schlummernder Geschichtsarchive publizieren wir **keine Koordinaten von gefährdeten oder nicht-touristischen Bodendenkmälern**. Raubgrabungen (auch das ungenehmigte Sondengehen mit Metallsuchgeräten) zerstören wissenschaftliche Fundzusammenhänge unwiederbringlich und sind nach dem **Saarländischen Denkmalschutzgesetz (SDschG)** streng untersagt sowie strafbar.

Alle hier aufgeführten Orte sind bereits touristisch umfassend erschlossen, öffentlich beschildert und wissenschaftlich erforscht.

---

## 🔒 Datenschutz-Prinzipien (DSGVO)

In vollständiger Abstimmung mit datenschutzfreundlichen Hochschulvorgaben:
- **Absoluter Verzicht** auf trackingbasierte Cookies oder Sessions.
- **Keine Einbettung** von speicherintensiven Tracking-Tools (z. B. Matomo, Google Analytics).
- **Kein User-Profiling** und keine Login-Pfade.
- **Sicherer Abruf** von Kartenkacheln direkt bei OpenStreetMap Foundation.
- **Sicherer Umgang mit Google Maps:** Routenbeschreibungen sind als **echte, externe Links** implementiert. Es erfolgt keine im Hintergrund unbemerkte Datenübertragung an Google-Server beim Laden des Portals.

---

## 💡 Erweiterungsmöglichkeiten

1. **Mehrsprachigkeit (i18n):** Erweiterung des Datenmodells sowie der Statik um Französisch und Englisch zur Förderung des grenzüberschreitenden Tourismus im Drei-Länder-Eck.
2. **Audio-Guides (Text-to-Speech):** Integration direkt im JavaScript zur Unterstützung barrierefreier Informationsaufnahme direkt vor Ort am Denkmal per Smartphone.
3. **Anbindung von Landes-Wanderwegen:** Darstellung von saarländischen Rundwanderwegen (z. B. Traumschleifen, Keltenweg) direkt als Overlay-Linien (GeoJSON-Layer) in Leaflet.
