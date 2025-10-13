import { Button } from "@/components/ui/button"
import { Calendar, Heart, Search, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="page-bg">
      {/* Header */}
      <header className="border-b border-orange-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo.jpeg" alt="Bonsai Care Logo" width={48} height={48} className="rounded-full" />
            <h1 className="text-2xl font-bold text-[#3D2520]">Bonsai Care</h1>
          </Link>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="border-[#D97941] text-[#D97941] hover:bg-orange-50 bg-transparent"
            >
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-[#D97941] hover:bg-[#C86830] text-white">
              <Link href="/auth/signup">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-[#3D2520] text-balance">
            Cuide dos seus bonsais com amor e dedicação
          </h2>
          <p className="text-xl text-[#5A4037] text-pretty">
            Gerencie suas plantas, acompanhe a evolução, compartilhe com a comunidade e nunca esqueça dos cuidados
            essenciais.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-[#D97941] hover:bg-[#C86830] text-white">
              <Link href="/auth/signup">Começar agora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#D97941] text-[#D97941] hover:bg-orange-50 bg-transparent"
            >
              <Link href="/auth/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Image src="/images/logo.jpeg" alt="Plant" width={32} height={32} className="rounded" />
            </div>
            <h3 className="text-lg font-semibold text-[#3D2520] mb-2">Gestão de Plantas</h3>
            <p className="text-[#5A4037] text-sm">
              Cadastre e gerencie todas as informações dos seus bonsais em um só lugar.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-[#D97941]" />
            </div>
            <h3 className="text-lg font-semibold text-[#3D2520] mb-2">Calendário de Cuidados</h3>
            <p className="text-[#5A4037] text-sm">Receba lembretes de rega e exposição ao sol para nunca esquecer.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-[#D97941]" />
            </div>
            <h3 className="text-lg font-semibold text-[#3D2520] mb-2">Feed Social</h3>
            <p className="text-[#5A4037] text-sm">
              Compartilhe a evolução das suas plantas e interaja com outros cultivadores.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-[#D97941]" />
            </div>
            <h3 className="text-lg font-semibold text-[#3D2520] mb-2">Busca e Descoberta</h3>
            <p className="text-[#5A4037] text-sm">Encontre outras plantas, usuários e inspire-se com a comunidade.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#D97941] to-[#C86830] rounded-2xl p-12 text-center text-white">
          <Users className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Junte-se à comunidade de cultivadores</h2>
          <p className="text-lg mb-8 text-orange-50 max-w-2xl mx-auto">
            Milhares de pessoas já estão cuidando melhor dos seus bonsais com nossa plataforma.
          </p>
          <Button asChild size="lg" className="bg-white text-[#D97941] hover:bg-orange-50">
            <Link href="/auth/signup">Criar conta grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-[#5A4037]">
          <p className="text-sm">
            © 2025 Bonsai Care. Feito com <Heart className="inline h-4 w-4 text-red-500" /> para cultivadores de bonsai.
          </p>
        </div>
      </footer>
    </div>
  )
}
