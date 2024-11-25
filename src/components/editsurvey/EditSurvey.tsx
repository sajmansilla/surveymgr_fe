import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { cn } from "@/lib/utils.ts";
import { CalendarIcon } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category_id: string;
  enabled: boolean;
}

interface Member {
  person_id: number;
  name: string;
  email: string;
  team_id: number;
}

function EditSurvey() {
  const { survey_id } = useParams<{ survey_id: string }>();
  const [surveyName, setSurveyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';

    // Fetch survey questions
    fetch(`${apiUrl}/api/surveyquestions/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
        setSelectedQuestions(
          data.questions
            .filter((q: any) => q.Question.enabled)
            .map((q: any) => q.Question.id)
        );
      });

    // Fetch survey participants
    fetch(`${apiUrl}/api/surveyparticip/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        setMembers(data.participants); // Asigna directamente los participantes a 'setMembers'
        setSelectedMembers(data.participants.map((participant: any) => participant.participant)); // Usa el campo 'participant' en el mapeo
      });

    // Optionally fetch survey metadata (e.g., name, dates, description)
    fetch(`${apiUrl}/api/survey/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        // Accede a los datos dentro de 'survey'
        setSurveyName(data.survey.name);
        setDescription(data.survey.description);
        setStartDate(data.survey.date_start ? new Date(data.survey.date_start) : undefined);
        setEndDate(data.survey.date_end ? new Date(data.survey.date_end) : undefined);
      });
  }, [survey_id]);

  const handleSaveChanges = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';

    const body = {
      name: surveyName,
      date_start: startDate ? format(startDate, "yyyy-MM-dd") : null,
      date_end: endDate ? format(endDate, "yyyy-MM-dd") : null,
      questions: selectedQuestions,
      participants: selectedMembers,
      description: description,
    };

    try {
      const response = await fetch(`${apiUrl}/api/survey/${survey_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      alert('Survey updated successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Failed to update survey:', error);
      alert('Failed to update survey. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Survey</h1>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Label htmlFor="name" className="whitespace-nowrap">Name</Label>
          <Input
            id="name"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            maxLength={50}
          />

          <Label htmlFor="start-date" className="whitespace-nowrap">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-32 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd.MM.yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date: Date | undefined) => setStartDate(date || undefined)}
              />
            </PopoverContent>
          </Popover>

          <Label htmlFor="end-date" className="whitespace-nowrap">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-32 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd.MM.yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date: Date | undefined) => setEndDate(date || undefined)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Questions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Questions</h2>
          {questions.map(question => (
            <div key={question.id} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`question-${question.id}`}
                checked={selectedQuestions.includes(question.id)}
                onCheckedChange={(checked) => {
                  setSelectedQuestions(prev =>
                    checked
                      ? [...prev, question.id]
                      : prev.filter(id => id !== question.id)
                  );
                }}
              />
              <Label htmlFor={`question-${question.id}`}>{question.question}</Label>
            </div>
          ))}
        </div>

        {/* Members */}
        <div>
          <h2 className="text-xl font-bold mb-4">Participants</h2>
          {members.map(member => (
            <div key={member.person_id} className="flex items-center space-x-2 mb-2">
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
              <Label htmlFor={`member-${member.person_id}`}>{member.name} ({member.email})</Label>
            </div>
          ))}
        </div>

        <Button onClick={handleSaveChanges} className="mt-6">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default EditSurvey;
