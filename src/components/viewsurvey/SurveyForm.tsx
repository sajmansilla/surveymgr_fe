import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface Question {
  id: string;
  question: string;
  category_id: string;
  enabled: boolean;
}

// Define the type for surveyData
interface SurveyData {
  startDate?: Date;
  endDate?: Date;
  description: string;
  surveyName: string;
  questions: Question[];
}

interface DatePickerProps {
  selectedDate: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export function SurveyDetailsForm({ surveyData }: { surveyData: SurveyData }) {
  const [startDate, setStartDate] = useState<Date | undefined>(surveyData.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(surveyData.endDate);
  const [description, setDescription] = useState<string>(surveyData.description);

  useEffect(() => {
    if (endDate) {
      const formattedDate = format(endDate, "MM.yy");
      console.log(`Survey name set to: ${formattedDate}`);
    }
  }, [endDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {/* Name */}
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={surveyData.surveyName} disabled />

        {/* Start date */}
        <Label htmlFor="start-date">Start Date</Label>
        <DatePicker selectedDate={startDate} onChange={setStartDate} />

        {/* End date */}
        <Label htmlFor="end-date">End Date</Label>
        <DatePicker selectedDate={endDate} onChange={setEndDate} />
      </div>

      {/* Description */}
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  );
}

function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-32">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "dd.MM.yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar mode="single" selected={selectedDate} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
