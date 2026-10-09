'use client'

import { CircleCheckBig, LoaderCircle, Send } from 'lucide-react'
import { useActionState, useEffect, useRef } from 'react'

import { submitContact } from '@/app/(frontend)/kontak/actions'
import { initialFormState } from '@/lib/forms'

import { describedBy, Field, FormAlert, Honeypot } from './fields'

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialFormState)
  const errors = state.errors ?? {}
  const value = (name: string) => state.values?.[name] ?? ''
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  // Setelah kirim: fokus ke hasil (sukses) atau ke isian pertama yang salah.
  useEffect(() => {
    if (state.status === 'success') successRef.current?.focus()
    if (state.status === 'error') {
      const target =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        formRef.current?.querySelector<HTMLElement>('[role="alert"]')
      target?.focus()
    }
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        className="card p-8 text-center outline-none"
        ref={successRef}
        role="status"
        tabIndex={-1}
      >
        <CircleCheckBig aria-hidden className="mx-auto size-12 text-brand-600" />
        <p className="mt-4 font-semibold text-stone-900">{state.message}</p>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="card relative space-y-5 p-6 md:p-8"
      noValidate
      ref={formRef}
    >
      <Honeypot />
      {state.status === 'error' && state.message && <FormAlert>{state.message}</FormAlert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.name} htmlFor="name" label="Nama">
          <input
            autoComplete="name"
            className="form-input"
            defaultValue={value('name')}
            id="name"
            name="name"
            required
            {...describedBy('name', errors.name)}
          />
        </Field>
        <Field error={errors.email} htmlFor="email" label="Email">
          <input
            autoComplete="email"
            className="form-input"
            defaultValue={value('email')}
            id="email"
            name="email"
            required
            type="email"
            {...describedBy('email', errors.email)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={errors.phone} htmlFor="phone" label="Telepon/WhatsApp" optional>
          <input
            autoComplete="tel"
            className="form-input"
            defaultValue={value('phone')}
            id="phone"
            inputMode="tel"
            name="phone"
            type="tel"
            {...describedBy('phone', errors.phone)}
          />
        </Field>
        <Field error={errors.subject} htmlFor="subject" label="Subjek">
          <input
            className="form-input"
            defaultValue={value('subject')}
            id="subject"
            name="subject"
            required
            {...describedBy('subject', errors.subject)}
          />
        </Field>
      </div>
      <Field error={errors.message} htmlFor="message" label="Pesan">
        <textarea
          className="form-input min-h-36"
          defaultValue={value('message')}
          id="message"
          name="message"
          required
          {...describedBy('message', errors.message)}
        />
      </Field>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden className="size-4" />
        )}
        {pending ? 'Mengirim…' : 'Kirim pesan'}
      </button>
    </form>
  )
}
