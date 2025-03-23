"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react"; // Ensure you have lucide-react installed
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { FormInput } from "./types";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import LoadingSpinner from "@/components/generalComponents/LoadingSpinner";

const CreatePage = () => {
  // Get the user's authentication state.
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize the form with default values.
  const { register, handleSubmit, control } = useForm<FormInput>({
    defaultValues: {
      sharedWith: [],
    },
  });

  // Manage dynamic email inputs.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sharedWith",
  });

  // Get the createProject mutation.
  const createProjectMutation = useMutation(api.projects.createProject);

  // Always call hooks; conditionally render content only after hooks have run.
  if (!isLoaded) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return <div>Please sign in to create a project.</div>;
  }

  // onSubmit: transform the form data into the payload for the mutation.
  const onSubmit = async (data: FormInput) => {
    // Transform the array of shared emails into a record.
    // Here each email gets a default role of "member".
    const sharedWithRecord: Record<string, string> = {};
    data.sharedWith.forEach((item) => {
      const email = item.email.trim();
      if (email) {
        sharedWithRecord[email] = "member";
      }
    });

    // Prepare the payload, mapping repoUrl to githubUrl.
    const payload = {
      projectName: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
      sharedWith: sharedWithRecord,
    };

    try {
      setIsSubmitting(true);
      // Call the mutation with the payload.
      const result = await createProjectMutation(payload);
      toast.success("Project created successfully");
      setIsSubmitting(false);
    } catch (error: any) {
      toast.error("Error on submitting the form");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <Image
        src={"/assets/createPageLogo.svg"}
        alt="create page logo"
        width={60}
        height={60}
        className="h-56 w-auto"
      />
      <div>
        <div>
          <h2 className="font-semibold text-2xl">
            Link your Github Repository
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to K2
          </p>
        </div>
        <div className="h-4" />
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2" />
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              required
            />
            <div className="h-2" />
            <Input
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <div className="h-2" />
            {/* Shared With Section */}
            <div className="w-full">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 mb-[0.5rem]"
                >
                  <Input
                    {...register(`sharedWith.${index}.email` as const)}
                    placeholder="Share With (Optional)"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="h-2" />
              <Button
                className="w-full"
                type="button"
                onClick={() => append({ email: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Email To Share
              </Button>
            </div>
            <div className="h-2" />
            <Button type="submit" disabled={isSubmitting}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
