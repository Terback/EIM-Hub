/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Moon
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
}

interface Category {
  id: string;
  title: string;
  tools: Tool[];
}

const INITIAL_CONFIG: Category[] = [
  {
    id: "ops",
    title: "Operations",
    tools: [
      {
        id: "1",
        title: "Invoice Generator",
        description: "Generate professional invoices quickly for EIM operations and client billing.",
        link: "https://invoice.eimtechnology.com/",
        iconName: "FileText",
      },
      {
        id: "2",
        title: "Team Schedule",
        description: "Manage and view internal team schedules, shifts, and project timelines.",
        link: "https://teamschedule.eimtechnology.com/",
        iconName: "Calendar",
      },
      {
        id: "3",
        title: "Inventory System",
        description: "Manage inventory and logistics for STEM kits and electronic components.",
        link: "#",
        iconName: "Package",
        comingSoon: true,
      },
    ],
  },
  {
    id: "edu",
    title: "Education",
    tools: [
      {
        id: "4",
        title: "Training Platform",
        description: "Access EIM Academy training system, curriculum, and learning resources (CN).",
        link: "https://training.eimacademy.com/",
        iconName: "GraduationCap",
      },
      {
        id: "5",
        title: "Report Generator",
        description: "Automatically generate structured student reports and performance assessments.",
        link: "https://eim-training-report-generator.vercel.app/",
        iconName: "ClipboardCheck",
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

const ToolCard: React.FC<{ 
  tool: Tool; 
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ tool, isAdmin, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const isPlaceholder = tool.link === "#" || tool.comingSoon;

  return (
    <motion.div
      layout
      whileHover={{ y: isAdmin ? 0 : -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (!isAdmin && !isPlaceholder) {
          window.open(tool.link, "_blank", "noopener,noreferrer");
        }
      }}
      className={`group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md dark:hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all h-full ${!isAdmin && !isPlaceholder ? 'cursor-pointer' : ''}`}
    >
      {isAdmin && (
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
        {!isPlaceholder && !isAdmin && (
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
        {isAdmin ? (
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
  const [config, setConfig] = useState<Category[]>(() => {
    const saved = localStorage.getItem("eim_hub_config");
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("eim_hub_theme");
    return saved === "dark";
  });
  const [editingTool, setEditingTool] = useState<{ catId: string; tool?: Tool } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'tool' | 'category'; catId: string; toolId?: string } | null>(null);

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newConfig = [...config];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newConfig.length) return;
    [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];
    setConfig(newConfig);
  };

  const moveTool = (catId: string, toolIndex: number, direction: 'up' | 'down') => {
    setConfig(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const newTools = [...cat.tools];
      const targetIndex = direction === 'up' ? toolIndex - 1 : toolIndex + 1;
      if (targetIndex < 0 || targetIndex >= newTools.length) return cat;
      [newTools[toolIndex], newTools[targetIndex]] = [newTools[targetIndex], newTools[toolIndex]];
      return { ...cat, tools: newTools };
    }));
  };

  useEffect(() => {
    localStorage.setItem("eim_hub_config", JSON.stringify(config));
  }, [config]);

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

  const handleSaveTool = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toolData: Tool = {
      id: editingTool?.tool?.id || Math.random().toString(36).substr(2, 9),
      title: (formData.get("title") as string).trim(),
      description: (formData.get("description") as string).trim(),
      link: ensureAbsoluteUrl(formData.get("link") as string),
      iconName: formData.get("iconName") as string,
      comingSoon: formData.get("comingSoon") === "on",
    };

    const targetCatId = formData.get("category") as string;
    
    setConfig(prev => {
      // Remove from old category if moving
      let newConfig = prev.map(cat => ({
        ...cat,
        tools: cat.tools.filter(t => t.id !== toolData.id)
      }));

      // Add to target category
      return newConfig.map(cat => {
        if (cat.id === targetCatId) {
          return { ...cat, tools: [...cat.tools, toolData] };
        }
        return cat;
      });
    });

    setEditingTool(null);
  };

  const handleDeleteTool = (catId: string, toolId: string) => {
    setConfirmDelete({ type: 'tool', catId, toolId });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'tool') {
      setConfig(prev => prev.map(cat => ({
        ...cat,
        tools: cat.tools.filter(t => t.id !== confirmDelete.toolId)
      })));
    } else if (confirmDelete.type === 'category') {
      setConfig(prev => prev.map(cat => {
        if (cat.id === confirmDelete.catId) {
          return null;
        }
        return cat;
      }).filter((cat): cat is Category => cat !== null));
    }
    setConfirmDelete(null);
  };

  const handleSaveCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("catTitle") as string).trim();

    if (editingCategory) {
      setConfig(prev => prev.map(cat => 
        cat.id === editingCategory.id ? { ...cat, title } : cat
      ));
    } else {
      setConfig(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        title,
        tools: []
      }]);
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
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsAdmin(!isAdmin)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isAdmin 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-blue-900/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {isAdmin ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span className="hidden sm:inline">{isAdmin ? "Admin Mode" : "Locked"}</span>
              </button>
              
              {!isAdmin && (
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
                    {isAdmin && (
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
                {isAdmin && (
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
                    isAdmin={isAdmin}
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

        {isAdmin && (
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
