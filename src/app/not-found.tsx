import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 rounded-full bg-[#E8F5E9] dark:bg-[#1B5E20]/20 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-[#1B5E20]" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page introuvable</h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-md">
        La page que vous recherchez n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;e.
        V&eacute;rifiez l&apos;URL ou retournez &agrave; l&apos;accueil.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white px-6 py-5 text-sm font-semibold rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            Retour &agrave; l&apos;accueil
          </Button>
        </Link>
        <Link href="/recherche">
          <Button variant="outline" className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] dark:hover:bg-[#1B5E20]/20 px-6 py-5 text-sm rounded-lg">
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
        </Link>
      </div>
      <Link href="/aide" className="mt-6 text-sm text-[#1B5E20] hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" />
        Besoin d&apos;aide ?
      </Link>
    </div>
  );
}
