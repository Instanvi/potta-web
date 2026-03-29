import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';

// Function to get currency symbol based on currency code
const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'FCFA':
      return 'FCFA';
    default:
      return currencyCode;
  }
};

interface ValidationError {
  product?: string;
  quantity?: string;
}

export default function NewTableFreeEntry() {
  const context = useContext(ContextData);
  const [rows, setRows] = useState<any>(context?.data?.table || []);
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [errors, setErrors] = useState<ValidationError>({});

  // Get currency from context
  const currency = context?.data?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const handleQtyChange = (value: string) => {
    setErrors((prev) => ({ ...prev, quantity: undefined }));
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQty(numValue);
    } else if (value === '') {
      setQty(0);
    }
  };

  const validateItemInput = (): boolean => {
    const newErrors: ValidationError = {};
    if (!description.trim()) {
      newErrors.product = 'Name is required';
    }
    if (qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRow = () => {
    if (!validateItemInput()) return;
    const newRow = {
      id: rows.length + 1,
      name: description,
      qty,
      price,
      tax,
      uuid: `${Date.now()}-${Math.random()}`,
    };
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    context?.setData((prevData: any) => ({
      ...prevData,
      table: updatedRows,
    }));
    setDescription('');
    setQty(1);
    setPrice(0);
    setTax(0);
  };

  // Calculate subtotal, tax and total
  const calculateSubtotal = () => {
    return rows.reduce((sum: number, row: any) => sum + row.qty * row.price, 0);
  };

  const calculateTaxAmount = () => {
    return rows.reduce((sum: number, row: any) => {
      const rowTotal = row.qty * row.price;
      const rowTax = (rowTotal * row.tax) / 100;
      return sum + rowTax;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleRemoveRow = (id: number) => {
    const updatedRows = rows.filter((row: any) => row.id !== id);
    context?.setData((prevData: any) => ({
      ...prevData,
      table: updatedRows,
    }));
    setRows(updatedRows);
  };

  return (
    <div>
      <div>
        <table className="min-w-full ">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-5/12">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12">
                Qty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12">
                Tax
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-1/12">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50 border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-left text-gray-500">
                    {row.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-left text-gray-500">
                    {currencySymbol} {formatCurrency(row.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-left text-gray-500">
                    {row.tax}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-base font-medium">
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      aria-label="Remove item"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500 italic"
                >
                  No items added yet. Enter a description below to add items.
                </td>
              </tr>
            )}
            <tr>
              <td className="px-3 py-3 w-5/12">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Name"
                  className={`border ${
                    errors.product ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                />
                {errors.product && (
                  <p className="text-red-500 text-xs mt-1">{errors.product}</p>
                )}
              </td>
              <td className="px-3 py-3 text-left w-2/12">
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  className={`border ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-left`}
                  min="1"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </td>
              <td className="px-3 py-3 text-left w-2/12">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="border border-gray-300 px-3 py-2.5 w-full focus:outline-none text-left"
                />
              </td>
              <td className="px-3 py-3 text-left w-2/12">
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value))}
                  className="border border-gray-300 px-3 py-2.5 w-full focus:outline-none text-left"
                />
              </td>
              <td className="px-3 py-3 text-left w-1/12">
                <button
                  onClick={handleAddRow}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 text-sm font-medium transition-colors duration-200 inline-flex items-center justify-center w-full rounded-none"
                >
                  <i className="ri-add-line mr-1"></i>
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
