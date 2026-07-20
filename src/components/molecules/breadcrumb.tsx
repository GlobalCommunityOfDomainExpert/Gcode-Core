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
      <ol className="text-small flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li>
                {item.href && !isLast ? (
                  <div className="flex gap-4">
                    <Link href={item.href} variant="secondary" size="sm">
                      {item.label}
                    </Link>
                    <span className="text-text-secondary"> / </span>
                  </div>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="text-text-primary font-medium"
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
