export interface TimelineItem {
  title: string;
  description?: string;
  active?: boolean;
  past?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 size-2.5 shrink-0 rounded-full ${
                  item.active ? "bg-primary" : item.past ? "bg-border-hover" : "bg-border-light"
                }`}
              />
              {!isLast && <span className="w-px flex-1 bg-border-light" />}
            </div>
            <div className={`pb-6 ${item.past ? "opacity-60" : ""}`}>
              <h4 className="text-body font-semibold text-text-primary">{item.title}</h4>
              {item.description && (
                <p className="text-small text-text-secondary">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
