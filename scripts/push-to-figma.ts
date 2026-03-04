import puppeteer from 'puppeteer';
import { uploadToNotion } from './notion-client.js';

interface DOMNode {
  tag: string;
  text?: string;
  styles?: Record<string, string>;
  children?: DOMNode[];
  attributes?: Record<string, string>;
}

async function captureDOM(url: string): Promise<DOMNode> {
  console.log(`🌐 Launching browser for ${url}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  console.log('📸 Capturing DOM structure...');
  
  const domData = await page.evaluate(() => {
    function captureNode(element: Element): any {
      const styles = window.getComputedStyle(element);
      
      return {
        tag: element.tagName.toLowerCase(),
        text: element.textContent?.trim() || undefined,
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          border: styles.border,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          margin: styles.margin,
          width: styles.width,
          height: styles.height
        },
        attributes: {
          class: element.className,
          id: element.id
        },
        children: Array.from(element.children).map(child => captureNode(child))
      };
    }
    
    return captureNode(document.body);
  });
  
  await browser.close();
  
  console.log(`✅ Captured ${JSON.stringify(domData).length} characters of data`);
  
  return domData;
}

async function main() {
  const url = process.argv[2] || 'https://example.com';
  
  console.log('🚀 Code to Figma - Capture & Upload');
  console.log('=====================================\n');
  
  // Capture DOM
  const dom = await captureDOM(url);
  
  // Prepare data
  const data = {
    url,
    timestamp: new Date().toISOString(),
    dom
  };
  
  // Save to local file
  const outputPath = './output/latest.json';
  const fs = await import('fs/promises');
  await fs.mkdir('./output', { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);
  
  // Output JSON to console
  const jsonOutput = JSON.stringify(data, null, 2);
  console.log('\n📋 JSON Output (copy this):');
  console.log('=====================================');
  console.log(jsonOutput);
  console.log('=====================================\n');
  
  // Also upload to Notion
  console.log('📤 Uploading to Notion...');
  const result = await uploadToNotion(url, data);
  
  console.log('\n✅ Complete!');
  console.log(`💾 Local file: ${outputPath}`);
  console.log(`📋 Notion Page: ${result.url}`);
  console.log(`🔑 Page ID: ${result.pageId}`);
  console.log('\n💡 Next steps:');
  console.log('1. Copy JSON from console output OR open ./output/latest.json');
  console.log('2. Open Figma plugin');
  console.log('3. Paste JSON and click "Create Figma Nodes"');
}

main().catch(console.error);
