import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SearchSelect, { Option } from '@potta/components/search-select'; // Import Option type
import useGetAllProducts from '@potta/app/(routes)/pos/inventory/_hooks/useGetAllProducts';

interface Product {
  uuid: string;
  name: string;
  price: number;
  tax: number;
  productId: string;
}

interface ProductOption {
  label: string;
  value: string;
  product: Product;
}

interface ValidationError {
  product?: string;
  quantity?: string;
}

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

export default function DynamicTable() {
  const context = useContext(ContextData);
  const [rows, setRows] = useState<any>(context?.data?.table || []);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [errors, setErrors] = useState<ValidationError>({});

  // Get currency from context
  const currency = context?.data?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useGetAllProducts({
    page: 1,
    limit: 100,
  });

  console.log('Products Loading:', productsLoading);
  console.log('Products Data:', productsData);

  // Replace this line:
  const products: Product[] = (productsData?.data || []).map((product) => ({
    uuid: product.uuid,
    name: product.name,
    price: product.salesPrice,
    tax: product.taxRate,
    productId: product.productId,
  }));

  // Create product options as regular Options instead of ProductOptions
  const productOptions: Option[] = products.map((product) => ({
    label: `${product.name} `,
    value: product.uuid,
  }));

  // Update handler to accept Option instead of ProductOption
  const handleProductSelect = (value: Option | null) => {
    // Clear product error when selection changes
    setErrors((prev) => ({ ...prev, product: undefined }));

    if (value) {
      const selectedProd = products.find((p) => p.uuid === value.value);
      if (selectedProd) {
        const productOption: ProductOption = {
          label: value.label,
          value: value.value as string,
          product: selectedProd,
        };
        setSelectedProduct(productOption);
        setPrice(selectedProd.price);
        setTax(selectedProd.tax);
      }
    } else {
      setSelectedProduct(null);
      setPrice(0);
      setTax(0);
    }
  };

  const handleQtyChange = (value: string) => {
    // Clear quantity error when value changes
    setErrors((prev) => ({ ...prev, quantity: undefined }));

    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setQty(numValue);
    } else if (value === '') {
      setQty(0); // Allow empty field for better UX
    }
  };

  const validateItemInput = (): boolean => {
    const newErrors: ValidationError = {};

    if (!selectedProduct) {
      newErrors.product = 'Please select a product';
    }

    if (qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRow = () => {
    if (!validateItemInput()) return;

    // Check if the product already exists in the table
    const existingProductIndex = rows.findIndex(
      (row: any) => row.uuid === selectedProduct!.product.uuid
    );

    let updatedRows;

    if (existingProductIndex !== -1) {
      // If product exists, update its quantity
      updatedRows = [...rows];
      updatedRows[existingProductIndex] = {
        ...updatedRows[existingProductIndex],
        qty: updatedRows[existingProductIndex].qty + qty,
      };
    } else {
      // If product doesn't exist, add a new row
      const newRow = {
        id: rows.length + 1,
        productId: selectedProduct!.product.productId,
        name: selectedProduct!.product.name,
        qty,
        price,
        tax,
        uuid: selectedProduct!.product.uuid,
      };
      updatedRows = [...rows, newRow];
    }

    // Update local state
    setRows(updatedRows);

    // Update context data
    context?.setData((prevData: any) => ({
      ...prevData,
      table: updatedRows,
    }));

    // Reset input fields
    setSelectedProduct(null);
    setQty(1);
    setPrice(0);
    setTax(0);
  };

  const handleRemoveRow = (id: number) => {
    const updatedRows = rows.filter((row: any) => row.id !== id);

    // Update context data
    context?.setData((prevData: any) => ({
      ...prevData,
      table: updatedRows,
    }));

    // Update local state
    setRows(updatedRows);
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="  ">
      <div className="">
        <table className="min-w-full ">
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-5/12"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12"
              >
                Qty
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-2/12"
              >
                Tax
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-1/12"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-gray-200">
            {/* Display existing items */}
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
                  No items added yet. Search for a product below to add items.
                </td>
              </tr>
            )}
            {/* Input row for adding new items */}
            <tr className="">
              <td className="px-3 py-3 w-5/12">
                <SearchSelect
                  options={productOptions}
                  value={
                    selectedProduct
                      ? {
                          label: selectedProduct.label,
                          value: selectedProduct.value,
                        }
                      : null
                  }
                  onChange={handleProductSelect}
                  isLoading={productsLoading}
                  placeholder="Search for a product"
                  isClearable={true}
                  isSearchable={true}
                  className={errors.product ? 'border-red-500' : ''}
                  noMarginTop={true}
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
                  } px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    text-left`}
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
                  className="border border-gray-300 px-3 py-2.5 w-full bg-gray-100 focus:outline-none text-left"
                  disabled
                />
              </td>
              <td className="px-3 py-3 text-left w-2/12">
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value))}
                  className="border border-gray-300 px-3 py-2.5 w-full bg-gray-100 focus:outline-none text-left"
                  disabled
                />
              </td>
              <td className="px-3 py-3 text-left w-1/12">
                <button
                  onClick={handleAddRow}
                  className={`${
                    !selectedProduct
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-3 py-2.5 text-sm font-medium transition-colors rounded-md duration-200 inline-flex items-center justify-center w-full`}
                  disabled={!selectedProduct}
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
