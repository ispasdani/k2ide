// store/commitsStore.ts
import { create } from "zustand";
import { Commit } from "@/lib/commits";
import { Id } from "@/convex/_generated/dataModel";

type CommitsState = {
  projectId: Id<"project"> | null; // Add projectId
  savedCommits: Record<string, Commit[] | undefined>; // Keyed by projectId
  displayPage: Record<string, number>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  setProjectId: (projectId: Id<"project"> | null) => void; // Add setter
  setSavedCommits: (projectId: string, commits: Commit[] | undefined) => void;
  setDisplayPage: (projectId: string, page: number) => void;
  setLoading: (projectId: string, loading: boolean) => void;
  setError: (projectId: string, error: string | null) => void;
};

export const useCommitsStore = create<CommitsState>((set) => ({
  projectId: null, // Initial value
  savedCommits: {},
  displayPage: {},
  loading: {},
  error: {},
  setProjectId: (projectId) => set({ projectId }),
  setSavedCommits: (projectId, commits) =>
    set((state) => ({
      savedCommits: { ...state.savedCommits, [projectId]: commits },
    })),
  setDisplayPage: (projectId, page) =>
    set((state) => ({
      displayPage: { ...state.displayPage, [projectId]: page },
    })),
  setLoading: (projectId, loading) =>
    set((state) => ({ loading: { ...state.loading, [projectId]: loading } })),
  setError: (projectId, error) =>
    set((state) => ({ error: { ...state.error, [projectId]: error } })),
}));
