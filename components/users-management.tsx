"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Save, X } from "lucide-react"

type AuthUser = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")

      if (!response.ok) throw new Error("Failed to fetch users")

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (user: AuthUser) => {
    setEditingUserId(user.id)
    setEditingName(user.full_name || "")
  }

  const cancelEditing = () => {
    setEditingUserId(null)
    setEditingName("")
  }

  const saveUserName = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: editingName }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      await loadUsers()
      setEditingUserId(null)
      setEditingName("")
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Er is een fout opgetreden bij het bijwerken van de gebruiker")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Gebruikers laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gebruikers</h1>
        <p className="text-muted-foreground mt-1">Beheer gebruikersaccounts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek op naam of email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="Volledige naam"
                            className="max-w-xs"
                          />
                          <Button size="sm" onClick={() => saveUserName(user.id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Opslaan
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="font-medium text-lg mt-1">
                          {user.full_name || <span className="text-muted-foreground italic">Geen naam ingesteld</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lid sinds{" "}
                    {new Date(user.created_at).toLocaleDateString("nl-NL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {editingUserId !== user.id && (
                  <Button variant="outline" size="sm" onClick={() => startEditing(user)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Bewerken
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "Geen gebruikers gevonden met deze zoekopdracht" : "Nog geen gebruikers"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
