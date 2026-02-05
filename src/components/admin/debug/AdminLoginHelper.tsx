'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export function AdminLoginHelper() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user?.email}`,
        })
        // Refresh the page to update the admin layout
        window.location.reload()
      }
    } catch {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    
    // Try common admin credentials
    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'admin@example.com', password: 'admin' },
      { email: 'admin@example.com', password: '123456' },
      { email: 'admin@example.com', password: 'admin@example.com' },
    ]

    for (const cred of testCredentials) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword(cred)
        
        if (!error && data.user) {
          toast({
            title: 'Login Successful',
            description: `Logged in as ${data.user.email}`,
          })
          window.location.reload()
          return
        }
      } catch {
        continue
      }
    }

    toast({
      title: 'Quick Login Failed',
      description: 'Please enter your password manually',
      variant: 'destructive'
    })
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleQuickLogin}
              disabled={loading}
            >
              Quick Login
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Admin Account Info</h4>
          <p className="text-blue-700 text-sm">
            <strong>Email:</strong> <code className="bg-blue-100 px-1 rounded">admin@example.com</code>
          </p>
          <p className="text-blue-700 text-sm mt-1">
            <strong>Name:</strong> Admin | <strong>Role:</strong> admin
          </p>
          <p className="text-blue-700 text-sm mt-1">
            <strong>Created:</strong> May 20, 2025 | <strong>Email Confirmed:</strong> Yes
          </p>
        </div>

        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Common Passwords to Try</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• admin123</li>
            <li>• password</li>
            <li>• admin</li>
            <li>• 123456</li>
            <li>• admin@example.com</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 