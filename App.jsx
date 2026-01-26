import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, List, EyeOff, Layout, Type, RefreshCw, AlertCircle, GraduationCap, ChevronRight, ChevronDown, Timer, Eye, Play, RotateCcw, AlignLeft, Grid3X3, Square, CaseSensitive, BookOpen, Keyboard, ArrowRight, Palette, Paintbrush, Mountain, Heart, History, Star, X, Library, Book, Bookmark } from 'lucide-react';

// Simplified Bible Metadata for the selector
const BIBLE_DATA = [
  { book: 'Genesis', chapters: 50 }, { book: 'Exodus', chapters: 40 }, { book: 'Leviticus', chapters: 27 },
  { book: 'Numbers', chapters: 36 }, { book: 'Deuteronomy', chapters: 34 }, { book: 'Joshua', chapters: 24 },
  { book: 'Judges', chapters: 21 }, { book: 'Ruth', chapters: 4 }, { book: '1 Samuel', chapters: 31 },
  { book: '2 Samuel', chapters: 24 }, { book: '1 Kings', chapters: 22 }, { book: '2 Kings', chapters: 25 },
  { book: '1 Chronicles', chapters: 29 }, { book: '2 Chronicles', chapters: 36 }, { book: 'Ezra', chapters: 10 },
  { book: 'Nehemiah', chapters: 13 }, { book: 'Esther', chapters: 10 }, { book: 'Job', chapters: 42 },
  { book: 'Psalms', chapters: 150 }, { book: 'Proverbs', chapters: 31 }, { book: 'Ecclesiastes', chapters: 12 },
  { book: 'Song of Solomon', chapters: 8 }, { book: 'Isaiah', chapters: 66 }, { book: 'Jeremiah', chapters: 52 },
  { book: 'Lamentations', chapters: 5 }, { book: 'Ezekiel', chapters: 48 }, { book: 'Daniel', chapters: 12 },
  { book: 'Hosea', chapters: 14 }, { book: 'Joel', chapters: 3 }, { book: 'Amos', chapters: 9 },
  { book: 'Obadiah', chapters: 1 }, { book: 'Jonah', chapters: 4 }, { book: 'Micah', chapters: 7 },
  { book: 'Nahum', chapters: 3 }, { book: 'Habakkuk', chapters: 3 }, { book: 'Zephaniah', chapters: 3 },
  { book: 'Haggai', chapters: 2 }, { book: 'Zechariah', chapters: 14 }, { book: 'Malachi', chapters: 4 },
  { book: 'Matthew', chapters: 28 }, { book: 'Mark', chapters: 16 }, { book: 'Luke', chapters: 24 },
  { book: 'John', chapters: 21 }, { book: 'Acts', chapters: 28 }, { book: 'Romans', chapters: 16 },
  { book: '1 Corinthians', chapters: 16 }, { book: '2 Corinthians', chapters: 13 }, { book: 'Galatians', chapters: 6 },
  { book: 'Ephesians', chapters: 6 }, { book: 'Philippians', chapters: 4 }, { book: 'Colossians', chapters: 4 },
  { book: '1 Thessalonians', chapters: 5 }, { book: '2 Thessalonians', chapters: 3 }, { book: '1 Timothy', chapters: 6 },
  { book: '2 Timothy', chapters: 4 }, { book: 'Titus', chapters: 3 }, { book: 'Philemon', chapters: 1 },
  { book: 'Hebrews', chapters: 13 }, { book: 'James', chapters: 5 }, { book: '1 Peter', chapters: 5 },
  { book: '2 Peter', chapters: 3 }, { book: '1 John', chapters: 5 }, { book: '2 John', chapters: 1 },
  { book: '3 John', chapters: 1 }, { book: 'Jude', chapters: 1 }, { book: 'Revelation', chapters: 22 }
];

// Helper to determine testament
const getTestament = (reference) => {
  if (!reference) return 'Old Testament';
  const bookName = reference.split(' ').slice(0, -1).join(' ').replace(/\s+\d+$/, '') || reference.split(' ')[0];
  const otBooks = BIBLE_DATA.slice(0, 39).map(b => b.book);
  return otBooks.includes(bookName) ? 'Old Testament' : 'New Testament';
};

