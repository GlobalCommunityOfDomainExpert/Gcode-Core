import { ReactNode } from "react";
import { Card } from "@/components/atoms";
import { TabItem, Tabs } from "./tabs";

export interface TabbedFormShellProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: ReactNode;
}

export function TabbedFormShell({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabbedFormShellProps) {
  return (
    <div className="flex gap-8">
      <Tabs
        items={tabs}
        value={activeTab}
        onChange={onTabChange}
        orientation="vertical"
      />
      <Card padding="md" className="min-w-0 flex-1">
        {children}
      </Card>
    </div>
  );
}
