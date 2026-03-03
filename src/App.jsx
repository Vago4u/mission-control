import { useState, useEffect, useRef, useCallback } from "react";

// ─── TRANSLATIONS ───────────────────────────────────────────────
const T = {
  en: {
    system_online: "● SYSTEM ONLINE", title: "MISSION CONTROL", subtitle: "NO EXCUSES. ONLY RESULTS.",
    level: "LEVEL", total_xp: "TOTAL XP", streak: "STREAK", done: "DONE",
    xp_to_next: "XP TO NEXT LEVEL", daily_briefing: "▶ DAILY BRIEFING", new_order: "NEW ORDER",
    week_progress: "▶ WEEK PROGRESS", category_status: "▶ CATEGORY STATUS", manual_today: "MANUAL TASKS TODAY",
    no_schedule: "No weekly schedule yet. Let AI build your battle plan.",
    generate_week: "GENERATE MY WEEK →", tab_base: "📊 Base", tab_schedule: "📅 Schedule",
    tab_tasks: "⚔️ Tasks", tab_boss: "💀 Boss", tab_badges: "🏅 Badges",
    tab_coach: "🎙️ Coach", tab_leaderboard: "🏆 Ranking",
    briefing_title: "WEEKLY MISSION BRIEFING",
    briefing_desc: "Answer 6 questions. I'll generate a complete 7-day schedule — content, exercise, business, everything. Specific. Brutal. Yours.",
    begin_briefing: "BEGIN BRIEFING →", question_of: "QUESTION {n} OF {total}",
    next: "NEXT →", generate_schedule: "GENERATE SCHEDULE →", back: "← BACK", skip: "SKIP",
    generating: "GENERATING BATTLE PLAN", generating_sub: "Analyzing objectives... Deploying schedule... Stand by...",
    your_plan: "▶ YOUR BATTLE PLAN", regenerate: "↺ REGENERATE",
    rest_day: "REST DAY — RECOVER AND RELOAD", complete: "COMPLETE",
    missions_complete: "missions complete", victory_reward: "VICTORY REWARD",
    boss_damage: "BOSS DAMAGE", hits: "HITS", all_bosses: "ALL BOSSES DEFEATED",
    commendations: "▶ COMMENDATIONS", earned: "✓ EARNED",
    drill_title: "▶ DRILL SERGEANT — LIVE FEED", drill_placeholder: "TYPE YOUR EXCUSE... OR YOUR QUESTION.",
    send: "SEND", incoming: "INCOMING TRANSMISSION...",
    coach_prompts: ["I don't feel motivated", "Help me prioritize today", "I missed yesterday", "Give me a pep talk"],
    manual_missions: "▶ MANUAL MISSIONS", pending: "PENDING", add: "+ ADD",
    new_mission: "▶ NEW MISSION", mission_placeholder: "MISSION OBJECTIVE...", deploy: "DEPLOY",
    completed_section: "▶ COMPLETED", no_missions: "NO MANUAL MISSIONS",
    no_missions_sub: "Use Schedule for AI tasks, or add one-off missions here.",
    xp_easy: "25 XP — Easy", xp_med: "50 XP — Medium", xp_hard: "100 XP — Hard", xp_epic: "200 XP — Epic",
    leaderboard_title: "▶ WEEKLY WAR STANDINGS", alltime_title: "▶ ALL-TIME GLORY",
    your_name: "YOUR CALL SIGN", save_name: "SAVE & JOIN", week_winner: "🏆 WEEK WINNER",
    alltime_leader: "👑 ALL-TIME LEADER", tasks_done: "tasks", this_week: "THIS WEEK",
    all_time: "ALL TIME", rank: "RANK", player: "PLAYER", score: "SCORE", refresh: "↺ REFRESH",
    no_players: "No other soldiers yet. Share the app with your friends!",
    you_label: "← YOU", days: ["MON","TUE","WED","THU","FRI","SAT","SUN"],
    schedule_questions: [
      { id: "role", label: "What's your main role or profession?", placeholder: "e.g. Content creator, entrepreneur, student, athlete..." },
      { id: "content_goals", label: "Content & video goals this week?", placeholder: "e.g. Post 3 reels, film 2 YouTube videos, write 5 captions..." },
      { id: "fitness_goals", label: "Fitness & running goals this week?", placeholder: "e.g. Run 5km 3x a week, gym Mon/Wed/Fri..." },
      { id: "business_goals", label: "Business & networking goals?", placeholder: "e.g. Email 10 leads, attend 1 event, close 2 deals..." },
      { id: "learning_goals", label: "Learning goals this week?", placeholder: "e.g. Finish an online course, read 50 pages..." },
      { id: "constraints", label: "Any time constraints or rest days?", placeholder: "e.g. Sunday is rest day, only mornings available..." },
    ],
    schedule_prompt: (a) => `You are a strict military life coach creating a personalized weekly schedule.\nUser profile:\n- Role: ${a.role||"not specified"}\n- Content & Video goals: ${a.content_goals||"not specified"}\n- Fitness & Running goals: ${a.fitness_goals||"not specified"}\n- Business & Networking goals: ${a.business_goals||"not specified"}\n- Learning goals: ${a.learning_goals||"not specified"}\n- Time constraints: ${a.constraints||"none"}\nCreate a detailed 7-day weekly schedule. Return ONLY valid JSON. No markdown. No explanation.\n{"MON":[{"time":"7:00 AM","title":"Task name","category":"exercise","duration":"30 min","xp":50,"completed":false}],"TUE":[...],"WED":[...],"THU":[...],"FRI":[...],"SAT":[...],"SUN":[...]}\ncategory must be one of: content, videos, networking, exercise, learning, business, running\nxp: 25=easy, 50=medium, 100=hard, 150=epic. 4-7 tasks/day. Specific times. Military-precise.`,
    coach_system: (lvl, xp, streak) => `You are a brutally strict, no-excuses drill sergeant life coach. User tracks: Make Content, Create Videos, Networking, Exercise, Learning/Study, Business Tasks, Running. Stats: Level ${lvl}, ${xp} XP, ${streak} day streak. Be strict, punchy, max 3 sentences. Zero fluff. No excuses accepted ever.`,
    strict_messages: [
      "Excuses are for the weak. Mark it done.", "Every unchecked task is a broken promise to yourself.",
      "You said you wanted change. PROVE IT.", "The world doesn't care about your reasons. Results only.",
      "Another day, another chance to not be mediocre.", "Your future self is watching you right now.",
      "Pain is temporary. Regret is forever.", "Do it now. You're already behind.",
      "No one is coming to save you. Get to work.", "You're not tired. You're just weak. Fix that.",
    ],
    categories: [
      { id: "content", label: "Make Content", icon: "✍️", color: "#FF4444" },
      { id: "videos", label: "Create Videos", icon: "🎬", color: "#FF8C00" },
      { id: "networking", label: "Networking", icon: "🤝", color: "#FFD700" },
      { id: "exercise", label: "Exercise", icon: "💪", color: "#00FF88" },
      { id: "learning", label: "Learning/Study", icon: "📚", color: "#00CFFF" },
      { id: "business", label: "Business Tasks", icon: "💼", color: "#AA44FF" },
      { id: "running", label: "Running Routine", icon: "🏃", color: "#FF44AA" },
    ],
    badges: [
      { id: "first_blood", label: "First Blood", desc: "Complete your first task", xp: 50, icon: "🩸", condition: (s) => s.totalCompleted >= 1 },
      { id: "streak3", label: "On Fire", desc: "3-day streak", xp: 100, icon: "🔥", condition: (s) => s.streak >= 3 },
      { id: "streak7", label: "Unstoppable", desc: "7-day streak", xp: 300, icon: "⚡", condition: (s) => s.streak >= 7 },
      { id: "all_cats", label: "Full Spectrum", desc: "Complete all categories in a week", xp: 500, icon: "🌈", condition: (s) => s.categoriesThisWeek >= 7 },
      { id: "xp500", label: "Grinder", desc: "Earn 500 XP", xp: 200, icon: "💎", condition: (s) => s.totalXP >= 500 },
      { id: "boss1", label: "Boss Slayer", desc: "Defeat your first boss", xp: 400, icon: "💀", condition: (s) => s.bossesDefeated >= 1 },
      { id: "planner", label: "War Planner", desc: "Generate your first weekly schedule", xp: 150, icon: "📅", condition: (s) => (s.schedulesGenerated||0) >= 1 },
      { id: "winner", label: "Week Champion", desc: "Win the weekly leaderboard", xp: 600, icon: "🏆", condition: (s) => (s.weekWins||0) >= 1 },
    ],
  },
  es: {
    system_online: "● SISTEMA EN LÍNEA", title: "CENTRO DE MISIONES", subtitle: "SIN EXCUSAS. SOLO RESULTADOS.",
    level: "NIVEL", total_xp: "XP TOTAL", streak: "RACHA", done: "HECHAS",
    xp_to_next: "XP AL SIGUIENTE NIVEL", daily_briefing: "▶ BRIEFING DIARIO", new_order: "NUEVA ORDEN",
    week_progress: "▶ PROGRESO SEMANAL", category_status: "▶ ESTADO DE CATEGORÍAS", manual_today: "TAREAS MANUALES HOY",
    no_schedule: "Sin horario semanal. Deja que la IA construya tu plan de batalla.",
    generate_week: "GENERAR MI SEMANA →", tab_base: "📊 Base", tab_schedule: "📅 Horario",
    tab_tasks: "⚔️ Tareas", tab_boss: "💀 Jefe", tab_badges: "🏅 Insignias",
    tab_coach: "🎙️ Coach", tab_leaderboard: "🏆 Ranking",
    briefing_title: "BRIEFING DE MISIÓN SEMANAL",
    briefing_desc: "Responde 6 preguntas. Genero tu plan de 7 días completo — contenido, ejercicio, negocios, todo. Específico. Brutal. Tuyo.",
    begin_briefing: "INICIAR BRIEFING →", question_of: "PREGUNTA {n} DE {total}",
    next: "SIGUIENTE →", generate_schedule: "GENERAR HORARIO →", back: "← ATRÁS", skip: "OMITIR",
    generating: "GENERANDO PLAN DE BATALLA", generating_sub: "Analizando objetivos... Desplegando horario... En espera...",
    your_plan: "▶ TU PLAN DE BATALLA", regenerate: "↺ REGENERAR",
    rest_day: "DÍA DE DESCANSO — RECUPERA Y RECARGA", complete: "COMPLETO",
    missions_complete: "misiones completas", victory_reward: "RECOMPENSA DE VICTORIA",
    boss_damage: "DAÑO AL JEFE", hits: "GOLPES", all_bosses: "TODOS LOS JEFES DERROTADOS",
    commendations: "▶ CONDECORACIONES", earned: "✓ OBTENIDA",
    drill_title: "▶ SARGENTO — EN VIVO", drill_placeholder: "ESCRIBE TU EXCUSA... O TU PREGUNTA.",
    send: "ENVIAR", incoming: "TRANSMISIÓN ENTRANTE...",
    coach_prompts: ["No me siento motivado", "Ayúdame a priorizar hoy", "Me salté ayer", "Dame un discurso motivacional"],
    manual_missions: "▶ MISIONES MANUALES", pending: "PENDIENTES", add: "+ AGREGAR",
    new_mission: "▶ NUEVA MISIÓN", mission_placeholder: "OBJETIVO DE MISIÓN...", deploy: "DESPLEGAR",
    completed_section: "▶ COMPLETADAS", no_missions: "SIN MISIONES MANUALES",
    no_missions_sub: "Usa Horario para tareas IA, o agrega misiones puntuales aquí.",
    xp_easy: "25 XP — Fácil", xp_med: "50 XP — Medio", xp_hard: "100 XP — Difícil", xp_epic: "200 XP — Épico",
    leaderboard_title: "▶ CLASIFICACIÓN SEMANAL", alltime_title: "▶ GLORIA HISTÓRICA",
    your_name: "TU NOMBRE EN BATALLA", save_name: "GUARDAR Y UNIRSE", week_winner: "🏆 GANADOR DE LA SEMANA",
    alltime_leader: "👑 LÍDER HISTÓRICO", tasks_done: "tareas", this_week: "ESTA SEMANA",
    all_time: "HISTÓRICO", rank: "RANGO", player: "JUGADOR", score: "PUNTOS", refresh: "↺ ACTUALIZAR",
    no_players: "¡Aún no hay otros soldados. Comparte la app con tus amigos!",
    you_label: "← TÚ", days: ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"],
    schedule_questions: [
      { id: "role", label: "¿Cuál es tu rol o profesión principal?", placeholder: "ej. Creador de contenido, emprendedor, estudiante, atleta..." },
      { id: "content_goals", label: "¿Metas de contenido y video esta semana?", placeholder: "ej. Publicar 3 reels, filmar 2 videos de YouTube, escribir 5 captions..." },
      { id: "fitness_goals", label: "¿Metas de fitness y running esta semana?", placeholder: "ej. Correr 5km 3 veces por semana, gym Lun/Mié/Vie..." },
      { id: "business_goals", label: "¿Metas de negocios y networking?", placeholder: "ej. Escribir a 10 clientes, asistir a 1 evento, cerrar 2 ventas..." },
      { id: "learning_goals", label: "¿Metas de aprendizaje esta semana?", placeholder: "ej. Terminar un curso online, leer 50 páginas..." },
      { id: "constraints", label: "¿Restricciones de tiempo o días de descanso?", placeholder: "ej. Domingo es descanso, solo mañanas disponibles, trabajo 9-5..." },
    ],
    schedule_prompt: (a) => `Eres un coach de vida militar estricto creando un horario semanal personalizado.\nPerfil del usuario:\n- Rol: ${a.role||"no especificado"}\n- Metas de contenido y video: ${a.content_goals||"no especificado"}\n- Metas de fitness y running: ${a.fitness_goals||"no especificado"}\n- Metas de negocios y networking: ${a.business_goals||"no especificado"}\n- Metas de aprendizaje: ${a.learning_goals||"no especificado"}\n- Restricciones de tiempo: ${a.constraints||"ninguna"}\nCrea un horario semanal detallado de 7 días. Devuelve SOLO JSON válido. Sin markdown. Sin explicaciones.\n{"LUN":[{"time":"7:00 AM","title":"Nombre de tarea","category":"exercise","duration":"30 min","xp":50,"completed":false}],"MAR":[...],"MIÉ":[...],"JUE":[...],"VIE":[...],"SÁB":[...],"DOM":[...]}\nLas claves del JSON DEBEN ser exactamente: LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM\ncategory debe ser uno de: content, videos, networking, exercise, learning, business, running\nxp: 25=fácil, 50=medio, 100=difícil, 150=épico. 4-7 tareas/día. Horarios específicos. Preciso.`,
    coach_system: (lvl, xp, streak) => `Eres un sargento coach de vida extremadamente estricto, sin excusas. El usuario rastrea: Crear Contenido, Videos, Networking, Ejercicio, Estudio, Tareas de Negocio, Running. Stats: Nivel ${lvl}, ${xp} XP, racha de ${streak} días. Sé estricto, directo, máximo 3 oraciones. Cero relleno. Nunca aceptes excusas. Responde siempre en español.`,
    strict_messages: [
      "Las excusas son para los débiles. Márcalo como hecho.", "Cada tarea sin completar es una promesa rota.",
      "Dijiste que querías cambiar. DEMUÉSTRALO.", "Al mundo no le importan tus razones. Solo resultados.",
      "Otro día, otra oportunidad de no ser mediocre.", "Tu yo del futuro te está observando ahora mismo.",
      "El dolor es temporal. El arrepentimiento es eterno.", "Hazlo ahora. Ya vas tarde.",
      "Nadie viene a rescatarte. Ponte a trabajar.", "No estás cansado. Eres débil. Arréglalo.",
    ],
    categories: [
      { id: "content", label: "Crear Contenido", icon: "✍️", color: "#FF4444" },
      { id: "videos", label: "Crear Videos", icon: "🎬", color: "#FF8C00" },
      { id: "networking", label: "Networking", icon: "🤝", color: "#FFD700" },
      { id: "exercise", label: "Ejercicio", icon: "💪", color: "#00FF88" },
      { id: "learning", label: "Aprendizaje", icon: "📚", color: "#00CFFF" },
      { id: "business", label: "Negocios", icon: "💼", color: "#AA44FF" },
      { id: "running", label: "Rutina de Carrera", icon: "🏃", color: "#FF44AA" },
    ],
    badges: [
      { id: "first_blood", label: "Primera Sangre", desc: "Completa tu primera tarea", xp: 50, icon: "🩸", condition: (s) => s.totalCompleted >= 1 },
      { id: "streak3", label: "En Llamas", desc: "Racha de 3 días", xp: 100, icon: "🔥", condition: (s) => s.streak >= 3 },
      { id: "streak7", label: "Imparable", desc: "Racha de 7 días", xp: 300, icon: "⚡", condition: (s) => s.streak >= 7 },
      { id: "all_cats", label: "Espectro Completo", desc: "Completa todas las categorías en una semana", xp: 500, icon: "🌈", condition: (s) => s.categoriesThisWeek >= 7 },
      { id: "xp500", label: "Trabajador", desc: "Gana 500 XP", xp: 200, icon: "💎", condition: (s) => s.totalXP >= 500 },
      { id: "boss1", label: "Cazajefes", desc: "Derrota a tu primer jefe", xp: 400, icon: "💀", condition: (s) => s.bossesDefeated >= 1 },
      { id: "planner", label: "Planificador", desc: "Genera tu primer horario semanal", xp: 150, icon: "📅", condition: (s) => (s.schedulesGenerated||0) >= 1 },
      { id: "winner", label: "Campeón Semanal", desc: "Gana el ranking semanal", xp: 600, icon: "🏆", condition: (s) => (s.weekWins||0) >= 1 },
    ],
  }
};

