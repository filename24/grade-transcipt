import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements
} from 'better-auth/plugins/admin/access'

// Use default admin statements (user, session permissions)
const statement = {
  ...defaultStatements
} as const

export const ac = createAccessControl(statement)

// ADMIN role with full admin permissions
export const ADMIN = ac.newRole({
  user: [
    'create',
    'list',
    'set-role',
    'ban',
    'impersonate',
    'delete',
    'set-password'
  ],
  session: ['list', 'revoke', 'delete']
})

// TEACHER role - no admin permissions
export const TEACHER = ac.newRole({
  user: [],
  session: []
})

// STUDENT role - no admin permissions
export const STUDENT = ac.newRole({
  user: [],
  session: []
})
