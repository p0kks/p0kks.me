const { fetchIssuesByLabel } = require('./fetchIssues');

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

describe('fetchIssuesByLabel', () => {
  afterEach(() => { fetch.mockReset(); });

  it('fetches issues and returns JSON', async () => {
    const fakeIssues = [{ id: 1, title: 'Test' }];
    fetch.mockResolvedValue({ ok: true, json: async () => fakeIssues });

    const result = await fetchIssuesByLabel('owner', 'repo', 'project', 'token');
    expect(result).toEqual(fakeIssues);
  });

  it('throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Bad' });
    await expect(fetchIssuesByLabel('o', 'r', 'l')).rejects.toThrow(/GitHub API request failed/);
  });
});
