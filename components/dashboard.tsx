"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Document {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[];
}

export function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select()
      .eq("owner_id", user?.id || "")
      .order("updatedAt", { ascending: false });

    if (data) {
      setDocuments(data);
    }

    if (error) {
      toast({
        title: "Error Fetching Documents",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const createDocument = async () => {
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          owner_id: user?.id || "",
          title: "Untitle Document",
          content: "",
          collaborators: [user?.id || ""],
        },
      ])
      .select()
      .single();

    fetchDocs();

    if (data) {
      toast({
        title: "Document created",
        description: "Your new document has been created successfully.",
      });
    }

    if (error) {
      toast({
        title: "Error Ocurred",
        description: error.message,
        variant: "destructive",
      });
    }

    router.push(`/doc/${data.id}`);
  };

  const deleteDocument = async (docId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("id", docId)
      .select();

    if (error) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      })
    }
    toast({
      title: "Document deleted",
      description: "The document has been permanently deleted.",
    });
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const newDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - newDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return newDate.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                logout();
                // This will redirect to landing page since user will be null
              }}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">DocuWrite</h1>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.name}
                    />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Documents</h2>
            <p className="text-gray-600 mt-1">
              Create and manage your documents
            </p>
          </div>
          <Button
            onClick={createDocument}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </Button>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first document to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={createDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors"
                          onClick={() => router.push(`/doc/${doc.id}`)}
                        >
                          {doc.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/doc/${doc.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteDocument(doc.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-sm text-gray-600 line-clamp-3 mb-4"
                      onClick={() => router.push(`/doc/${doc.id}`)}
                    >
                      {doc.content
                        ? doc.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 100) + "..."
                        : "No content yet..."}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <Users className="h-3 w-3" />
                        <span>{doc.collaborators.length}</span>
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {doc.content.length} characters
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
