interface FooterLetsTalkProps {
  title?: string
  subtitle?: string
}

export default function FooterLetsTalk({ 
  title = "Let's talk",
  subtitle = "Got a project in mind?"
}: FooterLetsTalkProps) {
  return (
    <div className="flex flex-col items-end justify-center h-full text-right">
      <span className="uppercase text-xs text-gray-400 mb-1 tracking-widest">
        {subtitle}
      </span>
      <span className="text-white text-5xl md:text-6xl font-bold leading-tight">
        {title}
      </span>
    </div>
  )
} 