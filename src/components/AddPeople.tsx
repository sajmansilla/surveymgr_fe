import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface Person {
  id: number;
  name: string;
  email: string;
}

const AddPeople = () => {
  const form = useForm({
    defaultValues: {
      people: [{ id: 1, name: "", email: "" }],
    },
  });

  const { control, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "people",
  });

  const onSubmit = async (data: { people: Person[] }) => {
    console.log("People data:", data.people);

    // Send data to the server through a POST request using fetch
    try {
      const response = await fetch("http://localhost:5173/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ people: data.people }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      const result = await response.json();
      console.log("Success:", result);
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };


  const handleAddRow = () => {
    append({ id: Date.now(), name: "", email: "" });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add People</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-bold">Name</TableCell>
                  <TableCell className="font-bold">Email</TableCell>
                  <TableCell className="font-bold">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`people.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                {...field}
                                type="text"
                                className="w-full border border-gray-300 rounded p-1"
                                placeholder="Enter name"
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
                        name={`people.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                {...field}
                                type="email"
                                className="w-full border border-gray-300 rounded p-1"
                                placeholder="Enter email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        Delete Row
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-4">
            <Button type="button" onClick={handleAddRow}>
              Add Row
            </Button>
            <Button type="submit">Save People</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddPeople;
