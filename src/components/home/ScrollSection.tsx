import React from "react";

export function ScrollSection({
  children,
  isLast = false,
  id,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="cv-auto relative" data-last={isLast ? "true" : undefined}>
      {children}
    </section>
  );
}
