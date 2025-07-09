"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

export default function FooterContentTab() {
  const { toast } = useToast()
  const [content, setContent] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Editable fields
  const [form, setForm] = useState<Record<string, unknown>>({})

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/footer/content")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch footer content")
        setContent(data.content)
        setForm(data.content)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
    // Check admin (naive: if API returns content, assume admin for now)
    fetch("/api/admin/footer/layout").then(r => r.json()).then(d => {
      setIsAdmin(!d.error)
    })
  }, [])

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleJsonChange = (field: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      setForm((prev) => ({ ...prev, [field]: parsed }))
    } catch {
      // ignore parse error for now
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/footer/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save footer content")
      setContent(data.content)
      setForm(data.content)
      toast({ title: "Success", description: "Footer content saved." })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Footer Content</CardTitle>
          <CardDescription>Manage company info, contact, social, CTA, copyright, navigation, and policy links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Company Name</label>
              <Input value={String(form.company_name || "")} onChange={e => handleChange("company_name", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Tagline</label>
              <Input value={String(form.company_tagline || "")} onChange={e => handleChange("company_tagline", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Description</label>
              <Textarea value={String(form.company_description || "")} onChange={e => handleChange("company_description", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Contact Phone</label>
              <Input value={String(form.contact_phone || "")} onChange={e => handleChange("contact_phone", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Contact Email</label>
              <Input value={String(form.contact_email || "")} onChange={e => handleChange("contact_email", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Contact Address</label>
              <Textarea value={String(form.contact_address || "")} onChange={e => handleChange("contact_address", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Contact Website</label>
              <Input value={String(form.contact_website || "")} onChange={e => handleChange("contact_website", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Facebook URL</label>
              <Input value={String(form.facebook_url || "")} onChange={e => handleChange("facebook_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Twitter URL</label>
              <Input value={String(form.twitter_url || "")} onChange={e => handleChange("twitter_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">LinkedIn URL</label>
              <Input value={String(form.linkedin_url || "")} onChange={e => handleChange("linkedin_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">Instagram URL</label>
              <Input value={String(form.instagram_url || "")} onChange={e => handleChange("instagram_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">YouTube URL</label>
              <Input value={String(form.youtube_url || "")} onChange={e => handleChange("youtube_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">WhatsApp URL</label>
              <Input value={String(form.whatsapp_url || "")} onChange={e => handleChange("whatsapp_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">CTA Title</label>
              <Input value={String(form.cta_title || "")} onChange={e => handleChange("cta_title", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">CTA Subtitle</label>
              <Input value={String(form.cta_subtitle || "")} onChange={e => handleChange("cta_subtitle", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">CTA Button Text</label>
              <Input value={String(form.cta_button_text || "")} onChange={e => handleChange("cta_button_text", e.target.value)} disabled={!isAdmin} />
            </div>
            <div>
              <label className="block font-medium mb-1">CTA Button URL</label>
              <Input value={String(form.cta_button_url || "")} onChange={e => handleChange("cta_button_url", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Copyright Text</label>
              <Input value={String(form.copyright_text || "")} onChange={e => handleChange("copyright_text", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Designed By Text</label>
              <Input value={String(form.designed_by_text || "")} onChange={e => handleChange("designed_by_text", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Navigation Columns (JSON)</label>
              <Textarea rows={6} value={JSON.stringify(form.navigation_columns, null, 2)} onChange={e => handleJsonChange("navigation_columns", e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Policy Links (JSON)</label>
              <Textarea rows={4} value={JSON.stringify(form.policy_links, null, 2)} onChange={e => handleJsonChange("policy_links", e.target.value)} disabled={!isAdmin} />
            </div>
          </div>
          {isAdmin && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Content"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 