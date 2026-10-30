export type AdminTab = 'packages' | 'vehicles' | 'blog';

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'packages', label: 'Packages' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'blog', label: 'Blog' },
];

interface AdminTabsProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}

export default function AdminTabs({ active, onChange }: AdminTabsProps) {
  return (
    <div role="tablist" aria-label="Admin sections" className="inline-flex rounded-full bg-sand p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            active === tab.id ? 'bg-brand text-white' : 'text-ink hover:bg-white/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
