import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { platform, task, token, config } = req.body;

    if (!platform || !task || !token) {
      return res.status(400).json({ error: "Missing required fields (platform, task, token)" });
    }

    if (platform === 'notion') {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: config.databaseId },
          properties: {
            Name: { title: [{ text: { content: task.task } }] },
            Assignee: { rich_text: [{ text: { content: task.owner || "Unassigned" } }] },
            Priority: { select: { name: task.priority || "medium" } },
          },
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return res.status(200).json({ success: true });
    }

    if (platform === 'linear') {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              issueCreate(input: {
                title: "${task.task}",
                description: "Assignee: ${task.owner}",
                teamId: "${config.teamId}"
              }) {
                success
                issue { id title }
              }
            }
          `
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Unsupported platform" });
  } catch (error: any) {
    console.error(`[PM Sync Error]:`, error);
    return res.status(500).json({ error: error.message });
  }
}
