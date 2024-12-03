import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

export function CategoriesTabs({
  categories,
  questions,
}: {
  categories: Category[];
  questions: Question[];
}) {
  return (
    <Tabs>
      <TabsList>
        {categories.map((category) => (
          <TabsTrigger key={category.category_id} value={category.category_id}>
            {category.category_name}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category.category_id} value={category.category_id}>
          {questions
            .filter((q) => q.category_id === category.category_id)
            .map((question) => (
              <div key={question.id} className="flex items-center space-x-2">
                <Checkbox id={question.id} />
                <Label htmlFor={question.id}>{question.question}</Label>
              </div>
            ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
