import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function Section({ children, title, subtitle, className }: SectionProps) {
  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  )
} 