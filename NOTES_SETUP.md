# Notes System Setup Guide

## Step 1: Create the Notes Repository

1. Go to GitHub and create a new repository named `notes`
2. Make it public (required for GitHub Pages API access)
3. Initialize with a README if desired

## Step 2: Configure the Repository

1. Create a label called "note" in your repository:
   - Go to Issues → Labels → New label
   - Name: `note`
   - Color: Choose any color (e.g., `#0052cc` for blue)
   - Description: "Weekly notes and updates"

## Step 3: Create Your First Note

1. Go to Issues → New Issue
2. Add the label "note" to the issue
3. Title: Use a descriptive title for your note
4. Body: Write your note content using Markdown
5. Publish the issue

## Step 4: Test the Implementation

1. Your notes will now automatically appear on your website
2. Visit your site and click on the "notes" navigation link
3. Notes will load from: `https://api.github.com/repos/p0kks/notes/issues?labels=note&state=open&sort=created&direction=desc`

## Features

- **Automatic Sorting**: Notes are sorted by creation date (newest first)
- **Markdown Support**: Full Markdown rendering in notes
- **GitHub Integration**: Uses GitHub Issues as a CMS
- **Minimal Design**: Fits your website's aesthetic
- **Error Handling**: Graceful fallbacks if repository doesn't exist

## Publishing Workflow

1. Create a new GitHub Issue in your `notes` repository
2. Add the "note" label
3. Write your weekly update using Markdown
4. Publish the issue
5. The note automatically appears on your website

## Customization

- Modify the API endpoint in `src/js/script.js` if you want different sorting
- Adjust CSS styles in `src/css/style.css` for different appearance
- Change the notes repository name by updating the fetch URL

## Troubleshooting

- **Notes not loading**: Ensure the `notes` repository exists and is public
- **CORS errors**: GitHub API should work without CORS issues
- **Styling issues**: Check browser console for CSS errors

## Example Note Structure

```markdown
## This Week's Progress

- Completed project X
- Learned new technology Y
- Working on feature Z

### Code Snippet

```javascript
console.log('Hello from weekly notes!');
```

**Next week**: Continue working on Z and start planning A.
```