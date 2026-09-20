"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  mode: "login" | "signup"
}

export function AuthForm({ mode, className, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const router = useRouter()

  const isLogin = mode === "login"
  const title = isLogin ? "Welcome back" : "Create an account"
  const description = isLogin ? "Enter your email and password to sign in" : "Enter your details to create an account"
  const buttonText = isLogin ? "Sign In" : "Sign Up"
  const linkText = isLogin ? "Don't have an account?" : "Already have an account?"
  const linkLabel = isLogin ? "Sign up" : "Sign in"
  const linkHref = isLogin ? "/signup" : "/login"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
        })

        if (error) {
          setError(error.message || "Failed to sign in")
          setIsLoading(false)
          return
        }

        router.push("/")
      } else {
        const { error } = await authClient.signUp.email({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
        })

        if (error) {
          setError(error.message || "Failed to create account")
          setIsLoading(false)
          return
        }

        router.push("/")
      }
    } catch {
      setError(isLogin ? "Failed to sign in" : "Failed to create account")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-cinema-gold/30 bg-white/5 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white font-limelight">{title}</CardTitle>
          <CardDescription className="text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/30 rounded p-3">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-cinema-gold">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-cinema-gold/30 text-white placeholder:text-gray-500 hover:border-cinema-gold/50 focus:border-cinema-gold transition-colors"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-cinema-gold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-white/10 border-cinema-gold/30 text-white placeholder:text-gray-500 hover:border-cinema-gold/50 focus:border-cinema-gold transition-colors"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-cinema-gold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
                disabled={isLoading}
                className="bg-white/10 border-cinema-gold/30 text-white placeholder:text-gray-500 hover:border-cinema-gold/50 focus:border-cinema-gold transition-colors"
              />
              {!isLogin && (
                <p className="text-xs text-gray-400">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-cinema-gold text-cinema-black font-semibold hover:bg-yellow-300 hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                buttonText
              )}
            </Button>

            <div className="text-center text-sm text-gray-400">
              {linkText}{" "}
              <Link href={linkHref} className="text-cinema-gold hover:text-yellow-300 underline underline-offset-4 transition">
                {linkLabel}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-gray-500 [&_a]:text-cinema-gold [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-yellow-300 [&_a]:transition">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}