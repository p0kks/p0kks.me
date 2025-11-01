const fetch = require('node-fetch');

async function fetchAndSaveData() {
    try {
        const projectsResponse = await fetch('https://api.github.com/repos/p0kks/p0kks.me/issues?labels=project&state=open');
        const notesResponse = await fetch('https://api.github.com/repos/p0kks/p0kks.me/issues?labels=note&state=open');
        
        const projects = await projectsResponse.json();
        const notes = await notesResponse.json();

        console.log(`Fetched ${projects.length} projects and ${notes.length} notes`);
    } catch (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    }
}

fetchAndSaveData();