// src/components/TeamCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@potta/components/card';
import { Button } from '@potta/components/shadcn/button';
import { Avatar, AvatarFallback, AvatarImage } from '@potta/components/avatar';
import { Plus } from 'lucide-react';
import { TeamMember } from '../utils/types';


interface TeamCardProps {
  teamMembers: TeamMember[];
  maxVisible?: number;
}

export function TeamCard({ teamMembers, maxVisible = 3 }: TeamCardProps) {
  const visibleMembers = teamMembers.slice(0, maxVisible);
  const hiddenCount = teamMembers.length - visibleMembers.length;

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-600">Team</CardTitle>
         <Button variant="ghost" size="icon" className="w-6 h-6 text-white bg-green-800 hover:bg-green-900 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {visibleMembers.map((member) => (
            <li key={member.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.imageUrl} alt={member.name} />
                <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{member.name}</span>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && (
          <Button variant="ghost" size="sm" className="mt-2 h-auto px-2 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200">
            +{hiddenCount} More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
