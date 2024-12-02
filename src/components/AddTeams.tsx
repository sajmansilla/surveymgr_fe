import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react"; // Importar useState
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
  const [success, setSuccess] = useState(false); // Submission success state

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teams: [{ name: "", description: "" }],
    },
  });

  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "teams" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log(values.teams);
      const response = await fetch("http://localhost:3001/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values.teams),
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      await response.json();
      setSuccess(true); // Mostrar mensaje de éxito
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleAddTeam = () => {
    append({ name: "", description: "" });
  };

  const handleContinueAdding = () => {
    reset({ teams: [{ name: "", description: "" }] }); // Reiniciar formulario
    setSuccess(false);
  };

  const handleGoToLanding = () => {
    window.location.href = "/"; // Redireccionar a landing
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Teams</h1>

      {success ? (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">Teams added successfully!</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleContinueAdding}>Continue Adding Teams</Button>
            <Button variant="secondary" onClick={handleGoToLanding}>
              Go to Landing Page
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        <Button variant="destructive" onClick={() => remove(index)}>
                          Remove Team
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-4 mt-4">
              <Button type="button" onClick={handleAddTeam}>Add Team</Button>
              <Button type="submit">Submit Teams</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default AddTeams;
