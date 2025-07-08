'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  X,
  ArrowRight
} from 'lucide-react'
import { FieldError, tabConfig, getFieldDisplayName } from '@/lib/form-validation'

interface RequiredFieldsModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToTab: (tab: string) => void
  errors: FieldError[]
}

export function RequiredFieldsModal({
  isOpen,
  onClose,
  onNavigateToTab,
  errors
}: RequiredFieldsModalProps) {

  // Group errors by tab
  const errorsByTab = errors.reduce((acc: Record<string, FieldError[]>, error: FieldError) => {
    if (!acc[error.tab]) {
      acc[error.tab] = []
    }
    acc[error.tab].push(error)
    return acc
  }, {} as Record<string, FieldError[]>)

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab)
    onNavigateToTab(tab)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Required Fields Missing
          </DialogTitle>
          <DialogDescription>
            Please complete the following required fields before saving the property.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">
                {errors.length} required field{errors.length !== 1 ? 's' : ''} need{errors.length !== 1 ? '' : 's'} to be completed
              </span>
            </div>
            <p className="text-sm text-amber-700">
              Click on any tab below to navigate directly to the section with missing fields.
            </p>
          </div>

          {/* Errors by Tab */}
          <div className="space-y-4">
            {Object.entries(errorsByTab).map(([tab, tabErrors]) => {
              const config = tabConfig[tab as keyof typeof tabConfig]
              if (!config) return null

              return (
                <div key={tab} className="border rounded-lg overflow-hidden">
                  <div className={`p-4 border-b ${config.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span className="font-medium">{config.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {tabErrors.length} field{tabErrors.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTabClick(tab)}
                        className="flex items-center gap-1 hover:bg-white/50"
                      >
                        <span>Go to Tab</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <ul className="space-y-2">
                      {tabErrors.map((error: FieldError, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              {getFieldDisplayName(error.field)}
                            </span>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {error.message}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              onClick={() => {
                if (Object.keys(errorsByTab).length > 0) {
                  const firstTab = Object.keys(errorsByTab)[0]
                  handleTabClick(firstTab)
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to First Tab
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 