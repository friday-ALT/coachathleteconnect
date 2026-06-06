import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type AppTab = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

export function AppAnimatedTabs({
  tabs,
  value,
  onValueChange,
  className,
}: {
  tabs: AppTab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const update = () => {
      const list = listRef.current;
      if (!list) return;
      const active = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!active) return;
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      });
    };
    update();
    window.addEventListener("resize", update);
    const t = window.setTimeout(update, 50);
    return () => {
      window.removeEventListener("resize", update);
      window.clearTimeout(t);
    };
  }, [value, tabs.length]);

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <div className="gloss-tabs">
        <TabsList ref={listRef} className="gloss-tabs__list">
          <span
            className={cn("gloss-tabs__indicator", indicator.ready && "gloss-tabs__indicator--ready")}
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
            aria-hidden
          />
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gloss-tabs__trigger">
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="gloss-tabs__count">{tab.count > 9 ? "9+" : tab.count}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="gloss-tabs__content">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
