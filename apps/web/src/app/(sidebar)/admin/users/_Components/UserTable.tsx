'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { authClient } from '@/utils/auth-client'

import { BanUserDialog } from './BanUserDialog'
import { SessionsDialog } from './SessionsDialog'
import { SetPasswordDialog } from './SetPasswordDialog'
import { UserDetailDialog } from './UserDetailDialog'

export interface UserData {
  id: string
  name: string
  email: string
  role: string
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
  createdAt: Date
  registerNumber?: string
  systemId?: string
}

export function UserTable() {
  const [users, setUsers] = React.useState<UserData[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchValue, setSearchValue] = React.useState('')
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20
  })

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    // 서버 측 정렬. 'name' 컬럼은 표시값("성 이니셜.이름")이 아니라
    // 이름 컬럼(firstName) 기준으로 정렬해야 성이 아닌 이름순이 된다.
    const sort = sorting[0]
    const sortBy = sort
      ? sort.id === 'name'
        ? 'firstName'
        : sort.id
      : undefined
    try {
      const result = await authClient.admin.listUsers({
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          searchValue: searchValue || undefined,
          searchField: 'name',
          searchOperator: 'contains',
          ...(sortBy
            ? { sortBy, sortDirection: sort?.desc ? 'desc' : 'asc' }
            : {})
        }
      })
      if (result.data) {
        setUsers(result.data.users as UserData[])
        setTotal(result.data.total)
      }
    } catch {
      toast.error('Failed to fetch users')
    }
    setLoading(false)
  }, [pagination.pageIndex, pagination.pageSize, searchValue, sorting])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUnban = async (userId: string) => {
    const result = await authClient.admin.unbanUser({ userId })
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('User unbanned')
      fetchUsers()
    }
  }

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      )
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('email')}</div>
    },
    {
      accessorKey: 'registerNumber',
      header: 'Register Number',
      cell: ({ row }) => <div>{row.getValue('registerNumber') || '-'}</div>
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
            {role}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'banned',
      header: 'Status',
      cell: ({ row }) => {
        const banned = row.getValue('banned')
        return banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <UserDetailDialog user={user} onSuccess={fetchUsers}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  View details
                </DropdownMenuItem>
              </UserDetailDialog>
              <SessionsDialog userId={user.id} userName={user.name}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Manage sessions
                </DropdownMenuItem>
              </SessionsDialog>
              <SetPasswordDialog userId={user.id} userName={user.name}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Set password
                </DropdownMenuItem>
              </SetPasswordDialog>
              <DropdownMenuSeparator />
              {user.banned ? (
                <DropdownMenuItem onClick={() => handleUnban(user.id)}>
                  Unban user
                </DropdownMenuItem>
              ) : (
                <BanUserDialog
                  userId={user.id}
                  userName={user.name}
                  onSuccess={fetchUsers}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <span className="text-destructive">Ban user</span>
                  </DropdownMenuItem>
                </BanUserDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, pageIndex: 0 })
    fetchUsers()
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of{' '}
          {total} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination({
                ...pagination,
                pageIndex: pagination.pageIndex - 1
              })
            }
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination({
                ...pagination,
                pageIndex: pagination.pageIndex + 1
              })
            }
            disabled={(pagination.pageIndex + 1) * pagination.pageSize >= total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
