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
    <section className="mb-6">
      <h3 className="bg-green-50 px-4 py-2 font-medium text-green-800">{title}</h3>
      {entries.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-500">No balances</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([name, value]) => (
              <tr key={name} className="border-b border-gray-100">
                <td className="px-4 py-2 text-gray-700">{name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatAmount(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-between border-t-2 border-gray-300 px-4 py-2 font-medium">
        <span>{totalLabel ?? `Total ${title.toLowerCase()}`}</span>
        <span className="tabular-nums">{formatAmount(total)}</span>
      </div>
    </section>
  );
};

export default ReportSection;
