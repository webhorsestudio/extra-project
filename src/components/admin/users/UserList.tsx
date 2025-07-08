'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Search, 
  Edit,
  Mail,
  Calendar,
} from 'lucide-react'
import { User, UserFilters } from '@/types/user'
import { RoleBadge } from './RoleBadge'
import { DeleteUserDialog } from './DeleteUserDialog'
import { UserForm } from './UserForm'
import { InviteUser } from './InviteUser'
import { ArrowUpDown } from 'lucide-react'


export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
      if (process.env.NODE_ENV === 'development') {
        headers['x-bypass-auth'] = 'true'
      }
      const response = await fetch(`/api/users?${params}`, { headers })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const text = await response.text()
      if (!text || text.trim() === '') { setUsers([]); return }
      let result
      try { result = JSON.parse(text) } catch (_parseError) { setUsers([]); return }
      if (!result || typeof result !== 'object') { setUsers([]); return }
      if (result.error) { setUsers([]); return }
      const transformedUsers: User[] = result.users?.map((user: unknown) => ({
        id: (user as { id: string }).id,
        email: (user as { email: string }).email,
        full_name: (user as { full_name?: string }).full_name,
        role: (user as { role: string }).role,
        created_at: (user as { created_at: string }).created_at,
        updated_at: (user as { updated_at: string }).updated_at
      })) || []
      setUsers(transformedUsers)
    } catch (_error) {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])



  const handleSort = (column: UserFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const openEditForm = (user: User) => {
    console.log('UserList: Opening edit form for user:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      roleType: typeof user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    })
    
    // Check if role is valid
    const validRoles = ['admin', 'agent', 'customer']
    if (!validRoles.includes(user.role)) {
      console.warn('UserList: Invalid role detected:', user.role)
    }
    
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSortIcon = (column: UserFilters['sortBy']) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return filters.sortOrder === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 rotate-180" /> : 
      <ArrowUpDown className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{users.length} users</span>
            <span>•</span>
            <span>{users.filter(u => u.role === 'admin').length} admins</span>
          </div>

        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value as UserFilters['role'] }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowInviteForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filters.search || filters.role !== 'all' 
                  ? 'No users found' 
                  : 'No users yet'
                }
              </h3>
              <p className="text-muted-foreground">
                {filters.search || filters.role !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Invite users to get started'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('full_name')}
                        className="h-auto p-0 font-semibold"
                      >
                        Name {getSortIcon('full_name')}
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-semibold"
                      >
                        Created {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'No name'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteUserDialog
                            user={user}
                            onDelete={fetchUsers}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Form */}
      <InviteUser 
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onUserCreated={() => {
          setShowInviteForm(false)
          fetchUsers()
        }} 
      />

      {/* Edit User Form */}
      <UserForm
        key={selectedUser?.id}
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedUser(null)
        }}
        onSave={() => {
          fetchUsers()
          setIsFormOpen(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
} 