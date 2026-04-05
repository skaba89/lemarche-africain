'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, type AuthUser } from '@/store/auth-store';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: (user: AuthUser) => void;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState(defaultMode);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Save trigger element and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setMode(defaultMode);
      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  }, [isOpen, defaultMode]);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<HTMLInputElement>('input:not([tabIndex="-1"])');
      if (firstInput) firstInput.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, mode]);

  // Focus trap inside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const modal = modalRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = modal.querySelectorAll<HTMLElement>(
        'input:not([tabIndex="-1"]), button:not([tabIndex="-1"]), select, textarea, [href]'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoginLoading(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      if (user) {
        toast.success(`Bienvenue${user.name ? ', ' + user.name : ''} !`);
        onSuccess?.(user);
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (regPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setRegLoading(true);
    try {
      const user = await register({
        email: regEmail.trim(),
        name: regName.trim(),
        phone: regPhone.trim() || undefined,
        password: regPassword,
      });
      if (user) {
        toast.success('Compte cree avec succes !');
        onSuccess?.(user);
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setRegLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Se connecter' : 'Creer un compte'}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Le Marche Africain</h2>
          <p className="text-sm text-white/80 mt-0.5">
            {mode === 'login' ? 'Connectez-vous a votre compte' : 'Creez votre compte gratuitement'}
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
            <TabsList className="w-full mb-5">
              <TabsTrigger value="login" className="flex-1">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Inscription</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white h-11"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-[#1B5E20] font-medium hover:underline"
                  >
                    Inscrivez-vous
                  </button>
                </p>
              </div>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-name"
                      placeholder="Ex : Mamadou Diallo"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Adresse e-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Telephone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+224 6XX XX XX XX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="pl-9"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mot de passe * <span className="text-gray-400 font-normal">(min. 6 car.)</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Confirmez votre mot de passe"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="pl-9"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#1B5E20] hover:bg-[#145218] text-white h-11 mt-2"
                >
                  {regLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Creer mon compte
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Deja un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#1B5E20] font-medium hover:underline"
                  >
                    Connectez-vous
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
