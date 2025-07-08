'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  User as UserIcon,
  ArrowUpDown
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { User, UserFilters } from '@/types/user'
import { RoleBadge } from '@/components/admin/users/RoleBadge'
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog'
import { UserForm } from '@/components/admin/users/UserForm'
import { InviteUser } from '@/components/admin/users/InviteUser'


interface UsersClientProps {
  initialUsers: User[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const result = await response.json()
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }
      
      setUsers(result.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    }
  }, [filters, toast])



  const handleSort = (column: UserFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  const openEditForm = (user: User) => {
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

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      if (filters.search && !user.full_name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const aValue = a[filters.sortBy] || ''
      const bValue = b[filters.sortBy] || ''
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  return (
    <div className="container mx-auto py-6">
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
              <span>{filteredUsers.length} users</span>
              <span>•</span>
              <span>{filteredUsers.filter(u => u.role === 'admin').length} admins</span>
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
            <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value as any }))}>
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
            {filteredUsers.length === 0 ? (
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
                    {filteredUsers.map((user) => (
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
    </div>
  )
} 