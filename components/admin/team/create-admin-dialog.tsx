'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { createAdminWithUsername } from '@/app/admin/team/admin-username-actions'

interface Role {
  id: string
  name: string
  display_name: string
}

export function CreateAdminDialog({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [issued, setIssued] = useState<{ username: string; tempPassword: string } | null>(null)

  const reset = () => {
    setUsername('')
    setDisplayName('')
    setEmail('')
    setRoleId('')
    setIssued(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleId) {
      toast.error('Choose a role')
      return
    }
    setLoading(true)
    try {
      const res = await createAdminWithUsername({ username, displayName, roleId, email: email || undefined })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setIssued({ username: res.username, tempPassword: res.tempPassword })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <KeyRound className="mr-2 h-4 w-4" />
          Create admin login
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create admin login</DialogTitle>
          <DialogDescription>
            They sign in with a username and a temporary password, and must set a new password on first login.
          </DialogDescription>
        </DialogHeader>
        {issued ? (
          <div className="space-y-3">
            <p className="text-sm">
              Account <span className="font-mono">{issued.username}</span> created. Share this temporary password
              privately. It is shown only once.
            </p>
            <Input readOnly value={issued.tempPassword} className="font-mono" onFocus={(e) => e.currentTarget.select()} />
            <Button
              className="w-full rounded-full"
              onClick={async () => {
                await navigator.clipboard.writeText(issued.tempPassword)
                toast.success('Copied')
              }}
            >
              Copy password
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ca-username">Username</Label>
              <Input
                id="ca-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                pattern="[a-z0-9._\-]{3,32}"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <p className="text-xs text-muted-foreground">3-32 characters: a-z, 0-9, dot, dash, underscore.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-name">Display name</Label>
              <Input id="ca-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-email">Email (optional)</Label>
              <Input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create login'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
