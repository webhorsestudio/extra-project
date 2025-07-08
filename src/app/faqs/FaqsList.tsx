"use client"

import React, { useEffect, useState } from 'react';
import { FAQData, FAQCategoryData, getFAQsDataClient, getFAQCategoriesDataClient } from '@/lib/faqs-data-client'
import { Button } from '@/components/ui/button'

interface FaqsListProps {
  initialFaqs: FAQData[]
  initialCategories: FAQCategoryData[]
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 last:mb-0">
      <button
        className="w-full flex justify-between items-center bg-white rounded-2xl shadow px-8 py-6 text-lg font-semibold text-gray-900 focus:outline-none transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="ml-4 text-2xl">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="bg-white rounded-b-2xl px-8 pb-6 pt-2 text-gray-700 text-base shadow-inner">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqsList({ initialFaqs, initialCategories }: FaqsListProps) {
  const [faqs, setFaqs] = useState<FAQData[]>(initialFaqs || [])
  const [categories, setCategories] = useState<FAQCategoryData[]>(initialCategories || [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(!initialFaqs?.length)

  // Fallback to client fetch if SSR data is empty
  useEffect(() => {
    if (!initialFaqs || initialFaqs.length === 0) {
      setLoading(true)
      getFAQsDataClient().then(data => {
        setFaqs(data)
        setLoading(false)
      })
    }
    if (!initialCategories || initialCategories.length === 0) {
      getFAQCategoriesDataClient().then(data => setCategories(data))
    }
  }, [initialFaqs, initialCategories])

  // Refetch FAQs when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFaqs(initialFaqs)
    } else {
      setLoading(true)
      getFAQsDataClient(selectedCategory).then(data => {
        setFaqs(data)
        setLoading(false)
      })
    }
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name} ({cat.faq_count})
            </Button>
          ))}
        </div>
      )}
      {/* FAQ List */}
      {faqs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No FAQs found for this category.</div>
      ) : (
        faqs.map((faq, idx) => (
          <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
        ))
      )}
    </div>
  );
} 