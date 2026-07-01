import { Fragment } from "react";
import { Divider, Link } from "@/components/atoms";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-small">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !isLast ? (
                  <Link href={item.href} variant="secondary" size="sm">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="font-medium text-text-primary"
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true">
                  <Divider orientation="vertical" className="h-3" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
