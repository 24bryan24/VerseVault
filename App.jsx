import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, List, EyeOff, Layout, Type, RefreshCw, AlertCircle, GraduationCap, ChevronRight, Timer, Eye, Play, RotateCcw, AlignLeft, Grid3X3, Square, CaseSensitive, BookOpen, Keyboard, ArrowRight, Palette } from 'lucide-react';

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

// Optimized Word Component to prevent unnecessary re-renders during layout shifts
const Word = memo(({ word, visibilityMode, revealedLetters, currentWpmIndex, showUnderlines, onClick }) => {
  const baseVisibility = visibilityMode === 'full' ? 99 : parseInt(visibilityMode);
  const extraReveal = revealedLetters[word.id] || 0;
  const totalVisible = baseVisibility + extraReveal;
  // Surgical Edit: Changed logic to <= to create a "Revealer" effect instead of a single word flasher
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
  const [themeIdx, setThemeIdx] = useState(0);

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

  const fetchPassage = async () => {
    let finalQuery = searchMode === 'text' ? manualQuery : `${selBook} ${selChapter}:${selVerse}`;
    setLoading(true);
    setError(null);
    setRevealedLetters({});
    resetWpm();

    try {
      // Check for range patterns like "Galatians 1-3" or "Psalm 23"
      const isFullBook = BIBLE_DATA.some(b => b.book.toLowerCase() === finalQuery.trim().toLowerCase());
      const selectedBookMeta = BIBLE_DATA.find(b => b.book.toLowerCase() === finalQuery.trim().toLowerCase());
      
      let chaptersToFetch = [];
      
      if (isFullBook && selectedBookMeta) {
        chaptersToFetch = Array.from({ length: selectedBookMeta.chapters }, (_, i) => `${selectedBookMeta.book} ${i + 1}`);
      } else {
        // Basic check for chapter range in manual query like "Galatians 1-3"
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

      setVerseData({ 
        reference: isFullBook ? selectedBookMeta.book : (sections.length > 1 ? finalQuery : sections[0].title), 
        sections: sections,
        allWords: allWords
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

  const handleWordClick = (wordGlobalIdx) => {
    if (visibilityMode === 'full') return;
    // Surgical Edit: Allow clicking to jump the WPM playhead while maintaining the current pause/playing state
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

  const styles = getCanvasStyles();

  return (
    <div className={`min-h-screen bg-neutral-50 text-slate-900 p-4 md:p-10 font-sans`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header - Fixed UI font */}
        <div className="mb-8 flex justify-between items-end font-sans">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase transition-all duration-300">
              VERSE <span className={`${theme.text}`}>VAULT</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setThemeIdx(prev => (prev + 1) % THEMES.length)}
              className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-90 group"
              title="Cycle Theme"
            >
              <Palette size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
            <div className="hidden sm:block text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b-2 border-slate-200 pb-0.5">
              ESV API v3
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 mb-8 font-sans">
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
                
                <button onClick={fetchPassage} disabled={loading} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50">
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={24} />}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Sticky Memory Toolbar */}
        <div className="sticky top-4 z-50 flex flex-col gap-3 bg-neutral-50/80 backdrop-blur-md py-3 px-3 rounded-2xl font-sans border border-white/20 shadow-sm transition-all duration-300">
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
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl shadow-lg text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                <CaseSensitive size={16} />
                {fontOption}
              </button>

              <button
                onClick={() => setShowUnderlines(!showUnderlines)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl shadow-lg text-xs font-bold uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                  showUnderlines ? 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50' : 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200'
                }`}
              >
                {showUnderlines ? <AlignLeft size={16} /> : <Grid3X3 size={16} />}
                {showUnderlines ? 'No Underline' : 'Underline'}
              </button>
            </div>
          </div>

          {/* WPM Reader HUD - Sticky Integration */}
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
        <div className={`bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-16 min-h-[450px] relative overflow-hidden ${styles.container}`}>
          {verseData ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              {/* Prominent Centered Header */}
              <header className="flex flex-col items-center justify-center mb-16 pb-8 border-b border-slate-50 font-sans">
                <div className="relative group">
                  <h2 className={`text-2xl text-slate-900 text-center ${styles.heading}`}>
                    {verseData.reference}
                  </h2>
                  <div className={`w-12 h-1 ${theme.bg} mx-auto mt-2 rounded-full transform transition-transform group-hover:scale-x-125`}></div>
                </div>
              </header>
              
              <div className="space-y-20">
                {verseData.sections.map((section, sIdx) => (
                  <div key={sIdx} className="animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-1 h-8 ${theme.bg} rounded-full`}></div>
                      <h3 className={`text-xl ${theme.text} capitalize ${styles.heading}`}>
                        {section.title}
                      </h3>
                      <div className={`flex-1 h-px ${theme.lightBg}`}></div>
                    </div>
                    <div className={`flex flex-wrap ${showUnderlines ? 'gap-x-4 gap-y-6' : 'gap-x-1.5 gap-y-4'} text-2xl md:text-3xl font-medium text-slate-800 ${styles.passage}`}>
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

        <footer className="mt-12 text-center pb-20 font-sans">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ESV® Bible • Crossway Publishing • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
