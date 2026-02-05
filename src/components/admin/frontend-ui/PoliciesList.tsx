'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Loader2,
  FileText,
  AlertTriangle,
  Eye as ViewIcon,
  Shield,
  Calendar,
  Clock,
  Filter
} from 'lucide-react'
import PolicyForm from './PolicyForm'
import { jsonToHtml, jsonToText } from '@/lib/content-utils'

interface Policy {
  id: string
  name: string
  description?: string
  content?: string
  policy_type: string
  is_active: boolean
  created_at: string
  content_updated_at?: string
}

const POLICY_TYPE_LABELS: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  refund: 'Refund Policy',
  shipping: 'Shipping Policy',
  cancellation: 'Cancellation Policy',
  general: 'General Policy'
}

const POLICY_TYPE_COLORS: Record<string, string> = {
  privacy: 'bg-blue-100 text-blue-800 border-blue-200',
  terms: 'bg-green-100 text-green-800 border-green-200',
  refund: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  shipping: 'bg-purple-100 text-purple-800 border-purple-200',
  cancellation: 'bg-red-100 text-red-800 border-red-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200'
}

const POLICY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }> | string> = {
  privacy: Shield,
  terms: FileText,
  refund: '↩️',
  shipping: '📦',
  cancellation: '❌',
  general: FileText
}

export default function PoliciesList() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [deletingPolicy, setDeletingPolicy] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [viewingContent, setViewingContent] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('')

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/policies')
      const data = await response.json()
      
      console.log('PoliciesList: API response:', data)
      
      if (data.policies) {
        setPolicies(data.policies)
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch policies',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  const handleDelete = async (policyId: string) => {
    if (confirmDelete === policyId) {
      // User confirmed, proceed with deletion
      setDeletingPolicy(policyId)
      try {
        const response = await fetch(`/api/admin/policies/${policyId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete policy')
        }

        toast({
          title: 'Success',
          description: 'Policy deleted successfully',
        })

        fetchPolicies()
      } catch (error) {
        console.error('Error deleting policy:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete policy',
          variant: 'destructive'
        })
      } finally {
        setDeletingPolicy(null)
        setConfirmDelete(null)
      }
    } else {
      // Show confirmation state
      setConfirmDelete(policyId)
      toast({
        title: 'Confirm Delete',
        description: 'Click delete again to confirm',
      })
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
    toast({
      title: 'Cancelled',
      description: 'Delete operation cancelled',
    })
  }

  const handleToggleActive = async (policy: Policy) => {
    try {
      const response = await fetch(`/api/admin/policies/${policy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...policy,
          is_active: !policy.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update policy')
      }

      toast({
        title: 'Success',
        description: `Policy ${policy.is_active ? 'deactivated' : 'activated'} successfully`,
      })

      fetchPolicies()
    } catch (error) {
      console.error('Error updating policy:', error)
      toast({
        title: 'Error',
        description: 'Failed to update policy',
        variant: 'destructive'
      })
    }
  }

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      POLICY_TYPE_LABELS[policy.policy_type]?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || policy.policy_type === selectedType
    
    return matchesSearch && matchesType
  })

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPolicy(null)
    fetchPolicies()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPolicy(null)
  }

  const handleEditPolicy = (policy: Policy) => {
    console.log('PoliciesList: Editing policy:', policy)
    setEditingPolicy(policy)
    setShowForm(true)
  }

  const getContentPreview = (content: string | undefined) => {
    if (!content) return 'No content available'
    
    try {
      // Convert content to text for preview
      const textContent = jsonToText(content)
      return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent
    } catch (error) {
      console.error('Error getting content preview:', error)
      return 'Content preview unavailable'
    }
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <PolicyForm
          policy={editingPolicy || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (viewingContent) {
    const policy = policies.find(p => p.id === viewingContent)
    if (!policy) return null

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {policy.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Viewing policy content and details
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewingContent(null)}>
            Back to List
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{policy.name}</CardTitle>
                <div className="flex items-center gap-3 mt-3">
                  <Badge className={`${POLICY_TYPE_COLORS[policy.policy_type]} border`}>
                    {POLICY_TYPE_LABELS[policy.policy_type]}
                  </Badge>
                  <Badge variant={policy.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {policy.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {policy.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPolicy(policy)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {policy.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-1">Description:</p>
                <p className="text-sm text-gray-600">{policy.description}</p>
              </div>
            )}
            <div className="prose max-w-none">
              {(() => {
                try {
                  return <div dangerouslySetInnerHTML={{ __html: jsonToHtml(policy.content || 'No content available') }} />
                } catch (error) {
                  console.error('Error displaying policy content:', error)
                  return <div className="text-red-500">Error displaying content</div>
                }
              })()}
            </div>
            <div className="mt-6 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created: {new Date(policy.created_at).toLocaleDateString()}
              </div>
              {policy.content_updated_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated: {new Date(policy.content_updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Policies Design
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your website policies and legal content
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies by name, description, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(POLICY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Loading policies...</span>
          </div>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedType ? 'No policies found' : 'No policies yet'}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              {searchTerm || selectedType 
                ? 'Try adjusting your search terms or filters'
                : 'Get started by creating your first policy to manage your website\'s legal content'
              }
            </p>
            {!searchTerm && !selectedType && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Policy
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPolicies.map((policy) => {
            const PolicyIcon = POLICY_TYPE_ICONS[policy.policy_type]
            return (
              <Card key={policy.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {typeof PolicyIcon === 'string' ? (
                          <span className="text-lg">{PolicyIcon}</span>
                        ) : (
                          <PolicyIcon className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2">{policy.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${POLICY_TYPE_COLORS[policy.policy_type]} border`}>
                            {POLICY_TYPE_LABELS[policy.policy_type]}
                          </Badge>
                          <Badge variant={policy.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                            {policy.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {policy.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingContent(policy.id)}
                        title="View Content"
                        className="h-8 w-8 p-0"
                      >
                        <ViewIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(policy)}
                        title={policy.is_active ? 'Deactivate' : 'Activate'}
                        className="h-8 w-8 p-0"
                      >
                        {policy.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPolicy(policy)}
                        title="Edit Policy"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {confirmDelete === policy.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(policy.id)}
                            disabled={deletingPolicy === policy.id}
                            className="h-8 px-2"
                          >
                            {deletingPolicy === policy.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelDelete}
                            className="h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(policy.id)}
                          disabled={deletingPolicy === policy.id}
                          title="Delete Policy"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingPolicy === policy.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {policy.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {policy.description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-gray-700">Content Preview:</span>
                    <p className="mt-1 text-gray-600">{getContentPreview(policy.content)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(policy.created_at).toLocaleDateString()}
                    </div>
                    {policy.content_updated_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated: {new Date(policy.content_updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 