import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Баруун талын үйлдлүүд (товч г.м). */
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <h1 className="truncate font-semibold text-xl sm:text-2xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
