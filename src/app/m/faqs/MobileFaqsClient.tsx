"use client"

import React, { useEffect, useState } from 'react'
import { FAQData, FAQCategoryData, getFAQsDataClient, getFAQCategoriesDataClient } from '@/lib/faqs-data-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'

interface MobileFaqsClientProps {
  initialFaqs: FAQData[]
  initialCategories: FAQCategoryData[]
}

function MobileFaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mb-4">
      <CardContent className="p-0">
        <button
          className="w-full flex justify-between items-center px-4 py-4 text-base font-semibold text-gray-900 focus:outline-none transition-all"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="text-left pr-4">{question}</span>
          <span className="ml-2 text-gray-500">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>
        {open && (
          <div className="px-4 pb-4 pt-0 text-gray-700 text-sm border-t border-gray-100">
            <div className="pt-3">{answer}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MobileFaqsClient({ initialFaqs, initialCategories }: MobileFaqsClientProps) {
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
  }, [selectedCategory, initialFaqs])

  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/m" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </a>
            <h1 className="text-lg font-semibold text-gray-900">FAQ&apos;s</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm">
              Find answers to common questions about our services
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Filter by Category</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className="text-xs"
                    >
                      {cat.name} ({cat.faq_count})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* FAQ List */}
          {!loading && (
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                    <p className="text-gray-500 text-sm">
                      No FAQs found for this category. Please try a different category or check back later.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                faqs.map((faq) => (
                  <MobileFaqItem key={faq.id} question={faq.question} answer={faq.answer} />
                ))
              )}
            </div>
          )}

          {/* Footer */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Still have questions?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Can&apos;t find what you&apos;re looking for? Contact our support team for assistance.
              </p>
              <Button 
                asChild
                size="sm"
              >
                <a href="/m/contact">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </HydrationSuppressor>
  )
} 