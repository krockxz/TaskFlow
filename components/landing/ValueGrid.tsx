/**
 * ValueGrid - Static 3-icon value props
 *
 * Replaces the scrolling marquee with a clean static grid.
 */

interface ValueItem {
  icon: string;
  label: string;
}

const values: ValueItem[] = [
  { icon: '🔓', label: 'Open Source' },
  { icon: '🏠', label: 'Self-Hosted' },
  { icon: '✓', label: 'Type-Safe' },
];

export function ValueGrid() {
  return (
    <div className="flex items-center justify-center gap-8 py-8">
      {values.map((value) => (
        <div key={value.label} className="flex items-center gap-2 text-[#8b949e]">
          <span className="text-xl">{value.icon}</span>
          <span className="font-mono-display text-sm">{value.label}</span>
        </div>
      ))}
    </div>
  );
}
