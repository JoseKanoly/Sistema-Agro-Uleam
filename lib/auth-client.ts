'use client'

import { createAuthClient } from 'better-auth/react'

// Do NOT pass baseURL — better-auth/react will default to the current
// window origin and append /api/auth automatically. Passing a wrong
// baseURL is the most common cause of "Invalid origin" errors.
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
