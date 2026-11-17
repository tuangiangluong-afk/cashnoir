import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  Unlock,
  Key,
  Shield,
  Search,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Download,
  UploadCloud,
  X,
  Flame,
  ArrowLeft,
  Sliders,
  Users,
  Package,
  Calendar,
  Copy,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { Locale } from '../data/seoContent';

interface ItemDef {
  id: string;
  name: string;
  category: string;
  surfaceDesc?: string;
  clues?: string[];
  uvClues?: string[];
  clueTag?: string;
  baseValue: number;
  hotLevel: number;
  isCustom?: boolean;
  isModified?: boolean;
}

interface CharacterDef {
  id: string;
  firstName: string;
  fullName: string;
  gender: 'm' | 'f';
  age: number;
  job: string;
  faction: string;
  profileId: string;
  secret: string;
  weaknessHint: string;
  redLineHint: string;
  weakKeywords: string;
  angerKeywords: string;
  openingTemplate: string;
  tell: string;
  portraitVisual?: string;
  portraitUrl: string;
  isCustom?: boolean;
  isModified?: boolean;
}

interface ArchetypeDef {
  id: string;
  label: string;
  femaleLabel?: string;
  trait: string;
  femaleTrait?: string;
  weaknessHint: string;
  redLineHint: string;
  baseGauges: {
    peur: number;
    colere: number;
    mefiance: number;
  };
  fearBonus: number;
  angerPenalty: number;
  openings?: string[];
  tells?: string[];
  weakKeywords?: string;
  angerKeywords?: string;
}

interface SeasonDef {
  seasonNumber: number;
  name?: string;
  theme?: string;
  startDate?: string;
  endDate?: string;
  episodes?: Array<{ id: string; title: string; synopsis: string }>;
  rewards?: Array<{ tier: number; xp: number; reward: string }>;
}

