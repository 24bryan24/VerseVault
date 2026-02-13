import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { getUserPassages, setUserPassages } from './firebase';
import { List, EyeOff, Layout, Type, RefreshCw, AlertCircle, GraduationCap, ChevronRight, ChevronDown, Timer, Eye, Play, RotateCcw, AlignLeft, Grid3X3, Square, CaseSensitive, BookOpen, Keyboard, ArrowRight, Palette, Paintbrush, Mountain, Heart, History, Star, X, Library, Book, Bookmark, LogIn, Trash2, Lightbulb, Paperclip } from 'lucide-react';

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

// Verse count per chapter per book (ESV), same order as BIBLE_DATA; [bookIndex][chapterIndex] = verse count
const VERSE_COUNTS_BY_BOOK = [
  [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26],
  [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34],
  [54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13],
  [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],
  [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],
  [36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25],
  [22,23,18,22],
  [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13],
  [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25],
  [53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53],
  [18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30],
  [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30],
  [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23],
  [11,70,13,24,17,22,28,36,15,44],
  [11,20,32,23,19,19,73,18,38,39,36,47,31],
  [22,23,15,17,14,14,10,17,32,3],
  [22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17],
  [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6],
  [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31],
  [18,26,22,16,20,12,29,17,18,20,10,14],
  [17,17,11,16,16,13,13,14],
  [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24],
  [19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34],
  [22,22,66,22,22],
  [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35],
  [21,49,30,37,31,28,28,27,27,21,45,13],
  [11,23,5,19,15,11,16,14,17,15,12,14,16,9],
  [20,32,21],
  [15,16,15,13,27,14,17,14,15],
  [21],
  [17,10,10,11],
  [16,13,12,13,15,16,20],
  [15,13,19],
  [17,20,19],
  [18,15,20],
  [15,23],
  [21,13,10,14,11,15,14,23,17,12,17,14,9,21],
  [14,17,18,6],
  [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],
  [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],
  [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],
  [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],
  [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31],
  [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],
  [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24],
  [24,17,18,18,21,18,16,24,15,18,33,21,14],
  [24,21,29,31,26,18],
  [23,22,21,32,33,24],
  [30,30,21,23],
  [29,23,25,18],
  [10,20,13,18,28],
  [12,17,18],
  [20,15,16,16,25,21],
  [18,26,17,22],
  [16,15,15],
  [25],
  [14,18,19,16,14,20,28,13,28,39,40,29,25],
  [27,26,18,17,20],
  [25,25,22,19,14],
  [21,22,18],
  [10,29,24,21,21],
  [13],
  [15],
  [25],
  [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21]
];

// Helper to determine testament
const getTestament = (reference) => {
  if (!reference) return 'Old Testament';
  const bookName = reference.split(' ').slice(0, -1).join(' ').replace(/\s+\d+$/, '') || reference.split(' ')[0];
  const otBooks = BIBLE_DATA.slice(0, 39).map(b => b.book);
  return otBooks.includes(bookName) ? 'Old Testament' : 'New Testament';
};

