import { format } from 'date-fns';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar.tsx';

interface SurveyFormProps {
  surveyName: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setSurveyName: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  surveyName,
  description,
  startDate,
  endDate,
  setSurveyName,
  setDescription,
  setStartDate,
  setEndDate,
}) => {
  return (
    <div className="space-y-6">
      {/* Name Field */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          className="w-20"
        />
      </div>

      {/* Start Date */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32 justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd.MM.yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="end-date">End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32 justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd.MM.yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
          </PopoverContent>
        </Popover>
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
        />
      </div>
    </div>
  );
};
