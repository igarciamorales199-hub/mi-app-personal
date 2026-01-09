import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, StickyNote, FileText, Target, Plus, 
  CheckCircle2, Clock, Trash2, X, Menu, ChevronRight, Upload, ExternalLink, 
  Calendar, Zap, CheckSquare, Hash, Percent, LogOut, LogIn, AlertTriangle, Loader2
} from 'lucide-react';

// --- IMPORTANTE: FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE (YA INCLUYE TUS DATOS) ---
const firebaseConfig = {
  apiKey: "AIzaSyDKJhSx4GctH-GlHbOesHp_4bbxlkeNtnI",
  authDomain: "personal-os-sync-147d2.firebaseapp.com",
  projectId: "personal-os-sync-147d2",
  storageBucket: "personal-os-sync-147d2.firebasestorage.app",
  messagingSenderId: "789672051942",
  appId: "1:789672051942:web:bae5dd00e653f7d089a727"
};

// --- INICIALIZACIÓN DE FIREBASE ---
let app, auth, provider, db;
let initializationError = null;

try {
  // Inicializamos directamente con tus credenciales
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.error("Error inicializando Firebase:", error);
  initializationError = error.message;
}

// --- ESTILOS MÓVILES ---
const MobileStyles = () => (
  <style>{`
    .smooth-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    input, textarea { font-size: 16px !important; }
  `}</style>
);

// --- COMPONENTES UI BÁSICOS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", className = "", size = "md", disabled = false }) => {
  const baseStyle = "font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transform transition-transform";
  const variants = {
    primary: "bg-blue-600 active:bg-blue-700 text-white shadow-md shadow-blue-500/20",
    secondary: "bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 text-slate-800 dark:text-slate-100",
    danger: "bg-red-50 active:bg-red-100 text-red-600",
    ghost: "active:bg-slate-100 dark:active:bg-slate-800 text-slate-600 dark:text-slate-300"
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-3 md:py-2", icon: "p-3 md:p-2" };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</button>;
};

