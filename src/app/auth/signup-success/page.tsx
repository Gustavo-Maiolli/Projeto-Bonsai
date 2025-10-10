import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-emerald-900">Bonsai Care</h1>
          </div>
          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-center text-emerald-900">Verifique seu email</CardTitle>
              <CardDescription className="text-center">Enviamos um link de confirmação para seu email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Clique no link que enviamos para confirmar sua conta e começar a usar o Bonsai Care.
              </p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/login">Voltar para login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
