'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

import type { NavLink } from './nav'
import { SmartLink } from './SmartLink'

export type HeroSlide = {
  image: { alt: string; position: string; src: string } | null
  primary: NavLink | null
  secondary: NavLink | null
  subtitle: null | string
  title: string
}

const INTERVAL_MS = 7000

/** Banner beranda; berganti otomatis bila lebih dari satu slide (berhenti saat hover/fokus). */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  return (
    <section
      aria-label="Sorotan utama"
      aria-roledescription="carousel"
      className="bg-pattern relative isolate overflow-hidden bg-brand-800 text-white"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === active
        return (
          <div
            aria-label={`${index + 1} dari ${slides.length}`}
            aria-roledescription="slide"
            className={cn(
              'transition-opacity duration-700 ease-out',
              isActive ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0',
            )}
            inert={!isActive}
            key={`${slide.title}-${index}`}
            role="group"
          >
            {slide.image && (
              <>
                <Image
                  alt={slide.image.alt}
                  className="-z-20 object-cover"
                  fill
                  preload={index === 0}
                  sizes="100vw"
                  src={slide.image.src}
                  style={{ objectPosition: slide.image.position }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-r from-brand-950/90 via-brand-900/75 to-brand-900/25"
                />
              </>
            )}
            <div className="container-site pt-16 pb-28 md:pt-24 md:pb-36">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-200">
                Sekolah Tinggi Agama Islam Morowali
              </p>
              <h2 className="max-w-3xl text-3xl leading-tight font-extrabold md:text-5xl">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-5 max-w-2xl text-base text-brand-100 md:text-lg">
                  {slide.subtitle}
                </p>
              )}
              {(slide.primary || slide.secondary) && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {slide.primary && (
                    <SmartLink
                      className="btn btn-gold"
                      href={slide.primary.url}
                      newTab={slide.primary.newTab}
                    >
                      {slide.primary.label}
                    </SmartLink>
                  )}
                  {slide.secondary && (
                    <SmartLink
                      className="btn btn-outline-light"
                      href={slide.secondary.url}
                      newTab={slide.secondary.newTab}
                    >
                      {slide.secondary.label}
                    </SmartLink>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-24">
          {slides.map((slide, index) => (
            <button
              aria-current={index === active}
              aria-label={`Tampilkan slide ${index + 1}: ${slide.title}`}
              className={cn(
                'h-2.5 rounded-full transition-all',
                index === active ? 'w-8 bg-gold-400' : 'w-2.5 bg-white/50 hover:bg-white/80',
              )}
              key={`dot-${index}`}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      )}
    </section>
  )
}
