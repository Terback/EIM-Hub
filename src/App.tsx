/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Calendar, 
  Package, 
  GraduationCap, 
  ClipboardCheck, 
  ExternalLink,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

interface Tool {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const isPlaceholder = tool.link === "#" || tool.comingSoon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 group-hover:text-[#1565c0] group-hover:bg-blue-50 transition-colors">
          {tool.icon}
        </div>
        {!isPlaceholder && (
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
        {tool.title}
        {tool.comingSoon && (
          <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            Soon
          </span>
        )}
      </h3>
      
      <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">
        {tool.description}
      </p>

      <div className="mt-auto">
        {isPlaceholder ? (
          <button 
            disabled
            className="w-full py-2 px-4 bg-slate-50 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-100"
          >
            Coming Soon
          </button>
        ) : (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors group/btn"
          >
            Open Tool
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

const Section: React.FC<{ title: string; tools: Tool[] }> = ({ title, tools }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-grow bg-slate-200"></div>
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
        {title}
      </h2>
      <div className="h-px flex-grow bg-slate-200"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool, idx) => (
        <ToolCard key={idx} tool={tool} />
      ))}
    </div>
  </section>
);

export default function App() {
  const operationsTools: Tool[] = [
    {
      title: "Invoice Generator",
      description: "Generate professional invoices quickly for EIM operations and client billing.",
      link: "https://invoice.eimtechnology.com/",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Team Schedule",
      description: "Manage and view internal team schedules, shifts, and project timelines.",
      link: "https://teamschedule.eimtechnology.com/",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: "Inventory System",
      description: "Manage inventory and logistics for STEM kits and electronic components.",
      link: "#",
      icon: <Package className="w-6 h-6" />,
      comingSoon: true,
    },
  ];

  const educationTools: Tool[] = [
    {
      title: "Training Platform",
      description: "Access EIM Academy training system, curriculum, and learning resources (CN).",
      link: "https://training.eimacademy.com/",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      title: "Report Generator",
      description: "Automatically generate structured student reports and performance assessments.",
      link: "https://eim-training-report-generator.vercel.app/",
      icon: <ClipboardCheck className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <img 
                  src="https://github.com/Terback/Images/blob/main/logo/logo%20color%20palette-website-01.png?raw=true" 
                  alt="EIM Logo" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Hub
                </h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Tools for Hands-on STEM Education & Operations
              </p>
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1565c0] rounded-full text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1565c0]"></span>
                </span>
                System Operational
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Section title="Operations" tools={operationsTools} />
          <Section title="Education" tools={educationTools} />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-400 font-medium">
            More tools coming soon — Built by EIM Technology
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
              v1.0.0
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
              Internal Use Only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
