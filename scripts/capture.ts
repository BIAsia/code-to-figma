import puppeteer from 'puppeteer';

interface LayerMeta {
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: any[];
  strokes?: any[];
  children?: LayerMeta[];
  [key: string]: any;
}

/**
 * 使用 Puppeteer 捕获页面 DOM 并转换为 LayerMeta
 */
export async function capturePage(url: string, selector: string = 'body'): Promise<LayerMeta[]> {
  console.log(`🚀 启动浏览器，访问 ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ 页面加载完成');
    
    // 等待目标元素出现
    await page.waitForSelector(selector, { timeout: 10000 });
    console.log(`✅ 找到目标元素: ${selector}`);
    
    // 注入捕获脚本（使用字符串形式避免 TypeScript 编译问题）
    console.log('📸 开始捕获 DOM...');
    const layersMeta = await page.evaluate(`
      (function(selector) {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error('Element not found: ' + selector);
        }
        
        function convertElement(el, parentX, parentY) {
          parentX = parentX || 0;
          parentY = parentY || 0;
          
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          
          const layer = {
            type: el.tagName === 'IMG' ? 'IMAGE' : (el.tagName === 'svg' || el.tagName === 'SVG') ? 'VECTOR' : 'FRAME',
            name: el.className || el.tagName.toLowerCase(),
            x: rect.left - parentX,
            y: rect.top - parentY,
            width: rect.width,
            height: rect.height,
            fills: [],
            strokes: [],
            children: []
          };
          
          // 提取背景色
          const bgColor = styles.backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            const match = bgColor.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
            if (match) {
              layer.fills.push({
                type: 'SOLID',
                color: {
                  r: parseInt(match[1]) / 255,
                  g: parseInt(match[2]) / 255,
                  b: parseInt(match[3]) / 255
                },
                opacity: match[4] ? parseFloat(match[4]) : 1
              });
            }
          }
          
          // 提取边框
          const borderWidth = parseFloat(styles.borderWidth);
          if (borderWidth > 0) {
            const borderColor = styles.borderColor;
            const match = borderColor.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
            if (match) {
              layer.strokes.push({
                type: 'SOLID',
                color: {
                  r: parseInt(match[1]) / 255,
                  g: parseInt(match[2]) / 255,
                  b: parseInt(match[3]) / 255
                }
              });
              layer.strokeWeight = borderWidth;
            }
          }
          
          // 处理文本节点
          if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
            const text = el.textContent ? el.textContent.trim() : '';
            if (text) {
              layer.type = 'TEXT';
              layer.characters = text;
              layer.fontSize = parseFloat(styles.fontSize);
              layer.fontFamily = styles.fontFamily;
            }
          }
          
          // 递归处理子元素
          for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            if (child instanceof HTMLElement) {
              const childRect = child.getBoundingClientRect();
              if (childRect.width > 0 && childRect.height > 0) {
                layer.children.push(convertElement(child, rect.left, rect.top));
              }
            }
          }
          
          return layer;
        }
        
        return [convertElement(element)];
      })('${selector}')
    `);
    
    console.log(`✅ 捕获完成，共 ${layersMeta.length} 个顶层节点`);
    
    return layersMeta;
    
  } finally {
    await browser.close();
    console.log('🔒 浏览器已关闭');
  }
}
