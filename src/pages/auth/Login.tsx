import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            GetGrip Admin
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-primary relative hidden lg:flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-primary to-primary/60" />
        <div className="relative z-10 text-primary-foreground text-center p-10">
          <GalleryVerticalEnd className="size-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">GetGrip</h2>
          <p className="text-lg opacity-90">Phone Cover Admin Panel</p>
        </div>
      </div>
    </div>
  )
}
