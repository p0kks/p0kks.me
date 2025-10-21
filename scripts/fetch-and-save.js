const fs = require('fs');
const path = require('path');
const { fetchIssuesByLabel } = require('./lib/fetchIssues');

async function run() {
  const owner = process.env.GH_OWNER || 'p0kks';
  const repo = process.env.GH_REPO || 'p0kks.me';
  const token = process.env.GH_TOKEN;
  const labels = ['project', 'note'];

  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const label of labels) {
    console.log('Fetching', label);
    const issues = await fetchIssuesByLabel(owner, repo, label, token);
    fs.writeFileSync(path.join(outDir, `${label}s.json`), JSON.stringify(issues, null, 2));
  }
  console.log('Saved data to', outDir);
}

if (require.main === module) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
