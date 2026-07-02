import apiClient from './client';

export interface Concept {
  id: string;
  name: string;
  description?: string;
  category?: string;
  orderIndex?: number;
  parentId?: string;
  isMaterialOnly?: boolean;
  children?: Concept[];
  problems?: Problem[];
}

export interface PlatformLink {
  id: string;
  platformName: string;
  url: string;
}

export interface ProblemVideo {
  id: string;
  title: string;
  url: string;
}

export interface Problem {
  id: string;
  title: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime?: string;
  constraints?: string;
  conceptId?: string;
  problemLink?: string;
  youtubeLink?: string;
  documentationLink?: string;
  bruteSolution?: string; // Keeping these temporarily optional so old typescript code doesn't break if still accessed directly anywhere before cleanup
  betterSolution?: string;
  optimalSolution?: string;
  additionalSolutions?: string[];
  orderIndex?: number;
  category?: string;
  platformLinks?: PlatformLink[];
  videos?: ProblemVideo[];
  solutions?: Solution[];
}

export interface Solution {
  id?: string;
  language: string;
  bruteSolution?: string;
  betterSolution?: string;
  optimalSolution?: string;
  additionalSolutions?: string[];
}

export const roadmapApi = {
  getAllConcepts: async (): Promise<Concept[]> => {
    const response = await apiClient.get<Concept[]>('/concepts');
    return response.data;
  },

  getConceptsByCategory: async (category: string): Promise<Concept[]> => {
    const response = await apiClient.get<Concept[]>(`/concepts/category/${category}`);
    return response.data;
  },

  getSubConcepts: async (parentId: string): Promise<Concept[]> => {
    const response = await apiClient.get<Concept[]>(`/concepts/${parentId}/children`);
    return response.data;
  },

  searchConcepts: async (q: string): Promise<Concept[]> => {
    const response = await apiClient.get<Concept[]>(`/concepts/search?q=${encodeURIComponent(q)}`);
    return response.data;
  },
  
  getProblemsByConcept: async (conceptId: string): Promise<Problem[]> => {
    const response = await apiClient.get<Problem[]>(`/problems/concept/${conceptId}`);
    return response.data;
  },

  getAllProblems: async (): Promise<Problem[]> => {
    const response = await apiClient.get<Problem[]>('/problems');
    return response.data;
  },

  getProblemById: async (id: string): Promise<Problem> => {
    const response = await apiClient.get<Problem>(`/problems/${id}`);
    return response.data;
  },

  searchProblems: async (q: string): Promise<Problem[]> => {
    const response = await apiClient.get<Problem[]>(`/problems/search?q=${encodeURIComponent(q)}`);
    return response.data;
  },

  filterProblems: async (difficulty: string): Promise<Problem[]> => {
    const response = await apiClient.get<Problem[]>(`/problems/filter?difficulty=${encodeURIComponent(difficulty)}`);
    return response.data;
  },

  getSolutions: async (problemId: string): Promise<Solution[]> => {
    const response = await apiClient.get<Solution[]>(`/solutions/problem/${problemId}`);
    return response.data;
  }
};
