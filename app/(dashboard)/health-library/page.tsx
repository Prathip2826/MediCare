'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Clock, Bookmark, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { label: 'All', emoji: '📚' },
  { label: 'Heart', emoji: '❤️' },
  { label: 'Diabetes', emoji: '🩸' },
  { label: 'Mental Health', emoji: '🧠' },
  { label: 'Nutrition', emoji: '🥗' },
  { label: 'Fitness', emoji: '💪' },
  { label: "Women's Health", emoji: '♀️' },
  { label: 'Child Health', emoji: '👶' },
  { label: 'Senior Care', emoji: '🧓' },
];

const PRESET_ARTICLES = [
  { title: 'Understanding Hypertension', category: 'Heart', readTime: 5, prompt: 'Write a comprehensive yet accessible health article about hypertension (high blood pressure): causes, symptoms, risk factors, prevention, and management. Format with clear headings and bullet points.' },
  { title: 'Managing Type 2 Diabetes', category: 'Diabetes', readTime: 7, prompt: 'Write a comprehensive health article about Type 2 Diabetes: what it is, causes, symptoms, blood sugar management, diet tips, and lifestyle changes. Use clear headings.' },
  { title: 'Anxiety & Stress Management', category: 'Mental Health', readTime: 6, prompt: 'Write a health article about anxiety and stress management: types of anxiety, symptoms, evidence-based coping strategies, when to seek help, and self-care tips.' },
  { title: 'Heart-Healthy Diet Guide', category: 'Nutrition', readTime: 5, prompt: 'Write a health article about heart-healthy nutrition: foods to eat, foods to avoid, the Mediterranean diet, omega-3s, fiber, and practical meal planning tips.' },
  { title: 'Benefits of Regular Exercise', category: 'Fitness', readTime: 4, prompt: 'Write a health article about the benefits of regular exercise: cardiovascular health, mental health, weight management, bone density, and how to start a routine.' },
  { title: "Women's Hormonal Health", category: "Women's Health", readTime: 6, prompt: "Write a health article about women's hormonal health: menstrual cycle, PMS, PCOS, menopause, hormonal imbalances, and when to consult a gynecologist." },
  { title: 'Child Nutrition Essentials', category: 'Child Health', readTime: 5, prompt: 'Write a health article about child nutrition: essential nutrients for growth, healthy eating habits, dealing with picky eaters, and foods to limit or avoid.' },
  { title: 'Healthy Aging After 60', category: 'Senior Care', readTime: 6, prompt: 'Write a health article about healthy aging for seniors: common age-related conditions, preventive care, staying active, cognitive health, and social wellbeing.' },
  { title: 'Understanding Cholesterol', category: 'Heart', readTime: 5, prompt: 'Write a health article about cholesterol: HDL vs LDL, what levels mean, causes of high cholesterol, diet changes, medications, and cardiovascular risk.' },
  { title: 'Sleep Hygiene & Insomnia', category: 'Mental Health', readTime: 5, prompt: 'Write a health article about sleep hygiene and insomnia: causes of poor sleep, sleep hygiene tips, sleep disorders, when to see a doctor, and natural remedies.' },
];

export default function HealthLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openArticle, setOpenArticle] = useState<typeof PRESET_ARTICLES[0] | null>(null);
  const [content, setContent] = useState('');
  const [streaming, setStreaming] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const filtered = PRESET_ARTICLES.filter(a =>
    (activeCategory === 'All' || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAndLoad = async (article: typeof PRESET_ARTICLES[0]) => {
    setOpenArticle(article);
    if (content && openArticle?.title === article.title) return;
    setContent(''); setStreaming(''); setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: article.prompt }] }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.replace('data: ', '').trim(); if (data === '[DONE]') break;
          try { full += JSON.parse(data).choices?.[0]?.delta?.content || ''; setStreaming(full); } catch {}
        }
      }
      setContent(full); setStreaming('');
    } catch { setContent('Failed to load article. Please try again.'); }
    setLoading(false);
  };

  const toggleBookmark = (title: string) => {
    setBookmarks(prev => prev.includes(title) ? prev.filter(b => b !== title) : [...prev, title]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search health articles..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(c => (
            <button key={c.label} onClick={() => setActiveCategory(c.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${activeCategory === c.label ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-card'}`}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Article Grid */}
      {!openArticle ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-5 cursor-pointer card-hover group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{a.category}</span>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(a.title); }}
                  className={`p-1 rounded-lg transition-colors ${bookmarks.includes(a.title) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  <Bookmark size={14} fill={bookmarks.includes(a.title) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />{a.readTime} min read
                </div>
                <button onClick={() => openAndLoad(a)}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  Read <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No articles found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        /* Article Reader */
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setOpenArticle(null); setContent(''); setStreaming(''); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              ← Back
            </button>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{openArticle.category}</span>
            <div className="ml-auto flex items-center gap-2">
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{openArticle.readTime} min read</span>
              <button onClick={() => toggleBookmark(openArticle.title)}
                className={`p-1.5 rounded-lg transition-colors ml-2 ${bookmarks.includes(openArticle.title) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}>
                <Bookmark size={16} fill={bookmarks.includes(openArticle.title) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-6">{openArticle.title}</h1>
          {loading && !streaming && (
            <div className="flex items-center gap-3 text-muted-foreground py-8 justify-center">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm">Generating article with AI...</span>
            </div>
          )}
          {(streaming || content) && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-extrabold text-foreground mt-5 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-foreground">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary bg-primary/5 px-4 py-2 rounded-r-xl my-3">{children}</blockquote>
                  ),
                }}>
                {streaming || content}
              </ReactMarkdown>
              {loading && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />}
            </div>
          )}
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            ⚕️ This article is for informational purposes only. Always consult a healthcare professional for medical advice.
          </div>
        </motion.div>
      )}
    </div>
  );
}