// Library Item Component with Preview Logic
const LibraryItem = memo(({ passage, onSelect, onRemove, isFavorite, theme, API_TOKEN }) => {
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
  const hoverTextClass = theme.text ? theme.text.replace('text-', 'group-hover:text-') : 'group-hover:text-blue-600';

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { if (window.innerWidth >= 768) setShowPreview(false); }}
    >
      <div className={`group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all text-left ${hoverBorderClass} ${hoverShadowClass}`}>
        <button 
          onClick={() => onSelect(passage)}
          className={`flex-1 font-bold text-sm text-slate-700 ${hoverTextClass} transition-colors text-left min-w-0 truncate pr-2`}
        >
          {passage}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(passage); }}
              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
              title="Remove from library"
            >
              <Trash2 size={14} />
            </button>
          )}
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
  const [manualQuery, setManualQuery] = useState('');
  
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
  const [showFirstLetters, setShowFirstLetters] = useState(false);
  const [bunchedReveal, setBunchedReveal] = useState({}); // wordId -> extra letters revealed (Bunched + 1L/2L/3L)
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState('idle'); // idle | sending | success | error
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [suggestionFile, setSuggestionFile] = useState(null);
  const suggestionFileInputRef = useRef(null);
  const toolbarSentinelRef = useRef(null);
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);

  // Library State
  const [recentPassages, setRecentPassages] = useState([]);
  const [favoritePassages, setFavoritePassages] = useState([]);
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const [showAllOT, setShowAllOT] = useState(false);
  const [showAllNT, setShowAllNT] = useState(false);

  const { user } = useUser();
  const userId = user?.id ?? null;
  const userDataLoadedRef = useRef(false);
  const skipNextSyncRef = useRef(false);
  const searchInputRef = useRef(null);

  // Load recent/favorites and all preferences from Firestore when user signs in; clear when signed out
  useEffect(() => {
    if (userId) {
      userDataLoadedRef.current = false;
      getUserPassages(userId).then(({
        recentPassages: recent,
        favoritePassages: fav,
        themeIdx: savedThemeIdx,
        appBgIdx: savedAppBgIdx,
        fontOption: savedFontOption,
        bgOption: savedBgOption,
        lastPassage: savedLastPassage,
        visibilityMode: savedVisibilityMode,
        showFirstLetters: savedShowFirstLetters,
      }) => {
        setRecentPassages(Array.isArray(recent) ? recent : []);
        setFavoritePassages(Array.isArray(fav) ? fav : []);
        if (typeof savedThemeIdx === 'number' && savedThemeIdx >= 0 && savedThemeIdx < 5) setThemeIdx(savedThemeIdx);
        if (typeof savedAppBgIdx === 'number' && savedAppBgIdx >= 0 && savedAppBgIdx < 6) setAppBgIdx(savedAppBgIdx);
        if (typeof savedFontOption === 'string') setFontOption(savedFontOption);
        if (typeof savedBgOption === 'string') setBgOption(savedBgOption);
        // Keep search bar empty on refresh so placeholder shows; last passage still loads below
        if (typeof savedVisibilityMode === 'string') setVisibilityMode(savedVisibilityMode);
        if (typeof savedShowFirstLetters === 'boolean') setShowFirstLetters(savedShowFirstLetters);
        userDataLoadedRef.current = true;
        skipNextSyncRef.current = true; // Don't write back immediately after load
        if (savedLastPassage && savedLastPassage.trim()) fetchPassage(savedLastPassage);
      });
    } else {
      setRecentPassages([]);
      setFavoritePassages([]);
      userDataLoadedRef.current = false;
      skipNextSyncRef.current = false;
    }
  }, [userId]);

  // Sync recent/favorites and all preferences to Firestore when they change (only after initial load; skip first run after load)
  useEffect(() => {
    if (!userId || !userDataLoadedRef.current) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    setUserPassages(userId, {
      recentPassages,
      favoritePassages,
      themeIdx,
      appBgIdx,
      fontOption,
      bgOption,
      lastPassage: verseData?.reference ?? '',
      visibilityMode,
      showFirstLetters,
    });
  }, [userId, recentPassages, favoritePassages, themeIdx, appBgIdx, fontOption, bgOption, verseData?.reference, visibilityMode, showFirstLetters]);

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

  const versesList = useMemo(() => {
    const bookIdx = BIBLE_DATA.findIndex(b => b.book === selBook);
    if (bookIdx < 0 || !VERSE_COUNTS_BY_BOOK[bookIdx]) return Array.from({ length: 31 }, (_, i) => i + 1);
    const chIdx = parseInt(selChapter, 10) - 1;
    const counts = VERSE_COUNTS_BY_BOOK[bookIdx];
    const verseCount = counts[chIdx] ?? 31;
    return Array.from({ length: verseCount }, (_, i) => i + 1);
  }, [selBook, selChapter]);

  // When book/chapter changes, clamp verse to valid range for that chapter
  useEffect(() => {
    const bookIdx = BIBLE_DATA.findIndex(b => b.book === selBook);
    if (bookIdx < 0 || !VERSE_COUNTS_BY_BOOK[bookIdx]) return;
    const chIdx = parseInt(selChapter, 10) - 1;
    const maxVerse = VERSE_COUNTS_BY_BOOK[bookIdx][chIdx] ?? 31;
    const v = parseInt(selVerse, 10);
    if (v > maxVerse || isNaN(v) || v < 1) setSelVerse(String(maxVerse));
  }, [selBook, selChapter, selVerse]);

  // Detect when sticky toolbar has hit the top (for mobile compact layout)
  useEffect(() => {
    const sentinel = toolbarSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsToolbarStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
    let finalQuery = overrideQuery;
    if (finalQuery == null) {
      if (searchMode === 'text') {
        finalQuery = manualQuery;
      } else {
        const bookIdx = BIBLE_DATA.findIndex(b => b.book === selBook);
        const chIdx = parseInt(selChapter, 10) - 1;
        const maxVerse = (bookIdx >= 0 && VERSE_COUNTS_BY_BOOK[bookIdx]) ? (VERSE_COUNTS_BY_BOOK[bookIdx][chIdx] ?? 31) : 31;
        const v = parseInt(selVerse, 10);
        if (v === maxVerse) {
          finalQuery = `${selBook} ${selChapter}`;
        } else {
          finalQuery = `${selBook} ${selChapter}:${selVerse}`;
        }
      }
    }
    setLoading(true);
    setError(null);
    setRevealedLetters({});
    setBunchedReveal({});
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

  const removeFromFavorites = (passage) => {
    setFavoritePassages(prev => prev.filter(p => p !== passage));
  };

  const removeFromRecents = (passage) => {
    setRecentPassages(prev => prev.filter(p => p !== passage));
  };

  const removeFromLibrary = (passage) => {
    setFavoritePassages(prev => prev.filter(p => p !== passage));
    setRecentPassages(prev => prev.filter(p => p !== passage));
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    const formId = import.meta.env.VITE_FORMSPREE_FORM_ID;
    if (!formId) {
      setSuggestionStatus('error');
      return;
    }
    setSuggestionStatus('sending');
    const formData = new FormData();
    formData.append('name', suggestionName.trim() || 'Anonymous');
    formData.append('message', suggestionMessage.trim());
    formData.append('_subject', 'VerseVault: Suggestion or Bug Report');
    if (suggestionFile) formData.append('file', suggestionFile);
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setSuggestionStatus('success');
        setSuggestionName('');
        setSuggestionMessage('');
        setSuggestionFile(null);
        if (suggestionFileInputRef.current) suggestionFileInputRef.current.value = '';
      } else {
        setSuggestionStatus('error');
      }
    } catch {
      setSuggestionStatus('error');
    }
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

  // Reference search: switch to number keyboard after book name (1st space if book doesn't start with digit, 2nd space if it does)
  const searchIsNumberPhase = useMemo(() => {
    const q = manualQuery;
    const spaceCount = (q.match(/\s/g) || []).length;
    const first = q.trimStart()[0];
    if (!first) return false;
    if (/\d/.test(first)) return spaceCount >= 2;
    return spaceCount >= 1;
  }, [manualQuery]);

  // After colon has been used and there's at least one digit to the right, show dash instead of colon (e.g. for "John 3:16-17")
  const searchShowDashButton = useMemo(() => {
    if (!searchIsNumberPhase) return false;
    const q = manualQuery;
    const lastColon = q.lastIndexOf(':');
    if (lastColon < 0) return false;
    return /\d/.test(q.slice(lastColon + 1));
  }, [manualQuery, searchIsNumberPhase]);

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

  // Dynamic visible count calculation
  const visibleVerseCount = useMemo(() => {
    let count = 0;
    Object.entries(libraryGroups).forEach(([testament, books]) => {
      const isOT = testament === 'Old Testament';
      const showAll = isOT ? showAllOT : showAllNT;
      const bookEntries = Object.entries(books);
      const visibleBooks = showAll ? bookEntries : bookEntries.slice(0, 6);

      visibleBooks.forEach(([book, passages]) => {
        const hasMultiple = passages.length > 1;
        const isExpanded = expandedBooks.has(book);
        if (!hasMultiple || isExpanded) {
          count += passages.length;
        }
      });
    });
    return count;
  }, [libraryGroups, showAllOT, showAllNT, expandedBooks]);

  // Split allWords into sentences (words ending with . ! ?)
  const sentences = useMemo(() => {
    if (!verseData?.allWords?.length) return [];
    const list = [];
    let current = [];
    for (const word of verseData.allWords) {
      current.push(word);
      const lastChar = word.text.slice(-1);
      if (['.', '!', '?'].includes(lastChar)) {
        list.push([...current]);
        current = [];
      }
    }
    if (current.length) list.push(current);
    return list;
  }, [verseData?.allWords]);

  // Bunched letters logic - Preserving casing, punctuation, quotes, dashes, hyphens
  const firstLetterTape = useMemo(() => {
    if (!verseData?.allWords) return '';
    // Corresponds to visibility mode: 1L = 1 letter, 2L = 2 letters, etc.
    const limit = (visibilityMode === 'full' || visibilityMode === 'wpm') ? 999 : parseInt(visibilityMode);
    // Add 1 small space between words for 'full', '2', '3'
    const joinChar = (visibilityMode === 'full' || visibilityMode === '2' || visibilityMode === '3') ? ' ' : '';
    
    return verseData.allWords
      .map(w => {
        const text = w.text;
        let alphaFound = 0;
        let constructed = "";
        
        for (let char of text) {
          const isAlpha = /[a-zA-Z0-9]/.test(char);
          if (isAlpha) {
            if (alphaFound < limit) {
              constructed += char;
              alphaFound++;
            }
          } else {
            constructed += char;
          }
        }
        return constructed;
      })
      .join(joinChar);
  }, [verseData, visibilityMode]);

  // Build display string for a list of words with base limit + bunchedReveal (for click-to-reveal sentences)
  const getBunchedSentenceDisplay = (words, baseLimit, revealMap) => {
    const joinChar = ' ';
    return words
      .map(w => {
        let alphaFound = 0;
        const limit = baseLimit + (revealMap[w.id] || 0);
        let constructed = "";
        for (const char of w.text) {
          const isAlpha = /[a-zA-Z0-9]/.test(char);
          if (isAlpha) {
            if (alphaFound < limit) {
              constructed += char;
              alphaFound++;
            }
          } else {
            constructed += char;
          }
        }
        return constructed;
      })
      .join(joinChar);
  };

  const handleBunchedWordClick = (wordId) => {
    const baseLimit = (visibilityMode === 'full' || visibilityMode === 'wpm') ? 999 : parseInt(visibilityMode);
    const word = verseData?.allWords?.find(w => w.id === wordId);
    if (!word) return;
    const countAlphanumeric = (w) => w.text.split('').filter(c => /[a-zA-Z0-9]/.test(c)).length;
    const totalAlpha = countAlphanumeric(word);
    const currentReveal = bunchedReveal[wordId] || 0;
    if (baseLimit + currentReveal < totalAlpha) {
      setBunchedReveal(prev => ({ ...prev, [wordId]: (prev[wordId] || 0) + 1 }));
    }
  };

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
          <div className="flex items-center gap-3">
            <h1 className={`text-4xl font-black tracking-tighter uppercase transition-all duration-300 ${appBg.text}`}>
              VERSE <span className={`${theme.text}`}>VAULT</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => { setSuggestionModalOpen(true); setSuggestionStatus('idle'); }}
              className={`p-2.5 backdrop-blur-md border rounded-full shadow-sm transition-all active:scale-90 group ${
                appBgIdx === 0 ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
              title="Suggestions, feedback & bug reports"
            >
              <Lightbulb size={18} className="group-hover:scale-110 transition-transform" />
            </button>
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
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className={`p-2.5 backdrop-blur-md border rounded-full shadow-sm transition-all active:scale-90 group ${
                    appBgIdx === 0 ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Sign in"
                >
                  <LogIn size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center [&_.cl-avatarBox]:h-9 [&_.cl-avatarBox]:w-9">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
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
                              <div key={book} className="space-y-3">
                                {hasMultiple ? (
                                  <button 
                                    onClick={() => toggleBookExpansion(book)}
                                    className={`w-full flex items-center justify-between py-1 group transition-all`}
                                  >
                                    <span className={`text-base font-black uppercase tracking-tight ${theme.text} opacity-90 group-hover:opacity-100`}>{book}</span>
                                    <div className="flex items-center gap-3">
                                      <div className={`text-sm font-black transition-all ${theme.text} opacity-60 group-hover:opacity-100`}>
                                        {passages.length}
                                      </div>
                                      <ChevronDown size={14} className={`transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <h4 className={`text-base font-black uppercase tracking-tight ${theme.text} opacity-90`}>{book}</h4>
                                    <div className={`w-2 h-2 rounded-full ${theme.bg} opacity-20`}></div>
                                  </div>
                                )}
                                
                                {(!hasMultiple || isExpanded) && (
                                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {passages.map(p => (
                                      <LibraryItem 
                                        key={p}
                                        passage={p}
                                        onSelect={fetchPassage}
                                        onRemove={removeFromLibrary}
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
                {visibleVerseCount} Verses
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
            <div className="flex-1 w-full flex gap-2">
                {searchMode === 'text' ? (
                  <div className="relative w-full flex items-stretch flex-1 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <input 
                        ref={searchInputRef}
                        type="text"
                        value={manualQuery}
                        onChange={(e) => setManualQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchPassage()}
                        inputMode={searchIsNumberPhase ? 'numeric' : 'text'}
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 pl-11 outline-none transition-all font-medium ${theme.focus} focus:bg-white ${searchIsNumberPhase ? 'pr-12 md:pr-4' : ''}`}
                        placeholder="John 3:16"
                      />
                      <button
                        type="button"
                        onClick={() => setSearchMode('select')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
                        title="Browse Library"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                    {searchIsNumberPhase ? (
                      <button
                        type="button"
                        onClick={() => { setManualQuery(prev => prev + (searchShowDashButton ? '-' : ':')); searchInputRef.current?.focus(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-600 font-bold text-sm shrink-0 md:hidden"
                        title={searchShowDashButton ? 'Insert dash (verse range)' : 'Insert colon'}
                      >
                        {searchShowDashButton ? '−' : ':'}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex gap-2 w-full flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSearchMode('text')}
                      className="shrink-0 p-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      title="Direct Entry"
                    >
                      <Keyboard size={18} />
                    </button>
                    <select value={selBook} onChange={(e) => setSelBook(e.target.value)} className={`flex-[2] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 font-medium outline-none ${theme.focus}`}>
                      {BIBLE_DATA.map(b => <option key={b.book} value={b.book}>{b.book}</option>)}
                    </select>
                    <div className={`flex-1 flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden ${theme.focus}`}>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation();
                          const bookIdx = BIBLE_DATA.findIndex(b => b.book === selBook);
                          const chIdx = parseInt(selChapter, 10) - 1;
                          const maxVerse = (bookIdx >= 0 && VERSE_COUNTS_BY_BOOK[bookIdx]) ? (VERSE_COUNTS_BY_BOOK[bookIdx][chIdx] ?? 31) : 31;
                          setSelVerse(String(maxVerse));
                        }}
                        className="shrink-0 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Set to last verse (fetch whole chapter)"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <select value={selChapter} onChange={(e) => setSelChapter(e.target.value)} className="flex-1 min-w-0 bg-transparent px-3 py-3 font-medium outline-none border-0">
                        {chaptersList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <select value={selVerse} onChange={(e) => setSelVerse(e.target.value)} className={`flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 font-medium outline-none ${theme.focus}`}>
                      {versesList.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                )}
                
                <button onClick={() => fetchPassage()} disabled={loading} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50">
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={24} />}
                </button>
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
                <div 
                  key={p} 
                  className="flex items-center gap-1 pr-1 py-0.5 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-full text-xs font-bold text-slate-600 hover:border-rose-300 shadow-sm shrink-0 snap-start group/chip"
                >
                  <button 
                    onClick={() => fetchPassage(p)}
                    className="pl-4 py-1.5 hover:text-rose-600 transition-colors whitespace-nowrap text-left min-w-0 truncate max-w-[180px] sm:max-w-none"
                  >
                    {p}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromFavorites(p); }}
                    className="p-1 rounded-full hover:bg-rose-200 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Remove from favorites"
                  >
                    <X size={12} />
                  </button>
                </div>
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
                <div 
                  key={p} 
                  className="flex items-center gap-1 pr-1 py-0.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm shrink-0 snap-start group/chip"
                >
                  <button 
                    onClick={() => fetchPassage(p)}
                    className="pl-4 py-1.5 hover:border-slate-400 hover:text-slate-800 transition-colors whitespace-nowrap text-left min-w-0 truncate max-w-[180px] sm:max-w-none"
                  >
                    {p}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromRecents(p); }}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    title="Remove from recent"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentinel for sticky toolbar (detect when toolbar hits top) */}
        <div ref={toolbarSentinelRef} className="h-px w-full" aria-hidden="true" />

        {/* Sticky Memory Toolbar */}
        <div className={`sticky top-0 z-50 flex flex-col gap-3 bg-neutral-50/80 backdrop-blur-md py-3 px-3 rounded-2xl font-sans border border-white/20 shadow-sm transition-all duration-300 mb-8 ${isToolbarStuck ? 'group stuck' : ''}`}>
          {/* When stuck on mobile: single row of icon-only buttons; otherwise two groups */}
          {isToolbarStuck ? (
            <div className="flex items-center flex-nowrap gap-1 justify-center overflow-x-auto no-scrollbar w-full max-md:py-0.5">
              <button
                onClick={() => { setVisibilityMode('full'); resetWpm(); }}
                className={`p-2 rounded-lg text-xs font-bold transition-all shrink-0 min-w-[36px] flex items-center justify-center ${
                  visibilityMode === 'full' ? `${theme.bg} text-white shadow-lg ${theme.shadow}` : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Eye size={14} />
              </button>
              {['3', '2', '1'].map((id) => (
                <button
                  key={id}
                  onClick={() => { setVisibilityMode(id); resetWpm(); }}
                  className={`p-2 rounded-lg text-[10px] font-black transition-all shrink-0 min-w-[28px] flex items-center justify-center ${
                    visibilityMode === id ? `${theme.bg} text-white shadow-lg ${theme.shadow}` : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {id}L
                </button>
              ))}
              <button
                onClick={() => { setVisibilityMode('wpm'); }}
                className={`p-2 rounded-lg text-xs font-bold transition-all shrink-0 min-w-[36px] flex items-center justify-center ${
                  visibilityMode === 'wpm' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Timer size={14} />
              </button>
              <button onClick={cycleFont} className="p-2 rounded-lg shrink-0 min-w-[36px] flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all" title={fontOption}>
                <CaseSensitive size={14} />
              </button>
              <button onClick={cycleBg} className="p-2 rounded-lg shrink-0 min-w-[36px] flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all" title={bgOption}>
                <Paintbrush size={14} />
              </button>
              <button
                onClick={() => { const next = !showFirstLetters; if (!next) setBunchedReveal({}); setShowFirstLetters(next); }}
                className={`p-2 rounded-lg shrink-0 min-w-[36px] flex items-center justify-center border transition-all ${
                  showFirstLetters ? `${theme.bg} border-transparent text-white ${theme.shadow}` : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
                title={showFirstLetters ? 'Bunched' : 'Normal'}
              >
                <Type size={14} />
              </button>
            </div>
          ) : (
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
              {['3', '2', '1'].map((id) => (
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
                onClick={() => { const next = !showFirstLetters; if (!next) setBunchedReveal({}); setShowFirstLetters(next); }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                  showFirstLetters ? `${theme.bg} border-transparent text-white ${theme.shadow}` : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Type size={14} />
                {showFirstLetters ? 'Bunched' : 'Normal'}
              </button>
            </div>
          </div>
          )}

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
                  <h2 className={`text-2xl text-center ${styles.heading} ${paper.text} hover:${theme.text} transition-colors duration-300 cursor-default`}>
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
                {showFirstLetters ? (
                  <div className="animate-in fade-in duration-500">
                    {['1', '2', '3'].includes(visibilityMode) && sentences.length > 0 ? (
                      <div className={`break-words tracking-[0.1em] ${paper.text} leading-relaxed opacity-80 ${styles.passage}`}>
                        {sentences.map((sentenceWords, sentenceIdx) => (
                          <React.Fragment key={sentenceIdx}>
                            {sentenceWords.map((w, wordIdx) => (
                              <span
                                key={w.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleBunchedWordClick(w.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBunchedWordClick(w.id); } }}
                                className="cursor-pointer select-none inline hover:opacity-100 opacity-90 active:opacity-100 transition-opacity rounded px-0.5 -mx-0.5 touch-manipulation"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                              >
                                {getBunchedSentenceDisplay([w], parseInt(visibilityMode), bunchedReveal)}
                                {(wordIdx < sentenceWords.length - 1 || sentenceIdx < sentences.length - 1) ? ' ' : ''}
                              </span>
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className={`break-all tracking-[0.1em] ${paper.text} leading-relaxed opacity-80 select-all ${styles.passage}`}>
                        {firstLetterTape}
                      </div>
                    )}
                  </div>
                ) : (
                  verseData.sections.map((section, sIdx) => (
                    <div key={sIdx} className="animate-in fade-in duration-700">
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`w-1 h-8 ${theme.bg} rounded-full`}></div>
                        <h3 className={`text-xl ${theme.text} capitalize ${styles.heading}`}>
                          {section.title}
                        </h3>
                        <div className={`flex-1 h-px ${bgOption === 'charcoal' ? 'bg-white/10' : 'bg-black/5'}`}></div>
                      </div>
                      <div className={`flex flex-wrap gap-x-4 gap-y-6 text-2xl md:text-3xl font-medium ${paper.text} ${styles.passage}`}>
                        {section.words.map((word) => (
                          <Word 
                            key={word.id}
                            word={word}
                            visibilityMode={visibilityMode}
                            revealedLetters={revealedLetters}
                            currentWpmIndex={currentWpmIndex}
                            showUnderlines={true}
                            onClick={handleWordClick}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
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

        <footer className="mt-12 text-center pb-20 font-sans space-y-8">
          <p className={`text-xs font-medium ${appBg.muted}`}>Loving this application? Try out our other sites!</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="https://scripturetype.web.app" target="_blank" rel="noopener noreferrer" className={`text-sm font-bold uppercase tracking-wider transition-colors hover:underline ${appBg.muted} hover:opacity-100`}>
              VerseType
            </a>
            <a href="https://verseaxis.web.app" target="_blank" rel="noopener noreferrer" className={`text-sm font-bold uppercase tracking-wider transition-colors hover:underline ${appBg.muted} hover:opacity-100`}>
              VerseAxis
            </a>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${appBg.muted}`}>ESV® Bible • Crossway Publishing • {new Date().getFullYear()}</p>
        </footer>

        {/* Suggestion / feedback modal */}
        {suggestionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSuggestionModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Suggestion or bug report</h3>
                <button type="button" onClick={() => setSuggestionModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSuggestionSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="suggestion-name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Your name (optional)</label>
                  <input id="suggestion-name" type="text" value={suggestionName} onChange={e => setSuggestionName(e.target.value)} placeholder="Anonymous" className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-slate-800" />
                </div>
                <div>
                  <label htmlFor="suggestion-message" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Details <span className="text-rose-500">*</span></label>
                  <textarea id="suggestion-message" required value={suggestionMessage} onChange={e => setSuggestionMessage(e.target.value)} placeholder="Describe your idea or the issue..." rows={4} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none resize-y text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Attach a screenshot (optional)</label>
                  <input ref={suggestionFileInputRef} type="file" accept="image/*" onChange={e => setSuggestionFile(e.target.files?.[0] ?? null)} className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:font-bold file:text-slate-700" />
                  {suggestionFile && <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1"><Paperclip size={12} /> {suggestionFile.name}</p>}
                </div>
                {suggestionStatus === 'success' && <p className="text-sm font-bold text-emerald-600">Thanks! Your message was sent.</p>}
                {suggestionStatus === 'error' && <p className="text-sm font-bold text-rose-600">Something went wrong. Check that Formspree is set up or try again.</p>}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setSuggestionModalOpen(false)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={suggestionStatus === 'sending'} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black disabled:opacity-50">
                    {suggestionStatus === 'sending' ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
