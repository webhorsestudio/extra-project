import Link from 'next/link'

interface FooterCTAProps {
  title?: string
  subtitle?: string
  buttonText?: string
  buttonUrl?: string
}

export default function FooterCTA({ 
  title = "Meet with a Webinar & Virtual Event Expert",
  subtitle,
  buttonText = "Talk with an expert",
  buttonUrl = "#contact"
}: FooterCTAProps) {
  return (
    <div className="bg-neutral-900 rounded-xl mx-auto max-w-5xl -mt-32 mb-8 px-8 py-8 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/10">
      <div className="text-white text-2xl md:text-3xl font-medium mb-4 md:mb-0">
        {title}
        {subtitle && (
          <div className="text-lg md:text-xl text-gray-300 mt-2">
            {subtitle}
          </div>
        )}
      </div>
      <Link
        href={buttonUrl}
        className="bg-white text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-neutral-800 hover:text-white transition text-lg"
      >
        {buttonText}
      </Link>
    </div>
  )
} 