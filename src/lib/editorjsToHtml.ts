export function editorjsToHtml(data: any): string {
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
    if (data.blocks) {
      let blocks = data.blocks;
      if (!Array.isArray(blocks)) {
        blocks = [blocks];
      }

      const htmlParts: string[] = [];

      blocks.forEach((block: any) => {
        if (block && block.type && block.content) {
          switch (block.type) {
            case 'paragraph':
              htmlParts.push(`<p>${block.content}</p>`);
              break;
            case 'header':
              const level = block.level || 1;
              htmlParts.push(`<h${level}>${block.content}</h${level}>`);
              break;
            case 'list':
              const listType = block.style === 'ordered' ? 'ol' : 'ul';
              const items = Array.isArray(block.items) ? block.items : [block.items];
              const listItems = items.map((item: any) => `<li>${item}</li>`).join('');
              htmlParts.push(`<${listType}>${listItems}</${listType}>`);
              break;
            default:
              // For any other type, just wrap in a paragraph
              htmlParts.push(`<p>${block.content}</p>`);
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