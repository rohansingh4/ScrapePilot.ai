import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";
import { Logo } from "./navbar";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="font-semibold">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-xs">
              The intelligent web scraping platform for developers. Reliable,
              scalable, and easy to use.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href={SITE_CONFIG.links.twitter} label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialLink>
              <SocialLink href={SITE_CONFIG.links.github} label="GitHub">
                <Github className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="#" label="Email">
                <Mail className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Built with care for developers
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      aria-label={label}
    >
      {children}
    </a>
  );
}
