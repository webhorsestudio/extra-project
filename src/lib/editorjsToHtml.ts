export function editorjsToHtml(data: unknown): string {
  try {
    // Handle SSR - return empty string if no data
    if (typeof window === 'undefined' && !data) {
      return '';
    }

    // If data is already a string, return it
    if (typeof data === 'string') {
      return data;
    }

    // If data is null/undefined, return empty string
    if (!data) {
      return '';
    }

    // Simple parser for our JSON structure
    if (data && typeof data === 'object' && 'blocks' in data) {
      let blocks = (data as { blocks: unknown }).blocks;
      if (!Array.isArray(blocks)) {
        blocks = [blocks];
      }

      const htmlParts: string[] = [];

      (blocks as unknown[]).forEach((block: unknown) => {
        if (block && typeof block === 'object' && block !== null) {
          const blockObj = block as Record<string, unknown>;
          if (blockObj.type && blockObj.content) {
            switch (blockObj.type) {
              case 'paragraph':
                htmlParts.push(`<p>${blockObj.content}</p>`);
                break;
              case 'header':
                const level = (blockObj.level as number) || 1;
                htmlParts.push(`<h${level}>${blockObj.content}</h${level}>`);
                break;
              case 'list':
                const listType = blockObj.style === 'ordered' ? 'ol' : 'ul';
                const items = Array.isArray(blockObj.items) ? blockObj.items : [blockObj.items];
                const listItems = items.map((item: unknown) => `<li>${item}</li>`).join('');
                htmlParts.push(`<${listType}>${listItems}</${listType}>`);
                break;
              default:
                // For any other type, just wrap in a paragraph
                htmlParts.push(`<p>${blockObj.content}</p>`);
            }
          }
        }
      });

      return htmlParts.join('');
    }

    return '';
  } catch (error) {
    console.error('Content parsing error:', error);
    return '';
  }
} 