"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { RichTextEditor } from "@/components/optimized-rich-text-editor"
import {
  ArrowLeft,
  FileText,
  Users,
  Share2,
  UserPlus,
  MoreHorizontal,
  Crown,
  Eye,
  Edit3,
  X,
  Copy,
  Mail,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  collaborators: string[]
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  role: "owner" | "editor" | "viewer"
  isOnline: boolean
  lastSeen?: Date
  cursor?: { x: number; y: number }
}

interface DocumentEditorProps {
  document: Document
  onUpdate: (updates: Partial<Document>) => void
}

// Add debounce utility function before the component
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  } as T
}


export function DocumentEditor({ document, onUpdate }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(document.content)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(document.updatedAt)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor")
  const [isInviting, setIsInviting] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Enhanced mock collaborators with more realistic data
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: user?.id || "current-user",
      name: user?.name || "You",
      email: user?.email || "you@example.com",
      avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
      role: "owner",
      isOnline: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      role: "editor",
      isOnline: true,
      cursor: { x: 45, y: 120 },
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@company.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      role: "editor",
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@company.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      role: "viewer",
      isOnline: true,
    },
  ])

  const saveDocument = useCallback(
    debounce(async (titleToSave: string, contentToSave: string) => {
      setIsSaving(true)
      try {
        onUpdate({ title: titleToSave, content: contentToSave })
        setLastSaved(new Date())
      } finally {
        setIsSaving(false)
      }
    }, 3000), // Increased debounce to 3 seconds
    [onUpdate],
  )

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  useEffect(() => {
    if (title !== document.title || content !== document.content) {
      saveDocument(title, content)
    }
  }, [title, content, document.title, document.content, saveDocument])

  const handleInviteCollaborator = async () => {
    if (!inviteEmail) return

    setIsInviting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`,
      role: inviteRole,
      isOnline: false,
    }

    setCollaborators((prev) => [...prev, newCollaborator])
    setInviteEmail("")
    setIsInviting(false)

    toast({
      title: "Invitation sent!",
      description: `${inviteEmail} has been invited to collaborate.`,
    })
  }

  const removeCollaborator = (collaboratorId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
    toast({
      title: "Collaborator removed",
      description: "The collaborator has been removed from this document.",
    })
  }

  const updateCollaboratorRole = (collaboratorId: string, newRole: "editor" | "viewer") => {
    setCollaborators((prev) => prev.map((c) => (c.id === collaboratorId ? { ...c, role: newRole } : c)))
    toast({
      title: "Role updated",
      description: "Collaborator role has been updated successfully.",
    })
  }

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied!",
      description: "Document link has been copied to clipboard.",
    })
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) return "Saved just now"
    if (diffInMinutes < 60) return `Saved ${Math.floor(diffInMinutes)} minutes ago`
    return `Saved at ${date.toLocaleTimeString()}`
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const onlineCollaborators = useMemo(() => collaborators.filter((c) => c.isOnline), [collaborators])
  const currentUserRole = useMemo(
    () => collaborators.find((c) => c.id === user?.id)?.role || "viewer",
    [collaborators, user?.id],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Back</span>
              </Button>

              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg"
                >
                  <FileText className="h-6 w-6 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-none shadow-none text-xl font-bold p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-gray-400"
                    placeholder="Untitled Document"
                    disabled={currentUserRole === "viewer"}
                  />
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                    {isSaving ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="font-medium">Saving...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span>{formatLastSaved(lastSaved)}</span>
                      </motion.div>
                    )}
                    <div className="h-1 w-1 bg-gray-300 rounded-full" />
                    <span className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Encrypted</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Collaborators Section */}
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-3">
                  {onlineCollaborators.slice(0, 4).map((collaborator, index) => (
                    <motion.div
                      key={collaborator.id}
                      initial={{ scale: 0, x: 20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <Avatar className="h-10 w-10 border-3 border-white shadow-lg ring-2 ring-blue-100 transition-all duration-200 group-hover:ring-blue-200">
                        <AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                      {collaborator.role === "owner" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Crown className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                  {onlineCollaborators.length > 4 && (
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 border-3 border-white rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 shadow-lg">
                      +{onlineCollaborators.length - 4}
                    </div>
                  )}
                </div>

                {/* Premium Invite Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 rounded-xl shadow-sm"
                      disabled={currentUserRole === "viewer"}
                    >
                      <UserPlus className="h-4 w-4 text-blue-600" />
                      <span className="hidden sm:inline text-blue-700 font-medium">Invite</span>
                      <Sparkles className="h-3 w-3 text-blue-500" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <span>Invite Collaborators</span>
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Share this document with others to collaborate in real-time.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold">
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-semibold">
                          Permission level
                        </Label>
                        <Select value={inviteRole} onValueChange={(value: "editor" | "viewer") => setInviteRole(value)}>
                          <SelectTrigger className="h-11 rounded-xl bg-gray-50/50 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-green-100 rounded">
                                  <Edit3 className="h-3 w-3 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Can edit</p>
                                  <p className="text-xs text-gray-500">Full editing access</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="viewer">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-blue-100 rounded">
                                  <Eye className="h-3 w-3 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Can view</p>
                                  <p className="text-xs text-gray-500">Read-only access</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleInviteCollaborator}
                          disabled={!inviteEmail || isInviting}
                          className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-xl shadow-lg"
                        >
                          {isInviting ? (
                            <>
                              <Zap className="h-4 w-4 mr-2 animate-pulse" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invite
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={shareDocument}
                          className="h-11 px-4 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Premium Share Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareDocument}
                  className="flex items-center space-x-2 bg-white/80 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-xl shadow-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Share</span>
                </Button>
              </div>

              {/* Enhanced User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-gray-100 hover:ring-gray-200 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem className="font-normal p-4 rounded-xl">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {currentUserRole}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl m-1"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Premium Collaboration Status Bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-sm" />
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-medium">
                  {onlineCollaborators.length} online
                </Badge>
              </motion.div>

              <div className="flex items-center space-x-4">
                {onlineCollaborators.slice(0, 3).map((collaborator, index) => (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <div className="h-2 w-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                    <span className="hidden sm:inline font-medium">
                      {collaborator.id === user?.id ? "You" : collaborator.name.split(" ")[0]}
                      {collaborator.cursor && " is editing"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Collaborators Management */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-white/80 rounded-xl transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{collaborators.length} collaborators</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-96 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl"
                align="end"
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-4 text-lg">Document collaborators</h4>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                              <AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
                              <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {collaborator.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {collaborator.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold truncate">{collaborator.name}</p>
                              {collaborator.role === "owner" && (
                                <div className="p-1 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                                  <Crown className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
                            {!collaborator.isOnline && collaborator.lastSeen && (
                              <p className="text-xs text-gray-400">Last seen {formatLastSeen(collaborator.lastSeen)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {collaborator.role !== "owner" && currentUserRole === "owner" && (
                            <>
                              <Select
                                value={collaborator.role}
                                onValueChange={(value: "editor" | "viewer") =>
                                  updateCollaboratorRole(collaborator.id, value)
                                }
                              >
                                <SelectTrigger className="w-24 h-8 text-xs rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCollaborator(collaborator.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {collaborator.role === "owner" && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                            >
                              Owner
                            </Badge>
                          )}
                          {collaborator.role !== "owner" && currentUserRole !== "owner" && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {collaborator.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Premium Editor Container */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
          <RichTextEditor content={content} onChange={handleContentChange} readOnly={currentUserRole === "viewer"} />
        </div>
      </main>

      {/* Floating Collaboration Cursors */}
      <AnimatePresence>
        {collaborators
          .filter((c) => c.cursor && c.isOnline && c.id !== user?.id)
          .map((collaborator) => (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed pointer-events-none z-50"
              style={{
                left: collaborator.cursor!.x,
                top: collaborator.cursor!.y,
              }}
            >
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-full text-xs shadow-2xl backdrop-blur-sm">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                <span className="font-medium">{collaborator.name.split(" ")[0]}</span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
