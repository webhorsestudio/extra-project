'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Policy {
  id: string
  name: string
  policy_type: string
  is_active: boolean
}

interface FooterPolicyLinksProps {
  linkColor?: string
  linkHoverColor?: string
}

export default function FooterPolicyLinks({ 
  linkColor = '#9ca3af',
  linkHoverColor = '#ffffff'
}: FooterPolicyLinksProps) {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch('/api/policies')
        const data = await response.json()
        if (data.policies) {
          setPolicies(data.policies)
        }
      } catch (error) {
        console.error('Error fetching policies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  // Policy type to display name mapping
  const policyTypeLabels: Record<string, string> = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Refund Policy',
    shipping: 'Shipping Policy',
    cancellation: 'Cancellation Policy',
    general: 'General Policy'
  }

  // Filter to only show active policies
  const activePolicies = policies.filter(policy => policy.is_active)

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: linkColor }}>
        <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-300 h-4 w-24 rounded"></div>
        <div className="animate-pulse bg-gray-300 h-4 w-28 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 text-xs" style={{ color: linkColor }}>
      {activePolicies.map(policy => (
        <Link 
          key={policy.id}
          href={`/policy/${policy.policy_type}`} 
          className="hover:underline transition-colors"
          style={{ 
            color: linkColor,
            '--tw-text-opacity': '1'
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = linkHoverColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = linkColor
          }}
        >
          {policyTypeLabels[policy.policy_type] || policy.name}
        </Link>
      ))}
    </div>
  )
} 