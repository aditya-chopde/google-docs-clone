"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentEditor } from "@/components/document-editor";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[];
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentDocument = async (docId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();
    if (data) {
      setDocument(data as Document);
    }

    if (error) {
      console.error("Error fetching document:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const docId = params.id as string;

    fetchCurrentDocument(docId);
    setLoading(false);
  }, [params.id, user, router]);

  const updateDocument = async (updates: Partial<Document>) => {
    if (!document) return;
    console.log("updating the docs: ", document.id);
    const updatedDoc = { ...document, ...updates, updatedAt: new Date() };
    setDocument(updatedDoc);
    console.log(updatedDoc);

    const { data, error } = await supabase
      .from("documents")
      .update(updatedDoc)
      .eq("id", document.id)
      .select()
      .single();
    if (data) {
      console.log("Document Updated in DB: ", data);
    }

    if (error) {
      toast({
        title: "Error updating document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Document not found
          </h1>
          <p className="text-gray-600">
            The document you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <DocumentEditor document={document} onUpdate={updateDocument} />;
}
