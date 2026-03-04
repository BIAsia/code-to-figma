import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_HOME_PAGE_ID = process.env.NOTION_HOME_PAGE_ID;

if (!NOTION_TOKEN || !NOTION_HOME_PAGE_ID) {
  throw new Error('Missing NOTION_TOKEN or NOTION_HOME_PAGE_ID in .env');
}

const notion = new Client({ auth: NOTION_TOKEN });

async function createDatabase() {
  console.log('🔨 创建 Figma Import Queue Database...');
  
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: NOTION_HOME_PAGE_ID
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'Figma Import Queue'
        }
      }
    ],
    properties: {
      Name: {
        title: {}
      },
      Status: {
        select: {
          options: [
            { name: 'Ready', color: 'green' },
            { name: 'Imported', color: 'blue' },
            { name: 'Failed', color: 'red' }
          ]
        }
      },
      URL: {
        url: {}
      },
      Created: {
        date: {}
      }
    }
  });
  
  console.log('✅ Database 创建成功！');
  console.log(`📋 Database ID: ${response.id}`);
  console.log(`🔗 URL: ${response.url}`);
  
  return response;
}

createDatabase().catch(console.error);
