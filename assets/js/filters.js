/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * filters.js - Logic for combining archaeological site filters.
 */

/**
 * Filter list of sites based on user-selected criteria.
 * Filters are combinable, meaning a site must match ALL active criteria.
 * 
 * @param {Array} sites - Original list of archaeological sites.
 * @param {Object} criteria - Active filter state.
 * @param {string} criteria.zeitstellung - Selected epoch (or 'all').
 * @param {string} criteria.kategorie_attraktion - Selected attraction scale (or 'all').
 * @param {string} criteria.kategorie_befund - Selected archaeological type (or 'all').
 * @param {string} criteria.sichtbarkeit - Selected accessibility (or 'all').
 * @param {string} criteria.barrierefreiheit - Selected wheel accessibility ('all', 'yes', 'no').
 * @returns {Array} List of filtered archaeological sites.
 */
export function filterSites(sites, criteria) {
  return sites.filter(site => {
    // 1. Filter by Zeitstellung (Epoch)
    if (criteria.zeitstellung && criteria.zeitstellung !== 'all') {
      if (site.zeitstellung !== criteria.zeitstellung) {
        return false;
      }
    }

    // 2. Filter by Kategorie Attraktion
    if (criteria.kategorie_attraktion && criteria.kategorie_attraktion !== 'all') {
      if (site.kategorie_attraktion !== criteria.kategorie_attraktion) {
        return false;
      }
    }

    // 3. Filter by Befundtyp (archaeological category)
    if (criteria.kategorie_befund && criteria.kategorie_befund !== 'all') {
      if (site.kategorie_befund !== criteria.kategorie_befund) {
        return false;
      }
    }

    // 4. Filter by Sichtbarkeit (Visibility)
    if (criteria.sichtbarkeit && criteria.sichtbarkeit !== 'all') {
      if (site.sichtbarkeit !== criteria.sichtbarkeit) {
        return false;
      }
    }

    // 5. Filter by Barrierefreiheit (Wheelchair accessibility)
    if (criteria.barrierefreiheit && criteria.barrierefreiheit !== 'all') {
      const isBarrierFree = site.barrierefreiheit === true;
      if (criteria.barrierefreiheit === 'yes' && !isBarrierFree) {
        return false;
      }
      if (criteria.barrierefreiheit === 'no' && isBarrierFree) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract unique values for dynamic filter dropdown creation.
 * Helpful to make filters expandable or dynamic.
 * 
 * @param {Array} sites - Archaeological sites
 * @param {string} key - The property key in the site objects
 * @returns {Array<string>} Unique sorted values
 */
export function getUniqueValues(sites, key) {
  const values = sites.map(site => site[key]).filter(Boolean);
  return Array.from(new Set(values)).sort();
}
