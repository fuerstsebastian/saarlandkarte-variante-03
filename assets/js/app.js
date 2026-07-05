/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * app.js - Main coordinator script for the Saarland Archeology Hub.
 */

import { loadFundstellen } from './data.js';
import { filterSites } from './filters.js';
import { ArchMap, getEpochColor } from './map.js';

// Application State
let allSites = [];
let filteredSites = [];
let currentSelectedSite = null;
let archMapInstance = null;

const activeFilters = {
  zeitstellung: 'all',
  kategorie_attraktion: 'all',
  kategorie_befund: 'all',
  sichtbarkeit: 'all',
  barrierefreiheit: 'all'
};

/**
 * Initializes the application.
 */
async function initApp() {
  console.log("Initializing Archaeological App of Saarland...");

  // 1. Fetch JSON Data
  allSites = await loadFundstellen();
  filteredSites = [...allSites];

  // 2. Initialize Leaflet Map
  archMapInstance = new ArchMap('map-element', handleSiteSelection);
  archMapInstance.init();
  archMapInstance.updateMarkers(allSites);

  // 3. Populate dynamic filters (like Category & Discovery Type)
  populateDynamicFilters();

  // 4. Render Sidebar / Grid of Locations
  renderLocationsGrid(allSites);

  // 5. Setup Interactive Event Listeners
  setupEventListeners();

  // 6. Update Stats count
  updateStats(allSites.length, allSites.length);
}

/**
 * Dynamically updates selections based on real JSON content so they are perfectly in sync.
 */
function populateDynamicFilters() {
  const befundSelect = document.getElementById('filter-befund');
  const attraktionSelect = document.getElementById('filter-kategorie_attraktion');

  if (befundSelect) {
    const uniqueBefunde = Array.from(new Set(allSites.map(s => s.kategorie_befund).filter(Boolean))).sort();
    uniqueBefunde.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      befundSelect.appendChild(opt);
    });
  }

  if (attraktionSelect) {
    const uniqueAttraktionen = Array.from(new Set(allSites.map(s => s.kategorie_attraktion).filter(Boolean))).sort();
    uniqueAttraktionen.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      attraktionSelect.appendChild(opt);
    });
  }
}

/**
 * Updates the listing of locations below or beside the map based on filtering.
 */
