
async function getFetch() {
  try {
    // Prefer node-fetch when available so tests can mock it
    return require('node-fetch');
  } catch (e) {
    if (typeof fetch !== 'undefined') return fetch;
    throw new Error('Fetch API not available. Install node-fetch or run on Node 18+.');
  }
}

async function fetchIssuesByLabel(owner, repo, label, token) {
  const fetchFn = await getFetch();
  const perPage = 100;
  let allIssues = [];
  let url = `https://api.github.com/repos/${owner}/${repo}/issues?labels=${encodeURIComponent(label)}&state=open&per_page=${perPage}`;
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `token ${token}`;

  while (url) {
    const res = await fetchFn(url, { headers });
    if (!res.ok) throw new Error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    allIssues = allIssues.concat(json);

    const linkHeader = res.headers.get('Link');
    url = null; // Reset url for the next iteration
    if (linkHeader) {
      const nextLinkMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextLinkMatch) {
        url = nextLinkMatch[1];
      }
    }
  }
  return allIssues;
}

module.exports = { fetchIssuesByLabel };
