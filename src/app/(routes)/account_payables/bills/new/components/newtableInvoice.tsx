import { useContext, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SearchSelect, { Option } from '@potta/components/search-select'; // Import Option type
import useGetAllProducts from '@potta/app/(routes)/pos/hooks/useGetAllProducts';

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

  // Get currency from context
  const currency = context?.data?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useGetAllProducts({
    page: 1,
    limit: 100,
  });

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

  const handleAddRow = () => {
    if (!selectedProduct) return;

    const newRow = {
      id: rows.length + 1,
      productId: selectedProduct.product.productId,
      name: selectedProduct.product.name,
      qty,
      price,
      tax,
      uuid: selectedProduct.product.uuid,
    };

    // Append new row to local state and context
    const updatedRows = [...rows, newRow];
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

  return (
    <div>
      <table className="min-w-full border-collapse text-gray-500">
        <thead>
          <tr className="bg-gray-100">
            <th colSpan={3} className="text-center px-10 py-2">
              Product
            </th>
            <th colSpan={1} className="text-center px-4 py-2">
              Qty
            </th>
            <th colSpan={1} className="text-center px-4 py-2">
              Price
            </th>
            <th colSpan={1} className="text-center px-4 py-2">
              Tax
            </th>
            <th colSpan={1} className="text-center px-4 py-2">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id}>
              <td colSpan={3} className="px-10 py-2">
                {row.name}
              </td>
              <td className="px-4 py-2 text-center">{row.qty}</td>
              <td className="px-4 py-2 text-center">
                {currencySymbol} {row.price}
              </td>
              <td className="px-4 py-2 text-center">{row.tax}%</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleRemoveRow(row.id)}
                  className="text-red-500"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <tr className="py-4 grid grid-cols-8 gap-4">
        <td className="mb-2 col-span-3">
          <SearchSelect
            options={productOptions}
            value={
              selectedProduct
                ? { label: selectedProduct.label, value: selectedProduct.value }
                : null
            }
            onChange={handleProductSelect}
            isLoading={productsLoading}
            placeholder="Search"
            isClearable={true}
            isSearchable={true}
            className="mt-2"
          />
        </td>
        <td className="">
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value))}
            className="border border-gray-300 px-2 pl-3 py-2.5 w-full outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    text-center"
          />
        </td>
        <td className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="border border-gray-300 px-2 pl-3 py-2.5 w-full outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
    text-center"
            disabled
          />
        </td>
        <td className="relative">
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value))}
            className="border border-gray-300 px-2 pl-3 py-2.5 w-full outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
   "
            disabled
          />
        </td>
      </tr>

      <button
        onClick={handleAddRow}
        disabled={!selectedProduct}
        className={`${
          !selectedProduct ? 'bg-gray-400' : 'bg-green-600'
        } text-white px-4 py-2 rounded-full text-sm mt-4`}
      >
        <i className="ri-add-line mr-2"></i>Add Item
      </button>
    </div>
  );
}
