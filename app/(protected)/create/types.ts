// Define a type for each email entry.
type SharedEmail = { email: string };

export type FormInput = {
  projectName: string;
  repoUrl: string; // We'll map this to githubUrl in the payload.
  githubToken?: string;
  // Use an array of objects so that useFieldArray works correctly.
  sharedWith: SharedEmail[];
};
