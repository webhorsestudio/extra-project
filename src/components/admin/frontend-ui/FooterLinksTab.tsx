"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Link, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  Loader2,
  Save
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface FooterLink {
  id: string
  label: string
  href: string
  isActive: boolean
}

interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
  isActive: boolean
}

export default function FooterLinksTab() {
  const { toast } = useToast()
  const [content, setContent] = useState<unknown>(null)
  const [columns, setColumns] = useState<FooterColumn[]>([])
  const [policyLinks, setPolicyLinks] = useState<FooterLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/footer/content')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch footer content')
        setContent(data.content)
        
        // Parse navigation columns from JSON
        if (data.content?.navigation_columns) {
          const parsedColumns = data.content.navigation_columns.map((col: Record<string, unknown>, index: number) => ({
            id: index.toString(),
            title: typeof col.title === 'string' ? col.title : 'New Column',
            isActive: col.isActive !== false,
            links: Array.isArray(col.links) ? col.links.map((link: Record<string, unknown>, linkIndex: number) => ({
              id: `${index}-${linkIndex}`,
              label: typeof link.label === 'string' ? link.label : 'New Link',
              href: typeof link.href === 'string' ? link.href : '#',
              isActive: link.isActive !== false
            })) : []
          }))
          setColumns(parsedColumns)
        }
        
        // Parse policy links from JSON
        if (data.content?.policy_links) {
          const parsedPolicyLinks = data.content.policy_links.map((link: Record<string, unknown>, index: number) => ({
            id: index.toString(),
            label: typeof link.label === 'string' ? link.label : 'New Policy',
            href: typeof link.href === 'string' ? link.href : '/policy',
            isActive: link.isActive !== false
          }))
          setPolicyLinks(parsedPolicyLinks)
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
    // Check admin (naive: if API returns content, assume admin for now)
    fetch('/api/admin/footer/layout').then(r => r.json()).then(d => {
      setIsAdmin(!d.error)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Convert columns and policy links back to JSON format
      const navigationColumns = columns.map(col => ({
        title: col.title,
        isActive: col.isActive,
        links: col.links.map(link => ({
          label: link.label,
          href: link.href,
          isActive: link.isActive
        }))
      }))

      const policyLinksData = policyLinks.map(link => ({
        label: link.label,
        href: link.href,
        isActive: link.isActive
      }))

      const res = await fetch('/api/admin/footer/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(content as Record<string, unknown>),
          navigation_columns: navigationColumns,
          policy_links: policyLinksData
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save footer links')
      setContent(data.content)
      toast({ title: 'Success', description: 'Footer links saved.' })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: Date.now().toString(),
      title: 'New Column',
      isActive: true,
      links: []
    }
    setColumns([...columns, newColumn])
    toast({
      title: 'Column Added',
      description: 'New navigation column has been added',
    })
  }

  const removeColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId))
    toast({
      title: 'Column Removed',
      description: 'Navigation column has been removed',
    })
  }

  const updateColumnTitle = (columnId: string, title: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title } : col
    ))
  }

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, isActive: !col.isActive } : col
    ))
  }

  const addLink = (columnId: string) => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: 'New Link',
      href: '#',
      isActive: true
    }
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, links: [...col.links, newLink] } : col
    ))
  }

  const removeLink = (columnId: string, linkId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, links: col.links.filter(link => link.id !== linkId) } : col
    ))
  }

  const updateLink = (columnId: string, linkId: string, field: keyof FooterLink, value: string | boolean) => {
    setColumns(columns.map(col => 
      col.id === columnId ? {
        ...col,
        links: col.links.map(link => 
          link.id === linkId ? { ...link, [field]: value } : link
        )
      } : col
    ))
  }

  const addPolicyLink = () => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: 'New Policy',
      href: '/policy',
      isActive: true
    }
    setPolicyLinks([...policyLinks, newLink])
    toast({
      title: 'Policy Link Added',
      description: 'New policy link has been added',
    })
  }

  const removePolicyLink = (linkId: string) => {
    setPolicyLinks(policyLinks.filter(link => link.id !== linkId))
    toast({
      title: 'Policy Link Removed',
      description: 'Policy link has been removed',
    })
  }

  const updatePolicyLink = (linkId: string, field: keyof FooterLink, value: string | boolean) => {
    setPolicyLinks(policyLinks.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    ))
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }
  if (!content) {
    return <div className="text-center py-8 text-muted-foreground">No footer content found.</div>
  }

  return (
    <div className="space-y-6">
      {/* Navigation Columns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Navigation Columns
          </CardTitle>
          <CardDescription>
            Manage footer navigation columns and links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {columns.map((column) => (
            <div key={column.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Input
                    value={column.title}
                    onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                    className="w-48"
                    placeholder="Column Title"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={column.isActive}
                    onCheckedChange={() => toggleColumn(column.id)}
                    disabled={!isAdmin}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addLink(column.id)}
                    disabled={!isAdmin}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {columns.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeColumn(column.id)}
                      disabled={!isAdmin}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {column.links.length > 0 && (
                <div className="space-y-2 ml-7">
                  {column.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <Input
                        value={link.label}
                        onChange={(e) => updateLink(column.id, link.id, 'label', e.target.value)}
                        placeholder="Link Label"
                        className="flex-1"
                        disabled={!isAdmin}
                      />
                      <Input
                        value={link.href}
                        onChange={(e) => updateLink(column.id, link.id, 'href', e.target.value)}
                        placeholder="/link-url"
                        className="flex-1"
                        disabled={!isAdmin}
                      />
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={(checked) => updateLink(column.id, link.id, 'isActive', checked)}
                        disabled={!isAdmin}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLink(column.id, link.id)}
                        disabled={!isAdmin}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button onClick={addColumn} variant="outline" className="w-full" disabled={!isAdmin}>
            <Plus className="mr-2 h-4 w-4" />
            Add Navigation Column
          </Button>
        </CardContent>
      </Card>

      {/* Policy Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Links
          </CardTitle>
          <CardDescription>
            Manage policy and legal links in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {policyLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <Input
                value={link.label}
                onChange={(e) => updatePolicyLink(link.id, 'label', e.target.value)}
                placeholder="Policy Link Label"
                className="flex-1"
                disabled={!isAdmin}
              />
              <Input
                value={link.href}
                onChange={(e) => updatePolicyLink(link.id, 'href', e.target.value)}
                placeholder="/policy-url"
                className="flex-1"
                disabled={!isAdmin}
              />
              <Switch
                checked={link.isActive}
                onCheckedChange={(checked) => updatePolicyLink(link.id, 'isActive', checked)}
                disabled={!isAdmin}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePolicyLink(link.id)}
                disabled={!isAdmin}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addPolicyLink} variant="outline" className="w-full" disabled={!isAdmin}>
            <Plus className="mr-2 h-4 w-4" />
            Add Policy Link
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isAdmin && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Links'}
          </Button>
        </div>
      )}

      {/* Link Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Link Guidelines</CardTitle>
          <CardDescription>
            Best practices for footer links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Keep navigation columns to 3-4 for optimal layout</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Use descriptive labels that clearly indicate the destination</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Include essential policy links like Privacy Policy and Terms of Service</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Use relative URLs (e.g., /about) for internal pages</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 