// --- PANTALLA DE LOGIN ---
const LoginScreen = ({ onLogin, errorMsg, isRedirecting }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
      <LayoutDashboard className="text-white w-8 h-8" />
    </div>
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Personal OS</h1>
    <p className="text-slate-500 mb-8 max-w-xs">Sincroniza tus tareas, notas y hábitos en todos tus dispositivos.</p>
    
    {errorMsg && (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm max-w-xs text-left">
        <div className="flex items-center gap-2 font-bold mb-1"><AlertTriangle size={16}/> Error de Acceso</div>
        {errorMsg}
      </div>
    )}

    {initializationError ? (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6 text-sm max-w-xs text-left">
        <div className="flex items-center gap-2 font-bold mb-1"><AlertTriangle size={16}/> Error de Inicialización</div>
        <p className="text-xs opacity-75">{initializationError}</p>
      </div>
    ) : (
      <Button onClick={onLogin} className="w-full max-w-xs py-4 text-lg" disabled={isRedirecting}>
        {isRedirecting ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
        {isRedirecting ? " Redirigiendo..." : " Entrar con Google"}
      </Button>
    )}
  </div>
);

// --- MÓDULOS DE LA APP ---

// 1. KANBAN
const KanbanColumn = ({ title, status, color, tasks, moveTask, deleteTask, onAddTask }) => {
  const [localText, setLocalText] = useState("");
  const handleAdd = () => { if (!localText.trim()) return; onAddTask(localText); setLocalText(""); };

  return (
    <div className="flex-none w-[85vw] md:w-80 bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col h-full border border-slate-200 dark:border-slate-800 snap-center mx-1 md:mx-0">
      <div className={`p-3 font-bold flex items-center gap-2 ${color} border-b border-slate-200 dark:border-slate-800/50`}>
        <div className={`w-3 h-3 rounded-full ${color.replace('text', 'bg')}`}></div>
        {title} <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs py-0.5 px-2 rounded-full ml-auto">{tasks.length}</span>
      </div>
      {status === 'todo' && (
        <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex gap-2">
            <input value={localText} onChange={(e) => setLocalText(e.target.value)} placeholder="Nueva tarea..." className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            <button onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded-lg active:scale-90 transition-transform"><Plus size={20}/></button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 smooth-scroll">
        {tasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 active:border-blue-400 transition-colors">
            <p className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-snug">{task.title}</p>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] text-slate-400">{new Date(task.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
              <div className="flex gap-2">
                {status !== 'todo' && <button onClick={() => moveTask(task.id, 'todo')} className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center dark:bg-pink-900/30 dark:text-pink-300"><div className="w-2 h-2 rounded-full bg-current"></div></button>}
                {status !== 'doing' && <button onClick={() => moveTask(task.id, 'doing')} className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center dark:bg-yellow-900/30 dark:text-yellow-300"><div className="w-2 h-2 rounded-full bg-current"></div></button>}
                {status !== 'done' && <button onClick={() => moveTask(task.id, 'done')} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center dark:bg-green-900/30 dark:text-green-300"><div className="w-2 h-2 rounded-full bg-current"></div></button>}
                <button onClick={() => deleteTask(task.id)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center dark:bg-slate-700"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
        <div className="h-12 md:h-0"></div>
      </div>
    </div>
  );
};

const KanbanModule = ({ tasks, setTasks }) => {
  const addTask = (title) => setTasks([...tasks, { id: Date.now(), title, status: 'todo', createdAt: new Date().toISOString() }]);
  const moveTask = (taskId, newStatus) => setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  const deleteTask = (taskId) => setTasks(tasks.filter(t => t.id !== taskId));
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-950">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
         <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><KanbanSquare className="text-blue-500" /> Tablero</h2>
         <span className="text-xs text-slate-400">Desliza →</span>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50 dark:bg-slate-950 smooth-scroll">
        <div className="h-full flex px-2 py-4 gap-3 w-max snap-x snap-mandatory">
          <KanbanColumn title="Por Hacer" status="todo" color="text-pink-500" tasks={tasks.filter(t => t.status === 'todo')} moveTask={moveTask} deleteTask={deleteTask} onAddTask={addTask} />
          <KanbanColumn title="En Progreso" status="doing" color="text-yellow-500" tasks={tasks.filter(t => t.status === 'doing')} moveTask={moveTask} deleteTask={deleteTask} />
          <KanbanColumn title="Terminado" status="done" color="text-green-500" tasks={tasks.filter(t => t.status === 'done')} moveTask={moveTask} deleteTask={deleteTask} />
          <div className="w-2"></div>
        </div>
      </div>
    </div>
  );
};

// 2. NOTAS
const NotesModule = ({ notes, setNotes }) => {
  const [activeNote, setActiveNote] = useState(null);
  const createNote = () => { const newNote = { id: Date.now(), title: "", content: "", updatedAt: new Date().toISOString() }; setNotes([newNote, ...notes]); setActiveNote(newNote); };
  const updateNote = (field, value) => {
    if (!activeNote) return;
    const updated = { ...activeNote, [field]: value, updatedAt: new Date().toISOString() };
    setActiveNote(updated);
    setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
  };
  if (activeNote) return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 absolute inset-0 z-20">
      <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveNote(null)} className="p-2 -ml-2 text-slate-500"><ChevronRight className="rotate-180" /></button>
        <input value={activeNote.title} onChange={(e) => updateNote('title', e.target.value)} className="flex-1 font-bold bg-transparent focus:outline-none text-slate-800 dark:text-white" placeholder="Título..." />
        <button onClick={() => { setNotes(notes.filter(n => n.id !== activeNote.id)); setActiveNote(null); }} className="text-red-500"><Trash2 size={20}/></button>
      </div>
      <textarea value={activeNote.content} onChange={(e) => updateNote('content', e.target.value)} className="flex-1 p-4 bg-transparent resize-none focus:outline-none text-lg leading-relaxed dark:text-slate-300" placeholder="Escribe aquí..." autoFocus />
    </div>
  );
  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white"><StickyNote className="text-yellow-500" /> Notas</h2><Button onClick={createNote} size="sm"><Plus size={18}/> Nueva</Button></div>
      <div className="grid gap-3">
        {notes.length === 0 && <p className="text-slate-400 text-center py-10">No hay notas.</p>}
        {notes.map(note => (<div key={note.id} onClick={() => setActiveNote(note)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 active:scale-[0.98] transition-transform"><h3 className="font-bold text-slate-800 dark:text-white mb-1">{note.title || "Sin título"}</h3><p className="text-slate-500 text-sm truncate">{note.content || "Vacío"}</p></div>))}
      </div>
    </div>
  );
};

// 3. OBJETIVOS
const GoalsModule = ({ goals, setGoals }) => {
  const [newGoal, setNewGoal] = useState("");
  const addGoal = () => { if (!newGoal) return; setGoals([...goals, { id: Date.now(), title: newGoal, progress: 0 }]); setNewGoal(""); };
  return (
    <div className="p-4 pb-24 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white"><Target className="text-purple-500" /> Metas</h2>
      <div className="flex gap-2"><input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 dark:text-white" placeholder="Nueva meta..." /><Button onClick={addGoal}><Plus/></Button></div>
      <div className="space-y-4">{goals.map(goal => (<Card key={goal.id}><div className="flex justify-between mb-2"><span className="font-bold dark:text-white">{goal.title}</span><button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-slate-400"><Trash2 size={18}/></button></div><div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3"><div className="h-full bg-purple-500 transition-all" style={{ width: `${goal.progress}%` }}></div></div><div className="flex justify-between gap-2"><Button size="sm" variant="secondary" onClick={() => setGoals(goals.map(g => g.id === goal.id ? {...g, progress: Math.max(0, g.progress - 10)} : g))}>-10%</Button><span className="font-bold self-center dark:text-white">{goal.progress}%</span><Button size="sm" variant="secondary" onClick={() => setGoals(goals.map(g => g.id === goal.id ? {...g, progress: Math.min(100, g.progress + 10)} : g))}>+10%</Button></div></Card>))}</div>
    </div>
  );
};

// 4. HABITOS
const HabitsModule = ({ habits, setHabits }) => {
  const [newHabit, setNewHabit] = useState("");
  const today = new Date().toLocaleDateString('en-CA');
  const addHabit = () => { if (!newHabit.trim()) return; setHabits([...habits, { id: Date.now(), title: newHabit, completedDates: [], streak: 0 }]); setNewHabit(""); };
  const toggle = (id) => { setHabits(habits.map(h => { if (h.id !== id) return h; const done = h.completedDates.includes(today); return { ...h, completedDates: done ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today], streak: done ? Math.max(0, h.streak - 1) : h.streak + 1 }; })); };
  const deleteHabit = (id) => setHabits(habits.filter(h => h.id !== id));
  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white"><Zap className="text-yellow-500" /> Hábitos</h2>
      <div className="flex gap-2 mb-4"><input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="Nuevo hábito..." className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 dark:text-white" onKeyDown={(e) => e.key === 'Enter' && addHabit()} /><Button onClick={addHabit}><Plus/></Button></div>
      {habits.map(h => (<div key={h.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"><div onClick={() => toggle(h.id)} className="flex-1 cursor-pointer"><h3 className="font-bold dark:text-white">{h.title}</h3><span className="text-xs text-orange-500 font-bold">🔥 {h.streak} días</span></div><div className="flex items-center gap-3"><div onClick={() => toggle(h.id)} className="cursor-pointer">{h.completedDates.includes(today) ? <CheckCircle2 className="text-green-500" size={32} fill="currentColor" fillOpacity={0.2} /> : <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}</div><button onClick={() => deleteHabit(h.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button></div></div>))}
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Estados de datos
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // MANEJO DE SESIÓN Y REDIRECCIÓN
  useEffect(() => {
    if (!auth) { setLoading(false); return; }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsRedirecting(false); 
      } else {
        setLoading(false);
      }
    });

    // IMPORTANTE: Manejo de vuelta de Google
    getRedirectResult(auth)
      .then((result) => { if (result) console.log("Login exitoso"); })
      .catch((error) => {
        console.error("Error redirect:", error);
        setIsRedirecting(false);
        setLoginError(error.code === 'auth/unauthorized-domain' 
          ? "Dominio no autorizado en Firebase Console." 
          : error.message);
      });

    return () => unsubscribe();
  }, []);

  // SINCRONIZACIÓN DATOS
  useEffect(() => {
    if (!user || !db) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setTasks(d.tasks || []); setNotes(d.notes || []); setGoals(d.goals || []); setHabits(d.habits || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // GUARDADO AUTOMÁTICO
  useEffect(() => {
    if (!user || loading || !db) return;
    const timeout = setTimeout(async () => {
      try { await setDoc(doc(db, "users", user.uid), { tasks, notes, goals, habits }, { merge: true }); }
      catch (e) { console.error("Error saving:", e); }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [tasks, notes, goals, habits, user, loading]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogin = async () => {
    setLoginError("");
    if (initializationError) { setLoginError(initializationError); return; }
    if (!auth) { setLoginError("Error interno: Firebase no inicializado"); return; }
    
    setIsRedirecting(true);
    try { await signInWithRedirect(auth, provider); } 
    catch (error) { setIsRedirecting(false); setLoginError(error.message); }
  };

  const handleLogout = async () => { if (auth) await signOut(auth); setTasks([]); setNotes([]); setGoals([]); setHabits([]); };

  const getStatusColor = (s) => s === 'todo' ? 'bg-pink-500' : s === 'doing' ? 'bg-yellow-500' : s === 'done' ? 'bg-green-500' : 'bg-slate-500';

  if (!user) return <LoginScreen onLogin={handleLogin} errorMsg={loginError} isRedirecting={isRedirecting} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <MobileStyles />
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex-none h-screen">
        <div className="font-bold text-xl mb-8 flex items-center gap-2 px-2"><div className="w-8 h-8 bg-blue-600 rounded-lg"></div> OS</div>
        <nav className="space-y-1">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' }, { id: 'kanban', icon: KanbanSquare, label: 'Tareas' }, { id: 'notes', icon: StickyNote, label: 'Notas' }, { id: 'goals', icon: Target, label: 'Metas' }, { id: 'habits', icon: Zap, label: 'Hábitos' }].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${view === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><item.icon size={20} /> {item.label}</button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-2 px-3 py-2 text-slate-500">{darkMode ? '☀️' : '🌙'} Modo</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"><LogOut size={18} /> Salir</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full w-full relative">
        <div className={`flex-1 w-full ${view === 'kanban' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto smooth-scroll'}`}>
          {view === 'dashboard' && (
            <div className="p-4 pb-24 space-y-4 max-w-4xl mx-auto">
              <div className="md:hidden p-6 pb-2"><h1 className="text-3xl font-bold">Hola 👋</h1><p className="text-slate-500">Tu día de un vistazo.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div onClick={() => setView('kanban')} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"><KanbanSquare className="mb-2 opacity-80" /><div className="text-2xl font-bold">{tasks.filter(t => t.status === 'todo').length}</div><div className="text-xs text-blue-100">Pendientes</div></div>
                <div onClick={() => setView('habits')} className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"><Zap className="mb-2 opacity-80" /><div className="text-2xl font-bold">{habits.length}</div><div className="text-xs text-orange-100">Hábitos</div></div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Clock size={16}/> Recientes</h3>
                {tasks.length > 0 ? (tasks.slice(0, 3).map(t => (<div key={t.id} className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${getStatusColor(t.status)}`}></div><span className="text-sm truncate">{t.title}</span></div>))) : (<p className="text-sm text-slate-400 italic">No hay tareas recientes.</p>)}
              </div>
            </div>
          )}
          {view === 'kanban' && <KanbanModule tasks={tasks} setTasks={setTasks} />}
          {view === 'notes' && <NotesModule notes={notes} setNotes={setNotes} />}
          {view === 'goals' && <GoalsModule goals={goals} setGoals={setGoals} />}
          {view === 'habits' && <HabitsModule habits={habits} setHabits={setHabits} />}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe px-6 py-2 flex justify-between items-center z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] md:hidden">
          <button onClick={() => setView('dashboard')} className={`p-2 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><LayoutDashboard size={24} /><span className="text-[10px] block text-center">Inicio</span></button>
          <button onClick={() => setView('kanban')} className={`p-2 ${view === 'kanban' ? 'text-blue-600' : 'text-slate-400'}`}><KanbanSquare size={24} /><span className="text-[10px] block text-center">Kanban</span></button>
          <div className="relative -top-6"><button onClick={() => setView('notes')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg active:scale-90"><StickyNote size={24} /></button></div>
          <button onClick={() => setView('goals')} className={`p-2 ${view === 'goals' ? 'text-blue-600' : 'text-slate-400'}`}><Target size={24} /><span className="text-[10px] block text-center">Metas</span></button>
          <button onClick={() => setView('habits')} className={`p-2 ${view === 'habits' ? 'text-blue-600' : 'text-slate-400'}`}><Zap size={24} /><span className="text-[10px] block text-center">Hábito</span></button>
        </div>
      </main>
    </div>
  );
}
