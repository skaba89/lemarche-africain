'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-[#B12704]" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
      <p className="text-gray-500 text-center mb-2 max-w-md">
        Nous sommes d&eacute;sol&eacute;s, une erreur inattendue s&apos;est produite.
        Veuillez r&eacute;essayer ou retourner &agrave; l&apos;accueil.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6">Code d&apos;erreur : {error.digest}</p>
      )}
      {!error.digest && <div className="mb-6" />}
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="bg-[#1B5E20] hover:bg-[#145218] text-white px-6 py-5 text-sm font-semibold rounded-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          R&eacute;essayer
        </Button>
        <Link href="/">
          <Button variant="outline" className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9] px-6 py-5 text-sm rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>
        </Link>
      </div>
      <Link href="/aide" className="mt-6 text-sm text-[#1B5E20] hover:underline">
        Besoin d&apos;aide ? Contactez notre service client
      </Link>
    </div>
  );
}
