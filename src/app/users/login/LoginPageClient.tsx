'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Home, Shield, Users, TrendingUp, UserPlus } from 'lucide-react'
import { AuthCard } from '@/components/ui/AuthCard'
import { AuthHeader } from '@/components/ui/AuthHeader'
import { AuthFooter } from '@/components/ui/AuthFooter'
import clsx from 'clsx'
import { AuthModal } from '@/components/ui/AuthModal'

interface LoginPageProps {
  branding: {
    logo_url: string | null
    logo_alt: string
    company_name: string
    company_tagline: string
  }
}

export function LoginPage({ branding }: LoginPageProps) {
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const router = useRouter()

  // Handle form switching
  const switchToRegister = () => {
    setIsLoginForm(false)
  }

  const switchToLogin = () => {
    setIsLoginForm(true)
  }

  const openSignup = () => setIsSignupOpen(true)
  const closeSignup = () => setIsSignupOpen(false)

  // Check authentication on mount
  // (Optional: you may want to keep this, or move it to a server component)
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     if (session?.user) {
  //       router.push('/')
  //     }
  //   }
  //   checkAuth()
  // }, [router])

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto bg-white">
      {/* Left Side - Authentication Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-white min-h-screen relative">
        <div className="w-full max-w-xl">
          <AuthCard>
            <AuthHeader
              logoUrl={branding.logo_url}
              logoAlt={branding.logo_alt}
              title="Welcome Back"
              subtitle="Sign in to your account to continue"
            />
            <LoginForm onSwitchToRegister={openSignup} />
          </AuthCard>
        </div>
        {/* Footer: hidden on mobile/tablet, visible below card on desktop */}
        <div className="hidden lg:block w-full max-w-xl mt-4">
          <AuthFooter companyName={branding.company_name} />
        </div>
      </div>
      {/* Signup Modal */}
      <AuthModal open={isSignupOpen} onClose={closeSignup}>
        <AuthHeader
          logoUrl={branding.logo_url}
          logoAlt={branding.logo_alt}
          icon={<UserPlus className="h-8 w-8 text-blue-600 mx-auto" />}
          title="Create your account"
          subtitle="Sign up to access exclusive property listings and features."
        />
        <RegisterForm onSwitchToLogin={closeSignup} />
      </AuthModal>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-12 py-12 lg:py-16 text-white">
          {/* Company Info */}
          <div className="mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">
              {branding.company_name}
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 mb-6 lg:mb-8">
              {branding.company_tagline}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">Premium Properties</h3>
                <p className="text-sm lg:text-base text-blue-100">Discover exclusive real estate opportunities in prime locations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">Secure Platform</h3>
                <p className="text-sm lg:text-base text-blue-100">Your data is protected with enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">Expert Support</h3>
                <p className="text-sm lg:text-base text-blue-100">Get assistance from our experienced real estate professionals</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 lg:space-x-4">
              <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">Market Insights</h3>
                <p className="text-sm lg:text-base text-blue-100">Access real-time market data and investment opportunities</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-white/20">
            <div className="grid grid-cols-3 gap-6 lg:gap-8 text-center">
              <div>
                <div className="text-xl lg:text-2xl font-bold">500+</div>
                <div className="text-xs lg:text-sm text-blue-100">Properties</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold">1000+</div>
                <div className="text-xs lg:text-sm text-blue-100">Happy Clients</div>
              </div>
              <div>
                <div className="text-xl lg:text-2xl font-bold">15+</div>
                <div className="text-xs lg:text-sm text-blue-100">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hero Section */}
      <div className="lg:hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-8 text-white">
        <div className="flex flex-col items-center gap-y-4">
          {/* Company Name & Tagline */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold mb-1">{branding.company_name}</h2>
            <p className="text-base text-blue-100">{branding.company_tagline}</p>
          </div>
          {/* Features */}
          <div className="w-full flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <Home className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Premium Properties</div>
                <div className="text-xs text-blue-100">Discover exclusive real estate opportunities in prime locations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <Shield className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Secure Platform</div>
                <div className="text-xs text-blue-100">Your data is protected with enterprise-grade security</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <Users className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Expert Support</div>
                <div className="text-xs text-blue-100">Get assistance from our experienced real estate professionals</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Market Insights</div>
                <div className="text-xs text-blue-100">Access real-time market data and investment opportunities</div>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="w-full grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">500+</div>
              <div className="text-xs text-blue-100">Properties</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">1000+</div>
              <div className="text-xs text-blue-100">Happy Clients</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">15+</div>
              <div className="text-xs text-blue-100">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 