const BOSSES_DATA = [
  { id: "procrastination", name_en: "THE PROCRASTINATOR", name_es: "EL PROCRASTINADOR", icon: "😴", reward: 300, desc_en: "Your laziness given form. Complete 5 tasks to defeat it.", desc_es: "Tu pereza hecha forma. Completa 5 tareas para derrotarlo.", requirement: 5 },
  { id: "distraction", name_en: "LORD OF DISTRACTION", name_es: "SEÑOR DE LA DISTRACCIÓN", icon: "📱", reward: 500, desc_en: "Scatter-brain supreme. Complete 7 categories this week.", desc_es: "La distracción suprema. Completa 7 categorías esta semana.", requirement: 7 },
  { id: "comfort_zone", name_en: "COMFORT ZONE DEMON", name_es: "DEMONIO DE LA ZONA DE CONFORT", icon: "🛋️", reward: 800, desc_en: "The ultimate enemy. Maintain a 7-day streak.", desc_es: "El enemigo definitivo. Mantén una racha de 7 días.", requirement: 7 },
];

const XP_PER_LEVEL = 200;

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `week_${now.getFullYear()}_${week}`;
}

function getLevel(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function getLevelProgress(xp) { return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100; }

const initialState = {
  xp: 0, streak: 0, totalCompleted: 0, bossesDefeated: 0,
  categoriesThisWeek: 0, totalXP: 0, unlockedBadges: [],
  tasks: {}, currentBossIndex: 0, bossProgress: 0,
  weeklySchedule: null, schedulesGenerated: 0, weekWins: 0,
  playerName: "", weekXP: 0, weekTasks: 0,
};

export default function MissionControl() {
  const [lang, setLang] = useState("es");
  const t = T[lang];
  const [state, setState] = useState(initialState);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [coachMessage, setCoachMessage] = useState(() => t.strict_messages[0]);
  const [newTask, setNewTask] = useState({ title: "", category: "content", xp: 50 });
  const [showAddTask, setShowAddTask] = useState(false);
  const [notification, setNotification] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [scheduleStep, setScheduleStep] = useState(0);
  const [scheduleAnswers, setScheduleAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [allTimeBoard, setAllTimeBoard] = useState([]);
  const chatRef = useRef(null);
  const currentBoss = BOSSES_DATA[state.currentBossIndex] || null;

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chatHistory]);

  // Load leaderboard when tab opens
  useEffect(() => { if (activeTab === "leaderboard") loadLeaderboard(); }, [activeTab]);

  // Auto-push score when XP changes and player has a name
  useEffect(() => {
    if (state.playerName && state.totalXP > 0) pushScore();
  }, [state.totalXP, state.totalCompleted]);

  function showNotif(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }

  async function pushScore() {
    if (!state.playerName) return;
    const weekKey = getWeekKey();
    const weekData = { name: state.playerName, xp: state.weekXP, tasks: state.weekTasks, score: state.weekXP + state.weekTasks * 10, ts: Date.now() };
    const allData = { name: state.playerName, xp: state.totalXP, tasks: state.totalCompleted, score: state.totalXP + state.totalCompleted * 10, ts: Date.now() };
    try {
      await window.storage.set(`lb_week_${weekKey}_${state.playerName}`, JSON.stringify(weekData), true);
      await window.storage.set(`lb_alltime_${state.playerName}`, JSON.stringify(allData), true);
    } catch (e) { /* silent */ }
  }

  async function loadLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const weekKey = getWeekKey();
      const weekResult = await window.storage.list(`lb_week_${weekKey}_`, true);
      const allTimeResult = await window.storage.list(`lb_alltime_`, true);
      const weekEntries = [];
      if (weekResult?.keys) {
        for (const key of weekResult.keys) {
          try {
            const r = await window.storage.get(key, true);
            if (r?.value) weekEntries.push(JSON.parse(r.value));
          } catch {}
        }
      }
      const allEntries = [];
      if (allTimeResult?.keys) {
        for (const key of allTimeResult.keys) {
          try {
            const r = await window.storage.get(key, true);
            if (r?.value) allEntries.push(JSON.parse(r.value));
          } catch {}
        }
      }
      weekEntries.sort((a, b) => b.score - a.score);
      allEntries.sort((a, b) => b.score - a.score);
      setLeaderboard(weekEntries);
      setAllTimeBoard(allEntries);

      // Check if this player is the week winner and hasn't been awarded yet
      if (weekEntries.length > 0 && weekEntries[0].name === state.playerName && !(state.weekWinAwarded)) {
        setState(prev => {
          const newWins = (prev.weekWins || 0) + 1;
          const newState = { ...prev, weekWins: newWins, weekWinAwarded: true };
          const badges = t.badges.filter(b => !prev.unlockedBadges.includes(b.id) && b.condition(newState));
          if (badges.length) newState.unlockedBadges = [...prev.unlockedBadges, ...badges.map(b => b.id)];
          return newState;
        });
        showNotif(lang === "es" ? "🏆 ¡Eres el líder semanal!" : "🏆 You're leading the weekly board!", "boss");
      }
    } catch (e) { /* silent */ }
    setLeaderboardLoading(false);
  }

  function saveName() {
    if (!nameInput.trim()) return;
    setState(prev => ({ ...prev, playerName: nameInput.trim(), weekXP: prev.totalXP, weekTasks: prev.totalCompleted }));
    showNotif(lang === "es" ? "¡Bienvenido al campo de batalla!" : "Welcome to the battlefield!", "badge");
  }

  function checkBadges(newState, prev) {
    const newBadges = t.badges.filter(b => !prev.unlockedBadges.includes(b.id) && b.condition(newState));
    if (newBadges.length > 0) {
      newState.unlockedBadges = [...prev.unlockedBadges, ...newBadges.map(b => b.id)];
      setTimeout(() => showNotif(`🏅 ${lang === "es" ? "Insignia:" : "Badge:"} ${newBadges[0].label}!`, "badge"), 400);
    }
    return newState;
  }

  function applyXP(prev, xpGain) {
    const newTotal = prev.totalXP + xpGain;
    const newCompleted = prev.totalCompleted + 1;
    const newWeekXP = (prev.weekXP || 0) + xpGain;
    const newWeekTasks = (prev.weekTasks || 0) + 1;
    const newBossProgress = prev.bossProgress + 1;
    let bossIndex = prev.currentBossIndex;
    let bossProgress = newBossProgress;
    const boss = BOSSES_DATA[bossIndex];
    if (boss && newBossProgress >= boss.requirement) {
      bossIndex = Math.min(bossIndex + 1, BOSSES_DATA.length);
      bossProgress = 0;
      setTimeout(() => showNotif(`🏆 ${lang === "es" ? "¡JEFE DERROTADO!" : "BOSS DEFEATED!"} +${boss.reward} XP`, "boss"), 200);
    }
    return { newTotal, newCompleted, newWeekXP, newWeekTasks, bossIndex, bossProgress };
  }

  function completeTask(taskId) {
    setState(prev => {
      const task = prev.tasks[taskId];
      if (!task || task.completed) return prev;
      const { newTotal, newCompleted, newWeekXP, newWeekTasks, bossIndex, bossProgress } = applyXP(prev, task.xp);
      const updatedTasks = { ...prev.tasks, [taskId]: { ...task, completed: true } };
      const cats = new Set(Object.values(updatedTasks).filter(t => t.completed).map(t => t.category));
      let ns = { ...prev, totalXP: newTotal, totalCompleted: newCompleted, weekXP: newWeekXP, weekTasks: newWeekTasks, currentBossIndex: bossIndex, bossProgress, bossesDefeated: bossIndex > prev.currentBossIndex ? prev.bossesDefeated + 1 : prev.bossesDefeated, categoriesThisWeek: cats.size, tasks: updatedTasks };
      return checkBadges(ns, prev);
    });
    showNotif(`+XP!`, "xp");
  }

  function completeScheduleTask(day, idx) {
    setState(prev => {
      if (!prev.weeklySchedule) return prev;
      const schedule = JSON.parse(JSON.stringify(prev.weeklySchedule));
      if (!schedule[day]?.[idx] || schedule[day][idx].completed) return prev;
      const xpGain = schedule[day][idx].xp || 50;
      schedule[day][idx].completed = true;
      const { newTotal, newCompleted, newWeekXP, newWeekTasks, bossIndex, bossProgress } = applyXP(prev, xpGain);
      let ns = { ...prev, totalXP: newTotal, totalCompleted: newCompleted, weekXP: newWeekXP, weekTasks: newWeekTasks, currentBossIndex: bossIndex, bossProgress, bossesDefeated: bossIndex > prev.currentBossIndex ? prev.bossesDefeated + 1 : prev.bossesDefeated, weeklySchedule: schedule };
      return checkBadges(ns, prev);
    });
    showNotif(`+XP!`, "xp");
  }

  function addTask() {
    if (!newTask.title.trim()) return;
    const id = `task_${Date.now()}`;
    setState(prev => ({ ...prev, tasks: { ...prev.tasks, [id]: { ...newTask, id, completed: false } } }));
    setNewTask({ title: "", category: "content", xp: 50 });
    setShowAddTask(false);
  }

 async function askCoach() {
    if (!userInput.trim() || aiLoading) return;
    const q = userInput.trim();
    setUserInput("");
    setAiLoading(true);
    const hist = [...chatHistory, { role: "user", content: q }];
    setChatHistory(hist);
    try {
      const systemPrompt = t.coach_system(getLevel(state.totalXP), state.totalXP, state.streak);
      const geminiMessages = hist.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.9 },
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || (lang === "es" ? "Vuelve al trabajo." : "Get back to work.");
      setChatHistory([...hist, { role: "assistant", content: reply }]);
    } catch {
      setChatHistory([...hist, { role: "assistant", content: lang === "es" ? "Sin excusas. Trabaja." : "No excuses. Work." }]);
    }
    setAiLoading(false);
  }

  function nextScheduleQ() {
    const updated = { ...scheduleAnswers };
    if (currentAnswer.trim() && scheduleStep >= 1) updated[t.schedule_questions[scheduleStep - 1].id] = currentAnswer.trim();
    setScheduleAnswers(updated);
    setCurrentAnswer("");
    if (scheduleStep >= t.schedule_questions.length) generateSchedule(updated);
    else setScheduleStep(s => s + 1);
  }

  async function generateSchedule(answers) {
    setScheduleStep(7);
    setAiLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: t.schedule_prompt(answers) }] }],
            generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const schedule = JSON.parse(clean);
      setState(prev => {
        let ns = { ...prev, weeklySchedule: schedule, schedulesGenerated: (prev.schedulesGenerated || 0) + 1 };
        return checkBadges(ns, prev);
      });
      setScheduleStep(8);
      showNotif(lang === "es" ? "🗓️ ¡Plan de batalla desplegado!" : "🗓️ Battle plan deployed!", "badge");
    } catch {
      showNotif(lang === "es" ? "Error al generar. Intenta de nuevo." : "Generation failed. Try again.", "error");
      setScheduleStep(1);
    }
    setAiLoading(false);
  }

  const level = getLevel(state.totalXP);
  const levelProgress = getLevelProgress(state.totalXP);
  const tasks = Object.values(state.tasks);
  const DAYS = t.days;
  const todaySchedule = state.weeklySchedule?.[DAYS[selectedDay]] || [];
  const todayDone = todaySchedule.filter(x => x.completed).length;
  const bossHPPct = currentBoss ? (state.bossProgress / currentBoss.requirement) * 100 : 100;
  const hasSchedule = !!state.weeklySchedule;
  const getCatColor = id => t.categories.find(c => c.id === id)?.color || "#4a6080";
  const getCatIcon = id => t.categories.find(c => c.id === id)?.icon || "📌";

  const weekScore = (state.weekXP || 0) + (state.weekTasks || 0) * 10;

  const TABS = [
    { id: "dashboard", label: t.tab_base },
    { id: "schedule", label: t.tab_schedule },
    { id: "tasks", label: t.tab_tasks },
    { id: "boss", label: t.tab_boss },
    { id: "badges", label: t.tab_badges },
    { id: "coach", label: t.tab_coach },
    { id: "leaderboard", label: t.tab_leaderboard },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#E0E8FF", fontFamily: "'Courier New', monospace" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(0,200,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {notification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 10000, background: notification.type === "boss" ? "#FF4444" : notification.type === "badge" ? "#FFD700" : "#00FF88", color: "#000", padding: "12px 20px", fontWeight: "bold", fontSize: 13, border: "2px solid currentColor", boxShadow: "0 0 20px currentColor", transition: "all 0.3s" }}>
          {notification.msg}
        </div>
      )}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
        .tab-btn{background:transparent;border:1px solid #1a2040;color:#6080AA;padding:8px 11px;cursor:pointer;font-family:'Courier New',monospace;font-size:9px;letter-spacing:1px;transition:all 0.2s;text-transform:uppercase}
        .tab-btn:hover{border-color:#00CFFF;color:#00CFFF}
        .tab-btn.active{border-color:#00CFFF;color:#00CFFF;background:#00CFFF11}
        .trow{background:#080d1a;border:1px solid #1a2040;padding:12px 14px;margin-bottom:7px;display:flex;align-items:center;gap:11px;transition:all 0.2s;cursor:pointer;animation:fadeUp 0.3s ease}
        .trow:hover{border-color:#00CFFF33;background:#0d1525}
        .trow.done{opacity:0.4;border-color:#00FF8833}
        .chk{background:transparent;border:2px solid #2a3050;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all 0.2s;flex-shrink:0;color:#00FF88}
        .chk:hover{border-color:#00FF88;background:#00FF8811}
        .chk.done{border-color:#00FF88;background:#00FF8822}
        input,select,textarea{background:#080d1a;border:1px solid #1a2040;color:#E0E8FF;padding:9px 13px;font-family:'Courier New',monospace;font-size:13px;width:100%;box-sizing:border-box;outline:none;resize:none}
        input:focus,select:focus,textarea:focus{border-color:#00CFFF;box-shadow:0 0 8px #00CFFF22}
        .pbtn{background:#00CFFF;color:#000;border:none;padding:10px 20px;font-family:'Courier New',monospace;font-weight:bold;cursor:pointer;letter-spacing:1px;font-size:11px;transition:all 0.2s;text-transform:uppercase}
        .pbtn:hover{background:#00FFFF;box-shadow:0 0 14px #00CFFF77}
        .pbtn:disabled{background:#1a2040;color:#4a5060;cursor:not-allowed;box-shadow:none}
        .dbtn{background:transparent;border:1px solid #FF444466;color:#FF4444;padding:8px 16px;font-family:'Courier New',monospace;cursor:pointer;font-size:10px;letter-spacing:1px;transition:all 0.2s}
        .dbtn:hover{background:#FF444411}
        .daybtn{background:transparent;border:1px solid #1a2040;color:#4a6080;padding:7px 5px;cursor:pointer;font-family:'Courier New',monospace;font-size:9px;letter-spacing:1px;transition:all 0.2s;flex:1;text-align:center}
        .daybtn:hover{border-color:#FFD700;color:#FFD700}
        .daybtn.active{border-color:#FFD700;color:#FFD700;background:#FFD70011}
        .lbrow{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #1a2040;background:#080d1a;margin-bottom:7px;animation:slideIn 0.3s ease}
        .lbrow.me{border-color:#00CFFF44;background:#00CFFF08}
        .lbrow.first{border-color:#FFD70044;background:#FFD70008}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050810}::-webkit-scrollbar-thumb{background:#1a2040}
      `}</style>

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "18px 14px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid #1a2040", position: "relative" }}>
          {/* Lang Toggle */}
          <div style={{ position: "absolute", right: 0, top: 0, display: "flex", gap: 4 }}>
            {["es","en"].map(l => (
              <button key={l} onClick={() => { setLang(l); setCoachMessage(T[l].strict_messages[Math.floor(Math.random()*10)]); }} style={{ background: lang === l ? "#00CFFF22" : "transparent", border: `1px solid ${lang === l ? "#00CFFF" : "#1a2040"}`, color: lang === l ? "#00CFFF" : "#4a6080", padding: "5px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#FF4444", marginBottom: 5, animation: "pulse 2s infinite" }}>{t.system_online}</div>
          <h1 style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 5, margin: "0 0 4px", textShadow: "0 0 20px #00CFFF33" }}>{t.title}</h1>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#4a6080" }}>{t.subtitle}</div>
          {state.playerName && <div style={{ fontSize: 10, color: "#00CFFF", marginTop: 6, letterSpacing: 2 }}>◈ {state.playerName} — {lang === "es" ? "PUNTOS" : "SCORE"}: {weekScore}</div>}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[{ label: t.level, value: level, color: "#00CFFF" }, { label: t.total_xp, value: state.totalXP, color: "#FFD700" }, { label: t.streak, value: `${state.streak}d`, color: "#FF8C00" }, { label: t.done, value: state.totalCompleted, color: "#00FF88" }].map(s => (
            <div key={s.label} style={{ background: "#080d1a", border: "1px solid #1a2040", padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#4a6080", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 16, background: "#080d1a", border: "1px solid #1a2040", padding: "10px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#4a6080", marginBottom: 6, letterSpacing: 1 }}>
            <span>LVL {level}</span><span>{Math.round(state.totalXP % XP_PER_LEVEL)}/{XP_PER_LEVEL} {t.xp_to_next}</span>
          </div>
          <div style={{ height: 4, background: "#0d1525" }}>
            <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#00CFFF,#00FFFF)", transition: "width 0.5s", boxShadow: "0 0 6px #00CFFF" }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(tab => <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: "#080d1a", border: "1px solid #FF444422", padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#FF4444", marginBottom: 7 }}>{t.daily_briefing}</div>
              <div style={{ fontSize: 13, color: "#C0C8E0", lineHeight: 1.7 }}>{coachMessage}</div>
              <button onClick={() => setCoachMessage(t.strict_messages[Math.floor(Math.random()*t.strict_messages.length)])} style={{ marginTop: 9, background: "transparent", border: "1px solid #FF444466", color: "#FF4444", padding: "4px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>{t.new_order}</button>
            </div>

            {hasSchedule && (
              <div style={{ background: "#080d1a", border: "1px solid #FFD70022", padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#FFD700", marginBottom: 10 }}>{t.week_progress}</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {DAYS.map((day, i) => {
                    const dt = state.weeklySchedule[day] || [];
                    const done = dt.filter(x => x.completed).length;
                    const pct = dt.length > 0 ? (done / dt.length) * 100 : 0;
                    return (
                      <div key={day} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => { setActiveTab("schedule"); setSelectedDay(i); }}>
                        <div style={{ fontSize: 8, color: "#4a6080", marginBottom: 3 }}>{day}</div>
                        <div style={{ height: 32, background: "#0d1525", border: "1px solid #1a2040", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: pct === 100 ? "#00FF88" : "#FFD700", transition: "height 0.5s" }} />
                        </div>
                        <div style={{ fontSize: 8, color: pct === 100 ? "#00FF88" : "#4a6080", marginTop: 2 }}>{done}/{dt.length}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasSchedule && (
              <div style={{ background: "#080d1a", border: "1px dashed #00CFFF33", padding: 18, marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 7 }}>📅</div>
                <div style={{ fontSize: 11, color: "#6080AA", marginBottom: 12 }}>{t.no_schedule}</div>
                <button className="pbtn" onClick={() => { setActiveTab("schedule"); setScheduleStep(1); }}>{t.generate_week}</button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
              {t.categories.map(cat => {
                const ct = tasks.filter(x => x.category === cat.id);
                const cd = ct.filter(x => x.completed).length;
                const pct = ct.length > 0 ? (cd / ct.length) * 100 : 0;
                return (
                  <div key={cat.id} style={{ background: "#080d1a", border: `1px solid ${cat.color}1a`, padding: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
                      <span>{cat.icon} {cat.label}</span>
                      <span style={{ color: cat.color, fontSize: 10 }}>{cd}/{ct.length}</span>
                    </div>
                    <div style={{ height: 3, background: "#0d1525" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cat.color, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SCHEDULE ═══ */}
        {activeTab === "schedule" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {!hasSchedule && scheduleStep === 0 && (
              <div style={{ textAlign: "center", padding: "36px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 13, letterSpacing: 3, color: "#00CFFF", marginBottom: 10 }}>{t.briefing_title}</div>
                <div style={{ fontSize: 12, color: "#6080AA", lineHeight: 1.8, maxWidth: 440, margin: "0 auto 22px" }}>{t.briefing_desc}</div>
                <button className="pbtn" onClick={() => setScheduleStep(1)}>{t.begin_briefing}</button>
              </div>
            )}

            {!hasSchedule && scheduleStep >= 1 && scheduleStep <= t.schedule_questions.length && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {t.schedule_questions.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, background: i < scheduleStep ? "#00CFFF" : "#1a2040", transition: "background 0.3s", borderRadius: 2 }} />
                  ))}
                </div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080", marginBottom: 7 }}>
                  {t.question_of.replace("{n}", scheduleStep).replace("{total}", t.schedule_questions.length)}
                </div>
                <div style={{ fontSize: 14, color: "#E0E8FF", marginBottom: 16, lineHeight: 1.6 }}>{t.schedule_questions[scheduleStep - 1].label}</div>
                <textarea rows={3} placeholder={t.schedule_questions[scheduleStep - 1].placeholder} value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} style={{ marginBottom: 12 }} autoFocus />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="pbtn" onClick={nextScheduleQ}>{scheduleStep === t.schedule_questions.length ? t.generate_schedule : t.next}</button>
                  {scheduleStep > 1 && <button onClick={() => { setScheduleStep(s => s - 1); setCurrentAnswer(""); }} style={{ background: "transparent", border: "1px solid #1a2040", color: "#4a6080", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>{t.back}</button>}
                  <button onClick={nextScheduleQ} style={{ background: "transparent", border: "1px solid #1a2040", color: "#4a6080", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>{t.skip}</button>
                </div>
              </div>
            )}

            {scheduleStep === 7 && (
              <div style={{ textAlign: "center", padding: "56px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 16, display: "inline-block", animation: "spin 2s linear infinite" }}>⚙️</div>
                <div style={{ fontSize: 12, letterSpacing: 3, color: "#00CFFF", marginBottom: 8 }}>{t.generating}</div>
                <div style={{ fontSize: 10, color: "#4a6080", animation: "pulse 1.5s infinite" }}>{t.generating_sub}</div>
              </div>
            )}

            {hasSchedule && (scheduleStep === 0 || scheduleStep === 8) && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080" }}>{t.your_plan}</div>
                  <button className="dbtn" onClick={() => { setState(p => ({ ...p, weeklySchedule: null })); setScheduleStep(0); setScheduleAnswers({}); }}>{t.regenerate}</button>
                </div>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {DAYS.map((day, i) => {
                    const dt = state.weeklySchedule[day] || [];
                    const done = dt.filter(x => x.completed).length;
                    return (
                      <button key={day} className={`daybtn ${selectedDay === i ? "active" : ""}`} onClick={() => setSelectedDay(i)}>
                        <div>{day}</div>
                        {dt.length > 0 && <div style={{ fontSize: 8, marginTop: 2, color: done === dt.length ? "#00FF88" : "#4a6080" }}>{done}/{dt.length}</div>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ background: "#080d1a", border: "1px solid #FFD70033", padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#FFD700", letterSpacing: 3 }}>{DAYS[selectedDay]}</div>
                    <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>{todayDone}/{todaySchedule.length} {t.missions_complete}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: todayDone === todaySchedule.length && todaySchedule.length > 0 ? "#00FF88" : "#FFD700" }}>
                      {todaySchedule.length > 0 ? Math.round((todayDone / todaySchedule.length) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 9, color: "#4a6080" }}>{t.complete}</div>
                  </div>
                </div>
                <div style={{ height: 3, background: "#0d1525", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${todaySchedule.length > 0 ? (todayDone / todaySchedule.length) * 100 : 0}%`, background: "linear-gradient(90deg,#FFD700,#00FF88)", transition: "width 0.5s" }} />
                </div>
                {todaySchedule.length === 0 && (
                  <div style={{ textAlign: "center", padding: 28, color: "#4a6080", border: "1px dashed #1a2040", fontSize: 11, letterSpacing: 2 }}>{t.rest_day}</div>
                )}
                {todaySchedule.map((task, idx) => {
                  const color = getCatColor(task.category);
                  const icon = getCatIcon(task.category);
                  return (
                    <div key={idx} className={`trow ${task.completed ? "done" : ""}`} onClick={() => !task.completed && completeScheduleTask(DAYS[selectedDay], idx)}>
                      <div style={{ flexShrink: 0, minWidth: 50, textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#4a6080" }}>{task.time}</div>
                      </div>
                      <div style={{ width: 3, height: 36, background: task.completed ? "#00FF88" : color, borderRadius: 2, flexShrink: 0 }} />
                      <button className={`chk ${task.completed ? "done" : ""}`} onClick={e => { e.stopPropagation(); if (!task.completed) completeScheduleTask(DAYS[selectedDay], idx); }}>{task.completed ? "✓" : ""}</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</div>
                        <div style={{ fontSize: 10, color: "#4a6080", marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ color }}>{icon} {task.category}</span>
                          <span>⏱ {task.duration}</span>
                          <span style={{ color: "#FFD700" }}>+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ TASKS ═══ */}
        {activeTab === "tasks" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080" }}>{t.manual_missions} ({tasks.filter(x => !x.completed).length} {t.pending})</div>
              <button className="pbtn" onClick={() => setShowAddTask(!showAddTask)}>{t.add}</button>
            </div>
            {showAddTask && (
              <div style={{ background: "#080d1a", border: "1px solid #00CFFF33", padding: 14, marginBottom: 14, animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#00CFFF", marginBottom: 10 }}>{t.new_mission}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <input placeholder={t.mission_placeholder} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} onKeyDown={e => e.key === "Enter" && addTask()} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}>
                      {t.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                    <select value={newTask.xp} onChange={e => setNewTask({ ...newTask, xp: Number(e.target.value) })}>
                      <option value={25}>{t.xp_easy}</option>
                      <option value={50}>{t.xp_med}</option>
                      <option value={100}>{t.xp_hard}</option>
                      <option value={200}>{t.xp_epic}</option>
                    </select>
                  </div>
                  <button className="pbtn" onClick={addTask}>{t.deploy}</button>
                </div>
              </div>
            )}
            {tasks.length === 0 && (
              <div style={{ textAlign: "center", padding: 36, color: "#4a6080", border: "1px dashed #1a2040" }}>
                <div style={{ fontSize: 26, marginBottom: 9 }}>🎯</div>
                <div style={{ fontSize: 10, letterSpacing: 2 }}>{t.no_missions}</div>
                <div style={{ fontSize: 10, marginTop: 6 }}>{t.no_missions_sub}</div>
              </div>
            )}
            {tasks.filter(x => !x.completed).map(task => {
              const cat = t.categories.find(c => c.id === task.category);
              return (
                <div key={task.id} className="trow" onClick={() => completeTask(task.id)}>
                  <button className="chk" onClick={e => { e.stopPropagation(); completeTask(task.id); }}></button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{task.title}</div>
                    <div style={{ fontSize: 10, color: "#4a6080", marginTop: 3 }}>
                      <span style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
                      <span style={{ marginLeft: 12, color: "#FFD700" }}>+{task.xp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(x => x.completed).length > 0 && (
              <>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080", margin: "16px 0 9px" }}>{t.completed_section}</div>
                {tasks.filter(x => x.completed).map(task => {
                  const cat = t.categories.find(c => c.id === task.category);
                  return (
                    <div key={task.id} className="trow done">
                      <div className="chk done">✓</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, textDecoration: "line-through" }}>{task.title}</div>
                        <div style={{ fontSize: 10, color: "#4a6080", marginTop: 3 }}>{cat?.icon} {cat?.label} • +{task.xp} XP</div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ═══ BOSS ═══ */}
        {activeTab === "boss" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {currentBoss ? (
              <>
                <div style={{ textAlign: "center", padding: "24px 20px", background: "#080d1a", border: "1px solid #FF444422", marginBottom: 14 }}>
                  <div style={{ fontSize: 52, marginBottom: 10, animation: "pulse 1.5s infinite" }}>{currentBoss.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: "bold", letterSpacing: 4, color: "#FF4444", marginBottom: 7 }}>{lang === "es" ? currentBoss.name_es : currentBoss.name_en}</div>
                  <div style={{ fontSize: 12, color: "#6080AA", maxWidth: 360, margin: "0 auto" }}>{lang === "es" ? currentBoss.desc_es : currentBoss.desc_en}</div>
                </div>
                <div style={{ background: "#080d1a", border: "1px solid #1a2040", padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 1, color: "#4a6080", marginBottom: 9 }}>
                    <span>{t.boss_damage}</span><span>{state.bossProgress}/{currentBoss.requirement} {t.hits}</span>
                  </div>
                  <div style={{ height: 13, background: "#0d1525", position: "relative", border: "1px solid #FF444422" }}>
                    <div style={{ height: "100%", width: `${Math.min(bossHPPct, 100)}%`, background: "linear-gradient(90deg,#FF4444,#FF8800)", transition: "width 0.5s", boxShadow: "0 0 10px #FF444866" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: "bold", color: "#fff" }}>{Math.round(bossHPPct)}%</div>
                  </div>
                </div>
                <div style={{ background: "#080d1a", border: "1px solid #FFD70022", padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 2, marginBottom: 5 }}>{t.victory_reward}</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#FFD700" }}>+{currentBoss.reward} XP</div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 56, color: "#FFD700" }}>
                <div style={{ fontSize: 44 }}>🏆</div>
                <div style={{ fontSize: 13, letterSpacing: 3, marginTop: 12 }}>{t.all_bosses}</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ BADGES ═══ */}
        {activeTab === "badges" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080", marginBottom: 12 }}>{t.commendations} ({state.unlockedBadges.length}/{t.badges.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
              {t.badges.map(badge => {
                const unlocked = state.unlockedBadges.includes(badge.id);
                return (
                  <div key={badge.id} style={{ background: "#080d1a", border: `1px solid ${unlocked ? "#FFD70044" : "#1a2040"}`, padding: 14, opacity: unlocked ? 1 : 0.45, transition: "all 0.3s" }}>
                    <div style={{ fontSize: 26, marginBottom: 7, filter: unlocked ? "none" : "grayscale(100%)" }}>{badge.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: "bold", color: unlocked ? "#FFD700" : "#4a6080", letterSpacing: 1 }}>{badge.label}</div>
                    <div style={{ fontSize: 10, color: "#4a6080", marginTop: 3 }}>{badge.desc}</div>
                    <div style={{ fontSize: 10, color: "#FFD700", marginTop: 7 }}>+{badge.xp} XP</div>
                    {unlocked && <div style={{ fontSize: 9, color: "#00FF88", marginTop: 5, letterSpacing: 2 }}>{t.earned}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ COACH ═══ */}
        {activeTab === "coach" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#4a6080", marginBottom: 12 }}>{t.drill_title}</div>
            <div ref={chatRef} style={{ background: "#080d1a", border: "1px solid #FF444422", padding: 14, minHeight: 240, maxHeight: 340, overflowY: "auto", marginBottom: 12 }}>
              {chatHistory.length === 0 && (
                <div style={{ color: "#4a6080", fontSize: 12, textAlign: "center", padding: 36 }}>
                  <div style={{ fontSize: 26, marginBottom: 9 }}>🎙️</div>
                  <div>{lang === "es" ? "Habla con tu sargento." : "Talk to your drill sergeant."}</div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ marginBottom: 11, display: "flex", gap: 9, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ fontSize: 15, flexShrink: 0 }}>{msg.role === "user" ? "🫵" : "🎙️"}</div>
                  <div style={{ background: msg.role === "user" ? "#0d1a2a" : "#1a0808", border: `1px solid ${msg.role === "user" ? "#00CFFF22" : "#FF444422"}`, padding: "9px 13px", fontSize: 13, lineHeight: 1.6, maxWidth: "80%", color: msg.role === "user" ? "#C0D8FF" : "#FFD0D0" }}>{msg.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 15 }}>🎙️</div>
                  <div style={{ color: "#FF4444", fontSize: 10, animation: "pulse 1s infinite" }}>{t.incoming}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input style={{ flex: 1, width: "auto" }} placeholder={t.drill_placeholder} value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === "Enter" && askCoach()} />
              <button className="pbtn" onClick={askCoach} disabled={aiLoading || !userInput.trim()} style={{ whiteSpace: "nowrap" }}>{t.send}</button>
            </div>
            <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {t.coach_prompts.map(q => (
                <button key={q} onClick={() => setUserInput(q)} style={{ background: "transparent", border: "1px solid #1a2040", color: "#4a6080", padding: "4px 9px", cursor: "pointer", fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ LEADERBOARD ═══ */}
        {activeTab === "leaderboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Name setup if not set */}
            {!state.playerName && (
              <div style={{ background: "#080d1a", border: "1px solid #00CFFF44", padding: 20, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⚔️</div>
                <div style={{ fontSize: 12, color: "#6080AA", marginBottom: 16, lineHeight: 1.7 }}>
                  {lang === "es" ? "Para aparecer en el ranking, elige tu nombre de batalla. Será visible para todos." : "To appear on the leaderboard, choose your battle name. It will be visible to everyone."}
                </div>
                <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
                  <input placeholder={t.your_name} value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveName()} style={{ flex: 1, width: "auto" }} />
                  <button className="pbtn" onClick={saveName} style={{ whiteSpace: "nowrap" }}>{t.save_name}</button>
                </div>
              </div>
            )}

            {state.playerName && (
              <div style={{ background: "#080d1a", border: "1px solid #00CFFF22", padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#00CFFF" }}>◈ {state.playerName}</div>
                <div style={{ fontSize: 11, color: "#FFD700" }}>{lang === "es" ? "Puntos esta semana" : "Score this week"}: <strong>{weekScore}</strong></div>
              </div>
            )}

            {/* Weekly Board */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#FFD700" }}>{t.leaderboard_title}</div>
              <button className="dbtn" onClick={loadLeaderboard}>{t.refresh}</button>
            </div>

            {leaderboardLoading && (
              <div style={{ textAlign: "center", padding: 24, color: "#4a6080", fontSize: 11, animation: "pulse 1s infinite" }}>
                {lang === "es" ? "Cargando clasificación..." : "Loading standings..."}
              </div>
            )}

            {!leaderboardLoading && leaderboard.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "#4a6080", border: "1px dashed #1a2040", fontSize: 11, marginBottom: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
                {t.no_players}
              </div>
            )}

            {leaderboard.length > 0 && (
              <>
                {/* Winner banner */}
                <div style={{ background: "#1a1400", border: "1px solid #FFD70044", padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>🏆</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: 2 }}>{t.week_winner}</div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#FFE44D" }}>{leaderboard[0].name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#FFD700" }}>{leaderboard[0].score}</div>
                    <div style={{ fontSize: 9, color: "#4a6080" }}>{lang === "es" ? "pts" : "pts"}</div>
                  </div>
                </div>

                {leaderboard.map((player, i) => (
                  <div key={player.name} className={`lbrow ${player.name === state.playerName ? "me" : ""} ${i === 0 ? "first" : ""}`}>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#4a6080", minWidth: 24, textAlign: "center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: player.name === state.playerName ? "#00CFFF" : "#E0E8FF" }}>
                        {player.name} {player.name === state.playerName && <span style={{ fontSize: 9, color: "#00CFFF" }}>{t.you_label}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>{player.xp} XP · {player.tasks} {t.tasks_done}</div>
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 15, color: i === 0 ? "#FFD700" : "#E0E8FF" }}>{player.score}</div>
                  </div>
                ))}
              </>
            )}

            {/* All-Time Board */}
            <div style={{ marginTop: 24, marginBottom: 12, fontSize: 9, letterSpacing: 2, color: "#AA44FF" }}>{t.alltime_title}</div>

            {allTimeBoard.length > 0 && (
              <>
                <div style={{ background: "#0d0a1a", border: "1px solid #AA44FF44", padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>👑</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#AA44FF", letterSpacing: 2 }}>{t.alltime_leader}</div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#CC88FF" }}>{allTimeBoard[0].name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#AA44FF" }}>{allTimeBoard[0].score}</div>
                    <div style={{ fontSize: 9, color: "#4a6080" }}>pts</div>
                  </div>
                </div>
                {allTimeBoard.map((player, i) => (
                  <div key={player.name} className={`lbrow ${player.name === state.playerName ? "me" : ""}`} style={{ borderColor: i === 0 ? "#AA44FF33" : "#1a2040" }}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: i === 0 ? "#AA44FF" : "#4a6080", minWidth: 24, textAlign: "center" }}>
                      {i === 0 ? "👑" : `#${i+1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: player.name === state.playerName ? "#00CFFF" : "#E0E8FF" }}>
                        {player.name} {player.name === state.playerName && <span style={{ fontSize: 9, color: "#00CFFF" }}>{t.you_label}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>{player.xp} XP · {player.tasks} {t.tasks_done}</div>
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 15, color: i === 0 ? "#AA44FF" : "#E0E8FF" }}>{player.score}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
