// BasicSwap Orderbook Landing Page JavaScript

const API_BASE = 'https://api.basicswap.bid';
const REFRESH_INTERVAL = 30000; // 30 seconds

let allOffers = [];
let filteredOffers = [];
let currentPage = 1;
const pageSize = 20;
let sortColumn = 'expiresAt';
let sortDirection = 'asc';

// Fetch data from API
async function fetchStatus() {
  try {
    // For demo/development, use mock data if API not available
    const response = await fetch(`${API_BASE}/sync/status`);
    if (!response.ok) throw new Error('API not available');
    return await response.json();
  } catch (e) {
    console.warn('Using mock status data');
    return {
      status: 'fresh',
      lastSyncAt: new Date().toISOString(),
      ageSeconds: 5,
      offerCount: 0
    };
  }
}

async function fetchOrderbook() {
  try {
    const response = await fetch(`${API_BASE}/v1/orderbook`, {
      headers: { 'X-API-Key': 'demo' }
    });
    if (!response.ok) throw new Error('API not available');
    return await response.json();
  } catch (e) {
    console.warn('Using mock orderbook data');
    return { data: getMockOffers(), meta: { lastSyncAt: new Date().toISOString(), offerCount: 5 } };
  }
}

async function fetchPairs() {
  try {
    const response = await fetch(`${API_BASE}/v1/pairs`, {
      headers: { 'X-API-Key': 'demo' }
    });
    if (!response.ok) throw new Error('API not available');
    return await response.json();
  } catch (e) {
    console.warn('Using mock pairs data');
    return { data: getMockPairs() };
  }
}

// Mock data for demo
function getMockOffers() {
  return [
    { offerId: '1', coinFrom: 'BTC', coinTo: 'XMR', amountFrom: '0.5', amountTo: '85.5', rate: '171', minSwap: '0.01', expiresAt: Date.now() + 3600000 },
    { offerId: '2', coinFrom: 'LTC', coinTo: 'BTC', amountFrom: '10', amountTo: '0.003', rate: '0.0003', minSwap: '1', expiresAt: Date.now() + 7200000 },
    { offerId: '3', coinFrom: 'XMR', coinTo: 'BTC', amountFrom: '50', amountTo: '0.3', rate: '0.006', minSwap: '5', expiresAt: Date.now() + 5400000 },
    { offerId: '4', coinFrom: 'PART', coinTo: 'BTC', amountFrom: '1000', amountTo: '0.01', rate: '0.00001', minSwap: '100', expiresAt: Date.now() + 1800000 },
    { offerId: '5', coinFrom: 'BTC', coinTo: 'FIRO', amountFrom: '0.1', amountTo: '50', rate: '500', minSwap: '0.01', expiresAt: Date.now() + 9000000 }
  ];
}

function getMockPairs() {
  return [
    { pair: 'BTC-XMR', coinFrom: 'BTC', coinTo: 'XMR', offerCount: 12, avgRate: 171.5, minRate: 168, maxRate: 175 },
    { pair: 'LTC-BTC', coinFrom: 'LTC', coinTo: 'BTC', offerCount: 8, avgRate: 0.00032, minRate: 0.0003, maxRate: 0.00035 },
    { pair: 'XMR-BTC', coinFrom: 'XMR', coinTo: 'BTC', offerCount: 15, avgRate: 0.0058, minRate: 0.0055, maxRate: 0.006 },
    { pair: 'PART-BTC', coinFrom: 'PART', coinTo: 'BTC', offerCount: 5, avgRate: 0.00001, minRate: 0.000009, maxRate: 0.000012 }
  ];
}

// Update freshness indicator
function updateFreshness(status) {
  const indicator = document.getElementById('freshness-indicator');
  const dot = indicator.querySelector('.freshness-dot');
  const text = document.getElementById('freshness-text');
  const countEl = document.getElementById('offer-count');
  const updatedEl = document.getElementById('last-updated');

  dot.className = 'freshness-dot ' + status.status;

  if (status.status === 'fresh') {
    text.textContent = 'Live data';
  } else if (status.status === 'recent') {
    text.textContent = 'Data is ' + formatAge(status.ageSeconds) + ' old';
  } else if (status.status === 'stale') {
    text.textContent = 'Data may be outdated (' + formatAge(status.ageSeconds) + ')';
  } else {
    text.textContent = 'Connecting...';
  }

  countEl.textContent = status.offerCount || 0;
  updatedEl.textContent = status.lastSyncAt ? formatTime(new Date(status.lastSyncAt)) : '--';
}

