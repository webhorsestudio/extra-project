/**
 * Utility functions for handling content conversion between JSON and HTML formats
 */

export interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
  attrs?: Record<string, any>
}

/**
 * Check if content is in JSON format
 */
export function isJsonContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  try {
    const parsed = JSON.parse(content)
    return typeof parsed === 'object' && parsed !== null
  } catch {
    return false
  }
}

/**
 * Validate and clean TipTap JSON content
 */
export function validateTipTapContent(content: string | TipTapNode): TipTapNode | null {
  if (!content) return null
  
  let jsonContent: TipTapNode
  if (typeof content === 'string') {
    try {
      jsonContent = JSON.parse(content)
    } catch {
      return null
    }
  } else {
    jsonContent = content
  }

  // Basic validation
  if (!jsonContent || typeof jsonContent !== 'object') return null
  if (!jsonContent.type) return null

  // Clean null/undefined values from content arrays
  const cleanNode = (node: any): any => {
    if (!node) return null
    if (typeof node === 'string') return node
    if (typeof node !== 'object') return node

    const cleaned: any = { ...node }
    
    if (cleaned.content && Array.isArray(cleaned.content)) {
      cleaned.content = cleaned.content
        .map(cleanNode)
        .filter((item: any) => item !== null && item !== undefined)
    }

    return cleaned
  }

  return cleanNode(jsonContent)
}

/**
 * Convert TipTap JSON content to HTML
 */
export function jsonToHtml(content: string | TipTapNode): string {
  if (!content) return ''
  
  // Validate and clean the content first
  const validatedContent = validateTipTapContent(content)
  if (!validatedContent) {
    // If validation fails, try to return as plain text
    if (typeof content === 'string') return content
    return ''
  }

  const convertNode = (node: TipTapNode | null | undefined): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    
    switch (node.type) {
      case 'doc':
        return node.content ? node.content.map(convertNode).join('') : ''
      
      case 'paragraph':
        const innerContent = node.content ? node.content.map(convertNode).join('') : ''
        return `<p>${innerContent}</p>`
      
      case 'heading':
        const level = node.attrs?.level || 1
        const headingContent = node.content ? node.content.map(convertNode).join('') : ''
        return `<h${level}>${headingContent}</h${level}>`
      
      case 'text':
        let text = node.text || ''
        if (node.marks) {
          node.marks.forEach((mark) => {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`
                break
              case 'italic':
                text = `<em>${text}</em>`
                break
              case 'underline':
                text = `<u>${text}</u>`
                break
              case 'link':
                const href = mark.attrs?.href || '#'
                text = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
                break
              case 'code':
                text = `<code>${text}</code>`
                break
            }
          })
        }
        return text
      
      case 'bulletList':
        const bulletItems = node.content ? node.content.map(convertNode).join('') : ''
        return `<ul>${bulletItems}</ul>`
      
      case 'orderedList':
        const orderedItems = node.content ? node.content.map(convertNode).join('') : ''
        return `<ol>${orderedItems}</ol>`
      
      case 'listItem':
        const itemContent = node.content ? node.content.map(convertNode).join('') : ''
        return `<li>${itemContent}</li>`
      
      case 'codeBlock':
        const codeContent = node.content ? node.content.map(convertNode).join('') : ''
        const language = node.attrs?.language || ''
        return `<pre><code class="language-${language}">${codeContent}</code></pre>`
      
      case 'image':
        const src = node.attrs?.src || ''
        const alt = node.attrs?.alt || ''
        return `<img src="${src}" alt="${alt}" class="max-w-full h-auto" />`
      
      case 'blockquote':
        const quoteContent = node.content ? node.content.map(convertNode).join('') : ''
        return `<blockquote>${quoteContent}</blockquote>`
      
      case 'horizontalRule':
        return '<hr />'
      
      default:
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(convertNode).join('')
        }
        return ''
    }
  }

  return convertNode(validatedContent)
}

/**
 * Extract plain text from TipTap JSON content
 */
export function jsonToText(content: string | TipTapNode): string {
  if (!content) return ''
  
  // Validate and clean the content first
  const validatedContent = validateTipTapContent(content)
  if (!validatedContent) {
    // If validation fails, try to return as plain text
    if (typeof content === 'string') return content
    return ''
  }

  const extractText = (node: TipTapNode | null | undefined): string => {
    if (!node) return ''
    if (typeof node === 'string') return node
    if (node.text) return node.text
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join(' ')
    }
    return ''
  }

  return extractText(validatedContent)
} 