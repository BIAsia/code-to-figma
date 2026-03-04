import { capturePage } from './capture.js';
import { uploadToNotion } from './notion-client.js';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env 文件
config({ path: resolve(process.cwd(), '.env') });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FIGMA_IMPORT_DB_ID = process.env.FIGMA_IMPORT_DB_ID;

if (!NOTION_TOKEN || !FIGMA_IMPORT_DB_ID) {
  console.error('❌ 缺少环境变量:');
  console.error('   NOTION_TOKEN: Notion Integration Token');
  console.error('   FIGMA_IMPORT_DB_ID: Notion Database ID');
  process.exit(1);
}

async function main() {
  const url = process.argv[2] || 'https://okscale.app/generator';
  const selector = process.argv[3] || '.generator-container';
  
  console.log('🎯 Code to Figma - 自动推送工具');
  console.log('================================\n');
  
  try {
    // 1. 捕获页面
    console.log('📸 阶段 1: 捕获页面 DOM');
    const layersMeta = await capturePage(url, selector);
    console.log(`✅ 捕获成功: ${JSON.stringify(layersMeta).length} 字符\n`);
    
    // 2. 上传到 Notion
    console.log('☁️  阶段 2: 上传到 Notion');
    const result = await uploadToNotion(
      layersMeta,
      { databaseId: FIGMA_IMPORT_DB_ID, token: NOTION_TOKEN },
      url
    );
    
    console.log('\n✅ 完成！');
    console.log('================================');
    console.log(`📋 Page ID: ${result.pageId}`);
    console.log(`🔗 Notion URL: ${result.pageUrl}`);
    console.log('\n💡 下一步:');
    console.log('   1. 打开 Figma');
    console.log('   2. 运行插件 "OKScale to Figma"');
    console.log(`   3. 粘贴 Page ID: ${result.pageId}`);
    
  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

main();
