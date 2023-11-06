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
    <div>
      <div>
        <nav
          className="-mb-px flex w-full gap-x-2 sm:gap-x-8"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.name}
              role="button"
              onClick={() => onChange(tab.name)}
              className={classNames(
                tab.name === selectedTab
                  ? "border-nav-text-selected text-nav-text-selected"
                  : "border-transparent text-nav-text hover:text-nav-text-hovered hover:border-gray-200",
                "flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
              )}
              aria-current={tab.name === selectedTab ? "page" : undefined}
            >
              {tab.name}
              {tab.count ? (
                <span
                  className={classNames(
                    tab.name === selectedTab
                      ? "bg-[#FF00BD] text-nav-text-selected"
                      : "bg-[#FF00BD] text-nav-text",
                    "ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
