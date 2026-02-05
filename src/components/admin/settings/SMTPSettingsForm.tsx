'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Server, FileText, Eye, EyeOff, TestTube, HelpCircle } from 'lucide-react'

type Props = {
  settings: {
    smtp_host: string
    smtp_port: number
    smtp_username: string
    smtp_password: string
    smtp_secure: boolean
    email_from: string
    email_from_name: string
    signup_confirmation_subject: string
    signup_confirmation_body: string
    password_reset_subject: string
    password_reset_body: string
    email_confirmation_enabled: boolean
  }
}

export function SMTPSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    smtp_host: settings.smtp_host || '',
    smtp_port: settings.smtp_port || 587,
    smtp_username: settings.smtp_username || '',
    smtp_password: settings.smtp_password || '',
    smtp_secure: settings.smtp_secure || false,
    email_from: settings.email_from || '',
    email_from_name: settings.email_from_name || '',
    signup_confirmation_subject: settings.signup_confirmation_subject || 'Welcome to {company_name} - Confirm Your Email',
    signup_confirmation_body: settings.signup_confirmation_body || `Hello {name},

Thank you for signing up with {company_name}!

Please confirm your email address by clicking the link below:

{confirmation_link}

If you did not create this account, you can safely ignore this email.

Best regards,
The {company_name} Team`,
    password_reset_subject: settings.password_reset_subject || 'Reset Your Password - {company_name}',
    password_reset_body: settings.password_reset_body || `Hello {name},

We received a request to reset your password for your {company_name} account.

To reset your password, please click the link below:

{reset_link}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The {company_name} Team`,
    email_confirmation_enabled: settings.email_confirmation_enabled || false,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Fetch latest settings on mount
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/smtp', { method: 'GET', credentials: 'include' });
        if (response.ok) {
          const { settings: newSettings } = await response.json();
          console.log('SMTPSettingsForm: fetched settings from API', newSettings);
          setFormData({
            smtp_host: newSettings.smtp_host || '',
            smtp_port: newSettings.smtp_port || 587,
            smtp_username: newSettings.smtp_username || '',
            smtp_password: newSettings.smtp_password || '',
            smtp_secure: newSettings.smtp_secure || false,
            email_from: newSettings.email_from || '',
            email_from_name: newSettings.email_from_name || '',
            signup_confirmation_subject: newSettings.signup_confirmation_subject || 'Welcome to {company_name} - Confirm Your Email',
            signup_confirmation_body: newSettings.signup_confirmation_body || `Hello {name},

Thank you for signing up with {company_name}!

Please confirm your email address by clicking the link below:

{confirmation_link}

If you did not create this account, you can safely ignore this email.

Best regards,
The {company_name} Team`,
            password_reset_subject: newSettings.password_reset_subject || 'Reset Your Password - {company_name}',
            password_reset_body: newSettings.password_reset_body || `Hello {name},

We received a request to reset your password for your {company_name} account.

To reset your password, please click the link below:

{reset_link}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The {company_name} Team`,
            email_confirmation_enabled: newSettings.email_confirmation_enabled || false,
          });
          console.log('SMTPSettingsForm: updated formData', {
            smtp_host: newSettings.smtp_host || '',
            smtp_port: newSettings.smtp_port || 587,
            smtp_username: newSettings.smtp_username || '',
            smtp_password: newSettings.smtp_password || '',
            smtp_secure: newSettings.smtp_secure || false,
            email_from: newSettings.email_from || '',
            email_from_name: newSettings.email_from_name || '',
            signup_confirmation_subject: newSettings.signup_confirmation_subject || 'Welcome to {company_name} - Confirm Your Email',
            signup_confirmation_body: newSettings.signup_confirmation_body || `Hello {name},

Thank you for signing up with {company_name}!

Please confirm your email address by clicking the link below:

{confirmation_link}

If you did not create this account, you can safely ignore this email.

Best regards,
The {company_name} Team`,
            password_reset_subject: newSettings.password_reset_subject || 'Reset Your Password - {company_name}',
            password_reset_body: newSettings.password_reset_body || `Hello {name},

We received a request to reset your password for your {company_name} account.

To reset your password, please click the link below:

{reset_link}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The {company_name} Team`,
            email_confirmation_enabled: newSettings.email_confirmation_enabled || false,
          });
        }
      } catch (error) {
        console.log('SMTPSettingsForm: error fetching settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true)

      // Validate required fields
      if (!formData.smtp_host || !formData.smtp_username || !formData.email_from) {
        throw new Error('Please fill in all required SMTP fields')
      }

      // Use API route to update settings
      const response = await fetch('/api/settings/smtp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update SMTP settings')
      }

      // Refetch latest settings after save
      const refetch = await fetch('/api/settings/smtp', { method: 'GET', credentials: 'include' });
      if (refetch.ok) {
        const { settings: newSettings } = await refetch.json();
        setFormData({
          smtp_host: newSettings.smtp_host || '',
          smtp_port: newSettings.smtp_port || 587,
          smtp_username: newSettings.smtp_username || '',
          smtp_password: newSettings.smtp_password || '',
          smtp_secure: newSettings.smtp_secure || false,
          email_from: newSettings.email_from || '',
          email_from_name: newSettings.email_from_name || '',
          signup_confirmation_subject: newSettings.signup_confirmation_subject || 'Welcome to {company_name} - Confirm Your Email',
          signup_confirmation_body: newSettings.signup_confirmation_body || `Hello {name},

Thank you for signing up with {company_name}!

Please confirm your email address by clicking the link below:

{confirmation_link}

If you did not create this account, you can safely ignore this email.

Best regards,
The {company_name} Team`,
          password_reset_subject: newSettings.password_reset_subject || 'Reset Your Password - {company_name}',
          password_reset_body: newSettings.password_reset_body || `Hello {name},

We received a request to reset your password for your {company_name} account.

To reset your password, please click the link below:

{reset_link}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The {company_name} Team`,
          email_confirmation_enabled: newSettings.email_confirmation_enabled || false,
        });
      }

      toast({
        title: 'Success',
        description: 'SMTP settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating SMTP settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update SMTP settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSMTPConnection = async () => {
    if (!formData.smtp_host || !formData.smtp_port || !formData.smtp_username || !formData.smtp_password || !formData.email_from) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required SMTP fields before testing.',
        variant: 'destructive',
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/settings/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_host: formData.smtp_host,
          smtp_port: formData.smtp_port,
          smtp_username: formData.smtp_username,
          smtp_password: formData.smtp_password,
          smtp_secure: formData.smtp_secure,
          email_from: formData.email_from,
          email_from_name: formData.email_from_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'SMTP connection test failed')
      }

      toast({
        title: 'Success',
        description: data.message || 'SMTP connection test successful!',
      })
    } catch (error) {
      console.error('Error testing SMTP connection:', error)
      
      let errorMessage = 'SMTP connection test failed'
      let errorDetails = ''
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Provide specific guidance for common errors
        if (errorMessage.includes('Invalid login') || errorMessage.includes('Username and Password not accepted')) {
          errorDetails = `
            <strong>Authentication Error:</strong> Your username or password is incorrect.
            <br><br>
            <strong>For Gmail users:</strong>
            <ul>
              <li>Make sure you're using an App Password, not your regular password</li>
              <li>Enable 2-Factor Authentication on your Google account</li>
              <li>Generate an App Password: <a href="https://myaccount.google.com/apppasswords" target="_blank">Google App Passwords</a></li>
              <li>Use the App Password in the SMTP password field</li>
            </ul>
          `
        } else if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
          errorDetails = `
            <strong>SSL/TLS Error:</strong> There's a security configuration issue.
            <br><br>
            <strong>Common solutions:</strong>
            <ul>
              <li>For Gmail: Use port 587 with STARTTLS or port 465 with SSL</li>
              <li>For other providers: Check their recommended port and security settings</li>
              <li>Try different port/security combinations</li>
            </ul>
          `
        } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
          errorDetails = `
            <strong>Connection Error:</strong> Cannot connect to the SMTP server.
            <br><br>
            <strong>Check:</strong>
            <ul>
              <li>SMTP host is correct (e.g., smtp.gmail.com)</li>
              <li>Port number is correct</li>
              <li>Your internet connection</li>
              <li>Firewall settings</li>
            </ul>
          `
        }
      }
      
      toast({
        title: 'SMTP Test Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      
      // Show detailed error information in console for debugging
      if (errorDetails) {
        console.error('SMTP Error Details:', errorDetails)
      }
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* SMTP Configuration Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                SMTP Configuration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure your SMTP server settings for sending emails
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtp_host" className="text-sm font-medium text-gray-700">
                SMTP Host *
              </Label>
              <Input
                id="smtp_host"
                name="smtp_host"
                value={formData.smtp_host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Your SMTP server hostname
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port" className="text-sm font-medium text-gray-700">
                SMTP Port *
              </Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                value={formData.smtp_port}
                onChange={handleChange}
                placeholder="587"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Usually 587 (TLS) or 465 (SSL)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtp_username" className="text-sm font-medium text-gray-700">
                SMTP Username *
              </Label>
              <Input
                id="smtp_username"
                name="smtp_username"
                value={formData.smtp_username}
                onChange={handleChange}
                placeholder="your-email@gmail.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Your email address or username
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password" className="text-sm font-medium text-gray-700">
                SMTP Password *
              </Label>
              <div className="relative">
                <Input
                  id="smtp_password"
                  name="smtp_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtp_password}
                  onChange={handleChange}
                  placeholder="Your password or app password"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Use app password for Gmail or other providers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email_from" className="text-sm font-medium text-gray-700">
                From Email *
              </Label>
              <Input
                id="email_from"
                name="email_from"
                type="email"
                value={formData.email_from}
                onChange={handleChange}
                placeholder="noreply@yourdomain.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Email address that will appear as sender
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_from_name" className="text-sm font-medium text-gray-700">
                From Name
              </Label>
              <Input
                id="email_from_name"
                name="email_from_name"
                value={formData.email_from_name}
                onChange={handleChange}
                placeholder="Your Company Name"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                Display name for the sender
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="smtp_secure"
              checked={formData.smtp_secure}
              onCheckedChange={(checked) => handleSwitchChange('smtp_secure', checked)}
            />
            <Label htmlFor="smtp_secure" className="text-sm font-medium text-gray-700">
              Use SSL/TLS (recommended for port 465)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="email_confirmation_enabled"
              checked={formData.email_confirmation_enabled}
              onCheckedChange={(checked) => handleSwitchChange('email_confirmation_enabled', checked)}
            />
            <Label htmlFor="email_confirmation_enabled" className="text-sm font-medium text-gray-700">
              Enable email confirmation for new signups
            </Label>
          </div>

          {/* Test Connection Button */}
          <div className="flex justify-start">
            <Button
              onClick={testSMTPConnection}
              disabled={isTesting || !formData.smtp_host || !formData.smtp_username}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Email Templates
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize email templates for signup confirmation and password reset
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Signup Confirmation
              </TabsTrigger>
              <TabsTrigger value="reset" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Password Reset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="signup_confirmation_subject" className="text-sm font-medium text-gray-700">
                  Subject Line
                </Label>
                <Input
                  id="signup_confirmation_subject"
                  name="signup_confirmation_subject"
                  value={formData.signup_confirmation_subject}
                  onChange={handleChange}
                  placeholder="Confirm your email address"
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup_confirmation_body" className="text-sm font-medium text-gray-700">
                  Email Body
                </Label>
                <Textarea
                  id="signup_confirmation_body"
                  name="signup_confirmation_body"
                  value={formData.signup_confirmation_body}
                  onChange={handleChange}
                  placeholder="Hello {{name}},&#10;&#10;Please confirm your email address by clicking the link below:&#10;&#10;{{confirmation_link}}&#10;&#10;Best regards,&#10;{{company_name}}"
                  rows={12}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Available variables: {'{name}'}, {'{confirmation_link}'}, {'{company_name}'}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {formData.signup_confirmation_body.length} characters
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="password_reset_subject" className="text-sm font-medium text-gray-700">
                  Subject Line
                </Label>
                <Input
                  id="password_reset_subject"
                  name="password_reset_subject"
                  value={formData.password_reset_subject}
                  onChange={handleChange}
                  placeholder="Reset your password"
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_reset_body" className="text-sm font-medium text-gray-700">
                  Email Body
                </Label>
                <Textarea
                  id="password_reset_body"
                  name="password_reset_body"
                  value={formData.password_reset_body}
                  onChange={handleChange}
                  placeholder="Hello {{name}},&#10;&#10;You requested a password reset. Click the link below to reset your password:&#10;&#10;{{reset_link}}&#10;&#10;If you didn't request this, please ignore this email.&#10;&#10;Best regards,&#10;{{company_name}}"
                  rows={12}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Available variables: {'{name}'}, {'{reset_link}'}, {'{company_name}'}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {formData.password_reset_body.length} characters
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SMTP Troubleshooting Guide */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                SMTP Troubleshooting Guide
              </CardTitle>
              <CardDescription className="text-gray-600">
                Common solutions for SMTP connection issues
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gmail Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Gmail SMTP Configuration</h3>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Step 1: Enable 2-Factor Authentication</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
                <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" className="text-blue-600 hover:underline">Google Account Security</a></li>
                <li>Enable 2-Step Verification if not already enabled</li>
                <li>This is required to generate App Passwords</li>
              </ol>
              
              <h4 className="font-medium text-gray-900 mb-2">Step 2: Generate App Password</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-4">
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-600 hover:underline">Google App Passwords</a></li>
                <li>Select &quot;Mail&quot; as the app and &quot;Other&quot; as the device</li>
                <li>Enter &quot;Extra Realty SMTP&quot; as the name</li>
                <li>Click &quot;Generate&quot; and copy the 16-character password</li>
              </ol>
              
              <h4 className="font-medium text-gray-900 mb-2">Step 3: Configure SMTP Settings</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div><strong>SMTP Host:</strong> smtp.gmail.com</div>
                <div><strong>SMTP Port:</strong> 587 (or 465 for SSL)</div>
                <div><strong>SMTP Username:</strong> your-gmail@gmail.com</div>
                <div><strong>SMTP Password:</strong> [16-character App Password]</div>
                <div><strong>Secure:</strong> false (for port 587) or true (for port 465)</div>
                <div><strong>Email From:</strong> no-reply@yourdomain.com (business email)</div>
                <div><strong>Email From Name:</strong> Your Company Name</div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">📧 Email Flow Explanation:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>SMTP Username:</strong> Your Gmail account that actually sends emails</li>
                  <li>• <strong>Email From:</strong> Business email that appears as sender (may show as Gmail if domain not verified)</li>
                  <li>• <strong>Test Emails:</strong> Will be sent TO your Gmail account for verification</li>
                  <li>• <strong>User Emails:</strong> Will be sent TO users&apos; registered email addresses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Other Email Providers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Other Email Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Outlook/Hotmail */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Outlook/Hotmail</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Host:</strong> smtp-mail.outlook.com</div>
                  <div><strong>Port:</strong> 587</div>
                  <div><strong>Security:</strong> STARTTLS</div>
                </div>
              </div>
              
              {/* Yahoo */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Yahoo Mail</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Host:</strong> smtp.mail.yahoo.com</div>
                  <div><strong>Port:</strong> 587</div>
                  <div><strong>Security:</strong> STARTTLS</div>
                </div>
              </div>
              
              {/* Custom SMTP */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Custom SMTP Server</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Host:</strong> Your SMTP server hostname</div>
                  <div><strong>Port:</strong> Usually 25, 587, or 465</div>
                  <div><strong>Security:</strong> Check with your provider</div>
                </div>
              </div>
              
              {/* SendGrid */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">SendGrid</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Host:</strong> smtp.sendgrid.net</div>
                  <div><strong>Port:</strong> 587</div>
                  <div><strong>Security:</strong> STARTTLS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Issues & Solutions</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">🔐 Authentication Errors</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use App Passwords for Gmail (not regular password)</li>
                  <li>• Check username spelling and case sensitivity</li>
                  <li>• Ensure 2FA is enabled for Gmail</li>
                  <li>• Verify credentials with your email provider</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">🔒 SSL/TLS Errors</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Port 587: Use STARTTLS (secure: false)</li>
                  <li>• Port 465: Use SSL (secure: true)</li>
                  <li>• Port 25: Use no encryption (secure: false)</li>
                  <li>• Try different port/security combinations</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">🌐 Connection Errors</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Verify SMTP host is correct</li>
                  <li>• Check port number</li>
                  <li>• Ensure internet connection is stable</li>
                  <li>• Check firewall/antivirus settings</li>
                  <li>• Try from different network if possible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Testing Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Testing Tips</h3>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <strong>Test with a simple configuration first</strong> - Use Gmail with App Password</li>
                <li>✅ <strong>Check your spam folder</strong> - Test emails might be marked as spam</li>
                <li>✅ <strong>Use the same email for &quot;From&quot; and &quot;To&quot;</strong> - This helps with testing</li>
                <li>✅ <strong>Try different ports</strong> - 587 (STARTTLS) or 465 (SSL)</li>
                <li>✅ <strong>Check provider documentation</strong> - Each email provider has specific requirements</li>
                <li>✅ <strong>Contact your email provider</strong> - If issues persist, they may have specific requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
} 