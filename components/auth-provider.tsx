"use client";

import { supabase } from "@/lib/supabase";
import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("docuwrite_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log(authData);
      const userId = authData?.user?.id;
      console.log("userId: " + userId);
      const { data: dataRes } = await supabase
        .from("users_data")
        .select("*")
        .eq("id", userId);
      const res = dataRes?.[0];

      setUser({
        id: res.id,
        name: res.name,
        email: res.email,
        avatar: res.avatar,
      });

      if (authError) {
        throw new Error("Login Error: " + authError.message);
      }
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong loggin in");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      const userId = authData?.user?.id;
      if (userId) {
        const { data: insertData, error: insertError } = await supabase
          .from("users_data")
          .insert([
            {
              id: userId,
              email,
              name,
              password,
            },
          ])
          .select();

        const fetchedUser = insertData?.[0];

        setUser({
          id: fetchedUser.id,
          email: fetchedUser.email,
          name: fetchedUser.name,
          avatar: fetchedUser.avater,
        });

        if (insertError) {
          throw new Error("SignUp Error: " + insertError.message);
        }
      }

      if (authError) {
        throw new Error("SignUp Error: " + authError.message);
      }
    } catch (error: any) {
      throw new Error(
        error.message || "Something went wrong during registration."
      );
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("docuwrite_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
