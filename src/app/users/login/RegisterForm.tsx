'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { supabase } from '@/lib/supabaseClient'
import { ArrowRight } from 'lucide-react'

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        } else if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 8 characters long.')
        } else {
          throw new Error(`Registration failed: ${authError.message}`)
        }
      }

      if (authData.user) {
        // Create profile via secure API route
        const profileRes = await fetch('/api/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            full_name: values.full_name,
            role: 'customer',
          }),
        });
        if (!profileRes.ok) {
          const { error } = await profileRes.json();
          toast({
            title: 'Profile creation failed',
            description: error || 'Could not create user profile. Please contact support if you have issues logging in.',
            variant: 'destructive',
          });
        }

        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to confirm your account before signing in.',
        })
        
        // Switch back to login form
        onSwitchToLogin()
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
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
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-4 lg:space-y-6"
        >
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="h-11 lg:h-12 text-sm lg:text-base"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-11 lg:h-12 text-sm lg:text-base"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Password and Confirm Password on the same row */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className="h-11 lg:h-12 text-sm lg:text-base"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm lg:text-base font-medium text-gray-700">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        className="h-11 lg:h-12 text-sm lg:text-base"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 lg:h-12 text-sm lg:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </Form>
      {/* Already have an account */}
      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Sign in here
        </button>
      </div>
    </div>
  )
} 