interface EcosystemData {
  items: ItemDef[];
  characters: CharacterDef[];
  archetypes: ArchetypeDef[];
  seasons: SeasonDef[];
  factions: Array<{ id: string; name: string; leader: string }>;
  categories: string[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Données': { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Joaillerie': { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Horlogerie': { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'Art': { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Reliques': { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Armement': { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Métaux': { bg: 'bg-zinc-800/40', text: 'text-zinc-300', border: 'border-zinc-500/30' },
};

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  gameLocale?: Locale;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'items' | 'characters' | 'archetypes' | 'seasons' | 'uploads'>('items');

  const [ecosystem, setEcosystem] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [itemSort, setItemSort] = useState<'name' | 'value_desc' | 'value_asc' | 'hot'>('value_desc');

  const [charSearch, setCharSearch] = useState<string>('');
  const [charFactionFilter, setCharFactionFilter] = useState<string>('all');
  const [charProfileFilter, setCharProfileFilter] = useState<string>('all');

  // Modals & Forms
  const [editingItem, setEditingItem] = useState<ItemDef | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);

  const [editingChar, setEditingChar] = useState<CharacterDef | null>(null);
  const [isCharModalOpen, setIsCharModalOpen] = useState<boolean>(false);

  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; name: string; size: number }>>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadFolder, setUploadFolder] = useState<'portraits' | 'uploads'>('portraits');
  const importInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check initial auth status
  useEffect(() => {
    fetchEcosystem()
      .then((data) => {
        if (data) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecking(false));
  }, []);

  const fetchEcosystem = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ecosystem', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setEcosystem(data);
        if (typeof window !== 'undefined') {
          try {
            if (data.items) localStorage.setItem('fence_ecosystem_items', JSON.stringify(data.items));
            if (data.characters) localStorage.setItem('fence_ecosystem_characters', JSON.stringify(data.characters));
          } catch {}
        }
        return data;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        showToast('Accès Administrateur validé.');
        await fetchEcosystem();
      } else {
        setLoginError(data.error || 'Clé d’accès incorrecte.');
      }
    } catch (err) {
      setLoginError('Erreur de connexion au serveur.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'fence_admin_session=; Path=/; Max-Age=0; SameSite=Strict';
    setIsAuthenticated(false);
    setPasswordInput('');
    showToast('Session fermée.');
  };

  /* ---------------- Objets CRUD ---------------- */
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name) return;

    try {
      const res = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(`Objet « ${editingItem.name} » enregistré.`);
        setIsItemModalOpen(false);
        setEditingItem(null);
        await fetchEcosystem();
      } else {
        showToast(`Erreur : ${data.error || 'Échec de sauvegarde'}`);
      }
    } catch {
      showToast('Erreur réseau lors de la sauvegarde.');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Confirmer la suppression ou réinitialisation de l'objet « ${name} » ?`)) return;

    try {
      const res = await fetch(`/api/admin/items?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Objet « ${name} » supprimé.`);
        await fetchEcosystem();
      } else {
        showToast('Erreur lors de la suppression.');
      }
    } catch {
      showToast('Erreur réseau.');
    }
  };

  /* ---------------- Personnages CRUD ---------------- */
  const handleSaveChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar || !editingChar.fullName) return;

    try {
      const res = await fetch('/api/admin/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingChar),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(`Profil de ${editingChar.fullName} mis à jour.`);
        setIsCharModalOpen(false);
        setEditingChar(null);
        await fetchEcosystem();
      } else {
        showToast(`Erreur : ${data.error || 'Échec de mise à jour'}`);
      }
    } catch {
      showToast('Erreur réseau.');
    }
  };

  const handleDeleteChar = async (id: string, name: string) => {
    if (!confirm(`Confirmer la suppression ou réinitialisation de « ${name} » ?`)) return;

    try {
      const res = await fetch(`/api/admin/characters?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Personnage « ${name} » supprimé.`);
        await fetchEcosystem();
      } else {
        showToast('Erreur lors de la suppression.');
      }
    } catch {
      showToast('Erreur réseau.');
    }
  };

  /* ---------------- Archetypes Sliders ---------------- */
  const handleSaveArchetype = async (arch: ArchetypeDef) => {
    try {
      const res = await fetch('/api/admin/archetypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arch),
      });
      if (res.ok) {
        showToast(`Profil psychologique « ${arch.id} » enregistré.`);
        await fetchEcosystem();
      } else {
        showToast('Erreur lors de l’enregistrement de l’archétype.');
      }
    } catch {
      showToast('Erreur réseau.');
    }
  };

  /* ---------------- Upload Sécurisé (Gate 20) ---------------- */
  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Fichier supérieur à 5 Mo interdit.');
      return;
    }
    setUploadLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).replace(/^data:image\/\w+;base64,/, '');
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            data: base64Data,
            folder: uploadFolder,
          }),
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok && result.success) {
          showToast(`Image téléversée : ${result.url}`);
          setUploadedImages((prev) => [{ url: result.url, name: file.name, size: result.size }, ...prev]);
        } else {
          showToast(`Refus Upload (Gate 20) : ${result.error || 'Format non conforme'}`);
        }
      } catch {
        showToast('Erreur lors du téléversement.');
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- Sauvegarde & Système ---------------- */
  const handleExportJson = () => {
    window.location.href = '/api/admin/export';
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('Sauvegarde JSON importée avec succès !');
        await fetchEcosystem();
      } else {
        showToast(`Erreur import : ${data.error || 'Format JSON invalide'}`);
      }
    } catch {
      showToast('Fichier JSON corrompu ou illisible.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleResetEcosystem = async () => {
    if (!confirm('ATTENTION : Réinitialiser tout l’écosystème aux valeurs d’usine ? Toutes les modifications locales seront effacées.')) return;

    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Écosystème réinitialisé aux valeurs d’usine.');
        await fetchEcosystem();
      }
    } catch {
      showToast('Erreur lors de la réinitialisation.');
    }
  };

  /* ---------------- Données filtrées ---------------- */
  const filteredItems = useMemo(() => {
    if (!ecosystem) return [];
    let list = [...ecosystem.items];

    if (itemCategoryFilter !== 'all') {
      list = list.filter((it) => it.category === itemCategoryFilter);
    }

    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          (it.surfaceDesc && it.surfaceDesc.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (itemSort === 'value_desc') return b.baseValue - a.baseValue;
      if (itemSort === 'value_asc') return a.baseValue - b.baseValue;
      if (itemSort === 'hot') return b.hotLevel - a.hotLevel;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [ecosystem, itemCategoryFilter, itemSearch, itemSort]);

  const filteredCharacters = useMemo(() => {
    if (!ecosystem) return [];
    let list = [...ecosystem.characters];

    if (charFactionFilter !== 'all') {
      list = list.filter((c) => c.faction === charFactionFilter);
    }

    if (charProfileFilter !== 'all') {
      list = list.filter((c) => c.profileId === charProfileFilter);
    }

    if (charSearch.trim()) {
      const q = charSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.job.toLowerCase().includes(q) ||
          c.secret.toLowerCase().includes(q) ||
          c.weaknessHint.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [ecosystem, charFactionFilter, charProfileFilter, charSearch]);

  // Si pas authentifié : Écran Vault de verrouillage
  if (!isAuthenticated && !authChecking) {
    return (
      <div className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md bg-[#0e1017] border border-amber-500/20 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider font-mono text-white flex items-center gap-2">
                CASH NOIR <span className="text-amber-400">//</span> BO ADMIN
              </h1>
              <p className="text-xs text-zinc-400">Accès Maître & Gestion de l'Écosystème</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Clé Maîtresse du Syndicat
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  autoFocus
                  required
                  className="w-full bg-[#07080b] border border-zinc-800 focus:border-amber-500/60 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition font-mono pr-10"
                />
                <Key className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold py-3 px-4 rounded-lg text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Déverrouiller la Console
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 flex justify-between items-center text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-amber-500/60" /> Gate 01 & 04 Actifs
            </span>
            <button
              type="button"
              onClick={() => onNavigate('/play')}
              className="hover:text-zinc-300 underline font-mono cursor-pointer"
            >
              Retourner au Jeu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-200 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141c] border border-amber-500/40 shadow-2xl rounded-lg px-4 py-3 text-xs font-mono text-amber-300 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-[#0b0c10] border-b border-zinc-800/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('/play')}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Revenir au comptoir"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold tracking-wider font-mono text-white">
              CASH NOIR <span className="text-amber-400">//</span> CONSOLE ADMIN
            </h1>
            <span className="text-[10px] bg-zinc-800/80 text-zinc-400 px-2 py-0.5 rounded font-mono border border-zinc-700/50">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Global Ecosystem Actions */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Télécharger une sauvegarde JSON complète de l’écosystème"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            Export JSON
          </button>

          <button
            onClick={() => importInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Importer une sauvegarde JSON"
          >
            <UploadCloud className="w-3.5 h-3.5 text-zinc-400" />
            Import JSON
          </button>
          <input
            type="file"
            ref={importInputRef}
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportJson}
          />

          <button
            onClick={handleResetEcosystem}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 border border-zinc-700/70 hover:border-red-500/40 text-zinc-400 hover:text-red-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Réinitialiser tous les ajouts et modifications aux données d’origine"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            Reset Usine
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Verrouiller
          </button>
        </div>
      </header>

      {/* Navigation Sub-Header Tabs */}
      <div className="bg-[#0e1017] border-b border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-3 text-xs font-mono tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'items'
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Objets & Butin ({ecosystem?.items.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-3 text-xs font-mono tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'characters'
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Personnages & Suspects ({ecosystem?.characters.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('archetypes')}
            className={`px-4 py-3 text-xs font-mono tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'archetypes'
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Matrice Psycho (9)
          </button>

          <button
            onClick={() => setActiveTab('seasons')}
            className={`px-4 py-3 text-xs font-mono tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'seasons'
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Saisons & Pass
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-3 text-xs font-mono tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'uploads'
                ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Médiathèque (Gate 20)
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Synchronisation...
          </div>
        )}
      </div>

      {/* KPI Overview Banner */}
      <div className="bg-[#0b0c11] border-b border-zinc-800/60 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Objets Actifs :</span>
              <span className="text-amber-400 font-bold">{ecosystem?.items.length || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Suspects Enregistrés :</span>
              <span className="text-emerald-400 font-bold">{ecosystem?.characters.length || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Catégories :</span>
              <span className="text-cyan-400 font-bold">{ecosystem?.categories.length || 7} / 7</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Archétypes :</span>
              <span className="text-purple-400 font-bold">9 profils psycho</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Sécurité Gate 01/04/20 Active · Session Chiffrée</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* ======================================================== */}
        {/* TAB 1: OBJETS (ITEMS)                                   */}
        {/* ======================================================== */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setItemCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                    itemCategoryFilter === 'all'
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Toutes ({ecosystem?.items.length || 0})
                </button>
                {ecosystem?.categories.map((cat) => {
                  const count = ecosystem.items.filter((it) => it.category === cat).length;
                  const c = CATEGORY_COLORS[cat] || { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' };
                  return (
                    <button
                      key={cat}
                      onClick={() => setItemCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                        itemCategoryFilter === cat
                          ? `${c.bg} ${c.text} ${c.border} font-bold ring-1 ring-amber-500/50`
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Rechercher un objet..."
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>

                <select
                  value={itemSort}
                  onChange={(e) => setItemSort(e.target.value as any)}
                  className="bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="value_desc">Valeur Décroissante</option>
                  <option value="value_asc">Valeur Croissante</option>
                  <option value="hot">Niveau Danger</option>
                  <option value="name">Alphabétique</option>
                </select>

                <button
                  onClick={() => {
                    setEditingItem({
                      id: `item_custom_${Date.now()}`,
                      name: '',
                      category: itemCategoryFilter !== 'all' ? itemCategoryFilter : 'Joaillerie',
                      baseValue: 2500,
                      hotLevel: 2,
                      surfaceDesc: '',
                      clues: [''],
                      uvClues: [''],
                      isCustom: true,
                    });
                    setIsItemModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold text-xs rounded-lg font-mono flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer Objet
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#07080b] text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Nom de l'Objet</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Valeur Rue</th>
                      <th className="py-3 px-4">Chaleur</th>
                      <th className="py-3 px-4">Indices Clés (Loupe & UV)</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredItems.map((it) => {
                      const color = CATEGORY_COLORS[it.category] || { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' };
                      return (
                        <tr key={it.id} className="hover:bg-zinc-900/50 transition">
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>{it.name}</div>
                            {it.surfaceDesc && (
                              <div className="text-[11px] text-zinc-400 line-clamp-1 font-sans">{it.surfaceDesc}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                              {it.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-amber-400 font-bold">
                            {it.baseValue.toLocaleString('fr-FR')} $
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-0.5 text-rose-500">
                              {Array.from({ length: it.hotLevel || 1 }).map((_, i) => (
                                <Flame key={i} className="w-3.5 h-3.5 fill-rose-500/20" />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs text-zinc-400 text-[11px] font-sans">
                            {it.clues && it.clues[0] && (
                              <div className="truncate"><span className="text-zinc-300 font-mono">🔍</span> {it.clues[0]}</div>
                            )}
                            {it.uvClues && it.uvClues[0] && (
                              <div className="truncate text-purple-300/80"><span className="text-purple-400 font-mono">🟣</span> {it.uvClues[0]}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {it.isCustom ? (
                              <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded">
                                Créé
                              </span>
                            ) : it.isModified ? (
                              <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                                Modifié
                              </span>
                            ) : (
                              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                                Défaut
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingItem({ ...it });
                                setIsItemModalOpen(true);
                              }}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                              title="Modifier l'objet"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(it.id, it.name)}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                              title="Supprimer / Réinitialiser"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PERSONNAGES (CHARACTERS & PERSONALITIES)         */}
        {/* ======================================================== */}
        {activeTab === 'characters' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
                    placeholder="Nom, métier, secret..."
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>

                <select
                  value={charFactionFilter}
                  onChange={(e) => setCharFactionFilter(e.target.value)}
                  className="bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="all">Toutes les Factions</option>
                  {ecosystem?.factions.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <select
                  value={charProfileFilter}
                  onChange={(e) => setCharProfileFilter(e.target.value)}
                  className="bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="all">Tous les Archétypes</option>
                  {ecosystem?.archetypes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingChar({
                    id: `custom_c_${Date.now()}`,
                    fullName: '',
                    firstName: '',
                    gender: 'm',
                    age: 38,
                    job: 'Contrebandier indépendant',
                    faction: ecosystem?.factions[0]?.name || 'Syndicat Indépendant',
                    profileId: 'gambler',
                    secret: 'Célèbre faussaire recherché par Interpol.',
                    weaknessHint: 'Perd ses moyens si on évoque la descente de police.',
                    redLineHint: 'Quitte la négociation si on traite son objet de déchet.',
                    weakKeywords: 'police|flic|mandat|prison',
                    angerKeywords: 'escroc|ordure|déchet',
                    openingTemplate: 'Prends {item} pour {price} $ et pose pas de questions.',
                    tell: 'Il jette un regard fiévreux vers la sortie.',
                    portraitUrl: '/assets/portraits/cast/c001.webp',
                    isCustom: true,
                  });
                  setIsCharModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold text-xs rounded-lg font-mono flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Créer Suspect
              </button>
            </div>

            {/* Suspects Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition relative overflow-hidden"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={c.portraitUrl || `/assets/portraits/cast/${c.id}.webp`}
                      alt={c.fullName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/portraits/cast/c001.webp';
                      }}
                      className="w-14 h-14 rounded-lg object-cover bg-zinc-900 border border-zinc-700/60 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-500 uppercase">{c.id}</span>
                        {c.isCustom ? (
                          <span className="text-[9px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded font-mono">
                            Personnalisé
                          </span>
                        ) : c.isModified ? (
                          <span className="text-[9px] bg-amber-950/60 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-mono">
                            Modifié
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{c.fullName}</h3>
                      <p className="text-xs text-zinc-400 truncate">{c.age} ans · {c.job}</p>
                      <p className="text-[11px] text-amber-400/90 truncate font-mono">{c.faction}</p>
                    </div>
                  </div>

                  {/* Psychological Matrix Preview */}
                  <div className="bg-[#07080b] rounded-lg p-2.5 space-y-1.5 text-[11px] font-sans border border-zinc-900 mb-3">
                    <div>
                      <span className="text-amber-400 font-mono font-semibold">Faille : </span>
                      <span className="text-zinc-300">{c.weaknessHint}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-mono font-semibold">Ligne Rouge : </span>
                      <span className="text-zinc-300">{c.redLineHint}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-mono font-semibold">Secret : </span>
                      <span className="text-zinc-400 italic line-clamp-1">{c.secret}</span>
                    </div>
                    <div className="pt-1 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-400">
                      Mots déclencheurs : <span className="text-amber-300/80">{c.weakKeywords}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs font-mono">
                    <span className="text-zinc-500 capitalize">{c.profileId}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingChar({ ...c });
                          setIsCharModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDeleteChar(c.id, c.fullName)}
                        className="p-1 rounded bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                        title="Supprimer / Réinitialiser"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MATRICE PSYCHOLOGIQUE (9 ARCHETYPES)             */}
        {/* ======================================================== */}
        {activeTab === 'archetypes' && (
          <div className="space-y-6">
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-4">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Paramétrage des Tempéraments & Réactions Cerveau
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Ajuste les jauges de départ, la sensibilité aux menaces (Fear Bonus) et l’agressivité aux insultes (Anger Penalty) pour chaque profil d'acheteur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystem?.archetypes.map((arch) => (
                <div
                  key={arch.id}
                  className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {arch.id}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">Archétype</span>
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1">{arch.label}</h3>
                    <p className="text-xs text-zinc-400 italic mb-4 font-sans">{arch.trait}</p>

                    {/* Sliders */}
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Peur Initiale</span>
                          <span className="text-amber-400 font-bold">{arch.baseGauges.peur}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={arch.baseGauges.peur}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEcosystem((prev) => {
                              if (!prev) return prev;
                              const updated = prev.archetypes.map((a) =>
                                a.id === arch.id
                                  ? { ...a, baseGauges: { ...a.baseGauges, peur: val } }
                                  : a
                              );
                              return { ...prev, archetypes: updated };
                            });
                          }}
                          className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Colère Initiale</span>
                          <span className="text-rose-400 font-bold">{arch.baseGauges.colere}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={arch.baseGauges.colere}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEcosystem((prev) => {
                              if (!prev) return prev;
                              const updated = prev.archetypes.map((a) =>
                                a.id === arch.id
                                  ? { ...a, baseGauges: { ...a.baseGauges, colere: val } }
                                  : a
                              );
                              return { ...prev, archetypes: updated };
                            });
                          }}
                          className="w-full accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Méfiance Initiale</span>
                          <span className="text-cyan-400 font-bold">{arch.baseGauges.mefiance}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={arch.baseGauges.mefiance}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEcosystem((prev) => {
                              if (!prev) return prev;
                              const updated = prev.archetypes.map((a) =>
                                a.id === arch.id
                                  ? { ...a, baseGauges: { ...a.baseGauges, mefiance: val } }
                                  : a
                              );
                              return { ...prev, archetypes: updated };
                            });
                          }}
                          className="w-full accent-cyan-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Fear Bonus</span>
                          <span className="text-white font-bold">+{arch.fearBonus}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Anger Penalty</span>
                          <span className="text-white font-bold">+{arch.angerPenalty}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveArchetype(arch)}
                    className="mt-5 w-full py-2 bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200 text-xs font-mono font-semibold rounded-lg transition cursor-pointer"
                  >
                    Enregistrer Réglages
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SAISONS & BATTLE PASS                             */}
        {/* ======================================================== */}
        {activeTab === 'seasons' && (
          <div className="space-y-6">
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Saisons & Pass Clandestin
              </h2>
              <p className="text-xs text-zinc-400">
                Gère le calendrier des saisons narratives, les paliers de récompenses et les épisodes débloqués.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ecosystem?.seasons.map((s) => (
                <div key={s.seasonNumber} className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                        Saison {s.seasonNumber}
                      </span>
                      <h3 className="font-bold text-base text-white">{s.name || `Saison ${s.seasonNumber}`}</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Thématique Narrative</label>
                    <input
                      type="text"
                      value={s.theme || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEcosystem((prev) => {
                          if (!prev) return prev;
                          const updated = prev.seasons.map((item) =>
                            item.seasonNumber === s.seasonNumber ? { ...item, theme: val } : item
                          );
                          return { ...prev, seasons: updated };
                        });
                      }}
                      className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono text-zinc-400">
                        Épisodes Narratifs ({s.episodes?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const title = prompt('Titre du nouvel épisode :');
                          if (!title) return;
                          const synopsis =
                            prompt('Synopsis narratif :') || 'Nouvel arc clandestin en cours.';
                          const newEp = { id: `ep_${Date.now()}`, title, synopsis };
                          setEcosystem((prev) => {
                            if (!prev) return prev;
                            const updated = prev.seasons.map((item) =>
                              item.seasonNumber === s.seasonNumber
                                ? { ...item, episodes: [...(item.episodes || []), newEp] }
                                : item
                            );
                            return { ...prev, seasons: updated };
                          });
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter Épisode
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {s.episodes?.map((ep, idx) => (
                        <div key={ep.id || idx} className="bg-[#07080b] p-2.5 rounded-lg border border-zinc-900 text-xs font-mono">
                          <div className="text-white font-semibold">{ep.title}</div>
                          <div className="text-zinc-500 text-[11px] truncate">{ep.synopsis}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/seasons', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ season: s }),
                        });
                        if (res.ok) showToast('Saison mise à jour.');
                      } catch {
                        showToast('Erreur lors de la mise à jour.');
                      }
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono rounded-lg transition cursor-pointer"
                  >
                    Sauvegarder la Saison
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MÉDIATHÈQUE & UPLOAD (GATE 20)                     */}
        {/* ======================================================== */}
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  Médiathèque Sécurisée (Gate 20)
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">Dossier cible :</span>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as any)}
                    className="bg-[#07080b] border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono cursor-pointer"
                  >
                    <option value="portraits">Portraits (/assets/portraits/cast/)</option>
                    <option value="uploads">Objets & Butin (/assets/uploads/)</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Téléversement direct d'illustrations et portraits. Contrôle d'intégrité par octets magiques (PNG, WEBP, JPEG), sanitation du nom et limite 5 Mo.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-zinc-800 hover:border-amber-500/60 bg-[#0d0f15] rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition cursor-pointer text-center"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/png,image/webp,image/jpeg';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files[0]) {
                    handleFileUpload(target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {uploadLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Glisse une image ici ou clique pour parcourir
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  WEBP, PNG, JPEG · Max 5 Mo · Gate 20 Magic Bytes Audit
                </p>
              </div>
            </div>

            {/* Uploaded Gallery */}
            {uploadedImages.length > 0 && (
              <div className="bg-[#0d0f15] border border-zinc-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">
                  Images Téléversées Récemment ({uploadedImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((img, i) => (
                    <div
                      key={i}
                      className="bg-[#07080b] border border-zinc-800 rounded-lg p-2 flex flex-col items-center gap-2 group"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-28 object-cover rounded bg-zinc-900 border border-zinc-800"
                      />
                      <div className="w-full text-[11px] font-mono text-zinc-400 truncate text-center">
                        {img.name}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                          showToast('URL copiée dans le presse-papier !');
                        }}
                        className="w-full py-1 bg-zinc-800 hover:bg-amber-500 hover:text-black rounded text-[10px] font-mono flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        Copier l'URL
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: EDIT / CREATE ITEM                                */}
      {/* ======================================================== */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-amber-500/30 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsItemModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold font-mono text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              {editingItem.name ? `Modifier « ${editingItem.name} »` : 'Créer un Nouvel Objet'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nom de l'Objet</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex : Cryptophone blindé de Député"
                  className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Catégorie</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  >
                    {ecosystem?.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Valeur de Base ($)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="1000000"
                    value={editingItem.baseValue}
                    onChange={(e) => setEditingItem({ ...editingItem, baseValue: Number(e.target.value) })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Niveau Danger / Hot Level</label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, hotLevel: lvl })}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition cursor-pointer ${
                          editingItem.hotLevel === lvl
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                            : 'bg-[#07080b] border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Flame
                          className={`w-3 h-3 ${
                            editingItem.hotLevel >= lvl ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                        <span>{lvl}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">ID Technique</label>
                  <input
                    type="text"
                    disabled
                    value={editingItem.id}
                    className="w-full bg-[#07080b]/50 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description de Surface (Comptoir)</label>
                <textarea
                  rows={2}
                  value={editingItem.surfaceDesc || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, surfaceDesc: e.target.value })}
                  placeholder="Aspect visuel immédiat posé sur le zinc..."
                  className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Indice Loupe (Défaut de fabrication / secret)</label>
                <textarea
                  rows={2}
                  value={editingItem.clues ? editingItem.clues[0] : ''}
                  onChange={(e) => setEditingItem({ ...editingItem, clues: [e.target.value] })}
                  placeholder="Ce que la loupe révèle..."
                  className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Indice UV (Marquage clandestin / traces invisibles)</label>
                <textarea
                  rows={2}
                  value={editingItem.uvClues ? editingItem.uvClues[0] : ''}
                  onChange={(e) => setEditingItem({ ...editingItem, uvClues: [e.target.value] })}
                  placeholder="Ce que la lampe UV révèle..."
                  className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-purple-300 font-sans text-xs"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg cursor-pointer"
                >
                  Sauvegarder l'Objet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / CREATE CHARACTER                           */}
      {/* ======================================================== */}
      {isCharModalOpen && editingChar && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-amber-500/30 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCharModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold font-mono text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              {editingChar.fullName ? `Dossier de ${editingChar.fullName}` : 'Nouveau Suspect'}
            </h3>

            <form onSubmit={handleSaveChar} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={editingChar.fullName}
                    onChange={(e) => setEditingChar({ ...editingChar, fullName: e.target.value })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Métier / Couverture</label>
                  <input
                    type="text"
                    required
                    value={editingChar.job}
                    onChange={(e) => setEditingChar({ ...editingChar, job: e.target.value })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Âge</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={editingChar.age}
                    onChange={(e) => setEditingChar({ ...editingChar, age: Number(e.target.value) })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Genre</label>
                  <select
                    value={editingChar.gender}
                    onChange={(e) => setEditingChar({ ...editingChar, gender: e.target.value as any })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="m">Homme</option>
                    <option value="f">Femme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Faction</label>
                  <select
                    value={editingChar.faction}
                    onChange={(e) => setEditingChar({ ...editingChar, faction: e.target.value })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  >
                    {ecosystem?.factions.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1">Archétype Psychologique</label>
                  <select
                    value={editingChar.profileId}
                    onChange={(e) => setEditingChar({ ...editingChar, profileId: e.target.value })}
                    className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-2 text-white"
                  >
                    {ecosystem?.archetypes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Portrait du Suspect</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={editingChar.portraitUrl || '/assets/portraits/cast/c001.webp'}
                      alt="Aperçu"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/portraits/cast/c001.webp';
                      }}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-700 shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingChar.portraitUrl || ''}
                        onChange={(e) => setEditingChar({ ...editingChar, portraitUrl: e.target.value })}
                        placeholder="/assets/portraits/cast/c001.webp"
                        className="w-full bg-[#07080b] border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs mb-1"
                      />
                      <label className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1 font-mono">
                        <UploadCloud className="w-3 h-3" />
                        Téléverser nouveau portrait (Gate 20)
                        <input
                          type="file"
                          accept="image/png,image/webp,image/jpeg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const b64 = (reader.result as string).replace(/^data:image\/\w+;base64,/, '');
                              const res = await fetch('/api/admin/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ filename: file.name, data: b64, folder: 'portraits' }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (res.ok && data.url) {
                                setEditingChar((prev) => (prev ? { ...prev, portraitUrl: data.url } : null));
                                showToast(`Portrait téléversé : ${data.url}`);
                              } else {
                                showToast(`Erreur upload : ${data.error || 'Format invalide'}`);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Psychological Details */}
              <div className="p-4 bg-[#07080b] rounded-lg border border-zinc-800 space-y-3">
                <h4 className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Profil Cerveau & Déclencheurs Émotionnels
                </h4>

                <div>
                  <label className="block text-zinc-400 mb-1">Secret Intime (ce qu'il dissimule au comptoir)</label>
                  <textarea
                    rows={2}
                    value={editingChar.secret}
                    onChange={(e) => setEditingChar({ ...editingChar, secret: e.target.value })}
                    className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-cyan-300 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Faille Psychologique (ce qui fait grimper sa Peur)</label>
                  <textarea
                    rows={2}
                    value={editingChar.weaknessHint}
                    onChange={(e) => setEditingChar({ ...editingChar, weaknessHint: e.target.value })}
                    className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-amber-300 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Ligne Rouge (ce qui déclenche sa Colère / fuite)</label>
                  <textarea
                    rows={2}
                    value={editingChar.redLineHint}
                    onChange={(e) => setEditingChar({ ...editingChar, redLineHint: e.target.value })}
                    className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-rose-300 font-sans text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Mots déclencheurs Peur (|)</label>
                    <input
                      type="text"
                      value={editingChar.weakKeywords}
                      onChange={(e) => setEditingChar({ ...editingChar, weakKeywords: e.target.value })}
                      placeholder="police|flic|prison"
                      className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-amber-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Mots déclencheurs Colère (|)</label>
                    <input
                      type="text"
                      value={editingChar.angerKeywords}
                      onChange={(e) => setEditingChar({ ...editingChar, angerKeywords: e.target.value })}
                      placeholder="escroc|ordure|déchet"
                      className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-rose-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Tic Physique / Comportemental</label>
                  <input
                    type="text"
                    value={editingChar.tell}
                    onChange={(e) => setEditingChar({ ...editingChar, tell: e.target.value })}
                    placeholder="Il tapote nerveusement le zinc..."
                    className="w-full bg-[#0e1017] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 font-sans text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCharModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg cursor-pointer"
                >
                  Sauvegarder le Suspect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
