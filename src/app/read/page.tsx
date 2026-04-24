"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Save, X } from 'lucide-react';

export default function ReadArticle() {
  const [article, setArticle] = useState<any>(null);
  const [selectedText, setSelectedText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem('currentArticle');
    if (saved) setArticle(JSON.parse(saved));
    else router.push('/');

    const handleSelection = () => {
      const text = window.getSelection()?.toString().trim() || "";
      if (text.length > 5) setSelectedText(text);
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [router]);

  const handleExplain = async () => {
    if (!selectedText) return;
    setIsExplaining(true);
    setExplanation("");
    
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: selectedText, 
          context: article.summary // Passing summary as context to save tokens, full HTML is too large without embeddings
        })
      });
      
      const data = await res.json();
      setExplanation(data.explanation || "Error fetching explanation.");
    } catch (e) {
      setExplanation("Connection error. Check your API key.");
    } finally {
      setIsExplaining(false);
    }
  };

  if (!article) return <div className="min-h-screen bg-gray-950"></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 max-w-2xl mx-auto relative pb-40">
      <nav className="sticky top-0 bg-gray-950/80 backdrop-blur-md p-4 border-b border-gray-800 z-40 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-900 rounded-full text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Reader Mode</div>
      </nav>

      <article className="p-6">
        <h1 className="text-3xl font-black mb-4 leading-tight text-white">{article.title}</h1>
        <div className="flex gap-2 items-center text-xs text-gray-400 mb-8 border-b border-gray-800 pb-4">
          <span className="bg-gray-800 px-2 py-1 rounded">{article.author}</span>
          <span>•</span>
          <span>{article.category}</span>
        </div>
        
        {/* Render actual HTML from RSS feed using Tailwind Typography plugin */}
        <div 
          className="prose prose-invert prose-emerald max-w-none prose-img:rounded-xl prose-a:text-emerald-400"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      </article>

      {/* Floating Ghostreader Bot */}
      <AnimatePresence>
        {(selectedText || explanation) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-gray-900 border border-gray-700 p-5 rounded-3xl shadow-2xl z-50"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <Sparkles size={16} /> Ghostreader
              </div>
              <button onClick={() => { setSelectedText(""); setExplanation(""); }} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl mb-4 text-xs text-gray-400 italic line-clamp-2">
              "{selectedText}"
            </div>

            {explanation ? (
              <div className="text-sm text-gray-200 leading-relaxed max-h-48 overflow-y-auto pr-2">
                {explanation}
              </div>
            ) : isExplaining ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-emerald-500"></div>
                Analyzing context...
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleExplain}
                  className="flex-1 bg-emerald-500 text-gray-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition"
                >
                  <Sparkles size={16} /> Explain Concept
                </button>
                <button className="px-4 bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center hover:bg-gray-700 transition">
                  <Save size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
