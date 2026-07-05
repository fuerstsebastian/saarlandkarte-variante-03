/* empty css               */(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * data.js - Handles fetching and caching the archaeological sites data.
 */const x=[{id:"befestigung-st-arnual-sonnenberg",name:"Vorgeschichtliche Befestigung St. Arnual/Sonnenberg",gemeinde:"Saarbrücken",lat:49.207179,lng:7.01288,beschreibung:"Im Stiftswald bei St. Arnual liegt auf dem Sonnenberg eine vorgeschichtliche Befestigungsanlage, die aus zwei etwa 800 m voneinander entfernten Wällen bestand. Der östliche Hauptwall sicherte den Sporn, während der 2019 untersuchte Vorwall das Plateau an einer Engstelle abriegelte.",zeitstellung:"Hallstatt",kategorie_attraktion:"Bodendenkmal",kategorie_befund:"Befestigung / Ringwall",sichtbarkeit:"eingeschränkt sichtbar",barrierefreiheit:!1,oeffnungszeiten:null,eintrittspreis:"Kostenlos",maps_link:"https://maps.google.com/?q=49.207179,7.012880",denkmalschutzstatus:"Archäologisch bekanntes Bodendenkmal",literatur:["Ott, R. / Höpken, C. 2019: Neue Untersuchungen an der prähistorischen Befestigung im Stiftswald von St. Arnual. Denkmalpflege im Saarland 2019, 21–23."],thumbnail:!1}];async function k(){try{const s=await fetch("data/fundstellen.json");if(!s.ok)throw new Error(`Data fetch failed: ${s.statusText}`);return await s.json()}catch(s){return console.warn("Could not retrieve archaeological data from JSON, loading backup locally.",s),x}}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * filters.js - Logic for combining archaeological site filters.
 */function v(s,e){return s.filter(t=>{if(e.zeitstellung&&e.zeitstellung!=="all"&&t.zeitstellung!==e.zeitstellung||e.kategorie_attraktion&&e.kategorie_attraktion!=="all"&&t.kategorie_attraktion!==e.kategorie_attraktion||e.kategorie_befund&&e.kategorie_befund!=="all"&&t.kategorie_befund!==e.kategorie_befund||e.sichtbarkeit&&e.sichtbarkeit!=="all"&&t.sichtbarkeit!==e.sichtbarkeit)return!1;if(e.barrierefreiheit&&e.barrierefreiheit!=="all"){const a=t.barrierefreiheit===!0;if(e.barrierefreiheit==="yes"&&!a||e.barrierefreiheit==="no"&&a)return!1}return!0})}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * map.js - Manages the Leaflet map, layers, custom markers, and popups.
 */function m(s){switch(s){case"Neolithikum":return"#8B7E66";case"Bronzezeit":return"#C2A36B";case"Eisenzeit / Latènezeit":return"#8B5E3C";case"Hallstatt":return"#9A5233";case"Römerzeit":return"#4A5D4E";case"Mittelalter":return"#5C5549";default:return"#8B7E66"}}class y{constructor(e,t){this.containerId=e,this.onMarkerSelect=t,this.map=null,this.markerGroup=null,this.markersMap=new Map,this.activeSiteId=null,this.defaultCenter=[49.38,6.95],this.defaultZoom=10}init(){if(!this.map){if(typeof L>"u"){console.error("Leaflet.js is not loaded. Please inspect your CDN links.");return}this.map=L.map(this.containerId,{center:this.defaultCenter,zoom:this.defaultZoom,zoomControl:!1,scrollWheelZoom:!0,maxBounds:[[49,6.1],[49.8,7.6]],minZoom:9}),L.control.zoom({position:"bottomright"}).addTo(this.map),this.map.getContainer().addEventListener("click",e=>{const t=e.target.closest(".select-site-btn");if(!t)return;e.preventDefault(),e.stopPropagation();const a=t.getAttribute("data-id");a&&(this.selectSite(a,!0),this.map.closePopup())}),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende'}).addTo(this.map),this.markerGroup=L.layerGroup().addTo(this.map)}}updateMarkers(e){!this.map||!this.markerGroup||(this.markerGroup.clearLayers(),this.markersMap.clear(),e.forEach(t=>{const a=m(t.zeitstellung),n=L.divIcon({className:`custom-div-marker site-marker-${t.id}`,html:`<div class="custom-div-marker-inner" style="background-color: ${a};" title="${t.name} (${t.zeitstellung})"></div>`,iconSize:[18,18],iconAnchor:[9,9],popupAnchor:[0,-9]}),i=L.marker([t.lat,t.lng],{icon:n}),r=`
        <div class="p-5 flex flex-col gap-3 font-sans">
          ${t.thumbnail?`
            <div class="-mx-5 -mt-5 mb-1 overflow-hidden rounded-t-lg">
              <img src="${t.bild}" alt="${t.name}" class="w-full h-36 object-cover" loading="lazy" />
              <div class="bg-slate-800/70 text-white text-[9px] px-3 py-1 flex items-center justify-between" style="margin-top: -24px; position: relative; z-index: 1;">
                <span>${t.id.replace("dummy-","").replace(/-/g," ").replace(/\b\w/g,d=>d.toUpperCase())}</span>
                <span>Foto: CC-lizenziert</span>
              </div>
            </div>
          `:""}
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <span class="text-xs uppercase tracking-wide font-sans font-extrabold px-2.5 py-1 rounded-sm shadow-xs text-white" style="background-color: ${a};">
              ${t.zeitstellung}
            </span>
            <span class="text-xs text-slate-500 font-bold">${t.gemeinde}</span>
          </div>
          <h3 class="text-lg font-extrabold font-sans text-slate-900 leading-tight tracking-tight">${t.name}</h3>
          <p class="text-[13px] text-slate-700 leading-relaxed">${t.beschreibung}</p>
          <div class="border-t border-slate-100 my-1 pt-3.5 flex items-center justify-between gap-3">
            <span class="text-xs font-bold text-slate-500">
              ${t.kategorie_befund||"Ausgrabung"}
            </span>
            <button class="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#3A4C3E] text-white transition-colors cursor-pointer select-site-btn focus:outline-hidden" data-id="${t.id}">
              Details →
            </button>
          </div>
        </div>
      `;i.bindPopup(r),i.bindTooltip(`
        <div class="p-2 text-xs font-sans rounded shadow-md bg-white border border-slate-100">
          <div class="font-extrabold text-slate-900 mb-0.5">${t.name}</div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${a};"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${t.zeitstellung}</span>
          </div>
        </div>
      `,{direction:"top",offset:[0,-16],opacity:.98,sticky:!0}),i.on("click",()=>{this.selectSite(t.id,!1)}),i.addTo(this.markerGroup),this.markersMap.set(t.id,i)}))}selectSite(e,t=!0){this.activeSiteId=e,document.querySelectorAll(".custom-div-marker-active").forEach(i=>i.classList.remove("custom-div-marker-active"));const n=this.markersMap.get(e);if(n){const i=n.getElement();i&&i.classList.add("custom-div-marker-active");const r=n.getLatLng();t&&(this.map.setView(r,13,{animate:!0,duration:1}),n.openPopup())}this.onMarkerSelect&&this.onMarkerSelect(e)}resetView(){if(!this.map)return;this.map.setView(this.defaultCenter,this.defaultZoom,{animate:!0,duration:1.2}),this.map.hasLayer(this.markerGroup)&&this.map.closePopup(),document.querySelectorAll(".custom-div-marker-active").forEach(t=>t.classList.remove("custom-div-marker-active")),this.activeSiteId=null}}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * app.js - Main coordinator script for the Saarland Archeology Hub.
 */let o=[],c=[],l=null;const u={zeitstellung:"all",kategorie_attraktion:"all",kategorie_befund:"all",sichtbarkeit:"all",barrierefreiheit:"all"};async function w(){console.log("Initializing Archaeological App of Saarland..."),o=await k(),c=[...o],l=new y("map-element",B),l.init(),l.updateMarkers(o),E(),g(o),$(),b(o.length,o.length)}function E(){const s=document.getElementById("filter-befund"),e=document.getElementById("filter-kategorie_attraktion");s&&Array.from(new Set(o.map(a=>a.kategorie_befund).filter(Boolean))).sort().forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=a,s.appendChild(n)}),e&&Array.from(new Set(o.map(a=>a.kategorie_attraktion).filter(Boolean))).sort().forEach(a=>{const n=document.createElement("option");n.value=a,n.textContent=a,e.appendChild(n)})}function g(s){const e=document.getElementById("locations-grid");if(e){if(s.length===0){e.innerHTML=`
      <div class="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <svg class="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium text-slate-700">Keine Fundstellen gefunden</p>
        <p class="text-xs text-slate-400 mt-1">Versuche andere Filterkombinationen oder setze die Suche zurück.</p>
      </div>	
    `;return}e.innerHTML=s.map(t=>{const a=m(t.zeitstellung),n=t.barrierefreiheit?"Barrierearm":"Nicht stufenlos",i=t.barrierefreiheit?"bg-emerald-50 text-emerald-700 border-emerald-100":"bg-amber-50 text-amber-700 border-amber-100";return`
      <div class="bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden cursor-pointer hover:border-brand-200 group relative p-5" data-id="${t.id}">
        <!-- Header Badges -->
        <div class="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
          <span class="text-xs uppercase font-sans tracking-wider font-semibold text-[#4A5D4E] bg-slate-100 px-2.5 py-1 rounded">
            ${t.gemeinde}
          </span>
          <span class="text-xs uppercase font-sans tracking-wide font-extrabold text-white px-2.5 py-1.5 rounded shadow-xs" style="background-color: ${a};">
            ${t.zeitstellung}
          </span>
        </div>

        <!-- Content Body -->
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 group-hover:text-[#4A5D4E] transition-colors text-base font-display mb-1 line-clamp-1">${t.name}</h3>
            <p class="text-xs text-slate-500 mb-3 font-medium flex items-center gap-1">
              <span>${t.kategorie_befund||"Befund"}</span>
              <span>•</span>
              <span>${t.sichtbarkeit}</span>
            </p>
            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">${t.beschreibung}</p>
          </div>

          <div class="border-t border-slate-50 pt-3 flex items-center justify-between gap-1 mt-auto">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${i}">
              ${n}
            </span>
            <span class="text-xs font-bold text-brand-500 group-hover:underline flex items-center gap-0.5">
              Anzeigen →
            </span>
          </div>
        </div>
      </div>
    `}).join(""),e.querySelectorAll("[data-id]").forEach(t=>{t.addEventListener("click",()=>{const a=t.getAttribute("data-id");l&&(l.selectSite(a,!0),window.innerWidth<768&&document.getElementById("map-element").scrollIntoView({behavior:"smooth"}))})})}}function B(s){const e=o.find(d=>d.id===s);if(!e)return;const t=document.getElementById("details-panel");if(!t)return;const a=m(e.zeitstellung),n=e.barrierefreiheit===!0;t.innerHTML=`
    <div class="p-6">
      <div class="flex items-center justify-between gap-2 mb-4">
        <button id="close-details-btn" class="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer">
          ✕ Schließen
        </button>
        <span class="text-xs font-mono text-slate-400">ID: ${e.id}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 mb-4">
        <span class="text-xs uppercase font-sans tracking-wider font-extrabold text-white px-3 py-1.5 rounded-sm shadow-xs" style="background-color: ${a};">
          ${e.zeitstellung}
        </span>
        <span class="text-xs font-sans font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-sm">
          ${e.gemeinde}
        </span>
      </div>

      <h2 class="text-2xl font-bold font-display text-slate-900 leading-tight mb-3">${e.name}</h2>

      ${e.bild?`
        <div class="mb-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img src="${e.bild}" alt="${e.name}" class="w-full h-56 object-cover" loading="lazy" />
          <div class="bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500 flex items-center justify-between font-sans">
            <span>Bild: ${S(e.id)}</span>
            <span>${z(e.id)}</span>
          </div>
        </div>
      `:""}

      <p class="text-sm text-slate-600 leading-relaxed mb-6">${e.beschreibung}</p>

      <!-- Steckbrief Grid -->
      <div class="bg-brand-50/50 border border-brand-200 rounded-xl p-4 mb-6">
        <h3 class="text-xs uppercase font-bold tracking-widest text-[#2D362E] mb-3 pb-1 border-b border-brand-200">
          Steckbrief &amp; Fund-Metadaten
        </h3>
        
        <dl class="space-y-2.5 text-xs">
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Kategorie Attraktion</dt>
            <dd class="text-slate-900 font-bold text-right">${e.kategorie_attraktion}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Befundtyp</dt>
            <dd class="text-slate-900 font-bold text-right">${e.kategorie_befund||"Befund"}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Sichtbarkeit vor Ort</dt>
            <dd class="text-slate-900 font-bold text-right capitalize">${e.sichtbarkeit}</dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Barrierefreiheit</dt>
            <dd class="font-bold text-right ${n?"text-emerald-700":"text-amber-700"}">
              ${n?"Barrierearm zugänglich":"Nicht barrierefrei / Naturpfad"}
            </dd>
          </div>
          <div class="flex justify-between border-b border-orange-100/50 pb-1.5">
            <dt class="text-slate-500 font-medium">Öffnungszeiten</dt>
            <dd class="text-slate-900 font-medium text-right max-w-[180px]">${e.oeffnungszeiten||"Keine Angabe"}</dd>
          </div>
          <div class="flex justify-between pb-1">
            <dt class="text-slate-500 font-medium">Eintrittspreis</dt>
            <dd class="text-slate-900 font-bold text-right">${e.eintrittspreis||"Freibetrag"}</dd>
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
              ${e.denkmalschutzstatus||"Keine sensiblen Detailangaben öffentlich anzeigen"}. Es gelten die Bestimmungen des Saarländischen Denkmalschutzgesetzes. Raubgrabungen sind rechtswidrig und strafbar.
            </p>
          </div>
        </div>
      </div>

      <!-- Literature List -->
      ${e.literatur&&e.literatur.length>0?`
        <div class="mb-6">
          <h3 class="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold mb-2">Fachliteratur</h3>
          <ul class="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
            ${e.literatur.map(d=>`<li>${d}</li>`).join("")}
          </ul>
        </div>
      `:""}

      <!-- External Map Navigation Link -->
      ${e.maps_link?`
        <div class="mt-6 pt-4 border-t border-slate-100">
          <a href="${e.maps_link}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3A4C3E] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center">
            Google Maps Navigation 
            <span class="text-[10px] font-normal text-slate-200 font-mono">(Externer Link)</span>
          </a>
        </div>
      `:""}
    </div>
  `;const i=document.getElementById("welcome-details-state");i&&i.classList.add("hidden"),t.classList.remove("hidden");const r=document.getElementById("close-details-btn");r&&r.addEventListener("click",()=>{t.classList.add("hidden"),i&&i.classList.remove("hidden"),l&&l.resetView()})}function $(){document.getElementById("filter-form");const s=document.getElementById("clear-filters-btn"),e=document.getElementById("reset-map-btn");["zeitstellung","kategorie_attraktion","kategorie_befund","sichtbarkeit","barrierefreiheit"].forEach(a=>{const n=`filter-${a==="zeitstellung"?"epoch":a}`,i=document.getElementById(n);i&&i.addEventListener("change",r=>{u[a]=r.target.value,p()})}),s&&s.addEventListener("click",a=>{a.preventDefault();const n=document.getElementById("filter-epoch"),i=document.getElementById("filter-kategorie_attraktion"),r=document.getElementById("filter-befund"),d=document.getElementById("filter-sichtbarkeit"),f=document.getElementById("filter-barrierefreiheit");n&&(n.value="all"),i&&(i.value="all"),r&&(r.value="all"),d&&(d.value="all"),f&&(f.value="all"),Object.keys(u).forEach(h=>u[h]="all"),p()}),e&&e.addEventListener("click",()=>{if(l){l.resetView();const a=document.getElementById("details-panel");a&&a.classList.add("hidden");const n=document.getElementById("welcome-details-state");n&&n.classList.remove("hidden")}})}function p(){if(c=v(o,u),l){l.updateMarkers(c),l.resetView();const s=document.getElementById("details-panel");s&&s.classList.add("hidden");const e=document.getElementById("welcome-details-state");e&&e.classList.remove("hidden")}g(c),b(c.length,o.length)}function b(s,e){const t=document.getElementById("visible-count"),a=document.getElementById("total-count-suffix");t&&(t.textContent=s.toString()),a&&(a.textContent=`/ ${e} Orte`)}document.addEventListener("DOMContentLoaded",w);function S(s){return{"dummy-001-gollenstein":"Wikimedia","dummy-002-spellenstein":"Wikimedia","dummy-003-museum-vor-fruehgeschichte":"Lokales Projektfoto","dummy-004-hunnenring":"Wikipedia","dummy-005-kulturpark-bliesbruck-reinheim":"Flocci Nivis","dummy-006-villa-borg":"enbodenumer","dummy-007-villa-nennig":"Wikimedia","dummy-008-roemermuseum-schwarzenacker":"johann j.m.","dummy-010-emilianus-stollen":"LoKiLeCh","dummy-011-mithras-heiligtum":"Lokales Projektfoto","dummy-012-burg-montclair":"Wikimedia","dummy-013-abtei-tholey":"Wikipedia","dummy-014-voelklinger-huette":"Jakob Montrasio"}[s]||"Unbekannt"}function z(s){return{"dummy-001-gollenstein":"Wikimedia Commons","dummy-002-spellenstein":"Wikimedia Commons","dummy-003-museum-vor-fruehgeschichte":"Projektbestand","dummy-004-hunnenring":"Wikipedia/Wikimedia","dummy-005-kulturpark-bliesbruck-reinheim":"CC BY 4.0","dummy-006-villa-borg":"CC BY-NC-SA 2.0","dummy-007-villa-nennig":"Wikimedia Commons","dummy-008-roemermuseum-schwarzenacker":"CC BY-NC-SA 2.0","dummy-010-emilianus-stollen":"CC BY-SA 3.0","dummy-011-mithras-heiligtum":"Projektbestand","dummy-012-burg-montclair":"Wikimedia Commons","dummy-013-abtei-tholey":"Wikipedia/Wikimedia","dummy-014-voelklinger-huette":"CC BY 2.0"}[s]||"Unbekannt"}