function renderLocationsGrid(sites) {
  const gridContainer = document.getElementById('locations-grid');
  if (!gridContainer) return;

  if (sites.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <svg class="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium text-slate-700">Keine Fundstellen gefunden</p>
        <p class="text-xs text-slate-400 mt-1">Versuche andere Filterkombinationen oder setze die Suche zurück.</p>
      </div>	
    `;
    return;
  }

  gridContainer.innerHTML = sites.map(site => {
    const epochColor = getEpochColor(site.zeitstellung);
    const barrierText = site.barrierefreiheit ? 'Barrierearm' : 'Nicht stufenlos';
    const barrierClass = site.barrierefreiheit ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100';

    return `
      <div class="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden cursor-pointer hover:border-brand-200 group relative p-5" data-id="${site.id}">
        <!-- Header Badges -->
        <div class="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
          <span class="text-xs uppercase font-sans tracking-wider font-semibold text-[#4A5D4E] bg-slate-100 px-2.5 py-1 rounded">
            ${site.gemeinde}
          </span>
          <span class="text-xs uppercase font-sans tracking-wide font-extrabold text-white px-2.5 py-1.5 rounded shadow-xs" style="background-color: ${epochColor};">
            ${site.zeitstellung}
          </span>
        </div>

        <!-- Content Body -->
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 group-hover:text-[#4A5D4E] transition-colors text-base font-display mb-1 line-clamp-1">${site.name}</h3>
            <p class="text-xs text-slate-500 mb-3 font-medium flex items-center gap-1">
              <span>${site.kategorie_befund || 'Befund'}</span>
              <span>•</span>
              <span>${site.sichtbarkeit}</span>
            </p>
            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">${site.beschreibung}</p>
          </div>

          <div class="border-t border-slate-50 pt-3 flex items-center justify-between gap-1 mt-auto">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${barrierClass}">
              ${barrierText}
            </span>
            <span class="text-xs font-bold text-brand-500 group-hover:underline flex items-center gap-0.5">
              Anzeigen →
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind click event to each card
  gridContainer.querySelectorAll('[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (archMapInstance) {
        archMapInstance.selectSite(id, true);
        // Scroll map container into view on mobile
        if (window.innerWidth < 768) {
          document.getElementById('map-element').scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/**
 * Handles site selection - updates details modal / drawer and shows complete info.
 */
function handleSiteSelection(siteId) {
  const site = allSites.find(s => s.id === siteId);
  if (!site) return;

  currentSelectedSite = site;
  
  // Fill details card sidebar / modal
  const detailsPanel = document.getElementById('details-panel');
  if (!detailsPanel) return;

  const epochColor = getEpochColor(site.zeitstellung);
  const isBarrierFree = site.barrierefreiheit === true;

  // Render complete details html
  detailsPanel.innerHTML = `
    <div class="p-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <button id="close-details-btn" class="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer">
          ✕ Schließen
        </button>
        <span class="text-xs font-mono text-slate-400">ID: ${site.id}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 mb-4">
        <span class="text-xs uppercase font-sans tracking-wider font-extrabold text-white px-3 py-1.5 rounded-sm shadow-xs" style="background-color: ${epochColor};">
          ${site.zeitstellung}
        </span>
        <span class="text-xs font-sans font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-sm">
          ${site.gemeinde}
        </span>
      </div>

      <h2 class="text-2xl font-bold font-display text-slate-900 leading-tight mb-3">${site.name}</h2>

      ${site.bild ? `
        <div class="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img src="${site.bild}" alt="${site.name}" class="w-full h-56 object-cover" loading="lazy" />
          <div class="bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500 flex items-center justify-between font-sans">
            <span>Bild: ${getImageCreditName(site.id)}</span>
            <span>${getImageLicense(site.id)}</span>
          </div>
        </div>
      ` : ''}

      <p class="text-sm text-slate-600 leading-relaxed mb-6">${site.beschreibung}</p>

      <!-- Steckbrief Grid -->
      <div class="bg-brand-50/50 border border-brand-200 rounded-xl p-4 mb-6">
        <h3 class="text-xs uppercase font-bold tracking-widest text-[#2D362E] mb-3 pb-1 border-b border-brand-200">
          Steckbrief &amp; Fund-Metadaten
        </h3>
        
        <dl class="space-y-2.5 text-xs">
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Kategorie Attraktion</dt>
            <dd class="text-slate-900 font-bold text-right">${site.kategorie_attraktion}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Befundtyp</dt>
            <dd class="text-slate-900 font-bold text-right">${site.kategorie_befund || 'Befund'}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Sichtbarkeit vor Ort</dt>
            <dd class="text-slate-900 font-bold text-right capitalize">${site.sichtbarkeit}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Barrierefreiheit</dt>
            <dd class="font-bold text-right ${isBarrierFree ? 'text-emerald-700' : 'text-amber-700'}">
              ${isBarrierFree ? 'Barrierearm zugänglich' : 'Nicht barrierefrei / Naturpfad'}
            </dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Öffnungszeiten</dt>
            <dd class="text-slate-900 font-medium text-right max-w-[180px]">${site.oeffnungszeiten || 'Keine Angabe'}</dd>
          </div>
          <div class="flex justify-between pb-1">
            <dt class="text-slate-500 font-medium">Eintrittspreis</dt>
            <dd class="text-slate-900 font-bold text-right">${site.eintrittspreis || 'Freibetrag'}</dd>
          </div>
        </dl>
      </div>

      <!-- Denkmalschutz Warning -->
      <div class="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 mb-6">
        <div class="flex gap-2 items-start">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
          <div>
            <h4 class="text-xs font-bold text-amber-900 mb-1">Denkmalschutz-Hinweis</h4>
            <p class="text-[11px] text-amber-800 leading-relaxed">
              ${site.denkmalschutzstatus || 'Keine sensiblen Detailangaben öffentlich anzeigen'}. Es gelten die Bestimmungen des Saarländischen Denkmalschutzgesetzes. Raubgrabungen sind rechtswidrig und strafbar.
            </p>
          </div>
        </div>
      </div>

      <!-- Literature List -->
      ${site.literatur && site.literatur.length > 0 ? `
        <div class="mb-6">
          <h3 class="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-2">Fachliteratur</h3>
          <ul class="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
            ${site.literatur.map(lit => `<li>${lit}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- External Map Navigation Link -->
      ${site.maps_link ? `
        <div class="mt-6 pt-4 border-t border-slate-100">
          <a href="${site.maps_link}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3A4C3E] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center">
            Google Maps Navigation 
            <span class="text-[10px] font-normal text-slate-200 font-mono">(Externer Link)</span>
          </a>
        </div>
      ` : ''}
    </div>
  `;

  // Hide welcome state and show details panel
  const welcomeState = document.getElementById('welcome-details-state');
  if (welcomeState) welcomeState.classList.add('hidden');
  detailsPanel.classList.remove('hidden');

  // Invalidate map size after DOM changes to prevent white gaps
  if (archMapInstance && archMapInstance.map) {
    setTimeout(() => archMapInstance.map.invalidateSize(), 60);
  }

  // Close details via delegated click
  const closeBtn = document.getElementById('close-details-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      detailsPanel.classList.add('hidden');
      if (welcomeState) welcomeState.classList.remove('hidden');
      if (archMapInstance) {
        archMapInstance.resetView();
      }
    });
  }
}

/**
 * Standard Setup of DOM Event Listeners.
 */
function setupEventListeners() {
  const filterForm = document.getElementById('filter-form');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const overviewBtn = document.getElementById('reset-map-btn');

  // Listen to filter element changes
  const selectFilters = ['zeitstellung', 'kategorie_attraktion', 'kategorie_befund', 'sichtbarkeit', 'barrierefreiheit'];
  selectFilters.forEach(property => {
    const selectorId = `filter-${property === 'zeitstellung' ? 'epoch' : property}`;
    const element = document.getElementById(selectorId);
    if (element) {
      element.addEventListener('change', (e) => {
        activeFilters[property] = e.target.value;
        applyFilters();
      });
    }
  });

  // Clear filters button trigger
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Reset select DOM values
      const selectEpoch = document.getElementById('filter-epoch');
      const selectAttraktion = document.getElementById('filter-kategorie_attraktion');
      const selectBefund = document.getElementById('filter-befund');
      const selectSichtbarkeit = document.getElementById('filter-sichtbarkeit');
      const selectBarriere = document.getElementById('filter-barrierefreiheit');

      if (selectEpoch) selectEpoch.value = 'all';
      if (selectAttraktion) selectAttraktion.value = 'all';
      if (selectBefund) selectBefund.value = 'all';
      if (selectSichtbarkeit) selectSichtbarkeit.value = 'all';
      if (selectBarriere) selectBarriere.value = 'all';

      // Clear state filters
      Object.keys(activeFilters).forEach(key => activeFilters[key] = 'all');

      applyFilters();
    });
  }

  // Back to Saarland overview on map focus
  if (overviewBtn) {
    overviewBtn.addEventListener('click', () => {
      if (archMapInstance) {
        archMapInstance.resetView();
        const detailsPanel = document.getElementById('details-panel');
        if (detailsPanel) detailsPanel.classList.add('hidden');
        const welcomeState = document.getElementById('welcome-details-state');
        if (welcomeState) welcomeState.classList.remove('hidden');
      }
    });
  }
}

/**
 * Filter runner - ties the filtering module together with the map and list views.
 */
function applyFilters() {
  // Filter active nodes
  filteredSites = filterSites(allSites, activeFilters);

  // Update map layer
  if (archMapInstance) {
    archMapInstance.updateMarkers(filteredSites);
    archMapInstance.resetView();
    const detailsPanel = document.getElementById('details-panel');
    if (detailsPanel) detailsPanel.classList.add('hidden');
    const welcomeState = document.getElementById('welcome-details-state');
    if (welcomeState) welcomeState.classList.remove('hidden');
  }

  // Update lists
  renderLocationsGrid(filteredSites);

  // Update stats
  updateStats(filteredSites.length, allSites.length);
}

/**
 * Informative updates to stats counts in the header or panels.
 */
function updateStats(visibleCount, totalCount) {
  const countBadge = document.getElementById('visible-count');
  const countSuffix = document.getElementById('total-count-suffix');

  if (countBadge) {
    countBadge.textContent = visibleCount.toString();
  }
  if (countSuffix) {
    countSuffix.textContent = `/ ${totalCount} Orte`;
  }
}

// Bootstrap Applet
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Returns the image credit name for a site.
 */
function getImageCreditName(siteId) {
  const credits = {
    'dummy-001-gollenstein': 'Wikimedia',
    'dummy-002-spellenstein': 'Wikimedia',
    'dummy-003-museum-vor-fruehgeschichte': 'Lokales Projektfoto',
    'dummy-004-hunnenring': 'Wikipedia',
    'dummy-005-kulturpark-bliesbruck-reinheim': 'Flocci Nivis',
    'dummy-006-villa-borg': 'enbodenumer',
    'dummy-007-villa-nennig': 'Wikimedia',
    'dummy-008-roemermuseum-schwarzenacker': 'johann j.m.',
    'dummy-010-emilianus-stollen': 'LoKiLeCh',
    'dummy-011-mithras-heiligtum': 'Lokales Projektfoto',
    'dummy-012-burg-montclair': 'Wikimedia',
    'dummy-013-abtei-tholey': 'Wikipedia',
    'dummy-014-voelklinger-huette': 'Jakob Montrasio'
  };
  return credits[siteId] || 'Unbekannt';
}

/**
 * Returns the license string for a site.
 */
function getImageLicense(siteId) {
  const licenses = {
    'dummy-001-gollenstein': 'Wikimedia Commons',
    'dummy-002-spellenstein': 'Wikimedia Commons',
    'dummy-003-museum-vor-fruehgeschichte': 'Projektbestand',
    'dummy-004-hunnenring': 'Wikipedia/Wikimedia',
    'dummy-005-kulturpark-bliesbruck-reinheim': 'CC BY 4.0',
    'dummy-006-villa-borg': 'CC BY-NC-SA 2.0',
    'dummy-007-villa-nennig': 'Wikimedia Commons',
    'dummy-008-roemermuseum-schwarzenacker': 'CC BY-NC-SA 2.0',
    'dummy-010-emilianus-stollen': 'CC BY-SA 3.0',
    'dummy-011-mithras-heiligtum': 'Projektbestand',
    'dummy-012-burg-montclair': 'Wikimedia Commons',
    'dummy-013-abtei-tholey': 'Wikipedia/Wikimedia',
    'dummy-014-voelklinger-huette': 'CC BY 2.0'
  };
  return licenses[siteId] || 'Unbekannt';
}

export { allSites, filteredSites, archMapInstance };
export default initApp;
