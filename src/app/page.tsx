"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Activity, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Feed() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("All");
  const router = useRouter();

  const TOPICS = ["All", "AI/ML", "Onyx Longterm", "Trading"];

  useEffect(() => {
    async function loadFeeds() {
      try {
        const res = await fetch('/api/feed');
        const data = await res.json();
        if (data.articles) setArticles(data.articles);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFeeds();
  }, []);

  const filteredArticles = activeTopic === "All" 
    ? articles 
    : articles.filter(a => a.category === activeTopic);

  const openArticle = (article: any) => {
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    router.push('/read');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 pb-32 font-sans max-w-md mx-auto relative shadow-2xl">
      <header className="mb-6 pt-4">
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Discovery
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Live Knowledge Feed</p>
      </header>

      <div className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="text-sm text-gray-500 animate-pulse">Fetching live data streams...</p>
          </div>
        ) : (
          filteredArticles.map((article, index) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openArticle(article)}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg cursor-pointer hover:border-gray-700 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                  {article.category}
                </span>
                <span className="text-xs text-gray-500 font-medium">{new Date(article.published).toLocaleDateString()}</span>
              </div>
              <h2 className="text-xl font-bold mb-3 leading-snug text-gray-100">{article.title}</h2>
              <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-5">{article.summary}</p>
              
              <div className="flex items-center text-xs font-semibold text-gray-500 gap-2">
                <BookOpen size={14} />
                <span>Read & Analyze</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 p-4 z-50 flex gap-3 overflow-x-auto scrollbar-hide items-center justify-start rounded-t-3xl">
        {TOPICS.map(topic => (
          <button 
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`whitespace-nowrap px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTopic === topic 
                ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-900/20' 
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
            }`}
          >
            {topic === "Onyx Longterm" && <Code size={14} />}
            {topic === "Trading" && <Activity size={14} />}
            {topic === "All" && <BookOpen size={14} />}
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
