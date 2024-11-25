import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// Define schema validation with zod
const formSchema = z.object({
  teams: z.array(
    z.object({
      name: z.string().min(2, "Team name must be at least 2 characters."),
      description: z.string().optional(),
    })
  ),
});

const AddTeams = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teams: [
        { name: "", description: "" }, // Default empty team
      ],
    },
  });

  const { control, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teams", // Field name for dynamic array
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Submitted teams:", values.teams);
  };

  const handleAddTeam = () => {
    append({ name: "", description: "" }); // Add a new empty team
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Teams</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Table for displaying and editing teams */}
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-bold">Team Name</TableCell>
                  <TableCell className="font-bold">Description</TableCell>
                  <TableCell className="font-bold">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`teams.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Enter team name"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`teams.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Enter team description"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        Remove Team
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Buttons to add a new team or submit the form */}
          <div className="flex gap-4 mt-4">
            <Button type="button" onClick={handleAddTeam}>
              Add Team
            </Button>
            <Button type="submit">Submit Teams</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTeams;