/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Component } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  writeBatch,
  getDocFromServer
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import { 
  FileText, 
  Calendar, 
  Package, 
  GraduationCap, 
  ClipboardCheck, 
  ExternalLink,
  LayoutDashboard,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Settings2,
  X,
  Save,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User as UserIcon
} from "lucide-react";

// Icon mapping for serialization
const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  Package: <Package className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
  LayoutDashboard: <LayoutDashboard className="w-6 h-6" />,
};

interface Tool {
  id: string;
  title: string;
  description: string;
  link: string;
  iconName: string;
  comingSoon?: boolean;
  order: number;
}

interface Category {
  id: string;
  title: string;
  order: number;
  tools: Tool[];
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Something went wrong</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
            >
              Refresh Page
            </button>
            {this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-500">Technical Details</summary>
                <pre className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] overflow-auto text-slate-600 dark:text-slate-400 max-h-40">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const INITIAL_CONFIG: Category[] = [
  {
    id: "ops",
    title: "Operations",
    order: 0,
    tools: [
      {
        id: "1",
        title: "Invoice Generator",
        description: "Generate professional invoices quickly for EIM operations and client billing.",
        link: "https://invoice.eimtechnology.com/",
        iconName: "FileText",
        order: 0,
      },
      {
        id: "2",
        title: "Team Schedule",
        description: "Manage and view internal team schedules, shifts, and project timelines.",
        link: "https://teamschedule.eimtechnology.com/",
        iconName: "Calendar",
        order: 1,
      },
      {
        id: "3",
        title: "Inventory System",
        description: "Manage inventory and logistics for STEM kits and electronic components.",
        link: "#",
        iconName: "Package",
        comingSoon: true,
        order: 2,
      },
    ],
  },
  {
    id: "edu",
    title: "Education",
    order: 1,
    tools: [
      {
        id: "4",
        title: "Training Platform",
        description: "Access EIM Academy training system, curriculum, and learning resources (CN).",
        link: "https://training.eimacademy.com/",
        iconName: "GraduationCap",
        order: 0,
      },
      {
        id: "5",
        title: "Report Generator",
        description: "Automatically generate structured student reports and performance assessments.",
        link: "https://eim-training-report-generator.vercel.app/",
        iconName: "ClipboardCheck",
        order: 1,
      },
    ],
  },
];

