import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils.ts";
import { CalendarIcon } from 'lucide-react';

interface Category {
  category_id: string;
  category_name: string;
}

interface Question {
  id: string;
  question: string;
  category_id: string;
  enabled: boolean;
}

interface Team {
  id: number;
  team_name: string;
}

interface People {
  id: number;
  name: string;
  email: string;
}

interface Member {
  person_id: number;
  team_id: number;
  role: string;
}

interface Survey {
  survey_id: string;
  survey_name: string;
  description: string;
  date_start: string;
  date_end: string;
}

interface SelectedMember {
  person_id: number;
  team_id: number;
}


const ViewSurvey: React.FC = () => {
  const { survey_id } = useParams<{ survey_id: string }>();
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [endDateDisabled, setEndDateDisabled] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyName, setSurveyName] = useState<string>('');
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(
    categories.length > 0 ? categories[0].category_id : undefined
  );

  const [teamsIncluded, setTeamsIncluded] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [people, setPeople] = useState<People[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(
    undefined);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/surveyedit/${survey_id}`)
      .then((response) => response.json())
      .then((data) => {
        // Survey data
        setSurvey(data.survey);
        setSurveyName(data.survey.survey_name);
        setDescription(data.survey.description);
        setStartDate(data.survey.date_start ? new Date(data.survey.date_start) : undefined);
        setEndDate(data.survey.date_end ? new Date(data.survey.date_end) : undefined);

        // Questions
        fetch(`${apiUrl}/api/questions`)
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch questions");
            const resp = response.json();
            return resp
          })
          .then((data) => {
            setQuestions(data.questions);

          });

        // Selected Questions
        setSelectedQuestions(data.questions.map((q: Question) => q.id));

        // Fetch categories to populate tabs.
        fetch(`${apiUrl}/api/categories`)
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch categories");
            const resp = response.json();
            return resp
          })
          .then((data) => {
            setCategories(data.category);

            if (data.category.length > 0) {
              setSelectedCategory(data.category[0].category_id);
            }

          });

        // Included Teams
        setTeamsIncluded(data.teamsIncluded);

        // Fetch Team Members to populate tabs.
        fetch(`${apiUrl}/api/teammembers`)
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch team members");
            const resp = response.json();
            return resp
          })
          .then((data) => {
            setMembers(data.members);

          });

        // Included participants
        setSelectedMembers(data.members);

      });

    // Fetch teams to populate tabs.
    fetch(`${apiUrl}/api/teams`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch teams");
        const resp = response.json();
        return resp
      })
      .then((data) => {
        setTeams(data.teams);

        if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0].id);
        }

      });

    // Fetch teams to populate tabs.
    fetch(`${apiUrl}/api/teams`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch teams");
        const resp = response.json();
        return resp
      })
      .then((data) => {
        setTeams(data.teams);

        if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0].id);
        }

      });

    // Fetch people to populate tabs.
    fetch(`${apiUrl}/api/people`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch people");
        const resp = response.json();
        return resp
      })
      .then((data) => {
        setPeople(data.people);
      });

  }, [survey_id]);

  const handleEditSurvey = () => {
    const now = new Date();

    if (!startDate || !endDate) {
      alert("Dates are not properly set.");
      return;
    }

    if (startDate && endDate) {
      if (startDate > now) {
        // Future Survey: enable every field except name.
        // TODO: Bring all the questions, people and teams.
        setIsReadOnly(false);
        setEndDateDisabled(false);
      } else if (startDate <= now && endDate > now) {
        // Active Survey: enable only End date field
        setIsReadOnly(true);
        setEndDateDisabled(false);
      } else if (endDate <= now) {
        // Closed Survey: show error message
        alert("The survey is inactive and cannot be edited.");
      }
    }
  };

  useEffect(() => {
    if (endDate) {
      setSurveyName(format(endDate, 'MM.yy'));
    }
  }, [endDate]);

  const handleSaveSurvey = async () => {
    const teamNamesWithSelectedMembers = teams
      .filter((team) =>
        members
          .filter((member) => member.team_id === team.id)
          .some((member) =>
            selectedMembers.some(
              (selected) =>
                selected.person_id === member.person_id &&
                selected.team_id === member.team_id
            )
          )
      )
      .map((team) => team.team_name);

    const body = {
      name: survey?.survey_name,
      date_start: startDate ? format(startDate, "yyyy-MM-dd") : null,
      date_end: endDate ? format(endDate, "yyyy-MM-dd") : null,
      teams: teamNamesWithSelectedMembers,
      description,
      questions: selectedQuestions,
      members: selectedMembers,
    };

    try {
      const response = await fetch(`${apiUrl}/api/survey/${survey_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      alert("Survey updated successfully!");
      navigate("/surveys");
    } catch (error) {
      console.error("Failed to update survey:", error);
      alert("Failed to update survey. Please try again.");
    }
  };

  const handleSelectAll = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.category_id === categoryId);
    setSelectedQuestions(prev => [...new Set([...prev, ...categoryQuestions.map(q => q.id)])]);
  };

  const handleDeselectAll = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.category_id === categoryId);
    setSelectedQuestions(prev => prev.filter(id => !categoryQuestions.map(q => q.id).includes(id)));
  };

  const handleSelectAllMembers = (teamId: number) => {
    const teamMembers = members
      .filter((member) => member.team_id === teamId)
      .map((member) => ({
        person_id: member.person_id,
        team_id: member.team_id,
      }));

    setSelectedMembers((prev) => {
      const existingSet = new Set(prev.map((m) => `${m.person_id}-${m.team_id}`));
      const newMembers = teamMembers.filter(
        (m) => !existingSet.has(`${m.person_id}-${m.team_id}`)
      );
      return [...prev, ...newMembers];
    });
  };

  const handleDeselectAllMembers = (teamId: number) => {
    const teamMembers = members.filter((member) => member.team_id === teamId);
    setSelectedMembers((prev) =>
      prev.filter(
        (selected) =>
          !teamMembers.some(
            (member) =>
              member.person_id === selected.person_id &&
              member.team_id === selected.team_id
          )
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">View Survey</h1>
        <Button onClick={handleEditSurvey} disabled={!(isReadOnly)}>
          Edit Survey
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {/* Name field */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={surveyName}
              disabled
              className="w-20" // Limit the Name input width to approximately 6 characters
            />
          </div>

          {/* Start Date field */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="start-date" className="whitespace-nowrap">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-32 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isReadOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd.MM.yyyy") : <span>Pick a date</span>} {/* Format as DD.MM.YYYY */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date: Date | undefined) => setStartDate(date || undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date field */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-32 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={endDateDisabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd.MM.yyyy") : <span>Pick a date</span>} {/* Format as DD.MM.YYYY */}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date: Date | undefined) => setEndDate(date || undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Categories and Questions Tabs */}
        <div className="container mx-auto p-6">
          <Tabs
            value={selectedCategory !== undefined ? selectedCategory : ""}
            onValueChange={
              (value) => setSelectedCategory(value ? value : undefined)
            }>
            <TabsList className="flex flex-wrap space-x-4 justify-start">
              {categories.map(category => (
                <TabsTrigger key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(category => (
              <TabsContent key={category.category_id} value={category.category_id}>
                <div className="h-[300px] overflow-y-auto mb-4 border border-gray-300 rounded-lg p-4 shadow-sm">
                  {questions
                    .filter(question => question.category_id === category.category_id)
                    .map(question => (
                      <div key={question.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`question-${question.id}`}
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => {
                            setSelectedQuestions(prev =>
                              checked
                                ? [...prev, question.id]
                                : prev.filter(id => id !== question.id)
                            )
                          }}
                          disabled={isReadOnly}
                        />
                        <Label htmlFor={`question-${question.id}`}>
                          {question.question} {question.enabled ? "" : "{{ DISABLED }}"}
                        </Label>
                      </div>
                    ))
                  }
                </div>
                <div className="flex space-x-2 border-t border-gray-200 pt-4">
                  <Button onClick={() => handleSelectAll(category.category_id)} disabled={isReadOnly}>Select All</Button>
                  <Button onClick={() => handleDeselectAll(category.category_id)} disabled={isReadOnly}>Deselect All</Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>


        {/* Existing Teams and Members Tabs */}
        <div className="team-container mx-auto p-6">
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
                                checked={selectedMembers.some(
                                  (selectedMember) =>
                                    selectedMember.person_id === member.person_id &&
                                    selectedMember.team_id === member.team_id
                                )}
                                onCheckedChange={(checked) => {
                                  setSelectedMembers((prev) =>
                                    checked
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
        </div>

        <div className="flex justify-end space-x-4">
          <Button onClick={() => navigate("/surveys")} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSaveSurvey} disabled={endDateDisabled}>Save Survey</Button>
        </div>
      </div>
    </div>
  );
}

export default ViewSurvey;