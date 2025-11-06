import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  sex: 'male' | 'female' | 'other';
  ageGroup: string;
}

export const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {}
});
