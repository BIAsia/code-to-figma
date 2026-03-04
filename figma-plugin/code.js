"use strict";
// OKScale to Figma Plugin
// Reads DOM data from Notion and creates Figma nodes
// Show UI
figma.showUI(__html__, { width: 320, height: 240 });
// Handle messages from UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'import') {
        try {
            const data = await fetchFromNotion(msg.pageId);
            const nodeCount = await createFigmaNodes(data);
            figma.ui.postMessage({
                type: 'import-complete',
                nodeCount
            });
            figma.notify(`✅ Imported ${nodeCount} nodes from Notion`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            figma.ui.postMessage({
                type: 'import-error',
                error: errorMsg
            });
            figma.notify(`❌ Import failed: ${errorMsg}`, { error: true });
        }
    }
};
async function fetchFromNotion(pageId) {
    var _a;
    // Get Notion token from plugin settings
    const notionToken = await figma.clientStorage.getAsync('notionToken');
    if (!notionToken) {
        throw new Error('Notion token not configured. Please set it in plugin settings.');
    }
    // Fetch page content from Notion
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        headers: {
            'Authorization': `Bearer ${notionToken}`,
            'Notion-Version': '2022-06-28'
        }
    });
    if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    // Extract JSON data from code blocks
    let jsonData = '';
    for (const block of result.results) {
        if (block.type === 'code' && ((_a = block.code) === null || _a === void 0 ? void 0 : _a.rich_text)) {
            jsonData += block.code.rich_text.map((t) => t.plain_text).join('');
        }
    }
    if (!jsonData) {
        throw new Error('No data found in Notion page');
    }
    return JSON.parse(jsonData);
}
async function createFigmaNodes(data) {
    const frame = figma.createFrame();
    frame.name = `OKScale Import - ${new Date(data.timestamp).toLocaleString()}`;
    frame.resize(1200, 800);
    let nodeCount = 0;
    function createNode(domNode, parent, x, y) {
        let count = 0;
        // Create frame for this DOM node
        const node = figma.createFrame();
        node.name = domNode.tag;
        node.x = x;
        node.y = y;
        // Apply styles
        if (domNode.styles) {
            applyStyles(node, domNode.styles);
        }
        // Add text if present
        if (domNode.text && domNode.text.trim()) {
            const textNode = figma.createText();
            textNode.characters = domNode.text.trim();
            textNode.x = 0;
            textNode.y = 0;
            node.appendChild(textNode);
        }
        parent.appendChild(node);
        count++;
        // Process children
        let childY = domNode.text ? 20 : 0;
        if (domNode.children && domNode.children.length > 0) {
            for (const child of domNode.children) {
                count += createNode(child, node, 0, childY);
                childY += 40; // Simple vertical stacking
            }
        }
        // Auto-resize frame to fit content
        node.resize(Math.max(200, node.width), Math.max(40, childY || 40));
        return count;
    }
    nodeCount = createNode(data.dom, frame, 0, 0);
    // Select the created frame
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
    return nodeCount;
}
function applyStyles(node, styles) {
    // Background color
    if (styles.backgroundColor) {
        const color = parseColor(styles.backgroundColor);
        if (color) {
            node.fills = [{ type: 'SOLID', color }];
        }
    }
    // Border
    if (styles.border) {
        const borderWidth = parseInt(styles.border) || 1;
        node.strokeWeight = borderWidth;
        if (styles.borderColor) {
            const color = parseColor(styles.borderColor);
            if (color) {
                node.strokes = [{ type: 'SOLID', color }];
            }
        }
    }
    // Border radius
    if (styles.borderRadius) {
        const radius = parseInt(styles.borderRadius) || 0;
        node.cornerRadius = radius;
    }
    // Padding (approximate with auto-layout if needed)
    // For now, just set minimum size
    if (styles.padding) {
        const padding = parseInt(styles.padding) || 0;
        node.paddingLeft = padding;
        node.paddingRight = padding;
        node.paddingTop = padding;
        node.paddingBottom = padding;
    }
}
function parseColor(colorStr) {
    // Parse hex colors
    if (colorStr.startsWith('#')) {
        const hex = colorStr.slice(1);
        if (hex.length === 6) {
            return {
                r: parseInt(hex.slice(0, 2), 16) / 255,
                g: parseInt(hex.slice(2, 4), 16) / 255,
                b: parseInt(hex.slice(4, 6), 16) / 255
            };
        }
    }
    // Parse rgb/rgba
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]) / 255,
            g: parseInt(rgbMatch[2]) / 255,
            b: parseInt(rgbMatch[3]) / 255
        };
    }
    return null;
}
