import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox.tsx";

interface Team {
  id: number;
  team_name: string;
}

interface Member {
  person_id: number;
  team_id: number;
  role: string;
}

interface People {
  id: number;
  name: string;
  email: string;
}

interface SelectedMember {
  person_id: number;
  team_id: number;
}

interface TeamsAndMembersTabsProps {
  teams: Team[];
  members: Member[];
  people: People[];
  onSelectAllMembers: (teamId: number) => void;
  onDeselectAllMembers: (teamId: number) => void;
  onMemberSelectionChange: (member: SelectedMember, selected: boolean) => void;
  setSelectedTeam: React.Dispatch<React.SetStateAction<number | undefined>>;
  setSelectedMembers: React.Dispatch<React.SetStateAction<SelectedMember[]>>;
  isReadOnly: boolean;
  selectedTeam: number | undefined;
  setParticipants: React.Dispatch<React.SetStateAction<SelectedMember[]>>;
}

const TeamsAndMembersTabs: React.FC<TeamsAndMembersTabsProps> = ({
  teams,
  members,
  people,
  selectedMembers,
  isReadOnly,
  selectedTeam,
  setParticipants,
  setSelectedTeam,
  setSelectedMembers,
  onSelectAllMembers,
  onDeselectAllMembers,
}) => {
  return (
    <Tabs
      value={selectedTeam !== undefined ? String(selectedTeam) : ""}
      onValueChange={(value) =>
        setSelectedTeam(value ? parseInt(value) : undefined)
      }
    >
      <TabsList className="flex flex-wrap space-x-4 justify-start overflow-x-auto">
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
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Select</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-left">
                {members
                  .filter((member) => member.team_id === team.id)
                  .map((member) => {
                    const person = people.find(
                      (p) => p.id === member.person_id
                    );
                    const isSelected = selectedMembers.some(
                      (sm) =>
                        sm.person_id === member.person_id &&
                        sm.team_id === member.team_id
                    );

                    return (
                      <TableRow
                        key={member.person_id}
                        className={team.id % 2 === 0 ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            id={`member-${member.person_id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const updatedSelectedMembers = checked
                                ? [
                                    ...selectedMembers,
                                    {
                                      person_id: member.person_id,
                                      team_id: member.team_id,
                                    },
                                  ]
                                : selectedMembers.filter(
                                    (selectedMember) =>
                                      !(
                                        selectedMember.person_id ===
                                          member.person_id &&
                                        selectedMember.team_id ===
                                          member.team_id
                                      )
                                  );

                              setSelectedMembers(updatedSelectedMembers);

                              const updatedParticipants = checked
                                ? [
                                    ...selectedMembers,
                                    {
                                      person_id: member.person_id,
                                      team_id: member.team_id,
                                    },
                                  ]
                                : selectedMembers.filter(
                                    (participant) =>
                                      !(
                                        participant.person_id ===
                                          member.person_id &&
                                        participant.team_id ===
                                          member.team_id
                                      )
                                  );

                              setParticipants(updatedParticipants);
                            }}
                            disabled={isReadOnly}
                          />
                        </TableCell>
                        <TableCell>{person?.name}</TableCell>
                        <TableCell>{person?.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{team.team_name}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          <div className="flex space-x-2 border-t border-gray-200 pt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => onSelectAllMembers(team.id)}
              disabled={isReadOnly}
            >
              Select All
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => onDeselectAllMembers(team.id)}
              disabled={isReadOnly}
            >
              Deselect All
            </button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TeamsAndMembersTabs;
