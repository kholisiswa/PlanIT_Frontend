// client/src/types/task.ts
// Task type from database (provided through tRPC responses)
type Task = any;

export type TagShape = {
  id: number;
  name: string;
  color: string | null;
};

export type TaskWithTags = Task & {
  tags?: TagShape[];
};
