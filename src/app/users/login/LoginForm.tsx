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

      // 2. Check if email is confirmed
      if (!authData.user.email_confirmed_at) {
        // Sign out the user since email is not confirmed
        await supabase.auth.signOut()
        
        toast({
          title: 'Email Not Confirmed',
          description: 'Please check your email and confirm your account before signing in.',
          variant: 'destructive',
        })
        return
      }

      // 3. Check if the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profile) {
        // Profile doesn't exist, create one (first-time login)
        console.log('Profile not found, creating one for first-time login...')
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || '',
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Profile creation error:', insertError);
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
      } else {
        // Profile exists, show welcome back message
        toast({
          title: 'Welcome back!',
          description: `Hello ${profile.full_name || 'there'}!`,
        })
      }

      // 4. Redirect all users to home page - device detection will handle routing
      router.push('/')
      router.refresh()

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

          <Button
            type="submit"
            className="w-full h-11 lg:h-12 text-sm lg:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            disabled={isLoading}
          >
            Sign up here
          </button>
        </p>
        <p className="text-sm text-gray-600">
          <a
            href="/users/forgot-password"
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
          >
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  )
} 