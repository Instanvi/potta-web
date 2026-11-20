'use client';

import './globals.css';

/** Last-resort boundary (errors in the root layout); renders its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-6">
          <div className="w-full max-w-md space-y-5 text-center">
            <img src="/potta.svg" alt="Potta" className="mx-auto h-9 w-auto" />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Something went wrong</p>
              <h1 className="text-2xl font-medium tracking-tight text-gray-900">Potta couldn&apos;t start</h1>
              <p className="text-sm leading-relaxed text-gray-500">Reload the page. If it keeps happening, contact your administrator.</p>
            </div>
            <button
              type="button"
              onClick={() => reset()}
              className="h-11 bg-[#237804] px-6 text-sm text-white hover:bg-[#1d6303]"
            >
              Try again
            </button>
            {error.digest && <p className="text-xs text-gray-400">Reference: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  );
}
