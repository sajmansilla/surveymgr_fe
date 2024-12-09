import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from '@/components/ui/table.tsx';

interface TeamMembersProps {
  teams: { id: number; team_name: string }[];
  members: { person_id: number; team_id: number; name: string; email: string; role: string }[];
  selectedMembers: number[];
  setSelectedMembers: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTeam: number | undefined;
  setSelectedTeam: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleSelectAllMembers: (teamId: number) => void;
  handleDeselectAllMembers: (teamId: number) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
  teams,
  members,
  selectedMembers,
  setSelectedMembers,
  selectedTeam,
  setSelectedTeam,
  handleSelectAllMembers,
  handleDeselectAllMembers,
}) => {
  return (
    <Tabs value={selectedTeam !== undefined ? String(selectedTeam) : ""} onValueChange={(value) => setSelectedTeam(value ? parseInt(value) : undefined)}>
      <TabsList className="flex space-x-4">
        {teams.map((team) => (
          <TabsTrigger key={team.id} value={String(team.id)}>
            {team.team_name}
          </TabsTrigger>
        ))}
      </TabsList>
      {teams.map((team) => (
        <TabsContent key={team.id} value={String(team.id)}>
          <div className="h-[300px] overflow-y-auto mb-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members
                  .filter((member) => member.team_id === team.id)
                  .map((member) => (
                    <TableRow key={member.person_id}>
                      <TableCell>
                        <Checkbox
                          id={`member-${member.person_id}`}
                          checked={selectedMembers.includes(member.person_id)}
                          onCheckedChange={(checked) => {
                            setSelectedMembers((prev) =>
                              checked
                                ? [...prev, member.person_id]
                                : prev.filter((id) => id !== member.person_id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex space-x-2 border-t pt-4">
            <Button onClick={() => handleSelectAllMembers(team.id)}>Select All</Button>
            <Button onClick={() => handleDeselectAllMembers(team.id)}>Deselect All</Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
