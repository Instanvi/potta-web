'use client';
import React from 'react';

interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params, searchParams }: PageProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-gray-500">
        Print functionality is handled by the ReceiptPrinter class
      </p>
    </div>
  );
}
