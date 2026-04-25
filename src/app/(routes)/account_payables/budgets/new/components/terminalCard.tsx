// src/components/TerminalsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@potta/components/card';
import { Button } from '@potta/components/shadcn/button';

import { Plus } from 'lucide-react';

export function TerminalsCard({ count }: { count: number }) {
  return (
    <Card className="shadow-sm space-y-2 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 ">
        <CardTitle className="text-sm font-medium text-gray-600">Terminals</CardTitle>
        <Button variant="ghost" size="icon" className="w-6 h-6  text-white bg-green-800 hover:bg-green-900 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center pt-8'>


        <div className="text-5xl font-medium">{count}</div>

      </CardContent>
    </Card>
  );
}
