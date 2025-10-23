const { fetchIssuesByLabel } = require('./fetchIssues');

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

describe('fetchIssuesByLabel', () => {
  afterEach(() => { fetch.mockReset(); });

  it('fetches issues and returns JSON', async () => {
    const fakeIssues = [{ id: 1, title: 'Test' }];
    fetch.mockResolvedValue({ ok: true, json: async () => fakeIssues, headers: new Map() });

    const result = await fetchIssuesByLabel('owner', 'repo', 'project', 'token');
    expect(result).toEqual(fakeIssues);
  });

  it('throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Bad' });
    await expect(fetchIssuesByLabel('o', 'r', 'l')).rejects.toThrow(/GitHub API request failed/);
  });

  it('fetches issues across multiple pages', async () => {
    const fakeIssuesPage1 = [{ id: 1, title: 'Test 1' }];
    const fakeIssuesPage2 = [{ id: 2, title: 'Test 2' }];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => fakeIssuesPage1,
        headers: new Map([['Link', '<https://api.github.com/repos/owner/repo/issues?labels=project&state=open&per_page=100&page=2>; rel="next"']])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => fakeIssuesPage2,
        headers: new Map()
      });

    const result = await fetchIssuesByLabel('owner', 'repo', 'project', 'token');
    expect(result).toEqual([...fakeIssuesPage1, ...fakeIssuesPage2]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