function formatAge(seconds) {
  if (seconds < 60) return seconds + 's';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  return Math.floor(seconds / 3600) + 'h';
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatExpiry(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;

  if (diff < 0) return 'Expired';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
  return Math.floor(diff / 86400000) + 'd';
}

// Populate filter dropdowns
function populateFilters(offers) {
  const fromSelect = document.getElementById('filter-from');
  const toSelect = document.getElementById('filter-to');

  const fromCoins = new Set();
  const toCoins = new Set();

  offers.forEach(o => {
    if (o.coinFrom) fromCoins.add(o.coinFrom);
    if (o.coinTo) toCoins.add(o.coinTo);
  });

  const currentFrom = fromSelect.value;
  const currentTo = toSelect.value;

  fromSelect.innerHTML = '<option value="">All Coins</option>';
  toSelect.innerHTML = '<option value="">All Coins</option>';

  Array.from(fromCoins).sort().forEach(coin => {
    fromSelect.innerHTML += `<option value="${coin}">${coin}</option>`;
  });

  Array.from(toCoins).sort().forEach(coin => {
    toSelect.innerHTML += `<option value="${coin}">${coin}</option>`;
  });

  fromSelect.value = currentFrom;
  toSelect.value = currentTo;
}

// Apply filters
function applyFilters() {
  const fromFilter = document.getElementById('filter-from').value;
  const toFilter = document.getElementById('filter-to').value;

  filteredOffers = allOffers.filter(o => {
    if (fromFilter && o.coinFrom !== fromFilter) return false;
    if (toFilter && o.coinTo !== toFilter) return false;
    return true;
  });

  currentPage = 1;
  sortOffers();
  renderTable();
  updatePagination();
}

function clearFilters() {
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  applyFilters();
}

// Sorting
function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  sortOffers();
  renderTable();
}

function sortOffers() {
  filteredOffers.sort((a, b) => {
    let valA, valB;

    if (sortColumn === 'pair') {
      valA = a.coinFrom + '-' + a.coinTo;
      valB = b.coinFrom + '-' + b.coinTo;
    } else if (sortColumn === 'amountFrom' || sortColumn === 'rate' || sortColumn === 'minSwap') {
      valA = parseFloat(a[sortColumn]) || 0;
      valB = parseFloat(b[sortColumn]) || 0;
    } else if (sortColumn === 'expiresAt') {
      valA = a.expiresAt || 0;
      valB = b.expiresAt || 0;
    } else {
      valA = a[sortColumn];
      valB = b[sortColumn];
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

// Render table
function renderTable() {
  const tbody = document.getElementById('offers-body');
  const start = (currentPage - 1) * pageSize;
  const pageOffers = filteredOffers.slice(start, start + pageSize);

  if (pageOffers.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No offers found</td></tr>';
    return;
  }

  tbody.innerHTML = pageOffers.map(offer => `
    <tr>
      <td>
        <div class="pair-cell">
          <span class="coin-from">${offer.coinFrom}</span>
          <span class="coin-arrow">→</span>
          <span class="coin-to">${offer.coinTo}</span>
        </div>
      </td>
      <td>${parseFloat(offer.amountFrom).toFixed(4)} ${offer.coinFrom}</td>
      <td>${parseFloat(offer.rate).toPrecision(4)}</td>
      <td>${parseFloat(offer.minSwap).toFixed(4)} ${offer.coinFrom}</td>
      <td>${formatExpiry(offer.expiresAt)}</td>
    </tr>
  `).join('');
}

// Pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  const pagination = document.getElementById('pagination');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
    updatePagination();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
    updatePagination();
  }
}

// Render pairs grid
function renderPairs(pairs) {
  const grid = document.getElementById('pairs-grid');

  if (!pairs || pairs.length === 0) {
    grid.innerHTML = '<div class="loading-text">No trading pairs available</div>';
    return;
  }

  grid.innerHTML = pairs.map(pair => `
    <div class="pair-card">
      <div class="pair-card-header">
        <span class="pair-name">${pair.pair}</span>
        <span class="offer-count">${pair.offerCount} offers</span>
      </div>
      <div class="pair-stats">
        <div>Avg Rate: ${parseFloat(pair.avgRate).toPrecision(4)}</div>
        <div>Range: ${parseFloat(pair.minRate).toPrecision(3)} - ${parseFloat(pair.maxRate).toPrecision(3)}</div>
      </div>
    </div>
  `).join('');
}

// Load all data
async function loadData() {
  try {
    const [status, orderbook, pairs] = await Promise.all([
      fetchStatus(),
      fetchOrderbook(),
      fetchPairs()
    ]);

    updateFreshness(status);

    allOffers = orderbook.data || [];
    filteredOffers = [...allOffers];
    populateFilters(allOffers);
    sortOffers();
    renderTable();
    updatePagination();

    renderPairs(pairs.data || []);
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('freshness-text').textContent = 'Error loading data';
  }
}

// Initialize
loadData();

// Auto-refresh
setInterval(loadData, REFRESH_INTERVAL);
