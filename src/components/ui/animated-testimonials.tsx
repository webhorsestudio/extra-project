"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AnimatedTestimonial {
  quote: string
  name: string
  title: string
  avatar?: string | null
}

interface AnimatedTestimonialsProps {
  testimonials: AnimatedTestimonial[]
  interval?: number
  className?: string
  batchSize?: number
}

export function AnimatedTestimonials({
  testimonials,
  interval = 7000,
  className,
  batchSize = 4,
}: AnimatedTestimonialsProps) {
  const testimonialsCount = testimonials.length
  const clampedBatchSize = Math.max(1, batchSize)
  const totalBatches = Math.ceil(testimonialsCount / clampedBatchSize)
  const [activeBatch, setActiveBatch] = React.useState(0)
  const [displayBatch, setDisplayBatch] = React.useState(0)
  const [fadeState, setFadeState] = React.useState<"fade-in" | "fade-out">("fade-in")

  React.useEffect(() => {
    if (totalBatches <= 1) return
    const timer = setInterval(() => {
      setActiveBatch((prev) => (prev + 1) % totalBatches)
    }, interval)
    return () => clearInterval(timer)
  }, [interval, totalBatches])

  React.useEffect(() => {
    if (displayBatch === activeBatch) return
    setFadeState("fade-out")
    const timeout = setTimeout(() => {
      setDisplayBatch(activeBatch)
      setFadeState("fade-in")
    }, 220)
    return () => clearTimeout(timeout)
  }, [activeBatch, displayBatch])

  const goToBatch = React.useCallback(
    (batchIndex: number) => {
      if (batchIndex === activeBatch || totalBatches <= 1) return
      setActiveBatch(batchIndex)
    },
    [activeBatch, totalBatches],
  )

  const goToPrevBatch = React.useCallback(() => {
    setActiveBatch((prev) => (prev - 1 + totalBatches) % totalBatches)
  }, [totalBatches])

  const goToNextBatch = React.useCallback(() => {
    setActiveBatch((prev) => (prev + 1) % totalBatches)
  }, [totalBatches])

  if (testimonialsCount === 0) {
    return null
  }

  const activeBatchStart = displayBatch * clampedBatchSize
  const activeBatchTestimonials = testimonials.slice(
    activeBatchStart,
    activeBatchStart + clampedBatchSize,
  )

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-lg dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-[10%] h-56 w-56 rounded-full bg-blue-100/70 blur-[120px] dark:bg-blue-500/20" />
        <div className="absolute -bottom-24 right-[5%] h-64 w-64 rounded-full bg-indigo-100/80 blur-[140px] dark:bg-indigo-500/20" />
      </div>

      <div className="relative px-6 py-10 sm:px-10 md:py-14 lg:px-16">
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            fadeState === "fade-in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {activeBatchTestimonials.map((testimonial, index) => {
              const initials = testimonial.name
                .split(" ")
                .map((part) => part.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("")

              return (
                <div
                  key={`${testimonial.name}-${testimonial.title}-${activeBatchStart + index}`}
                  className="group h-full rounded-[22px] bg-gradient-to-r from-transparent via-blue-200/50 to-transparent p-[1.5px] dark:via-blue-500/30"
                >
                  <div className="flex h-full flex-col rounded-[20px] bg-white p-6 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      {testimonial.avatar ? (
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                          {initials}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {testimonial.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {testimonial.title}
                        </span>
                      </div>
                    </div>

                    <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                      “{testimonial.quote}”
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {totalBatches > 1 && (
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalBatches }).map((_, index) => (
                <button
                  key={`batch-dot-${index}`}
                  type="button"
                  onClick={() => goToBatch(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === activeBatch
                      ? "w-8 bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
                      : "w-4 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500",
                  )}
                  aria-label={`Go to testimonial set ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goToPrevBatch}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNextBatch}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

