import Link from 'next/link'

type Props = {
  children: React.ReactNode
  className?: string
  href: string
  newTab?: boolean | null
  onClick?: () => void
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

/** Tautan yang otomatis memakai <a> untuk URL luar dan next/link untuk rute internal. */
export function SmartLink({ children, href, newTab, ...rest }: Props) {
  const target = newTab ? '_blank' : undefined
  const rel = newTab ? 'noopener noreferrer' : undefined

  if (isExternal(href)) {
    return (
      <a href={href} rel={rel} target={target} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} rel={rel} target={target} {...rest}>
      {children}
    </Link>
  )
}
