import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react"; // Import useState hook
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
  const [success, setSuccess] = useState(false); // Submission success state

  const form = useForm({
    defaultValues: {
      people: [{ id: 1, name: "", email: "" }],
    },
  });

  const { control, handleSubmit, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "people",
  });

  const onSubmit = async (data: { people: Person[] }) => {
    try {
      const response = await fetch("http://localhost:3001/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.people),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      await response.json();
      setSuccess(true); // Set success state to true after submission
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleAddRow = () => {
    append({ id: Date.now(), name: "", email: "" });
  };

  const handleContinueAdding = () => {
    reset({ people: [{ id: Date.now(), name: "", email: "" }] }); // Reset form
    setSuccess(false); // Hide success message
  };

  const handleGoToLanding = () => {
    window.location.href = "/"; // Redirect to landing page
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add People</h1>

      {success ? (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">People added successfully!</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleContinueAdding}>
              Continue Adding People
            </Button>
            <Button variant="secondary" onClick={handleGoToLanding}>
              Go to Landing Page
            </Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default AddPeople;