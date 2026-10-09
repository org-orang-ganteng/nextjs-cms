'use client'

import { CircleCheckBig, LoaderCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'

import { submitRegistration } from '@/app/(frontend)/pmb/daftar/actions'
import { initialFormState } from '@/lib/forms'

import { describedBy, Field, FormAlert, Honeypot } from './fields'

type ProgramOption = { id: number; name: string }

type Props = {
  defaultProgramId?: number
  programs: ProgramOption[]
}

export function PmbForm({ defaultProgramId, programs }: Props) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialFormState)
  const errors = state.errors ?? {}
  const value = (name: string, fallback = '') => state.values?.[name] ?? fallback
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
        className="card p-8 text-center outline-none md:p-12"
        ref={successRef}
        role="status"
        tabIndex={-1}
      >
        <CircleCheckBig aria-hidden className="mx-auto size-14 text-brand-600" />
        <h2 className="mt-4 text-2xl font-extrabold text-brand-950">Pendaftaran awal terkirim</h2>
        {state.registrationNumber && (
          <p className="mt-4 text-stone-700">
            Nomor pendaftaran Anda:
            <span className="mt-2 block font-mono text-2xl font-bold tracking-wider text-brand-800">
              {state.registrationNumber}
            </span>
          </p>
        )}
        <p className="mx-auto mt-4 max-w-lg text-stone-600">{state.message}</p>
        <p className="mt-2 text-sm text-stone-500">
          Simpan atau tangkap layar nomor pendaftaran ini.
        </p>
        <Link className="btn btn-outline mt-8" href="/pmb">
          Kembali ke informasi PMB
        </Link>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="card relative space-y-8 p-6 md:p-8"
      noValidate
      ref={formRef}
    >
      <Honeypot />
      {state.status === 'error' && state.message && <FormAlert>{state.message}</FormAlert>}

      <fieldset className="space-y-5">
        <legend className="mb-4 text-lg font-bold text-brand-950">Data diri</legend>
        <Field error={errors.fullName} htmlFor="fullName" label="Nama lengkap (sesuai ijazah)">
          <input
            autoComplete="name"
            className="form-input"
            defaultValue={value('fullName')}
            id="fullName"
            name="fullName"
            required
            {...describedBy('fullName', errors.fullName)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            error={errors.nik}
            hint="16 digit sesuai KTP/Kartu Keluarga."
            htmlFor="nik"
            label="NIK"
          >
            <input
              className="form-input"
              defaultValue={value('nik')}
              id="nik"
              inputMode="numeric"
              maxLength={16}
              name="nik"
              required
              {...describedBy('nik', errors.nik, true)}
            />
          </Field>
          <Field error={errors.gender} htmlFor="gender" label="Jenis kelamin">
            <select
              className="form-input"
              defaultValue={value('gender')}
              id="gender"
              name="gender"
              required
              {...describedBy('gender', errors.gender)}
            >
              <option value="">Pilih…</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </Field>
          <Field error={errors.birthPlace} htmlFor="birthPlace" label="Tempat lahir">
            <input
              className="form-input"
              defaultValue={value('birthPlace')}
              id="birthPlace"
              name="birthPlace"
              required
              {...describedBy('birthPlace', errors.birthPlace)}
            />
          </Field>
          <Field error={errors.birthDate} htmlFor="birthDate" label="Tanggal lahir">
            <input
              autoComplete="bday"
              className="form-input"
              defaultValue={value('birthDate')}
              id="birthDate"
              name="birthDate"
              required
              type="date"
              {...describedBy('birthDate', errors.birthDate)}
            />
          </Field>
          <Field
            error={errors.phone}
            hint="Panitia menghubungi Anda melalui nomor ini."
            htmlFor="phone"
            label="Nomor WhatsApp"
          >
            <input
              autoComplete="tel"
              className="form-input"
              defaultValue={value('phone')}
              id="phone"
              inputMode="tel"
              name="phone"
              placeholder="08xxxxxxxxxx"
              required
              type="tel"
              {...describedBy('phone', errors.phone, true)}
            />
          </Field>
          <Field error={errors.email} htmlFor="email" label="Email" optional>
            <input
              autoComplete="email"
              className="form-input"
              defaultValue={value('email')}
              id="email"
              name="email"
              type="email"
              {...describedBy('email', errors.email)}
            />
          </Field>
        </div>
        <Field error={errors.address} htmlFor="address" label="Alamat lengkap">
          <textarea
            autoComplete="street-address"
            className="form-input min-h-24"
            defaultValue={value('address')}
            id="address"
            name="address"
            required
            {...describedBy('address', errors.address)}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-4 text-lg font-bold text-brand-950">
          Pendidikan &amp; pilihan program studi
        </legend>
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <Field error={errors.schoolOrigin} htmlFor="schoolOrigin" label="Asal sekolah">
            <input
              className="form-input"
              defaultValue={value('schoolOrigin')}
              id="schoolOrigin"
              name="schoolOrigin"
              placeholder="Contoh: MAN 1 Morowali"
              required
              {...describedBy('schoolOrigin', errors.schoolOrigin)}
            />
          </Field>
          <Field error={errors.graduationYear} htmlFor="graduationYear" label="Tahun lulus">
            <input
              className="form-input"
              defaultValue={value('graduationYear')}
              id="graduationYear"
              inputMode="numeric"
              maxLength={4}
              name="graduationYear"
              required
              {...describedBy('graduationYear', errors.graduationYear)}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field error={errors.firstChoice} htmlFor="firstChoice" label="Pilihan program studi 1">
            <select
              className="form-input"
              defaultValue={value('firstChoice', defaultProgramId ? String(defaultProgramId) : '')}
              id="firstChoice"
              name="firstChoice"
              required
              {...describedBy('firstChoice', errors.firstChoice)}
            >
              <option value="">Pilih program studi…</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            error={errors.secondChoice}
            htmlFor="secondChoice"
            label="Pilihan program studi 2"
            optional
          >
            <select
              className="form-input"
              defaultValue={value('secondChoice')}
              id="secondChoice"
              name="secondChoice"
              {...describedBy('secondChoice', errors.secondChoice)}
            >
              <option value="">Tidak ada</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <div>
        <label className="flex items-start gap-3 text-sm text-stone-700" htmlFor="consent">
          <input
            className="mt-0.5 size-4 rounded border-stone-300 accent-brand-700"
            defaultChecked={value('consent') === 'on'}
            id="consent"
            name="consent"
            required
            type="checkbox"
            {...describedBy('consent', errors.consent)}
          />
          <span>
            Saya menyatakan data di atas benar dan menyetujui penggunaannya oleh panitia PMB STAI
            Morowali untuk keperluan penerimaan mahasiswa baru.
          </span>
        </label>
        {errors.consent?.length ? (
          <p className="form-error" id="consent-error">
            {errors.consent[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-6">
        <button className="btn btn-primary min-w-48" disabled={pending} type="submit">
          {pending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Send aria-hidden className="size-4" />
          )}
          {pending ? 'Mengirim…' : 'Kirim pendaftaran'}
        </button>
        <p className="text-xs text-stone-500">
          Tidak perlu mengunggah berkas pada tahap pendaftaran awal ini.
        </p>
      </div>
    </form>
  )
}
