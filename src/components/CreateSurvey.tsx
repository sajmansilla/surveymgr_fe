import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Checkbox } from "./ui/checkbox.tsx";
import { Calendar } from "./ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover.tsx";
import { cn } from "../lib/utils.ts";
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

function CreateSurvey() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [surveyName, setSurveyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

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
              className="w-20"  // Limit the Name input width to approximately 6 characters
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

        {/* Tabs */}
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

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Save Survey Draft</Button>
          <Button>Assign Teams</Button>
        </div>
      </div>
    </div>
  );
}

export default CreateSurvey;
