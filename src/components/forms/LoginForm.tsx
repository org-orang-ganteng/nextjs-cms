'use client'

import { Eye, EyeOff, LoaderCircle, LogIn } from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'

import { loginAdmin } from '@/app/(frontend)/login/actions'
import { initialFormState } from '@/lib/forms'

import { Field, FormAlert } from './fields'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialFormState)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'error') {
      formRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus()
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5" noValidate ref={formRef}>
      {state.status === 'error' && state.message && <FormAlert>{state.message}</FormAlert>}
      <Field htmlFor="identifier" label="Username atau Email">
        <input
          autoCapitalize="none"
          autoComplete="username"
          autoFocus
          className="form-input"
          defaultValue={state.values?.identifier ?? ''}
          id="identifier"
          name="identifier"
          required
          spellCheck={false}
        />
      </Field>
      <Field htmlFor="password" label="Password">
        <div className="relative">
          <input
            autoComplete="current-password"
            className="form-input pr-11"
            id="password"
            name="password"
            required
            type={showPassword ? 'text' : 'password'}
          />
          <button
            aria-controls="password"
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-stone-500 hover:text-brand-700"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
            <span className="sr-only">
              {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            </span>
          </button>
        </div>
      </Field>
      <button className="btn btn-primary w-full" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <LogIn aria-hidden className="size-4" />
        )}
        {pending ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  )
}
