import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
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

interface TeamMembersProps {
  teams: Team[];
  members: Member[];
  people: People[];
  selectedTeam: number | undefined;
  participants: Member[];
  isReadOnly: boolean;
  setSelectedTeam: (teamId: number | undefined) => void;
  setSelectedMembers: React.Dispatch<React.SetStateAction<SelectedMember[]>>;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  teams,
  members,
  people,
  selectedTeam,
  participants,
  isReadOnly,
  setSelectedTeam,
  setSelectedMembers,
}) => {

  return (
    <Tabs
          value={selectedTeam !== undefined ? String(selectedTeam) : ""}
          onValueChange={
            (value) => setSelectedTeam(value ? parseInt(value) : undefined)
          }>
          <TabsList className="flex flex-wrap space-x-4 justify-start overflow-x-auto ">
            {teams.map(team => (
              <TabsTrigger key={team.id} value={String(team.id)}>
                {team.team_name}
              </TabsTrigger>
            ))}
          </TabsList>
          {teams.map(team => (
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
                      .map((member) => (
                        <TableRow
                          key={member.person_id}
                          className={team.id % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              id={`member-${member.person_id}`}
                              checked={participants.some(
                                (participant) =>
                                  participant.participant_id === member.person_id &&
                                  participant.team_id === member.team_id
                              )}
                              onCheckedChange={(checked) => {
                                setSelectedMembers((prev) =>
                                  !!checked
                                    ? [
                                      ...prev,
                                      { person_id: member.person_id, team_id: member.team_id },
                                    ]
                                    : prev.filter(
                                      (selectedMember) =>
                                        !(
                                          selectedMember.person_id === member.person_id &&
                                          selectedMember.team_id === member.team_id
                                        )
                                    )
                                );

                                if (!!checked) {
                                  setParticipants((prev) => [
                                    ...prev,
                                    { participant_id: member.person_id, team_id: member.team_id },
                                  ]);
                                } else {
                                  setParticipants((prev) =>
                                    prev.filter(
                                      (participant) =>
                                        !(
                                          participant.participant_id === member.person_id &&
                                          participant.team_id === member.team_id
                                        )
                                    )
                                  );
                                }
                              }}
                              disabled={isReadOnly}
                            />


                          </TableCell>
                          <TableCell>
                            {people.find((person) => person.id === member.person_id)?.name}
                          </TableCell>
                          <TableCell>
                            {people.find((person) => person.id === member.person_id)?.email}
                          </TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>{team.team_name}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>

                </Table>
              </div>
              <div className="flex space-x-2 border-t border-gray-200 pt-4">
                <Button onClick={() => handleSelectAllMembers(team.id)} disabled={isReadOnly}>Select All</Button>
                <Button onClick={() => handleDeselectAllMembers(team.id)} disabled={isReadOnly}>Deselect All</Button>
              </div>
            </TabsContent>

          ))}
        </Tabs>
  );
};

export default TeamMembers;
