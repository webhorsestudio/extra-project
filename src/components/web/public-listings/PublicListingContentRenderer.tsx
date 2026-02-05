'use client'

import { useEffect, useState } from 'react'

interface PublicListingContentRendererProps {
  content: Record<string, unknown>
}

export function PublicListingContentRenderer({ content }: PublicListingContentRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')

  useEffect(() => {
    // Convert Tiptap JSON content to HTML
    const convertToHtml = (content: Record<string, unknown>): string => {
      if (!content || typeof content !== 'object') return ''
      
      // Simple conversion from Tiptap JSON to HTML
      // This is a basic implementation - you might want to use a more robust solution
      let html = ''
      
      if (content.type === 'doc' && Array.isArray(content.content)) {
        html = content.content.map(convertNodeToHtml).join('')
      }
      
      return html
    }

      const convertNodeToHtml = (node: Record<string, unknown>): string => {
    if (!node || typeof node !== 'object') return ''
    
    const { type, content, attrs, text } = node as { type: string; content: unknown; attrs: Record<string, unknown>; text: string }
    
    if (type === 'text') {
      let textContent = text || ''
      
      // Apply marks (bold, italic, etc.)
      if (node.marks && Array.isArray(node.marks)) {
        (node.marks as Array<{ type: string; attrs?: Record<string, unknown> }>).forEach((mark) => {
            switch (mark.type) {
              case 'bold':
                textContent = `<strong>${textContent}</strong>`
                break
              case 'italic':
                textContent = `<em>${textContent}</em>`
                break
              case 'underline':
                textContent = `<u>${textContent}</u>`
                break
              case 'link':
                textContent = `<a href="${mark.attrs?.href || '#'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${textContent}</a>`
                break
            }
          })
        }
        
        return textContent
      }
      
      if (type === 'paragraph') {
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        return `<p class="mb-4 leading-relaxed">${innerContent}</p>`
      }
      
      if (type === 'heading') {
        const level = attrs?.level || 1
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        const tag = `h${level}`
        const classes = level === 1 ? 'text-2xl font-bold mb-4' : 
                      level === 2 ? 'text-xl font-semibold mb-3' : 
                      'text-lg font-medium mb-2'
        return `<${tag} class="${classes}">${innerContent}</${tag}>`
      }
      
      if (type === 'bulletList') {
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        return `<ul class="list-disc list-inside mb-4 space-y-1">${innerContent}</ul>`
      }
      
      if (type === 'orderedList') {
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        return `<ol class="list-decimal list-inside mb-4 space-y-1">${innerContent}</ol>`
      }
      
      if (type === 'listItem') {
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        return `<li class="ml-4">${innerContent}</li>`
      }
      
      if (type === 'blockquote') {
        const innerContent = Array.isArray(content) ? content.map(convertNodeToHtml).join('') : ''
        return `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4">${innerContent}</blockquote>`
      }
      
      if (type === 'image') {
        const src = attrs?.src || ''
        const alt = attrs?.alt || ''
        return `<img src="${src}" alt="${alt}" class="max-w-full h-auto rounded-lg mb-4" />`
      }
      
      if (type === 'horizontalRule') {
        return `<hr class="my-6 border-gray-300" />`
      }
      
      // Recursively process nested content
      if (Array.isArray(content)) {
        return content.map(convertNodeToHtml).join('')
      }
      
      return ''
    }
    
    const html = convertToHtml(content)
    setHtmlContent(html)
  }, [content])

  if (!htmlContent) {
    return (
      <div className="text-gray-500 text-center py-8">
        <p>No content available</p>
      </div>
    )
  }

  return (
    <div 
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
