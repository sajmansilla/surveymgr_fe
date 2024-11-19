import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
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

interface Member {
  person_id: number;
  team_id: number;
  role: string;
  name: string;
  email: string;
}

function CreateSurvey() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [surveyName, setSurveyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';
    fetch(`${apiUrl}/api/categories`)
      .then(response => response.json())
      .then(data => {
        setCategories(data.category);
        setSelectedCategory(data.category[0]?.category_id ?? null); // Set first category as default
      });

    fetch(`${apiUrl}/api/questions`)
      .then(response => response.json())
      .then(data => {
        const enabledQuestions = data.questions
          .filter((question: Question) => question.enabled)
          .map((question: Question) => question.id); // Get the IDs of enabled questions
        setQuestions(data.questions);
        setSelectedQuestions(enabledQuestions); // Mark enabled questions as selected
      });
  }, []);

  useEffect(() => {
    if (endDate) {
      setSurveyName(format(endDate, 'MM.yy'));
    }
  }, [endDate]);

  const handleSelectAll = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.category_id === categoryId);
    setSelectedQuestions(prev => [...new Set([...prev, ...categoryQuestions.map(q => q.id)])]);
  };

  const handleDeselectAll = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.category_id === categoryId);
    setSelectedQuestions(prev => prev.filter(id => !categoryQuestions.map(q => q.id).includes(id)));
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';

    fetch(`${apiUrl}/api/teams`)
      .then(response => response.json())
      .then(data => {
        setTeams(data.teams);
        setSelectedTeam(data.teams[0]?.id ?? null);
      });

      fetch(`${apiUrl}/api/teammembers`)
      .then(response => response.json())
      .then(data => {
        const memberPromises = data.members.map(async (member: Member) => {
          const response = await fetch(`${apiUrl}/api/people/${member.person_id}`);
          const personData = await response.json();
          return { ...member, ...personData.person }; // Combine member and person data
        });

        // Wait for all member data to be fetched and set state
        Promise.all(memberPromises).then(updatedMembers => {
          setMembers(updatedMembers);
        });
      });
  }, []);

  const handleSelectAllMembers = (teamId: number) => {
    const teamMembers = members.filter(member => member.team_id === teamId);
    setSelectedMembers(prev => [...new Set([...prev, ...teamMembers.map(member => member.person_id)])]);
  };

  const handleDeselectAllMembers = (teamId: number) => {
    const teamMembers = members.filter(member => member.team_id === teamId);
    setSelectedMembers(prev => prev.filter(id => !teamMembers.map(member => member.person_id).includes(id)));
  };

  const handleSaveDraft = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';
  
    // Prepare the list of team names with selected members
    const teamNamesWithSelectedMembers = teams
      .filter(team => {
        // Get all selected members for this team
        const teamMembers = members.filter(member => member.team_id === team.id);
        // Check if any member of the team is selected
        return teamMembers.some(member => selectedMembers.includes(member.person_id));
      })
      .map(team => team.team_name); // Map to just the team names
  
    const body = {
      name: surveyName,
      date_start: startDate ? format(startDate, "yyyy-MM-dd") : null,
      date_end: endDate ? format(endDate, "yyyy-MM-dd") : null,
      teams: teamNamesWithSelectedMembers, // Only send an array of team names
    };
  
    try {
      const response = await fetch(`${apiUrl}/api/survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log('Survey draft saved:', result);
      alert('Survey draft saved successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Failed to save survey draft:', error);
      alert('Failed to save survey draft. Please try again.');
    }
  };  

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Survey</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {/* Name field */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="name" className="whitespace-nowrap">Name</Label>
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
            <Label htmlFor="end-date" className="whitespace-nowrap">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-32 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
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
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
          />
        </div>

        {/* Categories and Questions Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
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
                      />
                      <Label htmlFor={`question-${question.id}`}>{question.question}</Label>
                    </div>
                  ))
                }
              </div>
              <div className="flex space-x-2 border-t border-gray-200 pt-4">
                <Button onClick={() => handleSelectAll(category.category_id)}>Select All</Button>
                <Button onClick={() => handleDeselectAll(category.category_id)}>Deselect All</Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="container mx-auto p-6">
        {/* Existing Teams and Members Tabs */}
        <Tabs
          value={selectedTeam !== undefined ? String(selectedTeam) : ""}
          onValueChange={(value) => setSelectedTeam(value ? parseInt(value) : undefined)}
        >
          <TabsList className="flex flex-wrap space-x-4 justify-start">
            {teams.map(team => (
              <TabsTrigger key={team.id} value={String(team.id)}>
                {team.team_name}
              </TabsTrigger>
            ))}
          </TabsList>
          {teams.map(team => (
            <TabsContent key={team.id} value={String(team.id)}>
              <div className="h-[300px] overflow-y-auto mb-4 border border-gray-300 rounded-lg p-4 shadow-sm">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members
                      .filter(member => member.team_id === team.id)
                      .map(member => (
                        <tr key={member.person_id}>
                          <td>
                            <Checkbox
                              id={`member-${member.person_id}`}
                              checked={selectedMembers.includes(member.person_id)}
                              onCheckedChange={(checked) => {
                                setSelectedMembers(prev =>
                                  checked
                                    ? [...prev, member.person_id]
                                    : prev.filter(id => id !== member.person_id)
                                );
                              }}
                            />
                          </td>
                          <td>
                            {member.name}
                          </td>
                          <td>{member.role}</td>
                          <td>{member.email}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <div className="flex space-x-2 border-t border-gray-200 pt-4">
                <Button onClick={() => handleSelectAllMembers(team.id)}>Select All</Button>
                <Button onClick={() => handleDeselectAllMembers(team.id)}>Deselect All</Button>
              </div>
            </TabsContent>

          ))}
        </Tabs>

      </div>

      <div className="flex justify-end space-x-4">
        <Button onClick={handleSaveDraft}>Save Survey</Button>
      </div>
    </div>
  );
}

export default CreateSurvey;
