'use client'

import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  loading: boolean
}

export function SubmitButton({ loading }: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={loading}
      className="w-full mt-6 text-lg py-3 rounded-xl shadow-md"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="w-5 h-5 mr-2" />
          Submit Support Request
        </>
      )}
    </Button>
  )
}
