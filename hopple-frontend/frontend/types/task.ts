// Define task type for type safety
export type Task = {
  id: string;
  name: string;
  description?: string;
  project: string;
  priority: "High" | "Medium" | "Low";
  status: "Backlog" | "To Do" | "In Progress" | "Done";
  dueDate: string;
  assignee: {
    name: string;
    image: string;
  };
  aiCreated: boolean;
  parentId?: string; // For subtasks
};
