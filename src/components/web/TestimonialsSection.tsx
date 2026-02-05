import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

interface TestimonialsSectionProps {
  testimonials: Array<{
    id: string
    quote: string
    name: string
    title: string
    avatar_url: string | null
  }>
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const hasTestimonials = testimonials && testimonials.length > 0

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-50">
            Our Testimonials
          </h2>
        </div>

        {hasTestimonials ? (
          <AnimatedTestimonials
            testimonials={testimonials.map((testimonial) => ({
              quote: testimonial.quote,
              name: testimonial.name,
              title: testimonial.title,
              avatar: testimonial.avatar_url,
            }))}
            batchSize={4}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Testimonials coming soon
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              We&apos;re gathering client stories to highlight here. Check back shortly for new success stories.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
