import classNames from "classnames";

export type Tab = {
  name: string;
  count?: number;
};

type TabsProps = {
  selectedTab: string;
  tabs: Tab[];
  onChange: (tabName: string) => void;
};

export default function Tabs({ tabs, selectedTab, onChange }: TabsProps) {
  return (
    <nav
      className="-mb-px flex w-full items-center gap-x-2 sm:gap-x-6 border-b border-line"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.name === selectedTab;
        return (
          <button
            key={tab.name}
            type="button"
            onClick={() => onChange(tab.name)}
            className={classNames(
              "inline-flex items-center gap-2 whitespace-nowrap px-1 py-3 text-[13px] font-semibold transition-colors border-b-2",
              isActive
                ? "text-accent border-accent"
                : "text-fg-muted border-transparent hover:text-fg",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.name}
            {tab.count ? (
              <span
                className={classNames(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums",
                  isActive
                    ? "bg-accent/[0.18] text-accent"
                    : "bg-bg-muted text-fg-muted",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
