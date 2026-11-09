import { formatAmount } from '../../../_shared/format';

interface Props {
  title: string;
  lines: Record<string, number> | undefined;
  total: number;
  totalLabel?: string;
  hideZero?: boolean;
}

const ReportSection = ({ title, lines, total, totalLabel, hideZero }: Props) => {
  const entries = Object.entries(lines ?? {}).filter(
    ([, value]) => !hideZero || Math.abs(Number(value)) >= 0.005
  );
  return (
    <section className="overflow-hidden border-b border-black/[0.06] last:border-b-0">
      <h3 className="bg-brand-subtle px-4 py-2.5 text-sm font-normal text-foreground">{title}</h3>
      {entries.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">No balances</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([name, value]) => (
              <tr key={name} className="border-b border-black/[0.06] hover:bg-black/[0.02]">
                <td className="px-4 py-2.5 text-foreground">{name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatAmount(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-between px-4 py-3 text-sm font-medium">
        <span>{totalLabel ?? `Total ${title.toLowerCase()}`}</span>
        <span className="tabular-nums">{formatAmount(total)}</span>
      </div>
    </section>
  );
};

export default ReportSection;
