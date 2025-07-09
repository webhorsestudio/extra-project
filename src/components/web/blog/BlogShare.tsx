'use client'

import { Facebook, Twitter, Linkedin, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at?: string;
}

export default function BlogShare({ blog }: { blog: Blog }) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(blog.title)}`,
      color: 'hover:text-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-700'
    }
  ]

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">Share:</span>
        
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-gray-500 transition-colors ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="h-5 w-5" />
          </a>
        ))}
        
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-700 ${
            copied ? 'text-green-600' : ''
          }`}
          aria-label="Copy link"
        >
          <Share2 className="h-5 w-5" />
          {copied && <span className="text-sm">Copied!</span>}
        </button>
      </div>
    </div>
  )
} 