const ensureAbsoluteUrl = (url: string) => {
  if (!url || url === "#") return url;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

interface ToolCardProps {
  tool: Tool; 
  isAdminModeActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isAdminModeActive, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const isPlaceholder = tool.link === "#" || tool.comingSoon;

  return (
    <motion.div
      layout
      whileHover={{ y: isAdminModeActive ? 0 : -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (!isAdminModeActive && !isPlaceholder) {
          window.open(tool.link, "_blank", "noopener,noreferrer");
        }
      }}
      className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md dark:hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all h-full ${!isAdminModeActive && !isPlaceholder ? 'cursor-pointer' : ''}`}
    >
      {isAdminModeActive && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 z-20">
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 sm:p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all"
              title="Edit Tool"
            >
              <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 sm:p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 shadow-sm transition-all"
              title="Delete Tool"
            >
              <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              disabled={isFirst}
              className={`p-2 sm:p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm transition-all ${isFirst ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800'}`}
              title="Move Left/Up"
            >
              <ChevronUp className="w-4 h-4 sm:w-3.5 sm:h-3.5 rotate-[-90deg] md:rotate-0" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={isLast}
              className={`p-2 sm:p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm transition-all ${isLast ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800'}`}
              title="Move Right/Down"
            >
              <ChevronDown className="w-4 h-4 sm:w-3.5 sm:h-3.5 rotate-[-90deg] md:rotate-0" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:text-[#1565c0] dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
          {ICON_MAP[tool.iconName] || <LayoutDashboard className="w-6 h-6" />}
        </div>
        {!isPlaceholder && !isAdminModeActive && (
          <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
        {tool.title}
        {tool.comingSoon && (
          <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
            Soon
          </span>
        )}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
        {tool.description}
      </p>

      <div className="mt-auto">
        {isAdminModeActive ? (
          <button 
            onClick={onEdit}
            className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit Details
          </button>
        ) : isPlaceholder ? (
          <button 
            disabled
            className="w-full py-2 px-4 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-100 dark:border-slate-800"
          >
            Coming Soon
          </button>
        ) : (
          <div
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors group/btn"
          >
            Open Tool
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [config, setConfig] = useState<Category[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("eim_hub_theme");
    return saved === "dark";
  });
  const [editingTool, setEditingTool] = useState<{ catId: string; tool?: Tool } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'tool' | 'category'; catId: string; toolId?: string } | null>(null);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user is admin (either by email or by role in Firestore)
        const isAdminByEmail = user.email === "terback@gmail.com" && user.emailVerified;
        if (isAdminByEmail) {
          setIsAdmin(true);
          setIsAdminModeActive(true);
        } else {
          try {
            const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
            const adminStatus = userDoc.exists() && userDoc.data().role === 'admin';
            setIsAdmin(adminStatus);
            setIsAdminModeActive(adminStatus);
          } catch (e) {
            setIsAdmin(false);
            setIsAdminModeActive(false);
          }
        }
      } else {
        setIsAdmin(false);
        setIsAdminModeActive(false);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Migration: Populate Firestore with initial data if empty
  useEffect(() => {
    if (!isAdmin || config.length > 0) return;

    const migrate = async () => {
      try {
        const batch = writeBatch(db);
        for (let i = 0; i < INITIAL_CONFIG.length; i++) {
          const cat = INITIAL_CONFIG[i];
          const catRef = doc(collection(db, "categories"));
          batch.set(catRef, { title: cat.title, order: i });
          
          for (let j = 0; j < cat.tools.length; j++) {
            const tool = cat.tools[j];
            const toolRef = doc(collection(db, `categories/${catRef.id}/tools`));
            batch.set(toolRef, {
              title: tool.title,
              description: tool.description,
              link: tool.link,
              iconName: tool.iconName,
              comingSoon: tool.comingSoon || false,
              order: j
            });
          }
        }
        await batch.commit();
        console.log("Migration complete");
      } catch (error) {
        console.error("Migration failed", error);
      }
    };

    migrate();
  }, [isAdmin, config.length]);

  // Firestore Real-time Listener
  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tools: []
      } as Category));
      
      if (categoriesData.length === 0) {
        setConfig([]);
        setIsLoading(false);
        return;
      }

      // Initialize config with categories (empty tools for now)
      // This prevents the screen from being blank while tools load
      setConfig(prev => {
        const newConfig = categoriesData.map(cat => {
          const existing = prev.find(p => p.id === cat.id);
          return { ...cat, tools: existing?.tools || [] };
        });
        return newConfig;
      });

      // Fetch tools for each category
      const toolUnsubscribes: (() => void)[] = [];
      categoriesData.forEach((cat) => {
        const toolsQ = query(collection(db, `categories/${cat.id}/tools`), orderBy("order", "asc"));
        const unsub = onSnapshot(toolsQ, (toolsSnapshot) => {
          const tools = toolsSnapshot.docs.map(tDoc => ({
            id: tDoc.id,
            ...tDoc.data()
          } as Tool));
          
          setConfig(prev => {
            return prev.map(c => c.id === cat.id ? { ...c, tools } : c);
          });
          setIsLoading(false);
        }, (error) => {
          console.error(`Error fetching tools for ${cat.id}:`, error);
          setIsLoading(false);
        });
        toolUnsubscribes.push(unsub);
      });

      return () => {
        toolUnsubscribes.forEach(u => u());
      };
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "categories");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (!isAdminModeActive) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.length) return;

    const cat1 = config[index];
    const cat2 = config[targetIndex];

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "categories", cat1.id), { order: cat2.order });
      batch.update(doc(db, "categories", cat2.id), { order: cat1.order });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "categories");
    }
  };

  const moveTool = async (catId: string, toolIndex: number, direction: 'up' | 'down') => {
    if (!isAdminModeActive) return;
    const category = config.find(c => c.id === catId);
    if (!category) return;

    const targetIndex = direction === 'up' ? toolIndex - 1 : toolIndex + 1;
    if (targetIndex < 0 || targetIndex >= category.tools.length) return;

    const tool1 = category.tools[toolIndex];
    const tool2 = category.tools[targetIndex];

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, `categories/${catId}/tools`, tool1.id), { order: tool2.order });
      batch.update(doc(db, `categories/${catId}/tools`, tool2.id), { order: tool1.order });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${catId}/tools`);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem("eim_hub_theme", "dark");
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem("eim_hub_theme", "light");
    }
  }, [darkMode]);

  const handleSaveTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdminModeActive) return;
    const formData = new FormData(e.currentTarget);
    const targetCatId = formData.get("category") as string;
    
    const toolData = {
      title: (formData.get("title") as string).trim(),
      description: (formData.get("description") as string).trim(),
      link: ensureAbsoluteUrl(formData.get("link") as string),
      iconName: formData.get("iconName") as string,
      comingSoon: formData.get("comingSoon") === "on",
    };

    try {
      if (editingTool?.tool) {
        // Update existing
        const toolId = editingTool.tool.id;
        if (editingTool.catId !== targetCatId) {
          // Move to new category
          const targetCat = config.find(c => c.id === targetCatId);
          const newOrder = targetCat ? (targetCat.tools.length > 0 ? Math.max(...targetCat.tools.map(t => t.order)) + 1 : 0) : 0;
          
          const batch = writeBatch(db);
          batch.delete(doc(db, `categories/${editingTool.catId}/tools`, toolId));
          batch.set(doc(db, `categories/${targetCatId}/tools`, toolId), { ...toolData, order: newOrder });
          await batch.commit();
        } else {
          // Just update in same category
          await setDoc(doc(db, `categories/${targetCatId}/tools`, toolId), { ...toolData, order: editingTool.tool.order }, { merge: true });
        }
      } else {
        // Create new
        const targetCat = config.find(c => c.id === targetCatId);
        const newOrder = targetCat ? (targetCat.tools.length > 0 ? Math.max(...targetCat.tools.map(t => t.order)) + 1 : 0) : 0;
        await addDoc(collection(db, `categories/${targetCatId}/tools`), { ...toolData, order: newOrder });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${targetCatId}/tools`);
    }

    setEditingTool(null);
  };

  const handleDeleteTool = (catId: string, toolId: string) => {
    setConfirmDelete({ type: 'tool', catId, toolId });
  };

  const executeDelete = async () => {
    if (!confirmDelete || !isAdminModeActive) return;

    try {
      if (confirmDelete.type === 'tool') {
        await deleteDoc(doc(db, `categories/${confirmDelete.catId}/tools`, confirmDelete.toolId!));
      } else if (confirmDelete.type === 'category') {
        // Delete all tools first
        const cat = config.find(c => c.id === confirmDelete.catId);
        if (cat) {
          const batch = writeBatch(db);
          cat.tools.forEach(tool => {
            batch.delete(doc(db, `categories/${cat.id}/tools`, tool.id));
          });
          batch.delete(doc(db, "categories", cat.id));
          await batch.commit();
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, confirmDelete.type === 'tool' ? `categories/${confirmDelete.catId}/tools` : "categories");
    }
    setConfirmDelete(null);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdminModeActive) return;
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("catTitle") as string).trim();

    try {
      if (editingCategory) {
        await setDoc(doc(db, "categories", editingCategory.id), { title }, { merge: true });
      } else {
        const newOrder = config.length > 0 ? Math.max(...config.map(c => c.order)) + 1 : 0;
        await addDoc(collection(db, "categories"), { title, order: newOrder });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "categories");
    }
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    setConfirmDelete({ type: 'category', catId });
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="https://github.com/Terback/Images/blob/main/logo/logo%20color%20palette-website-01.png?raw=true" 
                alt="EIM Logo" 
                className="h-7 sm:h-10 w-auto object-contain dark:brightness-110"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                EIM <span className="hidden min-[450px]:inline">Workstation</span> Hub
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end mr-1">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-none">{user.displayName}</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-tighter">{isAdmin ? 'Administrator' : 'User'}</span>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-blue-900/20"
                >
                  <UserIcon className="w-3 h-3" />
                  <span>Login</span>
                </button>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsAdminModeActive(!isAdminModeActive)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all ${
                    isAdminModeActive 
                      ? 'bg-blue-600 text-white shadow-blue-100 dark:shadow-blue-900/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isAdminModeActive ? "Switch to User View" : "Switch to Admin View"}
                >
                  {isAdminModeActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isAdminModeActive ? 'Admin Mode' : 'User View'}</span>
                </button>
              )}
              
              {!isAdminModeActive && isAuthReady && (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1565c0] dark:text-blue-400 rounded-full text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1565c0] dark:bg-blue-400"></span>
                    </span>
                    Operational
                  </div>
                  <div className="md:hidden flex items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full" title="Operational">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1565c0] dark:bg-blue-400"></span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Loading workstation tools...</p>
          </div>
        ) : config.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No tools found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              The workstation hub is currently empty. 
              {isAdminModeActive ? "As an administrator, you can start by adding a new category below." : "Please check back later or contact your administrator."}
            </p>
            {!user && (
              <button 
                onClick={handleLogin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
              >
                <LogIn className="w-5 h-5" /> Login to Initialize
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {config.map((category, catIndex) => (
              <motion.section 
                key={category.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-12"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 group/header">
                  <div className="flex items-center gap-3 flex-grow">
                    <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-2">
                      {category.title}
                      {isAdminModeActive && (
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover/header:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingCategory(category)}
                            className="p-1.5 sm:p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Rename Category"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1.5 sm:p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          </button>
                          <div className="flex gap-0.5 ml-1 border-l border-slate-200 dark:border-slate-800 pl-1">
                            <button 
                              onClick={() => moveCategory(catIndex, 'up')}
                              disabled={catIndex === 0}
                              className={`p-1.5 sm:p-1 transition-colors ${catIndex === 0 ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                              title="Move Category Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                            </button>
                            <button 
                              onClick={() => moveCategory(catIndex, 'down')}
                              disabled={catIndex === config.length - 1}
                              className={`p-1.5 sm:p-1 transition-colors ${catIndex === config.length - 1 ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                              title="Move Category Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </h2>
                    <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  {isAdminModeActive && (
                    <button 
                      onClick={() => setEditingTool({ catId: category.id })}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all w-full sm:w-auto"
                    >
                      <Plus className="w-3 h-3" /> Add Tool
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tools.map((tool, toolIndex) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      isAdminModeActive={isAdminModeActive}
                      onEdit={() => setEditingTool({ catId: category.id, tool })}
                      onDelete={() => handleDeleteTool(category.id, tool.id)}
                      onMoveUp={() => moveTool(category.id, toolIndex, 'up')}
                      onMoveDown={() => moveTool(category.id, toolIndex, 'down')}
                      isFirst={toolIndex === 0}
                      isLast={toolIndex === category.tools.length - 1}
                    />
                  ))}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        )}

        {isAdminModeActive && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-medium"
            >
              <Plus className="w-5 h-5" /> Add New Category
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Confirm Delete</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Are you sure you want to delete this {confirmDelete.type}? 
                  {confirmDelete.type === 'category' && " This will also delete all tools within it."}
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeDelete}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {(editingCategory || isAddingCategory) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {editingCategory ? "Rename Category" : "Add New Category"}
                </h3>
                <button 
                  onClick={() => { setEditingCategory(null); setIsAddingCategory(false); }} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Category Name</label>
                  <input 
                    name="catTitle" 
                    defaultValue={editingCategory?.title} 
                    required 
                    autoFocus
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setEditingCategory(null); setIsAddingCategory(false); }}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tool Editor Modal */}
      <AnimatePresence>
        {editingTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {editingTool.tool ? "Edit Tool" : "Add New Tool"}
                </h3>
                <button onClick={() => setEditingTool(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveTool} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                  <input 
                    name="title" 
                    defaultValue={editingTool.tool?.title} 
                    required 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingTool.tool?.description} 
                    required 
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select 
                      name="category" 
                      defaultValue={editingTool.catId}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
                    >
                      {config.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Icon</label>
                    <select 
                      name="iconName" 
                      defaultValue={editingTool.tool?.iconName || "LayoutDashboard"}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-slate-100"
                    >
                      {Object.keys(ICON_MAP).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">URL Link</label>
                  <input 
                    name="link" 
                    defaultValue={editingTool.tool?.link} 
                    placeholder="https://..."
                    required 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    name="comingSoon" 
                    id="comingSoon"
                    defaultChecked={editingTool.tool?.comingSoon}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                  />
                  <label htmlFor="comingSoon" className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as "Coming Soon"</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingTool(null)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            More tools coming soon — Built by EIM Technology
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-widest font-bold">v1.1.0</span>
            <span className="text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-widest font-bold">Internal Use Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
