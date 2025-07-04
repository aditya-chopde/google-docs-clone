"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DocumentEditor } from "@/components/document-editor"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  collaborators: string[]
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const docId = params.id as string
    const savedDocs = localStorage.getItem("docuwrite_documents")

    if (savedDocs) {
      const documents = JSON.parse(savedDocs)
      const foundDoc = documents.find((doc: any) => doc.id === docId)

      if (foundDoc) {
        setDocument({
          ...foundDoc,
          createdAt: new Date(foundDoc.createdAt),
          updatedAt: new Date(foundDoc.updatedAt),
        })
      } else {
        router.push("/")
      }
    } else {
      router.push("/")
    }

    setLoading(false)
  }, [params.id, user, router])

  const updateDocument = (updates: Partial<Document>) => {
    if (!document) return

    const updatedDoc = { ...document, ...updates, updatedAt: new Date() }
    setDocument(updatedDoc)

    // Update localStorage
    const savedDocs = localStorage.getItem("docuwrite_documents")
    if (savedDocs) {
      const documents = JSON.parse(savedDocs)
      const updatedDocs = documents.map((doc: any) => (doc.id === document.id ? updatedDoc : doc))
      localStorage.setItem("docuwrite_documents", JSON.stringify(updatedDocs))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document not found</h1>
          <p className="text-gray-600">The document you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return <DocumentEditor document={document} onUpdate={updateDocument} />
}
