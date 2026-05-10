import { type ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-chrome";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 pb-16">
        <div className="mb-10">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
