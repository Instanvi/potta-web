import React, { useState } from 'react';
import { toast } from 'sonner';

const btnBase =
  'flex items-center justify-center text-lg font-medium transition-colors select-none';
const opBtn = `${btnBase} bg-[var(--pos-green-op)] text-white hover:bg-[var(--pos-green)]`;
const numBtn = `${btnBase} bg-[#f5f5f5] text-black hover:bg-[#e8e8e8]`;

const Calculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);

  const appendToInput = (value: string) => {
    if (input) {
      if (
        value === '.' &&
        input
          .split(/[\+\-\*\/]/)
          .pop()
          ?.includes('.')
      ) {
        return;
      }
    }
    setInput((prev) => prev + value);

    try {
      const currentExpression = input + value;
      if (!/[\+\-\*\/]$/.test(currentExpression)) {
        const calculatedResult = eval(currentExpression.replace(/X/g, '*'));
        setResult(calculatedResult.toString());
      }
    } catch {
      // Ignore evaluation errors while typing
    }
  };

  const clearInput = () => {
    setInput('');
    setResult('');
  };

  const calculateResult = () => {
    try {
      const calculatedResult = eval(input.replace(/X/g, '*'));
      setResult(calculatedResult.toString());
    } catch {
      setResult('Error');
    }
  };

  const copyToClipboard = () => {
    const textToCopy = result || input;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toast.success('Copied to clipboard!'))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleMemoryClear = () => setMemory(0);

  const handleMemoryPlus = () => {
    const valueToAdd = result ? parseFloat(result) : parseFloat(input);
    if (!isNaN(valueToAdd)) setMemory(memory + valueToAdd);
  };

  const displayInput = input.replace(/\*/g, 'X');

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <div className="relative mb-3">
        <button
          type="button"
          onClick={copyToClipboard}
          className="absolute bottom-2 left-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-600"
          title="Copy to clipboard"
        >
          <i className="ri-file-copy-line text-base" />
        </button>
        <input
          type="text"
          value={displayInput}
          readOnly
          className="h-14 w-full border border-[var(--pos-border)] bg-[#fafafa] p-2 pr-3 text-right text-xl outline-none"
          placeholder="Enter calculation"
        />
        <input
          type="text"
          value={result}
          readOnly
          className="mt-1 h-16 w-full border border-[var(--pos-border)] bg-white p-2 pr-3 text-right text-3xl font-medium outline-none"
          placeholder="Result"
        />
        {memory !== 0 && (
          <span className="absolute right-2 top-2 text-xs text-gray-400">M: {memory}</span>
        )}
      </div>

      <div className="grid flex-1 grid-cols-4 grid-rows-5 gap-1">
        <button type="button" onClick={handleMemoryClear} className={opBtn}>
          MC
        </button>
        <button type="button" onClick={handleMemoryPlus} className={opBtn}>
          M+
        </button>
        <button type="button" onClick={() => appendToInput('/')} className={opBtn}>
          /
        </button>
        <button type="button" onClick={() => appendToInput('X')} className={opBtn}>
          x
        </button>

        <button type="button" onClick={() => appendToInput('7')} className={numBtn}>
          7
        </button>
        <button type="button" onClick={() => appendToInput('8')} className={numBtn}>
          8
        </button>
        <button type="button" onClick={() => appendToInput('9')} className={numBtn}>
          9
        </button>
        <button type="button" onClick={() => appendToInput('-')} className={numBtn}>
          −
        </button>

        <button type="button" onClick={() => appendToInput('4')} className={numBtn}>
          4
        </button>
        <button type="button" onClick={() => appendToInput('5')} className={numBtn}>
          5
        </button>
        <button type="button" onClick={() => appendToInput('6')} className={numBtn}>
          6
        </button>
        <button type="button" onClick={() => appendToInput('+')} className={numBtn}>
          +
        </button>

        <button type="button" onClick={() => appendToInput('1')} className={numBtn}>
          1
        </button>
        <button type="button" onClick={() => appendToInput('2')} className={numBtn}>
          2
        </button>
        <button type="button" onClick={() => appendToInput('3')} className={numBtn}>
          3
        </button>
        <button
          type="button"
          onClick={calculateResult}
          className={`${btnBase} row-span-2 bg-[var(--pos-equals)] text-white hover:bg-[#e64a19]`}
        >
          =
        </button>

        <button type="button" onClick={() => appendToInput('0')} className={`${numBtn} col-span-2`}>
          0
        </button>
        <button type="button" onClick={() => appendToInput('.')} className={numBtn}>
          .
        </button>
      </div>

      <button
        type="button"
        onClick={clearInput}
        className="mt-2 h-10 bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
      >
        Clear
      </button>
    </div>
  );
};

export default Calculator;
