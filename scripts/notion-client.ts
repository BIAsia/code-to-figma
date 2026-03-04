import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.FIGMA_IMPORT_DB_ID!;

export async function uploadToNotion(url: string, data: any): Promise<{ pageId: string; url: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonString = JSON.stringify(data, null, 2);
  
  console.log(`📊 Data size: ${jsonString.length} characters`);
  
  // Create page with file attachment (using paragraph blocks for now, as Notion API doesn't support direct file upload)
  // We'll use a single paragraph with the JSON
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{
          text: { content: `Code to Figma - ${timestamp}` }
        }]
      },
      Status: {
        select: { name: 'Ready' }
      },
      URL: {
        url: url
      },
      Created: {
        date: { start: new Date().toISOString() }
      }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { 
              content: `JSON data saved to local file: ./output/latest.json\nFile size: ${jsonString.length} characters`
            }
          }]
        }
      }
    ]
  });
  
  return {
    pageId: response.id,
    url: response.url
  };
}
