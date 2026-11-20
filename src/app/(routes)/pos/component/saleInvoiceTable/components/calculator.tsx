import React, { useState } from 'react';
import toast from 'react-hot-toast';

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

    // Try to calculate the result as the user types
    try {
      const currentExpression = input + value;
      // Only evaluate if the expression doesn't end with an operator
      if (!/[\+\-\*\/]$/.test(currentExpression)) {
        const calculatedResult = eval(currentExpression.replace(/X/g, '*'));
        setResult(calculatedResult.toString());
      }
    } catch (error) {
      // Ignore evaluation errors while typing
    }
  };

  const clearInput = () => {
    setInput('');
    setResult('');
  };

  const calculateResult = () => {
    try {
      const calculatedResult = eval(input.replace(/X/g, '*')); // Replace 'X' back to '*' for evaluation
      setResult(calculatedResult.toString());
      // Keep the input as is, don't replace it with the result
    } catch (error) {
      setResult('Error');
    }
  };

  const copyToClipboard = () => {
    const textToCopy = result || input;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleMemoryPlus = () => {
    const valueToAdd = result ? parseFloat(result) : parseFloat(input);
    if (!isNaN(valueToAdd)) {
      setMemory(memory + valueToAdd);
    }
  };

  // Convert the input to display 'X' instead of '*'
  const displayInput = input.replace(/\*/g, 'X');

  return (
    <div className="flex flex-col text-2xl items-center justify-center h-full bg-gray-100">
      <div className="bg-white p-6 w-full h-full">
        <div className="flex flex-col mb-4 relative">
          {/* Display calculation expression */}
          <button
            onClick={copyToClipboard}
            className="absolute left-2 bottom-2 bg-gray-400 text-white rounded-full hover:bg-gray-600 w-10 h-10 flex items-center justify-center"
            title="Copy to clipboard"
          >
            <i className="ri-file-copy-line text-base"></i>
          </button>
          <input
            type="text"
            value={displayInput}
            readOnly
            className="w-full h-16 text-right text-2xl p-2 bg-gray-50"
            placeholder="Enter calculation"
          />

          {/* Display result */}
          <input
            type="text"
            value={result}
            readOnly
            className="w-full h-20 text-right text-4xl font-medium p-2"
            placeholder="Result"
          />

          {/* Copy button - smaller and positioned to the right */}
        </div>

        {/* Operator Buttons Row */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <button
            onClick={handleMemoryClear}
            className="bg-green-800 text-white h-24 hover:bg-green-900 px-2"
          >
            MC
          </button>
          <button
            onClick={handleMemoryPlus}
            className="bg-green-800 text-white h-24 hover:bg-green-900 px-2"
          >
            M+
          </button>
          <button
            onClick={() => appendToInput('/')}
            className="h-24 hover:bg-green-900 bg-green-800 text-white"
          >
            /
          </button>
          <button
            onClick={() => appendToInput('X')}
            className="h-24 hover:bg-green-900 bg-green-800 text-white"
          >
            X
          </button>
        </div>

        {/* Number and Other Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => appendToInput('7')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            7
          </button>
          <button
            onClick={() => appendToInput('8')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            8
          </button>
          <button
            onClick={() => appendToInput('9')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            9
          </button>
          <button
            onClick={() => appendToInput('-')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            -
          </button>
          <button
            onClick={() => appendToInput('4')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            4
          </button>
          <button
            onClick={() => appendToInput('5')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            5
          </button>
          <button
            onClick={() => appendToInput('6')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            6
          </button>
          <button
            onClick={() => appendToInput('+')}
            className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
          >
            +
          </button>
          <div className="grid grid-cols-3 gap-2 col-span-3">
            <button
              onClick={() => appendToInput('1')}
              className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
            >
              1
            </button>
            <button
              onClick={() => appendToInput('2')}
              className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
            >
              2
            </button>
            <button
              onClick={() => appendToInput('3')}
              className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
            >
              3
            </button>

            <button
              onClick={() => appendToInput('0')}
              className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
            >
              0
            </button>
            <button
              onClick={() => appendToInput('.')}
              className="h-24 hover:bg-gray-300 bg-gray-100 text-black"
            >
              .
            </button>
            <button
              onClick={clearInput}
              className="hover:bg-slate-900 text-white h-24 bg-slate-950 px-2"
            >
              C
            </button>
          </div>
          <button
            onClick={calculateResult}
            className="bg-orange-500 text-white h-22 hover:bg-orange-600 col-span-1"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
