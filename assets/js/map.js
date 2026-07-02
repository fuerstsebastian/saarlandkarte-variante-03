/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * map.js - Manages the Leaflet map, layers, custom markers, and popups.
 */

/**
 * Returns a cohesive color code for each archaeological epoch.
 * Matches colors used in Tailwind stylesheet badge styles.
 * 
 * @param {string} epoch - The site's epoch / zeitstellung
 * @returns {string} HEX color code
 */
export function getEpochColor(epoch) {
  switch (epoch) {
    case 'Neolithikum': return '#8B7E66'; // Warm Olive Sage / Beige
    case 'Bronzezeit': return '#C2A36B'; // Soft Bronze / Amber
    case 'Eisenzeit / Latènezeit': return '#8B5E3C'; // Iron Terracotta / Brown
    case 'Hallstatt': return '#9A5233'; // Rich Rust / Hallstatt Terracotta Iron
    case 'Römerzeit': return '#4A5D4E'; // Rich Pine / Roman Forest Green
    case 'Mittelalter': return '#5C5549'; // Slate Earth / Charcoal Gray
    default: return '#8B7E66'; // Fallen leaves / Muted Grey Brown
  }
}

export class ArchMap {
  /**
   * Initializes the map inside the given container element
   * @param {string} containerId - DOM ID of the map div
   * @param {Function} onMarkerSelect - Callback when user selects/clicks a site marker
   */
  constructor(containerId, onMarkerSelect) {
    this.containerId = containerId;
    this.onMarkerSelect = onMarkerSelect;
    this.map = null;
    this.markerGroup = null;
    this.markersMap = new Map(); // Keep track of markers by site ID for programmatic selection
    this.activeSiteId = null;

    // Saarland Map center and bounds
    this.defaultCenter = [49.38, 6.95];
    this.defaultZoom = 10;
  }

  /**
   * Render or initialize the map and tile layers.
   */
  init() {
    if (this.map) return;

    // Use Leaflet global, assuming it's loaded via CDN in HTML
    if (typeof L === 'undefined') {
      console.error("Leaflet.js is not loaded. Please inspect your CDN links.");
      return;
    }

    // Initialize map
    this.map = L.map(this.containerId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: false, // We'll add it in a nicer spot manually
      scrollWheelZoom: true,
      maxBounds: [
        [49.00, 6.10], // Southwest bounds
        [49.80, 7.60]  // Northeast bounds
      ],
      minZoom: 9
    });

    // Add custom zoom control in the bottom-right corner rather than default top-left
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Event delegation for popup "Details" buttons
    this.map.getContainer().addEventListener('click', (e) => {
      const btn = e.target.closest('.select-site-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const siteId = btn.getAttribute('data-id');
      if (siteId) {
        this.selectSite(siteId, true);
        this.map.closePopup();
      }
    });

    // Standard high-quality OSM Tiles with correct attribution and nice styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende'
    }).addTo(this.map);

    // Group for easy bulk add/remove of markers
    this.markerGroup = L.layerGroup().addTo(this.map);
  }

  /**
   * Re-draw markers on the map for the given filtered array of sites.
   * 
   * @param {Array} sites - Filtered archaeological sites
   */
  updateMarkers(sites) {
    if (!this.map || !this.markerGroup) return;

    // Clear existing markers
    this.markerGroup.clearLayers();
    this.markersMap.clear();

    sites.forEach(site => {
      const color = getEpochColor(site.zeitstellung);
      
      // Elegant, minimalist small solid dot indicator
      const icon = L.divIcon({
        className: `custom-div-marker site-marker-${site.id}`,
        html: `<div class="custom-div-marker-inner" style="background-color: ${color};" title="${site.name} (${site.zeitstellung})"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      });

      // Build Leaflet Marker
      const marker = L.marker([site.lat, site.lng], { icon: icon });

      // Build rich, highly legible and modern content for popups with enhanced font hierarchy
      const popupContent = `
        <div class="p-5 flex flex-col gap-3 font-sans">
          ${site.thumbnail ? `
            <div class="-mx-5 -mt-5 mb-1 overflow-hidden rounded-t-lg">
              <img src="${site.bild}" alt="${site.name}" class="w-full h-36 object-cover" loading="lazy" />
              <div class="bg-slate-800/70 text-white text-[9px] px-3 py-1 flex items-center justify-between" style="margin-top: -24px; position: relative; z-index: 1;">
                <span>${site.id.replace('dummy-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                <span>Foto: CC-lizenziert</span>
              </div>
            </div>
          ` : ''}
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <span class="text-xs uppercase tracking-wide font-sans font-extrabold px-2.5 py-1 rounded-sm shadow-xs text-white" style="background-color: ${color};">
              ${site.zeitstellung}
            </span>
            <span class="text-xs text-slate-500 font-bold">${site.gemeinde}</span>
          </div>
          <h3 class="text-lg font-extrabold font-sans text-slate-900 leading-tight tracking-tight">${site.name}</h3>
          <p class="text-[13px] text-slate-700 leading-relaxed">${site.beschreibung}</p>
          <div class="border-t border-slate-100 my-1 pt-3.5 flex items-center justify-between gap-3">
            <span class="text-xs font-bold text-slate-500">
              ${site.kategorie_befund || 'Ausgrabung'}
            </span>
            <button class="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#3A4C3E] text-white transition-colors cursor-pointer select-site-btn focus:outline-hidden" data-id="${site.id}">
              Details →
            </button>
          </div>
        </div>
      `;

      // Assign popup
      marker.bindPopup(popupContent);

      // Add a highly legible hover tooltip with the site's name and its clear dating
      marker.bindTooltip(`
        <div class="p-2 text-xs font-sans rounded shadow-md bg-white border border-slate-100">
          <div class="font-extrabold text-slate-900 mb-0.5">${site.name}</div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${color};"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${site.zeitstellung}</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -16],
        opacity: 0.98,
        sticky: true
      });

      // Listen to click events on marker
      marker.on('click', () => {
        this.selectSite(site.id, false);
      });



      // Put to map group and internal dictionary
      marker.addTo(this.markerGroup);
      this.markersMap.set(site.id, marker);
    });
  }

  /**
   * Programmatically selects a site, moves map, opens popup and triggers callback.
   * 
   * @param {string} id - Site ID
   * @param {boolean} panTo - Whether to center the map on the selected site
   */
  selectSite(id, panTo = true) {
    this.activeSiteId = id;
    
    // Clear old active classes
    const activeElements = document.querySelectorAll('.custom-div-marker-active');
    activeElements.forEach(el => el.classList.remove('custom-div-marker-active'));

    // Highlight marker visually
    const marker = this.markersMap.get(id);
    if (marker) {
      const container = marker.getElement();
      if (container) {
        container.classList.add('custom-div-marker-active');
      }

      const latlng = marker.getLatLng();
      if (panTo) {
        this.map.setView(latlng, 13, { animate: true, duration: 1 });
        marker.openPopup();
      }
    }

    // Trigger outer UI sync
    if (this.onMarkerSelect) {
      this.onMarkerSelect(id);
    }
  }

  /**
   * Resets the map to the complete Saarland view.
   */
  resetView() {
    if (!this.map) return;
    this.map.setView(this.defaultCenter, this.defaultZoom, { animate: true, duration: 1.2 });
    if (this.map.hasLayer(this.markerGroup)) {
      this.map.closePopup();
    }
    
    // Clear marker highlighting
    const activeElements = document.querySelectorAll('.custom-div-marker-active');
    activeElements.forEach(el => el.classList.remove('custom-div-marker-active'));
    this.activeSiteId = null;
  }
}