// Library Item Component with Preview Logic
const LibraryItem = memo(({ passage, onSelect, isFavorite, theme, API_TOKEN }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPreview = async () => {
    if (previewText) return;
    setLoading(true);
    try {
      const url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(passage)}&include-headings=false&include-footnotes=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false`;
      const res = await fetch(url, { headers: { 'Authorization': `Token ${API_TOKEN}` } });
      const data = await res.json();
      setPreviewText(data.passages?.[0]?.trim() || "Preview unavailable.");
    } catch (e) {
      setPreviewText("Failed to load preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setShowPreview(true);
      fetchPreview();
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setShowPreview(!showPreview);
    if (!showPreview) fetchPreview();
  };

  const hoverBorderClass = theme.border ? theme.border.replace('border-', 'hover:border-') : 'hover:border-blue-500';
  const hoverShadowClass = theme.shadow ? theme.shadow.replace('shadow-', 'hover:shadow-') : 'hover:shadow-blue-50';

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { if (window.innerWidth >= 768) setShowPreview(false); }}
    >
      <div className={`group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all text-left ${hoverBorderClass} ${hoverShadowClass}`}>
        <button 
          onClick={() => onSelect(passage)}
          className="flex-1 font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors text-left"
        >
          {passage}
        </button>
        <div className="flex items-center gap-2">
          {isFavorite && <Star size={12} fill="#f43f5e" className="text-rose-500" />}
          <button 
            onClick={handleToggle}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} />
          </button>
          <ChevronRight size={14} className="text-slate-300 hidden md:block group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      
      {showPreview && (
        <div className="absolute z-[100] top-[calc(100%+8px)] left-0 right-0 p-4 bg-white rounded-3xl shadow-2xl border border-slate-200/60 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${theme.bg}`}></div>
          <div className="pl-3">
            <div className="text-[11px] leading-relaxed text-slate-600 font-medium max-h-32 overflow-y-auto no-scrollbar italic">
              {loading ? (
                <div className="flex items-center gap-2 not-italic">
                  <RefreshCw size={10} className="animate-spin text-blue-500" />
                  Fetching scripture...
                </div>
              ) : (
                `"${previewText}"`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Optimized Word Component to prevent unnecessary re-renders during layout shifts
const Word = memo(({ word, visibilityMode, revealedLetters, currentWpmIndex, showUnderlines, onClick }) => {
  const baseVisibility = visibilityMode === 'full' ? 99 : parseInt(visibilityMode);
  const extraReveal = revealedLetters[word.id] || 0;
  const totalVisible = baseVisibility + extraReveal;
  const charVisibleMode = visibilityMode === 'wpm' && word.id <= currentWpmIndex;

  let alphanumericCounter = 0;

  return (
    <div 
      onClick={() => onClick(word.id)}
      className={`cursor-pointer select-none transition-all group relative inline-flex items-baseline ${showUnderlines ? 'font-mono' : ''}`}
    >
      {word.letters.map((char, cIdx) => {
        const isPunctuation = /[^a-zA-Z0-9]/.test(char);
        let isCurrentlyVisible = false;
        
        if (visibilityMode === 'wpm') {
          isCurrentlyVisible = charVisibleMode;
        } else {
          if (isPunctuation) {
            isCurrentlyVisible = true;
          } else {
            isCurrentlyVisible = alphanumericCounter < totalVisible;
            alphanumericCounter++;
          }
        }

        return (
          <span 
            key={cIdx} 
            className={`transition-all duration-200 inline-block ${isCurrentlyVisible ? 'opacity-100' : 'opacity-0'} ${showUnderlines && !isCurrentlyVisible && !isPunctuation ? 'border-b-2 border-slate-200 !opacity-100 text-transparent' : ''}`}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
});

const App = () => {
  const API_TOKEN = '2e524054a71754facfb7f01d2a41452552d1b6a1';

  // Search/Selection State
  const [searchMode, setSearchMode] = useState('text'); 
  const [manualQuery, setManualQuery] = useState('John 3:16');
  
  // Selector State
  const [selBook, setSelBook] = useState('John');
  const [selChapter, setSelChapter] = useState('3');
  const [selVerse, setSelVerse] = useState('16');

  // App State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verseData, setVerseData] = useState(null);
  const [visibilityMode, setVisibilityMode] = useState('full'); 
  const [showUnderlines, setShowUnderlines] = useState(true);
  const [revealedLetters, setRevealedLetters] = useState({});
  const [fontOption, setFontOption] = useState('modern'); // classic, modern, mono, elegant, bold
  const [bgOption, setBgOption] = useState('blank'); // blank, papyrus, notepad, ivory, charcoal
  const [themeIdx, setThemeIdx] = useState(0);
  const [appBgIdx, setAppBgIdx] = useState(0);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Library State
  const [recentPassages, setRecentPassages] = useState([]);
  const [favoritePassages, setFavoritePassages] = useState([]);
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const [showAllOT, setShowAllOT] = useState(false);
  const [showAllNT, setShowAllNT] = useState(false);

  // App Background Themes
  const APP_BGS = [
    { id: 'neutral', name: 'Neutral', container: 'bg-neutral-100', text: 'text-slate-900', muted: 'text-slate-400', border: 'border-slate-300' },
    { id: 'forest', name: 'Forest Mist', container: 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950', text: 'text-emerald-50', muted: 'text-emerald-400/60', border: 'border-emerald-700/50' },
    { id: 'sunset', name: 'Golden Hour', container: 'bg-gradient-to-br from-orange-500 via-rose-600 to-indigo-900', text: 'text-orange-50', muted: 'text-orange-200/50', border: 'border-orange-400/30' },
    { id: 'ocean', name: 'Deep Sea', container: 'bg-gradient-to-br from-blue-700 via-indigo-900 to-black', text: 'text-blue-50', muted: 'text-blue-400/50', border: 'border-blue-800' },
    { id: 'bloom', name: 'Spring Bloom', container: 'bg-gradient-to-tr from-pink-100 via-emerald-50 to-blue-100', text: 'text-emerald-950', muted: 'text-emerald-800/40', border: 'border-emerald-200' },
    { id: 'midnight', name: 'Midnight', container: 'bg-slate-950', text: 'text-slate-100', muted: 'text-slate-600', border: 'border-slate-800' }
  ];
  const appBg = APP_BGS[appBgIdx];

  // Themes Configuration
  const THEMES = [
    { id: 'blue', text: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-500', shadow: 'shadow-blue-200', lightBg: 'bg-blue-50', focus: 'focus:border-blue-500' },
    { id: 'amber', text: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-500', shadow: 'shadow-amber-200', lightBg: 'bg-amber-50', focus: 'focus:border-amber-500' },
    { id: 'rose', text: 'text-rose-600', bg: 'bg-rose-600', border: 'border-rose-500', shadow: 'shadow-rose-200', lightBg: 'bg-rose-50', focus: 'focus:border-rose-500' },
    { id: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-500', shadow: 'shadow-emerald-200', lightBg: 'bg-emerald-50', focus: 'focus:border-emerald-500' },
    { id: 'violet', text: 'text-violet-600', bg: 'bg-violet-600', border: 'border-violet-500', shadow: 'shadow-violet-200', lightBg: 'bg-violet-50', focus: 'focus:border-violet-500' }
  ];
  const theme = THEMES[themeIdx];

  // WPM State
  const [wpmValue, setWpmValue] = useState(50);
  const [currentWpmIndex, setCurrentWpmIndex] = useState(-1);
  const [isWpmPlaying, setIsWpmPlaying] = useState(false);
  const [wpmCycleTarget, setWpmCycleTarget] = useState(5);
  const [wpmCycleCount, setWpmCycleCount] = useState(0);

  const chaptersList = useMemo(() => {
    const book = BIBLE_DATA.find(b => b.book === selBook);
    return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [1];
  }, [selBook]);

  const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const fetchPassage = async (overrideQuery = null) => {
    let finalQuery = overrideQuery || (searchMode === 'text' ? manualQuery : `${selBook} ${selChapter}:${selVerse}`);
    setLoading(true);
    setError(null);
    setRevealedLetters({});
    resetWpm();
    setIsLibraryOpen(false);

    try {
      const isFullBook = BIBLE_DATA.some(b => b.book.toLowerCase() === finalQuery.trim().toLowerCase());
      const selectedBookMeta = BIBLE_DATA.find(b => b.book.toLowerCase() === finalQuery.trim().toLowerCase());
      
      let chaptersToFetch = [];
      
      if (isFullBook && selectedBookMeta) {
        chaptersToFetch = Array.from({ length: selectedBookMeta.chapters }, (_, i) => `${selectedBookMeta.book} ${i + 1}`);
      } else {
        const rangeMatch = finalQuery.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
          const bookName = rangeMatch[1];
          const start = parseInt(rangeMatch[2]);
          const end = parseInt(rangeMatch[3]);
          for (let i = start; i <= end; i++) {
            chaptersToFetch.push(`${bookName} ${i}`);
          }
        } else {
          chaptersToFetch = [finalQuery];
        }
      }

      let allWords = [];
      let sections = [];
      let globalWordCounter = 0;

      for (const query of chaptersToFetch) {
        const esvUrl = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}&include-headings=false&include-footnotes=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false`;
        
        const data = await fetchWithRetry(esvUrl, {
          headers: { 'Authorization': `Token ${API_TOKEN}` }
        });

        if (data.passages?.[0]) {
          const rawText = data.passages[0].trim().replace(/([-–—])/g, ' $1 '); 
          const rawTokens = rawText.split(/\s+/);
          const processedTokens = rawTokens.filter(t => t.length > 0);

          const wordsInChapter = processedTokens.map((w) => {
            const wordObj = {
              id: globalWordCounter++,
              text: w,
              letters: w.split('')
            };
            allWords.push(wordObj);
            return wordObj;
          });

          sections.push({
            title: data.canonical,
            words: wordsInChapter
          });
        }
      }

      if (sections.length === 0) throw new Error("Passage not found.");

      const ref = isFullBook ? selectedBookMeta.book : (sections.length > 1 ? finalQuery : sections[0].title);
      
      setVerseData({ 
        reference: ref, 
        sections: sections,
        allWords: allWords
      });

      setRecentPassages(prev => {
        const filtered = prev.filter(p => p !== ref);
        return [ref, ...filtered].slice(0, 15);
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetWpm = () => {
    setIsWpmPlaying(false);
    setCurrentWpmIndex(-1);
    setWpmCycleCount(0);
  };

  const toggleFavorite = () => {
    if (!verseData) return;
    setFavoritePassages(prev => {
      if (prev.includes(verseData.reference)) {
        return prev.filter(p => p !== verseData.reference);
      }
      return [verseData.reference, ...prev];
    });
  };

  const toggleBookExpansion = (book) => {
    setExpandedBooks(prev => {
      const next = new Set(prev);
      if (next.has(book)) next.delete(book);
      else next.add(book);
      return next;
    });
  };

  useEffect(() => {
    let interval;
    if (visibilityMode === 'wpm' && isWpmPlaying && verseData?.allWords) {
      const msPerWord = (60 / wpmValue) * 1000;
      
      interval = setInterval(() => {
        setCurrentWpmIndex(prev => {
          if (prev >= verseData.allWords.length - 1) {
            setWpmCycleCount(c => {
              const nextCount = c + 1;
              if (nextCount >= wpmCycleTarget) {
                setIsWpmPlaying(false);
                return nextCount;
              }
              return nextCount;
            });
            return 0; 
          }
          return prev + 1;
        });
      }, msPerWord);
    }
    return () => clearInterval(interval);
  }, [visibilityMode, isWpmPlaying, wpmValue, verseData, wpmCycleTarget]);

  const toggleWpmValue = () => setWpmValue(prev => (prev >= 500 ? 50 : prev + 50));
  const toggleCycleTarget = () => setWpmCycleTarget(prev => (prev === 5 ? 10 : 5));
  
  const cycleFont = () => {
    const options = ['classic', 'modern', 'mono', 'elegant', 'bold'];
    const nextIdx = (options.indexOf(fontOption) + 1) % options.length;
    setFontOption(options[nextIdx]);
  };

  const cycleBg = () => {
    const options = ['blank', 'papyrus', 'notepad', 'ivory', 'charcoal'];
    const nextIdx = (options.indexOf(bgOption) + 1) % options.length;
    setBgOption(options[nextIdx]);
  };

  const handleWordClick = (wordGlobalIdx) => {
    if (visibilityMode === 'full') return;
    if (visibilityMode === 'wpm') {
      setCurrentWpmIndex(wordGlobalIdx);
      return;
    }
    setRevealedLetters(prev => ({
      ...prev,
      [wordGlobalIdx]: (prev[wordGlobalIdx] || 0) + 1
    }));
  };

  const getCanvasStyles = () => {
    switch(fontOption) {
      case 'classic': return { container: 'font-serif', heading: 'font-serif italic font-bold tracking-tight', passage: 'font-serif leading-relaxed tracking-normal' };
      case 'mono': return { container: 'font-mono', heading: 'font-mono font-black uppercase tracking-widest', passage: 'font-mono leading-loose tracking-tighter' };
      case 'elegant': return { container: 'font-serif', heading: 'font-serif font-light italic tracking-[0.2em] uppercase', passage: 'font-serif font-light leading-[1.8] tracking-wide' };
      case 'bold': return { container: 'font-sans', heading: 'font-sans font-black uppercase tracking-tighter scale-y-110', passage: 'font-sans font-extrabold leading-snug tracking-tight' };
      default: return { container: 'font-sans', heading: 'font-sans font-bold tracking-tight', passage: 'font-sans font-medium leading-[1.6]' };
    }
  };

  const getPaperStyles = () => {
    switch(bgOption) {
      case 'papyrus': return { paper: 'bg-[#f4e4bc] border-[#d9c59a] shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]', text: 'text-[#4a3721]' };
      case 'notepad': return { paper: 'bg-white border-[#e2e8f0] bg-[linear-gradient(transparent_0%,transparent_96%,#cbd5e1_96%)] bg-[length:100%_3rem] shadow-sm', text: 'text-slate-800' };
      case 'ivory': return { paper: 'bg-[#fdfcf0] border-[#f2f1e1] shadow-sm', text: 'text-slate-700' };
      case 'charcoal': return { paper: 'bg-slate-900 border-slate-800 shadow-2xl', text: 'text-slate-100' };
      default: return { paper: 'bg-white border-slate-100 shadow-2xl', text: 'text-slate-800' };
    }
  };

  const styles = getCanvasStyles();
  const paper = getPaperStyles();

  // Dashboard Grouping logic with Book Delineation
  const libraryGroups = useMemo(() => {
    const combined = Array.from(new Set([...favoritePassages, ...recentPassages]));
    const structure = {
      'Old Testament': {},
      'New Testament': {}
    };
    
    combined.forEach(p => {
      const testament = getTestament(p);
      const bookName = p.split(' ').slice(0, -1).join(' ').replace(/\s+\d+$/, '') || p.split(' ')[0];
      if (!structure[testament][bookName]) structure[testament][bookName] = [];
      structure[testament][bookName].push(p);
    });
    
    return structure;
  }, [favoritePassages, recentPassages]);

  return (
    <div className={`min-h-screen transition-all duration-700 p-4 md:p-10 font-sans ${appBg.container}`}>
      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.4);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        
        {/* Header - Dynamic visibility based on Environment */}
        <div className="mb-8 flex justify-between items-end font-sans">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter uppercase transition-all duration-300 ${appBg.text}`}>
              VERSE <span className={`${theme.text}`}>VAULT</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              className={`p-2.5 backdrop-blur-md border rounded-full shadow-sm transition-all active:scale-90 group ${
                isLibraryOpen 
                  ? `${theme.bg} ${theme.border} text-white` 
                  : (appBgIdx === 0 ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20')
              }`}
              title="Open Library"
            >
              <Library size={18} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => setAppBgIdx(prev => (prev + 1) % APP_BGS.length)}
              className={`p-2.5 backdrop-blur-md border rounded-full shadow-sm transition-all active:scale-90 group ${
                appBgIdx === 0 
                  ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' 
                  : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
              title={`Cycle Environment: ${appBg.name}`}
            >
              <Mountain size={18} className="group-hover:translate-y-[-1px] transition-transform" />
            </button>
            <button 
              onClick={() => setThemeIdx(prev => (prev + 1) % THEMES.length)}
              className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-90 group"
              title="Cycle Theme"
            >
              <Palette size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
            <div className={`hidden sm:block text-[10px] font-bold tracking-widest uppercase border-b-2 pb-0.5 transition-colors duration-300 ${appBg.muted} ${appBg.border}`}>
              ESV API v3
            </div>
          </div>
        </div>

        {/* Library Dashboard */}
        {isLibraryOpen && (
          <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 fade-in duration-300 origin-top">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 flex items-center gap-3">
                  <Book className={theme.text} size={24} />
                  Verse Library
                </h2>
                <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {Object.entries(libraryGroups).map(([testament, books]) => {
                  const bookEntries = Object.entries(books);
                  const isOT = testament === 'Old Testament';
                  const showAll = isOT ? showAllOT : showAllNT;
                  const visibleBooks = showAll ? bookEntries : bookEntries.slice(0, 6);

                  return (
                    <div key={testament} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{testament}</h3>
                        <div className="h-px flex-1 bg-slate-100"></div>
                      </div>
                      {bookEntries.length === 0 ? (
                        <p className="text-xs italic text-slate-300 py-4">No verses tracked in this testament yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {visibleBooks.map(([book, passages]) => {
                            const hasMultiple = passages.length > 1;
                            const isExpanded = expandedBooks.has(book);
                            
                            return (
                              <div key={book} className="space-y-2">
                                {hasMultiple ? (
                                  <button 
                                    onClick={() => toggleBookExpansion(book)}
                                    className={`w-full flex items-center justify-between text-[10px] font-black uppercase tracking-tighter pl-1 py-1 ${theme.text} opacity-70 hover:opacity-100 transition-opacity`}
                                  >
                                    <span>{book} ({passages.length})</span>
                                    <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                ) : (
                                  <h4 className={`text-[10px] font-black uppercase tracking-tighter pl-1 ${theme.text} opacity-70`}>{book}</h4>
                                )}
                                
                                {(!hasMultiple || isExpanded) && (
                                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {passages.map(p => (
                                      <LibraryItem 
                                        key={p}
                                        passage={p}
                                        onSelect={fetchPassage}
                                        isFavorite={favoritePassages.includes(p)}
                                        theme={theme}
                                        API_TOKEN={API_TOKEN}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {bookEntries.length > 6 && (
                            <button 
                              onClick={() => isOT ? setShowAllOT(!showAllOT) : setShowAllNT(!showAllNT)}
                              className={`w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-dashed rounded-xl transition-all ${theme.text} ${theme.lightBg} border-blue-200 hover:opacity-80`}
                            >
                              {showAll ? 'Show Less' : `+ Show ${bookEntries.length - 6} More Books`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-50 p-4 px-8 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {Array.from(new Set([...favoritePassages, ...recentPassages])).length} stored verses
              </span>
              <button 
                onClick={() => { setRecentPassages([]); setFavoritePassages([]); setExpandedBooks(new Set()); }}
                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
              >
                Clear All Data
              </button>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 mb-8 font-sans relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <div className="flex justify-end items-center mb-3">
                <button 
                  onClick={() => setSearchMode(searchMode === 'text' ? 'select' : 'text')}
                  className={`text-xs ${theme.text} hover:underline flex items-center gap-1.5 font-bold uppercase tracking-wider`}
                >
                  {searchMode === 'text' ? <BookOpen size={14}/> : <Keyboard size={14}/>}
                  {searchMode === 'text' ? 'Browse Library' : 'Direct Entry'}
                </button>
              </div>
              
              <div className="flex gap-2">
                {searchMode === 'text' ? (
                  <div className="relative w-full">
                    <input 
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchPassage()}
                      className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 pl-11 outline-none transition-all font-medium ${theme.focus} focus:bg-white`}
                      placeholder="e.g. Galatians 1-3"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <select value={selBook} onChange={(e) => setSelBook(e.target.value)} className={`flex-[2] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 font-medium outline-none ${theme.focus}`}>
                      {BIBLE_DATA.map(b => <option key={b.book} value={b.book}>{b.book}</option>)}
                    </select>
                    <select value={selChapter} onChange={(e) => setSelChapter(e.target.value)} className={`flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 font-medium outline-none ${theme.focus}`}>
                      {chaptersList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex-1 relative">
                      <input type="number" value={selVerse} onChange={(e) => setSelVerse(e.target.value)} placeholder="V" className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 font-medium outline-none ${theme.focus}`} />
                    </div>
                  </div>
                )}
                
                <button onClick={() => fetchPassage()} disabled={loading} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50">
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Library Section */}
        <div className="flex flex-col gap-4 mb-8 font-sans animate-in fade-in slide-in-from-top-4 w-full">
          {favoritePassages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar w-full touch-pan-x scroll-smooth snap-x snap-mandatory">
              <div className="sticky left-0 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm z-10 snap-start">
                <Star size={12} fill="white" />
                Favorites
              </div>
              {favoritePassages.map(p => (
                <button 
                  key={p} 
                  onClick={() => fetchPassage(p)}
                  className={`px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-all shrink-0 whitespace-nowrap shadow-sm snap-start`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          
          {recentPassages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar w-full touch-pan-x scroll-smooth snap-x snap-mandatory">
              <div className={`sticky left-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm z-10 snap-start`}>
                <History size={12} />
                Recent
              </div>
              {recentPassages.map(p => (
                <button 
                  key={p} 
                  onClick={() => fetchPassage(p)}
                  className={`px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-800 transition-all shrink-0 whitespace-nowrap shadow-sm snap-start`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Memory Toolbar */}
        <div className="sticky top-4 z-50 flex flex-col gap-3 bg-neutral-50/80 backdrop-blur-md py-3 px-3 rounded-2xl font-sans border border-white/20 shadow-sm transition-all duration-300 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-3 md:justify-between w-full">
            <div className="flex bg-white rounded-xl shadow-lg border border-slate-200 p-1 w-full md:w-auto justify-between md:justify-start overflow-x-auto">
              <button
                onClick={() => { setVisibilityMode('full'); resetWpm(); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  visibilityMode === 'full' ? `${theme.bg} text-white shadow-lg ${theme.shadow}` : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Eye size={16} />
              </button>
              {['1', '2', '3'].map((id) => (
                <button
                  key={id}
                  onClick={() => { setVisibilityMode(id); resetWpm(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    visibilityMode === id ? `${theme.bg} text-white shadow-lg ${theme.shadow}` : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black text-sm">{id}L</span>
                </button>
              ))}
              <button
                onClick={() => { setVisibilityMode('wpm'); }}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-l border-slate-100 ml-1 ${
                  visibilityMode === 'wpm' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Timer size={14} />
                WPM
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={cycleFont}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                <CaseSensitive size={14} />
                {fontOption}
              </button>

              <button
                onClick={cycleBg}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                <Paintbrush size={14} />
                {bgOption}
              </button>

              <button
                onClick={() => setShowUnderlines(!showUnderlines)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                  showUnderlines ? 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50' : 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200'
                }`}
              >
                {showUnderlines ? <AlignLeft size={14} /> : <Grid3X3 size={14} />}
                {showUnderlines ? 'No Lines' : 'Lines'}
              </button>
            </div>
          </div>

          {/* WPM Reader HUD */}
          {visibilityMode === 'wpm' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3 border-t border-slate-200/50 animate-in slide-in-from-top-2">
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                <button onClick={toggleWpmValue} className={`px-4 py-1.5 ${theme.lightBg} border ${theme.border} border-opacity-30 rounded-lg text-[10px] font-black ${theme.text} hover:opacity-80 transition-opacity`}>{wpmValue} WPM</button>
                <button onClick={toggleCycleTarget} className={`px-4 py-1.5 ${theme.lightBg} border ${theme.border} border-opacity-30 rounded-lg text-[10px] font-black ${theme.text} hover:opacity-80 transition-opacity`}>{wpmCycleTarget} CYCLES</button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className={`text-[10px] font-black text-white tracking-widest uppercase ${theme.bg} px-4 py-1.5 rounded-full border border-black/10 shadow-sm`}>
                  CYCLE {wpmCycleCount} / {wpmCycleTarget}
                </div>
                <button 
                  onClick={() => setIsWpmPlaying(!isWpmPlaying)} 
                  className={`p-3 rounded-full transition-all shadow-md active:scale-95 ${isWpmPlaying ? 'bg-slate-900 text-white ring-4 ring-slate-100' : `${theme.bg} text-white hover:opacity-90 shadow-lg ${theme.shadow}`}`}
                >
                  {isWpmPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verse Canvas */}
        <div className={`${paper.paper} rounded-[2.5rem] border p-8 md:p-16 min-h-[450px] relative overflow-hidden transition-all duration-500 ${styles.container}`}>
          {verseData ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <header className={`flex flex-col items-center justify-center mb-16 pb-8 border-b ${bgOption === 'charcoal' ? 'border-white/10' : 'border-black/5'} font-sans relative`}>
                <div className="relative group flex items-center gap-4">
                  <h2 className={`text-2xl text-center ${styles.heading} ${paper.text}`}>
                    {verseData.reference}
                  </h2>
                  <button 
                    onClick={toggleFavorite}
                    className={`transition-all active:scale-90 hover:scale-110 p-1.5 rounded-full ${favoritePassages.includes(verseData.reference) ? 'text-rose-500' : 'text-slate-300'}`}
                  >
                    <Heart size={20} fill={favoritePassages.includes(verseData.reference) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className={`w-12 h-1 ${theme.bg} mx-auto mt-2 rounded-full transform transition-transform group-hover:scale-x-125`}></div>
              </header>
              
              <div className="space-y-20">
                {verseData.sections.map((section, sIdx) => (
                  <div key={sIdx} className="animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-1 h-8 ${theme.bg} rounded-full`}></div>
                      <h3 className={`text-xl ${theme.text} capitalize ${styles.heading}`}>
                        {section.title}
                      </h3>
                      <div className={`flex-1 h-px ${bgOption === 'charcoal' ? 'bg-white/10' : 'bg-black/5'}`}></div>
                    </div>
                    <div className={`flex flex-wrap ${showUnderlines ? 'gap-x-4 gap-y-6' : 'gap-x-1.5 gap-y-4'} text-2xl md:text-3xl font-medium ${paper.text} ${styles.passage}`}>
                      {section.words.map((word) => (
                        <Word 
                          key={word.id}
                          word={word}
                          visibilityMode={visibilityMode}
                          revealedLetters={revealedLetters}
                          currentWpmIndex={currentWpmIndex}
                          showUnderlines={showUnderlines}
                          onClick={handleWordClick}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 pt-20 font-sans">
              <EyeOff size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-xl font-bold text-slate-300">Ready to memorize?</p>
              <p className="text-sm font-medium text-slate-300 mt-1 uppercase tracking-tighter">Choose a passage above</p>
            </div>
          )}
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-sans animate-in slide-in-from-bottom-4 shadow-sm">
            <AlertCircle size={20} />
            <span className="font-bold text-sm uppercase tracking-tight">{error}</span>
          </div>
        )}

        <footer className="mt-12 text-center pb-20 font-sans">
          <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${appBg.muted}`}>ESV® Bible • Crossway Publishing • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
