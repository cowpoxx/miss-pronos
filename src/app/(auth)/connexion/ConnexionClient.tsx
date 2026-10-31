'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function ConnexionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const callbackUrl = searchParams.get('callbackUrl') || '/mes-groupes'
  const verify = searchParams.get('verify')
  const errorParam = searchParams.get('error')

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setIsLoading(true)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setIsLoading(false)
    if (result?.error) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  if (verify) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="font-display text-3xl font-bold mb-2">Vérifiez votre boîte mail</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Un lien de connexion vous a été envoyé. Cliquez dessus pour vous connecter.
          </p>
          <Link href="/connexion" className="mt-6 inline-block text-primary-600 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Connexion</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Connectez-vous pour accéder à vos groupes</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {errorParam && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            Erreur de connexion. Veuillez réessayer.
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="vous@email.fr"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="current-password"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('email', { callbackUrl })}
          disabled={isLoading}
          className="w-full py-3 px-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors"
        >
          Lien magique par email
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Pas de compte ?{' '}
          <Link href="/inscription" className="text-primary-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        {children}
      </div>
    </div>
  )
}