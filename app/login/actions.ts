'use server'

import { createClient } from '@/utils/supabase/client' // Pastikan sudah setup server client
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName, // Ini bakal ditangkap sama Trigger SQL yang kita buat tadi
            },
        },
    })

    if (error) {
        return redirect('/login?message=Could not create user')
    }

    return redirect('/login?message=Check email to confirm registration')
}