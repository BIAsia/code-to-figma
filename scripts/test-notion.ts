import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function test() {
  console.log('Testing Notion connection...');
  console.log('Token:', process.env.NOTION_TOKEN?.slice(0, 10) + '...');
  console.log('Database ID:', process.env.FIGMA_IMPORT_DB_ID);
  
  try {
    // 测试读取 Database
    const response = await notion.databases.retrieve({
      database_id: process.env.FIGMA_IMPORT_DB_ID!
    });
    console.log('✅ Database 访问成功:', response.title);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    console.error('提示: Database 可能需要 share 给 Integration');
  }
}

test();
