import { BetterAuthClientPlugin } from 'better-auth'
import type { registerNumber } from '.'

export const registerNumberClient = () => {
  return {
    id: 'registerNumber',
    $InferServerPlugin: {} as ReturnType<typeof registerNumber>
  } satisfies BetterAuthClientPlugin
}
