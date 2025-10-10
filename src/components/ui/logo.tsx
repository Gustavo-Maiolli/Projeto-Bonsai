import Image from "next/image"
import Link from "next/link"
import clsx from "clsx"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/images/logo.jpeg"
        alt="Bonsai Care Logo"
        width={sizes[size]}
        height={sizes[size]}
        className="rounded-full"
      />
      <span className="font-bold text-[#3D2520] text-xl hidden sm:inline">Bonsai Care</span>
    </Link>
  )
}
