'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
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
        // Fetch settings to check if email confirmation is enabled
        const settingsRes = await fetch('/api/settings/public', { method: 'GET' });
        let emailConfirmationEnabled = false;
        if (settingsRes.ok) {
          const { settings } = await settingsRes.json();
          emailConfirmationEnabled = !!settings.email_confirmation_enabled;
        }
        // Send custom confirmation email only if enabled
        if (emailConfirmationEnabled) {
          await fetch('/api/auth/request-email-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: values.email }),
          });
        }
        toast({
          title: 'Account created successfully!',
          description: emailConfirmationEnabled
            ? 'Please check your email to confirm your account before signing in.'
            : 'You can now sign in with your new account.',
        })
        // Redirect to login page
        router.push('/users/login')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Link 
              href="/users/login"
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <CardTitle>Create your account</CardTitle>
            </div>
          </div>
          <CardDescription>
            Join us to access exclusive property listings and features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
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
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link 
              href="/users/login" 
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 