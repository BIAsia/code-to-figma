import { Client } from '@notionhq/client';

interface NotionConfig {
  databaseId: string;
  token: string;
}

interface LayerMeta {
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

/**
 * 上传数据到 Notion Database
 */
export async function uploadToNotion(
  layersMeta: LayerMeta[],
  config: NotionConfig,
  sourceUrl: string
): Promise<{ pageId: string; pageUrl: string }> {
  const notion = new Client({ auth: config.token });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonString = JSON.stringify(layersMeta, null, 2);
  
  console.log(`📊 数据大小: ${jsonString.length} 字符`);
  
  // 分块处理（Notion Code Block 限制 ~2000 字符）
  const chunkSize = 1900;
  const chunks: string[] = [];
  
  for (let i = 0; i < jsonString.length; i += chunkSize) {
    chunks.push(jsonString.slice(i, i + chunkSize));
  }
  
  console.log(`📦 分为 ${chunks.length} 个块`);
  
  // 创建 Notion Page
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
    parent: { database_id: config.databaseId },
    properties: {
      Name: {
        title: [{
          text: { content: `OKScale - ${timestamp}` }
        }]
      },
      Status: {
        select: { name: 'Ready' }
      },
      URL: {
        url: sourceUrl
      },
      Created: {
        date: { start: new Date().toISOString() }
      }
    },
    children
  });
  
  return {
    pageId: response.id,
    pageUrl: response.url
  };
}

/**
 * 从 Notion 读取数据
 */
export async function readFromNotion(
  pageId: string,
  config: NotionConfig
): Promise<LayerMeta[]> {
  const notion = new Client({ auth: config.token });
  
  const blocks = await notion.blocks.children.list({
    block_id: pageId
  });
  
  let jsonString = '';
  
  for (const block of blocks.results) {
    if ('type' in block && block.type === 'code' && 'code' in block) {
      const content = block.code.rich_text[0]?.plain_text || '';
      jsonString += content;
    }
  }
  
  return JSON.parse(jsonString);
}

/**
 * 查询最新的 Ready 状态记录
 */
export async function getLatestReady(
  config: NotionConfig
): Promise<{ pageId: string; pageUrl: string } | null> {
  const notion = new Client({ auth: config.token });
  
  const response = await notion.databases.query({
    database_id: config.databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Ready' }
    },
    sorts: [{
      property: 'Created',
      direction: 'descending'
    }],
    page_size: 1
  });
  
  if (response.results.length === 0) {
    return null;
  }
  
  const page = response.results[0];
  return {
    pageId: page.id,
    pageUrl: page.url
  };
}
