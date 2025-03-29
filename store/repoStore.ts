// store/repoStore.ts
import { create } from "zustand";

export interface RepoFile {
  _id: string;
  projectId: string;
  filePath: string;
  content: string;
  metadata: {
    source: string;
  };
}

interface RepoStore {
  repoFiles: RepoFile[];
  setRepoFiles: (files: RepoFile[]) => void;
  clearRepoFiles: () => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  repoFiles: [],
  setRepoFiles: (files) => set({ repoFiles: files }),
  clearRepoFiles: () => set({ repoFiles: [] }),
}));
