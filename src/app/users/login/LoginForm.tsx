'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { supabase } from '@/lib/supabaseClient'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // 1. Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Authentication failed')
      }

      // 2. Check if the user has a profile and get their role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profile) {
        // If profile doesn't exist, try to create one automatically
        console.log('Profile not found, attempting to create one...')
        let profileCreated = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              full_name: authData.user.user_metadata?.full_name || '',
              role: 'customer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          if (!insertError) {
            profileCreated = true;
            break;
          }
        }
        if (!profileCreated) {
          toast({
            title: 'Profile setup warning',
            description: 'Your account was created, but we could not set up your profile automatically. You can still use the site, but some features may be limited. Please contact support if you have issues.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome!',
            description: 'Your account has been set up successfully.',
          });
        }
        // Redirect all users to home page - device detection will handle routing
        router.push('/')
        router.refresh()
        return
      }

      // 3. Redirect all users to home page - device detection will handle routing
      // This ensures consistent behavior across all user types
      router.push('/')
      router.refresh()

      toast({
        title: 'Welcome back!',
        description: `Hello ${profile.full_name || 'there'}!`,
      })

    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - removed to avoid duplicate */}
      {/* <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-sm lg:text-base text-gray-600">Sign in to your account to continue</p>
      </div> */}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11 lg:h-12 text-sm lg:text-base"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 lg:h-12 text-sm lg:text-base"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between text-xs lg:text-sm">
            <button 
              type="button"
              onClick={() => window.location.href = '/users/forgot-password'}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 lg:h-12 text-sm lg:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>

          <div className="text-center text-xs lg:text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign up here
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
} 