import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";

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

interface QuestionsComponentProps {
  categories: Category[];
  questions: Question[];
  selectedQuestions: string[];
  selectedCategory: string | undefined;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
  handleSelectAll: (categoryId: string) => void;
  handleDeselectAll: (categoryId: string) => void;
  setSelectedQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  isReadOnly: boolean;
}

const QuestionsComponent: React.FC<QuestionsComponentProps> = ({
  categories,
  questions,
  selectedQuestions,
  selectedCategory,
  setSelectedCategory,
  handleSelectAll,
  handleDeselectAll,
  setSelectedQuestions,
  isReadOnly,
}) => {
  return (
    <Tabs
      value={selectedCategory !== undefined ? selectedCategory : ""}
      onValueChange={(value) => setSelectedCategory(value ? value : undefined)}
    >
      <TabsList className="flex flex-wrap space-x-4 justify-start">
        {categories.map((category) => (
          <TabsTrigger key={category.category_id} value={category.category_id}>
            {category.category_name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category.category_id} value={category.category_id}>
          <div className="h-[300px] overflow-y-auto mb-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            {questions
              .filter(
                (question) =>
                  question.category_id === category.category_id &&
                  (question.enabled || selectedQuestions.includes(question.id))
              )
              .map((question) => (
                <div key={question.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`question-${question.id}`}
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) =>
                      setSelectedQuestions((prev) =>
                        checked
                          ? [...prev, question.id]
                          : prev.filter((id) => id !== question.id)
                      )
                    }
                    disabled={isReadOnly}
                  />
                  <Label htmlFor={`question-${question.id}`}>
                    {question.question} {question.enabled ? "" : "{{ DISABLED }}"}
                    {selectedQuestions.includes(question.id) && !question.enabled && "{{ DISABLED }}"}
                  </Label>
                </div>
              ))}
          </div>
          <div className="flex space-x-2 border-t border-gray-200 pt-4">
            <Button onClick={() => handleSelectAll(category.category_id)} disabled={isReadOnly}>
              Select All
            </Button>
            <Button onClick={() => handleDeselectAll(category.category_id)} disabled={isReadOnly}>
              Deselect All
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default QuestionsComponent;
