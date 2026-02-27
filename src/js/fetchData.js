
// Vi fetchar datan ifrån API:n härifrån, alla fetchning ska ske via denna fil och dess metoder.

const API_BASE = "https://swapi.py4e.com/api";

export const endpoints = {
  people: `${API_BASE}/people/`,
  planets: `${API_BASE}/planets/`,
  starships: `${API_BASE}/starships/`,
  films: `${API_BASE}/films/`,
};

export function extractId(url) {
  const match = url.match(/\/(\d+)\/$/);
  return match ? match[1] : null;
}

async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.json();
}

export async function fetchById(type, id) {
  return fetchJson(`${endpoints[type]}${id}/`);
}

export async function fetchPage(type, page = 1) {
  return fetchJson(`${endpoints[type]}?page=${page}`);
}

export async function fetchManyByIds(type, ids = []) {
  return Promise.all(ids.map((id) => fetchById(type, id)));
}

export async function fetchAllLimited(type, limit = 18) {
  let nextUrl = endpoints[type];
  let results = [];

  while (nextUrl && results.length < limit) {
    const data = await fetchJson(nextUrl);
    results = results.concat(data.results || []);
    nextUrl = data.next;
  }

  return results.slice(0, limit);
}

export async function searchType(type, query, limit = 18) {
  let nextUrl = `${endpoints[type]}?search=${encodeURIComponent(query)}`;
  let results = [];

  while (nextUrl && results.length < limit) {
    const data = await fetchJson(nextUrl);
    results = results.concat(data.results || []);
    nextUrl = data.next;
  }

  return results.slice(0, limit);
}

export async function searchAllTypes(query, perTypeLimit = 8) {
  const types = ["people", "planets", "starships", "films"];

  return Promise.all(
    types.map(async (type) => ({
      type,
      results: await searchType(type, query, perTypeLimit),
    }))
  );
}

export async function fetchAll(type) {
  let nextUrl = endpoints[type];
  let results = [];

  while (nextUrl) {
    const data = await fetchJson(nextUrl);
    results = results.concat(data.results || []);
    nextUrl = data.next;
  }

  return results;
}