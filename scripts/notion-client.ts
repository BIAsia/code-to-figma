import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.FIGMA_IMPORT_DB_ID!;

export async function uploadToNotion(url: string, data: any): Promise<{ pageId: string; url: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonString = JSON.stringify(data, null, 2);
  
  console.log(`📊 Data size: ${jsonString.length} characters`);
  
  // Save JSON to a temporary file
  const tempFilePath = `./output/${timestamp}.json`;
  await fs.writeFile(tempFilePath, jsonString);
  
  // Upload JSON as file attachment to Notion
  // Note: Notion API doesn't support direct file upload, so we'll use code blocks
  // Split into chunks if needed
  const chunkSize = 1900;
  const chunks: string[] = [];
  
  for (let i = 0; i < jsonString.length; i += chunkSize) {
    chunks.push(jsonString.slice(i, i + chunkSize));
  }
  
  console.log(`📦 Split into ${chunks.length} chunks`);
  
  const children = chunks.map((chunk, index) => ({
    object: 'block' as const,
    type: 'code' as const,
    code: {
      language: 'json' as const,
      rich_text: [{
        type: 'text' as const,
        text: { content: chunk }
      }]
    }
  }));
  
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
    children
  });
  
  return {
    pageId: response.id,
    url: response.url
  };
}
