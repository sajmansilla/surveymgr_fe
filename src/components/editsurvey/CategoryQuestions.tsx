import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';

interface CategoryQuestionsProps {
  categories: { category_id: string; category_name: string }[];
  questions: { id: string; question: string; category_id: string }[];
  selectedCategory: string | undefined;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedQuestions: string[];
  setSelectedQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelectAll: (categoryId: string) => void;
  handleDeselectAll: (categoryId: string) => void;
}

export const CategoryQuestions: React.FC<CategoryQuestionsProps> = ({
  categories,
  questions,
  selectedCategory,
  setSelectedCategory,
  selectedQuestions,
  setSelectedQuestions,
  handleSelectAll,
  handleDeselectAll,
}) => {
  return (
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
      <TabsList className="flex space-x-4">
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
              .filter((question) => question.category_id === category.category_id)
              .map((question) => (
                <div key={question.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`question-${question.id}`}
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) => {
                      setSelectedQuestions((prev) =>
                        checked
                          ? [...prev, question.id]
                          : prev.filter((id) => id !== question.id)
                      );
                    }}
                  />
                  <Label htmlFor={`question-${question.id}`}>{question.question}</Label>
                </div>
              ))}
          </div>
          <div className="flex space-x-2 border-t pt-4">
            <Button onClick={() => handleSelectAll(category.category_id)}>Select All</Button>
            <Button onClick={() => handleDeselectAll(category.category_id)}>Deselect All</Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
