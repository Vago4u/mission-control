import { useState, useEffect, useRef } from "react";


async function callGemini(prompt, systemPrompt = "", history = [], maxTokens = 2000) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  if (history.length > 0) {
    history.forEach(m => messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
  } else {
    messages.push({ role: "user", content: prompt });
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: maxTokens, temperature: 0.8 })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    system_online: "● SYSTEM ONLINE", title: "MISSION CONTROL", subtitle: "NO EXCUSES. ONLY RESULTS.",
    level: "LEVEL", total_xp: "TOTAL XP", streak: "STREAK", done: "DONE", xp_to_next: "XP TO NEXT",
    tab_base: "📊 Base", tab_strategy: "🧠 Strategy", tab_schedule: "📅 Schedule",
    tab_tasks: "⚔️ Tasks", tab_boss: "💀 Boss", tab_badges: "🏅 Badges", tab_coach: "🎙️ Coach", tab_leaderboard: "🏆 Ranking",
    daily_briefing: "▶ DAILY BRIEFING", new_order: "NEW ORDER", week_progress: "▶ WEEK PROGRESS",
    no_schedule: "No schedule yet. Go to Strategy tab first.", generate_week: "BUILD MY STRATEGY →",
    strategy_title: "🧠 AI STRATEGIST", strategy_subtitle: "Answer a few questions. I'll analyze your situation and build your complete 90-day strategy + weekly plan. No guessing. Data-driven.",
    start_analysis: "START ANALYSIS →", analyzing: "ANALYZING YOUR MARKET...", analyzing_sub: "Studying trends, psychology, competition... building your strategy...",
    your_strategy: "▶ YOUR 90-DAY STRATEGY", regenerate_strategy: "↺ NEW STRATEGY", build_schedule: "▶ BUILD THIS WEEK'S PLAN →",
    building_schedule: "DEPLOYING WEEKLY PLAN", building_sub: "Optimizing tasks based on your strategy...",
    schedule_ready: "🗓️ Weekly plan deployed!", your_plan: "▶ YOUR BATTLE PLAN", regenerate: "↺ REGENERATE WEEK",
    rest_day: "REST DAY — RECOVER AND RELOAD", complete: "COMPLETE", missions_complete: "missions complete",
    victory_reward: "VICTORY REWARD", boss_damage: "BOSS DAMAGE", hits: "HITS", all_bosses: "ALL BOSSES DEFEATED",
    commendations: "▶ COMMENDATIONS", earned: "✓ EARNED",
    drill_title: "▶ STRATEGIC COACH — LIVE", drill_placeholder: "Ask your strategist anything...",
    send: "SEND", incoming: "ANALYZING...",
    coach_prompts: ["Analyze my progress", "What should I focus on today?", "I'm feeling unmotivated", "Review my strategy"],
    manual_missions: "▶ MANUAL MISSIONS", pending: "PENDING", add: "+ ADD",
    new_mission: "▶ NEW MISSION", mission_placeholder: "MISSION OBJECTIVE...", deploy: "DEPLOY",
    completed_section: "▶ COMPLETED", no_missions: "NO MANUAL MISSIONS", no_missions_sub: "Your strategy generates tasks automatically. Add extras here.",
    xp_easy: "25 XP — Easy", xp_med: "50 XP — Medium", xp_hard: "100 XP — Hard", xp_epic: "200 XP — Epic",
    leaderboard_title: "▶ WEEKLY WAR STANDINGS", alltime_title: "▶ ALL-TIME GLORY",
    your_name: "YOUR CALL SIGN", save_name: "SAVE & JOIN", week_winner: "🏆 WEEK WINNER",
    alltime_leader: "👑 ALL-TIME LEADER", tasks_done: "tasks", refresh: "↺ REFRESH",
    no_players: "No other soldiers yet. Share the app!", you_label: "← YOU",
    days: ["MON","TUE","WED","THU","FRI","SAT","SUN"],
    onboarding: [
      { id: "name", label: "What's your name?", placeholder: "e.g. Mateo", type: "text" },
      { id: "niche", label: "What's your niche or industry?", placeholder: "e.g. Wedding videography, fitness coaching, e-commerce..." },
      { id: "platforms", label: "Which platforms are you on?", placeholder: "e.g. Instagram 2k followers, TikTok 500, YouTube just starting..." },
      { id: "goal_90", label: "What's your #1 goal in 90 days?", placeholder: "e.g. Get 10 clients, reach 10k followers, make $5k/month..." },
      { id: "current_situation", label: "Describe your current situation honestly.", placeholder: "e.g. Posting inconsistently, no clear strategy, working full time, 2hrs free per day..." },
      { id: "obstacles", label: "What's your biggest obstacle right now?", placeholder: "e.g. No time, don't know what content to make, low engagement..." },
      { id: "available_hours", label: "How many hours per day can you dedicate?", placeholder: "e.g. 2 hours on weekdays, 4 hours on weekends, mornings only..." },
    ],
    strategy_prompt: (a) => `You are an elite growth strategist, market analyst, and conversion psychologist. Analyze this person and build their complete strategy.

PROFILE:
- Name: ${a.name}
- Niche: ${a.niche}
- Platforms: ${a.platforms}
- 90-day goal: ${a.goal_90}
- Current situation: ${a.current_situation}
- Main obstacle: ${a.obstacles}
- Available hours: ${a.available_hours}

Create a brutally honest, data-driven strategic analysis and 90-day battle plan. Use conversion psychology, market trends, and growth principles.

Structure your response EXACTLY like this (use these exact headers):

## MARKET ANALYSIS
[2-3 sentences about their niche, competition, and opportunity]

## BRUTAL DIAGNOSIS
[2-3 sentences of honest assessment of where they are and what's holding them back]

## 90-DAY STRATEGY
[The core strategic approach - content pillars, positioning, conversion funnel]

## WEEK 1-4: FOUNDATION
[Specific actions for the first month]

## WEEK 5-8: ACCELERATION  
[Specific actions for month 2]

## WEEK 9-12: CONVERSION
[Specific actions for month 3]

## CONTENT FORMULA
[Exact content formula: types, frequency, best times, hooks that work for their niche]

## PSYCHOLOGY TRIGGERS
[3-4 specific psychological triggers to use in their content and outreach]

## KEY METRICS TO TRACK
[5 specific numbers they must track weekly]

Be specific, actionable, and ruthless. No generic advice. Everything must be tailored to their exact situation.`,
    schedule_prompt: (a, strategy) => `You are a precision military scheduler. Build this person's optimal week based on their strategy.

PERSON: ${a.name}
NICHE: ${a.niche}
GOAL: ${a.goal_90}
HOURS/DAY: ${a.available_hours}
STRATEGY SUMMARY: ${strategy ? strategy.substring(0, 500) : "grow audience and get clients"}

Create a 7-day schedule optimized for maximum progress toward their goal. Every task must directly serve their strategy.

Return ONLY valid JSON. No markdown. No explanation. Keys must be exactly: MON, TUE, WED, THU, FRI, SAT, SUN

{"MON":[{"time":"7:00 AM","title":"specific task name","category":"content","duration":"45 min","xp":75,"why":"why this task matters strategically","completed":false}],"TUE":[...],"WED":[...],"THU":[...],"FRI":[...],"SAT":[...],"SUN":[...]}

category must be one of: content, videos, networking, exercise, learning, business, running
xp: 25=easy(15min), 50=medium(30min), 100=hard(60min), 150=epic(90min+)
4-6 tasks per day. Include specific times. Tasks must be SPECIFIC to their niche, not generic.
Each task needs a "why" field explaining its strategic purpose.
Balance content creation, outreach, learning, and self-care.`,
    coach_system: (profile, strategy, stats) => `You are an elite strategic coach and market analyst. You have deep knowledge of growth psychology, content strategy, and conversion optimization.

YOUR CLIENT:
- Name: ${profile?.name || "the user"}
- Niche: ${profile?.niche || "content creation"}
- Goal: ${profile?.goal_90 || "grow and monetize"}
- Stats: Level ${stats.level}, ${stats.xp} XP, ${stats.streak} day streak

THEIR STRATEGY:
${strategy ? strategy.substring(0, 300) : "Build audience and get clients"}

Be their strategic advisor. Analyze their questions through the lens of their specific goals and market. Give data-driven, psychology-based advice. Be direct and specific. Max 4 sentences. Never generic. Always tactical.`,
    strict_messages: [
      "Every day you don't post, a competitor takes your spot.", "Your content is your sales team. Put it to work.",
      "Your audience is waiting. They just don't know you exist yet.", "Consistency beats talent. Always.",
      "The algorithm rewards those who show up. Show up.", "Your future clients are scrolling right now. Are you there?",
      "Every piece of content is a 24/7 sales asset. Create more.", "Stop planning. Start executing.",
      "Data doesn't lie. Your metrics are telling you something. Listen.", "The best time to post was yesterday. The second best is now.",
    ],
    categories: [
      { id: "content", label: "Create Content", icon: "✍️", color: "#FF4444" },
      { id: "videos", label: "Film & Edit", icon: "🎬", color: "#FF8C00" },
      { id: "networking", label: "Outreach", icon: "🤝", color: "#FFD700" },
      { id: "exercise", label: "Exercise", icon: "💪", color: "#00FF88" },
      { id: "learning", label: "Study & Research", icon: "📚", color: "#00E5FF" },
      { id: "business", label: "Business", icon: "💼", color: "#AA44FF" },
      { id: "running", label: "Running", icon: "🏃", color: "#FF44AA" },
    ],
    badges: [
      { id: "first_blood", label: "First Blood", desc: "Complete your first task", xp: 50, icon: "🩸", condition: (s) => s.totalCompleted >= 1 },
      { id: "streak3", label: "On Fire", desc: "3-day streak", xp: 100, icon: "🔥", condition: (s) => s.streak >= 3 },
      { id: "streak7", label: "Unstoppable", desc: "7-day streak", xp: 300, icon: "⚡", condition: (s) => s.streak >= 7 },
      { id: "strategist", label: "Strategist", desc: "Complete your first strategy analysis", xp: 200, icon: "🧠", condition: (s) => (s.strategiesGenerated||0) >= 1 },
      { id: "xp500", label: "Grinder", desc: "Earn 500 XP", xp: 200, icon: "💎", condition: (s) => s.totalXP >= 500 },
      { id: "boss1", label: "Boss Slayer", desc: "Defeat your first boss", xp: 400, icon: "💀", condition: (s) => s.bossesDefeated >= 1 },
      { id: "all_cats", label: "Full Spectrum", desc: "Complete all 7 categories", xp: 500, icon: "🌈", condition: (s) => s.categoriesThisWeek >= 7 },
      { id: "winner", label: "Week Champion", desc: "Win the weekly leaderboard", xp: 600, icon: "🏆", condition: (s) => (s.weekWins||0) >= 1 },
    ],
  },
  es: {
    system_online: "● SISTEMA EN LÍNEA", title: "CENTRO DE MISIONES", subtitle: "SIN EXCUSAS. SOLO RESULTADOS.",
    level: "NIVEL", total_xp: "XP TOTAL", streak: "RACHA", done: "HECHAS", xp_to_next: "XP AL SIGUIENTE",
    tab_base: "📊 Base", tab_strategy: "🧠 Estrategia", tab_schedule: "📅 Horario",
    tab_tasks: "⚔️ Tareas", tab_boss: "💀 Jefe", tab_badges: "🏅 Insignias", tab_coach: "🎙️ Coach", tab_leaderboard: "🏆 Ranking",
    daily_briefing: "▶ BRIEFING DIARIO", new_order: "NUEVA ORDEN", week_progress: "▶ PROGRESO SEMANAL",
    no_schedule: "Sin horario. Ve primero a Estrategia.", generate_week: "CONSTRUIR MI ESTRATEGIA →",
    strategy_title: "🧠 ESTRATEGA IA", strategy_subtitle: "Responde unas preguntas. Analizo tu situación y construyo tu estrategia completa de 90 días + plan semanal. Sin suposiciones. Basado en datos.",
    start_analysis: "INICIAR ANÁLISIS →", analyzing: "ANALIZANDO TU MERCADO...", analyzing_sub: "Estudiando tendencias, psicología, competencia... construyendo tu estrategia...",
    your_strategy: "▶ TU ESTRATEGIA DE 90 DÍAS", regenerate_strategy: "↺ NUEVA ESTRATEGIA", build_schedule: "▶ CONSTRUIR PLAN DE ESTA SEMANA →",
    building_schedule: "DESPLEGANDO PLAN SEMANAL", building_sub: "Optimizando tareas según tu estrategia...",
    schedule_ready: "🗓️ ¡Plan semanal desplegado!", your_plan: "▶ TU PLAN DE BATALLA", regenerate: "↺ REGENERAR SEMANA",
    rest_day: "DÍA DE DESCANSO — RECUPERA Y RECARGA", complete: "COMPLETO", missions_complete: "misiones completas",
    victory_reward: "RECOMPENSA DE VICTORIA", boss_damage: "DAÑO AL JEFE", hits: "GOLPES", all_bosses: "TODOS LOS JEFES DERROTADOS",
    commendations: "▶ CONDECORACIONES", earned: "✓ OBTENIDA",
    drill_title: "▶ COACH ESTRATÉGICO — EN VIVO", drill_placeholder: "Pregúntale a tu estratega...",
    send: "ENVIAR", incoming: "ANALIZANDO...",
    coach_prompts: ["Analiza mi progreso", "¿En qué me enfoco hoy?", "No me siento motivado", "Revisa mi estrategia"],
    manual_missions: "▶ MISIONES MANUALES", pending: "PENDIENTES", add: "+ AGREGAR",
    new_mission: "▶ NUEVA MISIÓN", mission_placeholder: "OBJETIVO DE MISIÓN...", deploy: "DESPLEGAR",
    completed_section: "▶ COMPLETADAS", no_missions: "SIN MISIONES MANUALES", no_missions_sub: "Tu estrategia genera tareas automáticamente. Agrega extras aquí.",
    xp_easy: "25 XP — Fácil", xp_med: "50 XP — Medio", xp_hard: "100 XP — Difícil", xp_epic: "200 XP — Épico",
    leaderboard_title: "▶ CLASIFICACIÓN SEMANAL", alltime_title: "▶ GLORIA HISTÓRICA",
    your_name: "TU NOMBRE EN BATALLA", save_name: "GUARDAR Y UNIRSE", week_winner: "🏆 GANADOR DE LA SEMANA",
    alltime_leader: "👑 LÍDER HISTÓRICO", tasks_done: "tareas", refresh: "↺ ACTUALIZAR",
    no_players: "¡Aún no hay otros soldados. Comparte la app!", you_label: "← TÚ",
    days: ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"],
    onboarding: [
      { id: "name", label: "¿Cuál es tu nombre?", placeholder: "ej. Mateo", type: "text" },
      { id: "niche", label: "¿Cuál es tu nicho o industria?", placeholder: "ej. Videografía de bodas, coaching fitness, e-commerce..." },
      { id: "platforms", label: "¿En qué plataformas estás?", placeholder: "ej. Instagram 2k seguidores, TikTok 500, YouTube recién empezando..." },
      { id: "goal_90", label: "¿Cuál es tu meta #1 en 90 días?", placeholder: "ej. Conseguir 10 clientes, llegar a 10k seguidores, ganar $5k/mes..." },
      { id: "current_situation", label: "Describe tu situación actual con honestidad.", placeholder: "ej. Publico inconsistentemente, sin estrategia clara, trabajo tiempo completo, 2hrs libres al día..." },
      { id: "obstacles", label: "¿Cuál es tu mayor obstáculo ahora mismo?", placeholder: "ej. Sin tiempo, no sé qué contenido crear, bajo engagement..." },
      { id: "available_hours", label: "¿Cuántas horas al día puedes dedicar?", placeholder: "ej. 2 horas entre semana, 4 horas los fines de semana, solo mañanas..." },
    ],
    strategy_prompt: (a) => `Eres un estratega de crecimiento élite, analista de mercado y psicólogo de conversión. Analiza a esta persona y construye su estrategia completa.

PERFIL:
- Nombre: ${a.name}
- Nicho: ${a.niche}
- Plataformas: ${a.platforms}
- Meta 90 días: ${a.goal_90}
- Situación actual: ${a.current_situation}
- Mayor obstáculo: ${a.obstacles}
- Horas disponibles: ${a.available_hours}

Crea un análisis estratégico brutalmente honesto y un plan de batalla de 90 días. Usa psicología de conversión, tendencias de mercado y principios de crecimiento.

Estructura tu respuesta EXACTAMENTE así (usa estos encabezados exactos):

## ANÁLISIS DE MERCADO
[2-3 oraciones sobre su nicho, competencia y oportunidad]

## DIAGNÓSTICO BRUTAL
[2-3 oraciones de evaluación honesta de dónde está y qué lo frena]

## ESTRATEGIA DE 90 DÍAS
[El enfoque estratégico central — pilares de contenido, posicionamiento, embudo de conversión]

## SEMANAS 1-4: FUNDACIÓN
[Acciones específicas para el primer mes]

## SEMANAS 5-8: ACELERACIÓN
[Acciones específicas para el mes 2]

## SEMANAS 9-12: CONVERSIÓN
[Acciones específicas para el mes 3]

## FÓRMULA DE CONTENIDO
[Fórmula exacta: tipos, frecuencia, mejores horarios, hooks que funcionan para su nicho]

## DISPARADORES PSICOLÓGICOS
[3-4 disparadores psicológicos específicos para usar en su contenido y alcance]

## MÉTRICAS CLAVE A RASTREAR
[5 números específicos que debe rastrear semanalmente]

Sé específico, accionable y sin piedad. Sin consejos genéricos. Todo debe estar adaptado a su situación exacta. Responde en español.`,
    schedule_prompt: (a, strategy) => `Eres un planificador militar de precisión. Construye la semana óptima de esta persona basada en su estrategia.

PERSONA: ${a.name}
NICHO: ${a.niche}
META: ${a.goal_90}
HORAS/DÍA: ${a.available_hours}
RESUMEN DE ESTRATEGIA: ${strategy ? strategy.substring(0, 500) : "crecer audiencia y conseguir clientes"}

Crea un horario de 7 días optimizado para máximo progreso hacia su meta. Cada tarea debe servir directamente a su estrategia.

Devuelve SOLO JSON válido. Sin markdown. Sin explicaciones. Las claves deben ser exactamente: LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM

{"LUN":[{"time":"7:00 AM","title":"nombre específico de tarea","category":"content","duration":"45 min","xp":75,"why":"por qué esta tarea importa estratégicamente","completed":false}],"MAR":[...],"MIÉ":[...],"JUE":[...],"VIE":[...],"SÁB":[...],"DOM":[...]}

category debe ser uno de: content, videos, networking, exercise, learning, business, running
xp: 25=fácil(15min), 50=medio(30min), 100=difícil(60min), 150=épico(90min+)
4-6 tareas por día. Horarios específicos. Las tareas deben ser ESPECÍFICAS para su nicho, no genéricas.
Cada tarea necesita un campo "why" explicando su propósito estratégico.`,
    coach_system: (profile, strategy, stats) => `Eres un coach estratégico élite y analista de mercado con profundo conocimiento de psicología de crecimiento, estrategia de contenido y optimización de conversión.

TU CLIENTE:
- Nombre: ${profile?.name || "el usuario"}
- Nicho: ${profile?.niche || "creación de contenido"}
- Meta: ${profile?.goal_90 || "crecer y monetizar"}
- Stats: Nivel ${stats.level}, ${stats.xp} XP, racha de ${stats.streak} días

SU ESTRATEGIA:
${strategy ? strategy.substring(0, 300) : "Construir audiencia y conseguir clientes"}

Sé su asesor estratégico. Analiza sus preguntas a través de sus metas específicas y mercado. Da consejos basados en datos y psicología. Sé directo y específico. Máximo 4 oraciones. Nunca genérico. Siempre táctico. Responde siempre en español.`,
    strict_messages: [
      "Cada día que no publicas, un competidor toma tu lugar.", "Tu contenido es tu equipo de ventas. Ponlo a trabajar.",
      "Tu audiencia te está esperando. Solo que aún no saben que existes.", "La consistencia vence al talento. Siempre.",
      "El algoritmo premia a los que aparecen. Aparece.", "Tus futuros clientes están scrolleando ahora mismo. ¿Estás ahí?",
      "Cada pieza de contenido es un activo de ventas 24/7. Crea más.", "Deja de planear. Empieza a ejecutar.",
      "Los datos no mienten. Tus métricas te están diciendo algo. Escucha.", "El mejor momento para publicar fue ayer. El segundo mejor es ahora.",
    ],
    categories: [
      { id: "content", label: "Crear Contenido", icon: "✍️", color: "#FF4444" },
      { id: "videos", label: "Filmar y Editar", icon: "🎬", color: "#FF8C00" },
      { id: "networking", label: "Outreach", icon: "🤝", color: "#FFD700" },
      { id: "exercise", label: "Ejercicio", icon: "💪", color: "#00FF88" },
      { id: "learning", label: "Estudio e Investigación", icon: "📚", color: "#00E5FF" },
      { id: "business", label: "Negocios", icon: "💼", color: "#AA44FF" },
      { id: "running", label: "Running", icon: "🏃", color: "#FF44AA" },
    ],
    badges: [
      { id: "first_blood", label: "Primera Sangre", desc: "Completa tu primera tarea", xp: 50, icon: "🩸", condition: (s) => s.totalCompleted >= 1 },
      { id: "streak3", label: "En Llamas", desc: "Racha de 3 días", xp: 100, icon: "🔥", condition: (s) => s.streak >= 3 },
      { id: "streak7", label: "Imparable", desc: "Racha de 7 días", xp: 300, icon: "⚡", condition: (s) => s.streak >= 7 },
      { id: "strategist", label: "Estratega", desc: "Completa tu primer análisis estratégico", xp: 200, icon: "🧠", condition: (s) => (s.strategiesGenerated||0) >= 1 },
      { id: "xp500", label: "Trabajador", desc: "Gana 500 XP", xp: 200, icon: "💎", condition: (s) => s.totalXP >= 500 },
      { id: "boss1", label: "Cazajefes", desc: "Derrota a tu primer jefe", xp: 400, icon: "💀", condition: (s) => s.bossesDefeated >= 1 },
      { id: "all_cats", label: "Espectro Completo", desc: "Completa las 7 categorías", xp: 500, icon: "🌈", condition: (s) => s.categoriesThisWeek >= 7 },
      { id: "winner", label: "Campeón Semanal", desc: "Gana el ranking semanal", xp: 600, icon: "🏆", condition: (s) => (s.weekWins||0) >= 1 },
    ],
  }
};

const BOSSES_DATA = [
  { id: "procrastination", name_en: "THE PROCRASTINATOR", name_es: "EL PROCRASTINADOR", icon: "😴", reward: 300, desc_en: "Your laziness given form. Complete 5 tasks to defeat it.", desc_es: "Tu pereza hecha forma. Completa 5 tareas para derrotarlo.", requirement: 5 },
  { id: "distraction", name_en: "LORD OF DISTRACTION", name_es: "SEÑOR DE LA DISTRACCIÓN", icon: "📱", reward: 500, desc_en: "Scatter-brain supreme. Complete tasks across 7 categories.", desc_es: "La distracción suprema. Completa tareas en 7 categorías.", requirement: 7 },
  { id: "comfort_zone", name_en: "COMFORT ZONE DEMON", name_es: "DEMONIO DE LA ZONA DE CONFORT", icon: "🛋️", reward: 800, desc_en: "The ultimate enemy. Maintain a 7-day streak.", desc_es: "El enemigo definitivo. Mantén una racha de 7 días.", requirement: 7 },
];

const XP_PER_LEVEL = 200;
function getLevel(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function getLevelProgress(xp) { return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100; }
function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `week_${now.getFullYear()}_${week}`;
}

const initialState = {
  totalXP: 0, streak: 0, totalCompleted: 0, bossesDefeated: 0,
  categoriesThisWeek: 0, unlockedBadges: [], tasks: {},
  currentBossIndex: 0, bossProgress: 0,
  weeklySchedule: null, strategiesGenerated: 0, weekWins: 0,
  playerName: "", weekXP: 0, weekTasks: 0,
  userProfile: null, strategy: null,
};

export default function MissionControl() {
  const [lang, setLang] = useState("es");
  const t = T[lang];
  const [state, setState] = useState(initialState);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [coachMessage, setCoachMessage] = useState(() => T.es.strict_messages[0]);
  const [newTask, setNewTask] = useState({ title: "", category: "content", xp: 50 });
  const [showAddTask, setShowAddTask] = useState(false);
  const [notification, setNotification] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [allTimeBoard, setAllTimeBoard] = useState([]);

  // Onboarding & Strategy state
  const [onboardingStep, setOnboardingStep] = useState(0); // 0=intro, 1-7=questions, 8=generating, 9=done
  const [onboardingAnswers, setOnboardingAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [buildingSchedule, setBuildingSchedule] = useState(false);

  const chatRef = useRef(null);
  const currentBoss = BOSSES_DATA[state.currentBossIndex] || null;

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chatHistory]);
  useEffect(() => { if (activeTab === "leaderboard") loadLeaderboard(); }, [activeTab]);
  useEffect(() => { if (state.playerName && state.totalXP > 0) pushScore(); }, [state.totalXP, state.totalCompleted]);

  function showNotif(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }

  function checkBadges(newState, prev) {
    const newBadges = t.badges.filter(b => !prev.unlockedBadges.includes(b.id) && b.condition(newState));
    if (newBadges.length > 0) {
      newState.unlockedBadges = [...prev.unlockedBadges, ...newBadges.map(b => b.id)];
      setTimeout(() => showNotif(`🏅 ${newBadges[0].label}!`, "badge"), 400);
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
    showNotif("+XP!", "xp");
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
    showNotif("+XP!", "xp");
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
      const systemPrompt = t.coach_system(state.userProfile, state.strategy, { level: getLevel(state.totalXP), xp: state.totalXP, streak: state.streak });
      const reply = await callGemini(q, systemPrompt, hist, 1000);
      setChatHistory([...hist, { role: "assistant", content: reply || (lang === "es" ? "Vuelve al trabajo." : "Get back to work.") }]);
    } catch {
      setChatHistory([...hist, { role: "assistant", content: lang === "es" ? "Error de conexión. Intenta de nuevo." : "Connection error. Try again." }]);
    }
    setAiLoading(false);
  }

  function nextOnboardingStep() {
    const updated = { ...onboardingAnswers };
    if (currentAnswer.trim() && onboardingStep >= 1) {
      updated[t.onboarding[onboardingStep - 1].id] = currentAnswer.trim();
      setOnboardingAnswers(updated);
    }
    setCurrentAnswer("");
    if (onboardingStep >= t.onboarding.length) {
      generateStrategy(updated);
    } else {
      setOnboardingStep(s => s + 1);
    }
  }

  async function generateStrategy(answers) {
    setOnboardingStep(8);
    setAiLoading(true);
    try {
      const strategy = await callGemini(t.strategy_prompt(answers), "", [], 3000);
      setState(prev => {
        let ns = { ...prev, strategy, userProfile: answers, strategiesGenerated: (prev.strategiesGenerated || 0) + 1, playerName: answers.name || prev.playerName };
        return checkBadges(ns, prev);
      });
      setOnboardingStep(9);
      showNotif(lang === "es" ? "🧠 ¡Estrategia generada!" : "🧠 Strategy generated!", "badge");
    } catch {
      showNotif(lang === "es" ? "Error al generar. Intenta de nuevo." : "Generation failed. Try again.", "error");
      setOnboardingStep(1);
    }
    setAiLoading(false);
  }

  async function buildWeeklySchedule() {
    setBuildingSchedule(true);
    setAiLoading(true);
    try {
      const raw = await callGemini(t.schedule_prompt(state.userProfile, state.strategy), "", [], 4000);
      const clean = raw.replace(/```json|```/g, "").trim();
      const schedule = JSON.parse(clean);
      setState(prev => ({ ...prev, weeklySchedule: schedule }));
      setActiveTab("schedule");
      showNotif(t.schedule_ready, "badge");
    } catch {
      showNotif(lang === "es" ? "Error al generar horario." : "Schedule generation failed.", "error");
    }
    setBuildingSchedule(false);
    setAiLoading(false);
  }

  async function pushScore() {
    if (!state.playerName) return;
    const weekKey = getWeekKey();
    const weekData = { name: state.playerName, xp: state.weekXP, tasks: state.weekTasks, score: state.weekXP + state.weekTasks * 10, ts: Date.now() };
    const allData = { name: state.playerName, xp: state.totalXP, tasks: state.totalCompleted, score: state.totalXP + state.totalCompleted * 10, ts: Date.now() };
    try {
      await window.storage.set(`lb_week_${weekKey}_${state.playerName}`, JSON.stringify(weekData), true);
      await window.storage.set(`lb_alltime_${state.playerName}`, JSON.stringify(allData), true);
    } catch {}
  }

  async function loadLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const weekKey = getWeekKey();
      const weekResult = await window.storage.list(`lb_week_${weekKey}_`, true);
      const allTimeResult = await window.storage.list(`lb_alltime_`, true);
      const weekEntries = [];
      if (weekResult?.keys) for (const key of weekResult.keys) { try { const r = await window.storage.get(key, true); if (r?.value) weekEntries.push(JSON.parse(r.value)); } catch {} }
      const allEntries = [];
      if (allTimeResult?.keys) for (const key of allTimeResult.keys) { try { const r = await window.storage.get(key, true); if (r?.value) allEntries.push(JSON.parse(r.value)); } catch {} }
      weekEntries.sort((a, b) => b.score - a.score);
      allEntries.sort((a, b) => b.score - a.score);
      setLeaderboard(weekEntries);
      setAllTimeBoard(allEntries);
    } catch {}
    setLeaderboardLoading(false);
  }

  const level = getLevel(state.totalXP);
  const levelProgress = getLevelProgress(state.totalXP);
  const tasks = Object.values(state.tasks);
  const DAYS = t.days;
  const todaySchedule = state.weeklySchedule?.[DAYS[selectedDay]] || [];
  const todayDone = todaySchedule.filter(x => x.completed).length;
  const bossHPPct = currentBoss ? (state.bossProgress / currentBoss.requirement) * 100 : 100;
  const hasSchedule = !!state.weeklySchedule;
  const hasStrategy = !!state.strategy;
  const getCatColor = id => t.categories.find(c => c.id === id)?.color || "#3a5570";
  const getCatIcon = id => t.categories.find(c => c.id === id)?.icon || "📌";
  const weekScore = (state.weekXP || 0) + (state.weekTasks || 0) * 10;

  const TABS = [
    { id: "dashboard", label: t.tab_base },
    { id: "strategy", label: t.tab_strategy },
    { id: "schedule", label: t.tab_schedule },
    { id: "tasks", label: t.tab_tasks },
    { id: "boss", label: t.tab_boss },
    { id: "badges", label: t.tab_badges },
    { id: "coach", label: t.tab_coach },
    { id: "leaderboard", label: t.tab_leaderboard },
  ];

  // Render markdown-like strategy text
  function renderStrategy(text) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <div key={i} style={{ fontSize: 11, letterSpacing: 2, color: "#00E5FF", marginTop: 18, marginBottom: 8, fontWeight: "bold" }}>{line.replace('## ', '▶ ')}</div>;
      if (line.startsWith('# ')) return <div key={i} style={{ fontSize: 13, letterSpacing: 2, color: "#FFD700", marginBottom: 8, fontWeight: "bold" }}>{line.replace('# ', '')}</div>;
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ fontSize: 12, color: "#B0C0D8", lineHeight: 1.7, marginBottom: 2 }}>{line}</div>;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060A12", color: "#E8F0FF", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(100,0,255,0.04) 0%, transparent 60%)", backgroundAttachment: "fixed" }} />

      {notification && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 10000, background: notification.type === "boss" ? "linear-gradient(135deg,#FF4444,#CC0000)" : notification.type === "badge" ? "linear-gradient(135deg,#FFD700,#FFA500)" : "linear-gradient(135deg,#00FF88,#00CC66)", color: "#000", padding: "14px 22px", fontWeight: "700", fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", borderRadius: 10 }}>
          {notification.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn{background:transparent;border:1px solid rgba(255,255,255,0.07);color:#5a7090;padding:9px 13px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.5px;transition:all 0.2s ease;text-transform:uppercase;border-radius:6px}
        .tab-btn:hover{border-color:rgba(0,229,255,0.3);color:#00E5FF;background:rgba(0,229,255,0.05)}
        .tab-btn.active{border-color:#00E5FF;color:#00E5FF;background:rgba(0,229,255,0.08);box-shadow:0 0 12px rgba(0,229,255,0.15)}
        .trow{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;transition:all 0.2s ease;cursor:pointer;animation:fadeUp 0.3s ease;border-radius:10px}
        .trow:hover{border-color:rgba(0,229,255,0.2);background:rgba(0,229,255,0.03);transform:translateX(2px)}
        .trow.done{opacity:0.35;border-color:rgba(0,255,136,0.15)}
        .chk{background:transparent;border:2px solid rgba(255,255,255,0.12);width:24px;height:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all 0.2s;flex-shrink:0;color:#00FF88;border-radius:6px}
        .chk:hover{border-color:#00FF88;background:rgba(0,255,136,0.08)}
        .chk.done{border-color:#00FF88;background:rgba(0,255,136,0.15)}
        input,select,textarea{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);color:#E8F0FF;padding:11px 15px;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:400;width:100%;outline:none;resize:none;border-radius:8px;transition:all 0.2s;box-sizing:border-box}
        input:focus,select:focus,textarea:focus{border-color:#00E5FF;background:rgba(0,229,255,0.04);box-shadow:0 0 0 3px rgba(0,229,255,0.08)}
        select option{background:#0d1117;color:#E8F0FF}
        .pbtn{background:linear-gradient(135deg,#00E5FF,#0099CC);color:#000;border:none;padding:11px 22px;font-family:'Space Grotesk',sans-serif;font-weight:700;cursor:pointer;letter-spacing:0.5px;font-size:12px;transition:all 0.2s ease;text-transform:uppercase;border-radius:8px}
        .pbtn:hover{background:linear-gradient(135deg,#33EEFF,#00BBEE);box-shadow:0 4px 20px rgba(0,229,255,0.4);transform:translateY(-1px)}
        .pbtn:disabled{background:rgba(255,255,255,0.06);color:#3a4a5a;cursor:not-allowed;box-shadow:none;transform:none}
        .gbtn{background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;border:none;padding:11px 22px;font-family:'Space Grotesk',sans-serif;font-weight:700;cursor:pointer;letter-spacing:0.5px;font-size:12px;transition:all 0.2s ease;text-transform:uppercase;border-radius:8px}
        .gbtn:hover{background:linear-gradient(135deg,#FFE44D,#FFB733);box-shadow:0 4px 20px rgba(255,215,0,0.4);transform:translateY(-1px)}
        .gbtn:disabled{background:rgba(255,255,255,0.06);color:#3a4a5a;cursor:not-allowed;box-shadow:none;transform:none}
        .dbtn{background:transparent;border:1px solid rgba(255,68,68,0.35);color:#FF6B6B;padding:9px 18px;font-family:'Space Grotesk',sans-serif;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:0.5px;transition:all 0.2s;border-radius:7px}
        .dbtn:hover{background:rgba(255,68,68,0.08);border-color:rgba(255,68,68,0.6)}
        .daybtn{background:transparent;border:1px solid rgba(255,255,255,0.07);color:#4a6080;padding:8px 6px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.5px;transition:all 0.2s;flex:1;text-align:center;border-radius:7px}
        .daybtn:hover{border-color:rgba(255,215,0,0.4);color:#FFD700}
        .daybtn.active{border-color:#FFD700;color:#FFD700;background:rgba(255,215,0,0.08);box-shadow:0 0 10px rgba(255,215,0,0.12)}
        .lbrow{display:flex;align-items:center;gap:12px;padding:13px 16px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);margin-bottom:8px;border-radius:10px;transition:all 0.2s}
        .lbrow:hover{background:rgba(255,255,255,0.03)}
        .lbrow.me{border-color:rgba(0,229,255,0.25);background:rgba(0,229,255,0.04)}
        .lbrow.first{border-color:rgba(255,215,0,0.25);background:rgba(255,215,0,0.04)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 18px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 22, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
          <div style={{ position: "absolute", right: 0, top: 0, display: "flex", gap: 4 }}>
            {["es","en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#00CFFF22" : "transparent", border: `1px solid ${lang === l ? "#00E5FF" : "rgba(255,255,255,0.07)"}`, color: lang === l ? "#00E5FF" : "#3a5570", padding: "5px 10px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF5566", marginBottom: 8, animation: "pulse 2s infinite", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{t.system_online}</div>
          <h1 style={{ fontSize: 26, fontWeight: "900", letterSpacing: 6, margin: "0 0 6px", fontFamily: "'Orbitron', monospace", textShadow: "0 0 30px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.1)" }}>{t.title}</h1>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#3a5070", fontFamily: "'JetBrains Mono', monospace" }}>{t.subtitle}</div>
          {state.playerName && <div style={{ fontSize: 10, color: "#00E5FF", marginTop: 6, letterSpacing: 2 }}>◈ {state.playerName} · {lang === "es" ? "PUNTOS" : "SCORE"}: {weekScore}</div>}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[{ label: t.level, value: level, color: "#00E5FF" }, { label: t.total_xp, value: state.totalXP, color: "#FFD700" }, { label: t.streak, value: `${state.streak}d`, color: "#FF8C00" }, { label: t.done, value: state.totalCompleted, color: "#00FF88" }].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "14px 8px", textAlign: "center", borderRadius: 12, backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 22, fontWeight: "700", color: s.color, fontFamily: "'Orbitron', monospace" }}>{s.value}</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5070", marginTop: 5, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#3a5570", marginBottom: 6 }}>
            <span>LVL {level}</span><span>{Math.round(state.totalXP % XP_PER_LEVEL)}/{XP_PER_LEVEL} {t.xp_to_next}</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#00E5FF,#7B61FF)", transition: "width 0.6s ease", boxShadow: "0 0 10px rgba(0,229,255,0.5)", borderRadius: 3 }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(tab => <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: "rgba(255,50,70,0.03)", border: "1px solid rgba(255,68,68,0.12)", padding: 18, marginBottom: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF5566", marginBottom: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{t.daily_briefing}</div>
              <div style={{ fontSize: 14, color: "#B0C0D8", lineHeight: 1.8, fontWeight: 400 }}>{coachMessage}</div>
              <button onClick={() => setCoachMessage(t.strict_messages[Math.floor(Math.random() * t.strict_messages.length)])} style={{ marginTop: 9, background: "transparent", border: "1px solid #FF444466", color: "#FF4444", padding: "4px 12px", cursor: "pointer", fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>{t.new_order}</button>
            </div>

            {!hasStrategy && (
              <div style={{ background: "rgba(0,229,255,0.02)", border: "1px solid rgba(0,229,255,0.15)", padding: 22, marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🧠</div>
                <div style={{ fontSize: 13, color: "#00E5FF", letterSpacing: 2, marginBottom: 8 }}>{lang === "es" ? "SIN ESTRATEGIA AÚN" : "NO STRATEGY YET"}</div>
                <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 14, lineHeight: 1.7 }}>{t.strategy_subtitle}</div>
                <button className="pbtn" onClick={() => { setActiveTab("strategy"); setOnboardingStep(1); }}>{t.start_analysis}</button>
              </div>
            )}

            {hasStrategy && state.userProfile && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#00E5FF", marginBottom: 10 }}>▶ {lang === "es" ? "PERFIL ESTRATÉGICO" : "STRATEGIC PROFILE"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: lang === "es" ? "NICHO" : "NICHE", value: state.userProfile.niche },
                    { label: lang === "es" ? "META 90 DÍAS" : "90-DAY GOAL", value: state.userProfile.goal_90 },
                    { label: lang === "es" ? "PLATAFORMAS" : "PLATFORMS", value: state.userProfile.platforms },
                    { label: lang === "es" ? "HORAS/DÍA" : "HOURS/DAY", value: state.userProfile.available_hours },
                  ].map(item => (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "8px 10px" }}>
                      <div style={{ fontSize: 8, color: "#3a5570", letterSpacing: 2, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#E0E8FF" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasSchedule && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #FFD70022", padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#FFD700", marginBottom: 10 }}>{t.week_progress}</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {DAYS.map((day, i) => {
                    const dt = state.weeklySchedule[day] || [];
                    const done = dt.filter(x => x.completed).length;
                    const pct = dt.length > 0 ? (done / dt.length) * 100 : 0;
                    return (
                      <div key={day} style={{ flex: 1, textAlign: "center", cursor: "pointer" }} onClick={() => { setActiveTab("schedule"); setSelectedDay(i); }}>
                        <div style={{ fontSize: 8, color: "#3a5570", marginBottom: 3 }}>{day}</div>
                        <div style={{ height: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: pct === 100 ? "#00FF88" : "#FFD700", transition: "height 0.5s" }} />
                        </div>
                        <div style={{ fontSize: 8, color: pct === 100 ? "#00FF88" : "#3a5570", marginTop: 2 }}>{done}/{dt.length}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {t.categories.map(cat => {
                const ct = tasks.filter(x => x.category === cat.id);
                const cd = ct.filter(x => x.completed).length;
                const pct = ct.length > 0 ? (cd / ct.length) * 100 : 0;
                return (
                  <div key={cat.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${cat.color}1a`, padding: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
                      <span>{cat.icon} {cat.label}</span>
                      <span style={{ color: cat.color, fontSize: 10 }}>{cd}/{ct.length}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cat.color, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STRATEGY ═══ */}
        {activeTab === "strategy" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Intro */}
            {onboardingStep === 0 && !hasStrategy && (
              <div style={{ textAlign: "center", padding: "36px 20px" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🧠</div>
                <div style={{ fontSize: 14, letterSpacing: 3, color: "#00E5FF", marginBottom: 10 }}>{t.strategy_title}</div>
                <div style={{ fontSize: 12, color: "#4a6a8a", lineHeight: 1.8, maxWidth: 480, margin: "0 auto 24px" }}>{t.strategy_subtitle}</div>
                <button className="pbtn" onClick={() => setOnboardingStep(1)}>{t.start_analysis}</button>
              </div>
            )}

            {/* Questions */}
            {onboardingStep >= 1 && onboardingStep <= t.onboarding.length && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {t.onboarding.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, background: i < onboardingStep ? "#00E5FF" : "rgba(255,255,255,0.07)", transition: "background 0.3s", borderRadius: 2 }} />
                  ))}
                </div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570", marginBottom: 7 }}>
                  {t.onboarding[onboardingStep - 1] && (lang === "es" ? `PREGUNTA ${onboardingStep} DE ${t.onboarding.length}` : `QUESTION ${onboardingStep} OF ${t.onboarding.length}`)}
                </div>
                <div style={{ fontSize: 14, color: "#E0E8FF", marginBottom: 16, lineHeight: 1.6 }}>{t.onboarding[onboardingStep - 1]?.label}</div>
                <textarea rows={3} placeholder={t.onboarding[onboardingStep - 1]?.placeholder} value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} style={{ marginBottom: 12 }} autoFocus />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="pbtn" onClick={nextOnboardingStep}>
                    {onboardingStep === t.onboarding.length ? (lang === "es" ? "ANALIZAR →" : "ANALYZE →") : (lang === "es" ? "SIGUIENTE →" : "NEXT →")}
                  </button>
                  {onboardingStep > 1 && <button onClick={() => { setOnboardingStep(s => s - 1); setCurrentAnswer(""); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#3a5570", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>{lang === "es" ? "← ATRÁS" : "← BACK"}</button>}
                  <button onClick={nextOnboardingStep} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#3a5570", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: 10 }}>{lang === "es" ? "OMITIR" : "SKIP"}</button>
                </div>
              </div>
            )}

            {/* Generating */}
            {onboardingStep === 8 && (
              <div style={{ textAlign: "center", padding: "56px 20px" }}>
                <div style={{ fontSize: 44, marginBottom: 16, display: "inline-block", animation: "spin 2s linear infinite" }}>🧠</div>
                <div style={{ fontSize: 12, letterSpacing: 3, color: "#00E5FF", marginBottom: 8 }}>{t.analyzing}</div>
                <div style={{ fontSize: 10, color: "#3a5570", animation: "pulse 1.5s infinite" }}>{t.analyzing_sub}</div>
              </div>
            )}

            {/* Strategy Display */}
            {(hasStrategy && (onboardingStep === 0 || onboardingStep === 9)) && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570" }}>{t.your_strategy}</div>
                  <button className="dbtn" onClick={() => { setState(prev => ({ ...prev, strategy: null, userProfile: null, weeklySchedule: null })); setOnboardingStep(1); setOnboardingAnswers({}); }}>{t.regenerate_strategy}</button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", padding: 20, marginBottom: 16, maxHeight: 500, overflowY: "auto" }}>
                  {renderStrategy(state.strategy)}
                </div>

                <button className="gbtn" onClick={buildWeeklySchedule} disabled={buildingSchedule || aiLoading} style={{ width: "100%", padding: 14, fontSize: 13 }}>
                  {buildingSchedule ? (lang === "es" ? "⚙️ CONSTRUYENDO..." : "⚙️ BUILDING...") : t.build_schedule}
                </button>

                {buildingSchedule && (
                  <div style={{ textAlign: "center", marginTop: 16, color: "#3a5570", fontSize: 11, animation: "pulse 1.5s infinite" }}>{t.building_sub}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ SCHEDULE ═══ */}
        {activeTab === "schedule" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {!hasSchedule && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 12, color: "#4a6a8a", marginBottom: 18, lineHeight: 1.7 }}>{t.no_schedule}</div>
                <button className="pbtn" onClick={() => setActiveTab("strategy")}>{t.generate_week}</button>
              </div>
            )}

            {hasSchedule && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570" }}>{t.your_plan}</div>
                  <button className="dbtn" onClick={() => { setState(p => ({ ...p, weeklySchedule: null })); }}>{t.regenerate}</button>
                </div>

                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {DAYS.map((day, i) => {
                    const dt = state.weeklySchedule[day] || [];
                    const done = dt.filter(x => x.completed).length;
                    return (
                      <button key={day} className={`daybtn ${selectedDay === i ? "active" : ""}`} onClick={() => setSelectedDay(i)}>
                        <div>{day}</div>
                        {dt.length > 0 && <div style={{ fontSize: 8, marginTop: 2, color: done === dt.length ? "#00FF88" : "#3a5570" }}>{done}/{dt.length}</div>}
                      </button>
                    );
                  })}
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #FFD70033", padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#FFD700", letterSpacing: 3 }}>{DAYS[selectedDay]}</div>
                    <div style={{ fontSize: 10, color: "#3a5570", marginTop: 2 }}>{todayDone}/{todaySchedule.length} {t.missions_complete}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: todayDone === todaySchedule.length && todaySchedule.length > 0 ? "#00FF88" : "#FFD700" }}>
                      {todaySchedule.length > 0 ? Math.round((todayDone / todaySchedule.length) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 9, color: "#3a5570" }}>{t.complete}</div>
                  </div>
                </div>

                <div style={{ height: 3, background: "rgba(255,255,255,0.03)", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${todaySchedule.length > 0 ? (todayDone / todaySchedule.length) * 100 : 0}%`, background: "linear-gradient(90deg,#FFD700,#00FF88)", transition: "width 0.5s" }} />
                </div>

                {todaySchedule.length === 0 && (
                  <div style={{ textAlign: "center", padding: 28, color: "#3a5570", border: "1px dashed rgba(255,255,255,0.07)", fontSize: 11, letterSpacing: 2 }}>{t.rest_day}</div>
                )}

                {todaySchedule.map((task, idx) => {
                  const color = getCatColor(task.category);
                  const icon = getCatIcon(task.category);
                  return (
                    <div key={idx} className={`trow ${task.completed ? "done" : ""}`} onClick={() => !task.completed && completeScheduleTask(DAYS[selectedDay], idx)}>
                      <div style={{ flexShrink: 0, minWidth: 50, textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#3a5570" }}>{task.time}</div>
                      </div>
                      <div style={{ width: 3, height: 36, background: task.completed ? "#00FF88" : color, borderRadius: 2, flexShrink: 0 }} />
                      <button className={`chk ${task.completed ? "done" : ""}`} onClick={e => { e.stopPropagation(); if (!task.completed) completeScheduleTask(DAYS[selectedDay], idx); }}>{task.completed ? "✓" : ""}</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</div>
                        <div style={{ fontSize: 10, color: "#3a5570", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ color }}>{icon} {task.category}</span>
                          <span>⏱ {task.duration}</span>
                          <span style={{ color: "#FFD700" }}>+{task.xp} XP</span>
                        </div>
                        {task.why && <div style={{ fontSize: 10, color: "#3a5570", marginTop: 3, fontStyle: "italic" }}>💡 {task.why}</div>}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ═══ TASKS ═══ */}
        {activeTab === "tasks" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570" }}>{t.manual_missions} ({tasks.filter(x => !x.completed).length} {t.pending})</div>
              <button className="pbtn" onClick={() => setShowAddTask(!showAddTask)}>{t.add}</button>
            </div>
            {showAddTask && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #00CFFF33", padding: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <input placeholder={t.mission_placeholder} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} onKeyDown={e => e.key === "Enter" && addTask()} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}>
                      {t.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                    <select value={newTask.xp} onChange={e => setNewTask({ ...newTask, xp: Number(e.target.value) })}>
                      <option value={25}>{t.xp_easy}</option><option value={50}>{t.xp_med}</option>
                      <option value={100}>{t.xp_hard}</option><option value={200}>{t.xp_epic}</option>
                    </select>
                  </div>
                  <button className="pbtn" onClick={addTask}>{t.deploy}</button>
                </div>
              </div>
            )}
            {tasks.length === 0 && (
              <div style={{ textAlign: "center", padding: 36, color: "#3a5570", border: "1px dashed rgba(255,255,255,0.07)" }}>
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
                    <div style={{ fontSize: 10, color: "#3a5570", marginTop: 3 }}>
                      <span style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
                      <span style={{ marginLeft: 12, color: "#FFD700" }}>+{task.xp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.filter(x => x.completed).length > 0 && (
              <>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570", margin: "16px 0 9px" }}>{t.completed_section}</div>
                {tasks.filter(x => x.completed).map(task => {
                  const cat = t.categories.find(c => c.id === task.category);
                  return (
                    <div key={task.id} className="trow done">
                      <div className="chk done">✓</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, textDecoration: "line-through" }}>{task.title}</div>
                        <div style={{ fontSize: 10, color: "#3a5570", marginTop: 3 }}>{cat?.icon} {cat?.label} • +{task.xp} XP</div>
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
                <div style={{ textAlign: "center", padding: "24px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid #FF444422", marginBottom: 14 }}>
                  <div style={{ fontSize: 52, marginBottom: 10, animation: "pulse 1.5s infinite" }}>{currentBoss.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: "bold", letterSpacing: 4, color: "#FF4444", marginBottom: 7 }}>{lang === "es" ? currentBoss.name_es : currentBoss.name_en}</div>
                  <div style={{ fontSize: 12, color: "#4a6a8a", maxWidth: 360, margin: "0 auto" }}>{lang === "es" ? currentBoss.desc_es : currentBoss.desc_en}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 1, color: "#3a5570", marginBottom: 9 }}>
                    <span>{t.boss_damage}</span><span>{state.bossProgress}/{currentBoss.requirement} {t.hits}</span>
                  </div>
                  <div style={{ height: 13, background: "rgba(255,255,255,0.03)", position: "relative", border: "1px solid #FF444422" }}>
                    <div style={{ height: "100%", width: `${Math.min(bossHPPct, 100)}%`, background: "linear-gradient(90deg,#FF4444,#FF8800)", transition: "width 0.5s", boxShadow: "0 0 10px #FF444866" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: "bold", color: "#fff" }}>{Math.round(bossHPPct)}%</div>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #FFD70022", padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#3a5570", letterSpacing: 2, marginBottom: 5 }}>{t.victory_reward}</div>
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
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570", marginBottom: 12 }}>{t.commendations} ({state.unlockedBadges.length}/{t.badges.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
              {t.badges.map(badge => {
                const unlocked = state.unlockedBadges.includes(badge.id);
                return (
                  <div key={badge.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${unlocked ? "#FFD70044" : "rgba(255,255,255,0.07)"}`, padding: 14, opacity: unlocked ? 1 : 0.45, transition: "all 0.3s" }}>
                    <div style={{ fontSize: 26, marginBottom: 7, filter: unlocked ? "none" : "grayscale(100%)" }}>{badge.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: "bold", color: unlocked ? "#FFD700" : "#3a5570", letterSpacing: 1 }}>{badge.label}</div>
                    <div style={{ fontSize: 10, color: "#3a5570", marginTop: 3 }}>{badge.desc}</div>
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
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a5570", marginBottom: 12 }}>{t.drill_title}</div>
            {hasStrategy && state.userProfile && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", padding: "8px 12px", marginBottom: 12, fontSize: 10, color: "#3a5570" }}>
                🧠 {lang === "es" ? "Coach personalizado para:" : "Personalized coach for:"} <span style={{ color: "#00E5FF" }}>{state.userProfile.niche}</span> · {lang === "es" ? "Meta:" : "Goal:"} <span style={{ color: "#FFD700" }}>{state.userProfile.goal_90}</span>
              </div>
            )}
            <div ref={chatRef} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", padding: 14, minHeight: 240, maxHeight: 340, overflowY: "auto", marginBottom: 12 }}>
              {chatHistory.length === 0 && (
                <div style={{ color: "#3a5570", fontSize: 12, textAlign: "center", padding: 36 }}>
                  <div style={{ fontSize: 26, marginBottom: 9 }}>🧠</div>
                  <div>{lang === "es" ? "Tu estratega personal está listo." : "Your personal strategist is ready."}</div>
                  <div style={{ marginTop: 6, fontSize: 10 }}>{lang === "es" ? "Pregunta sobre estrategia, contenido, mercado..." : "Ask about strategy, content, market..."}</div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ marginBottom: 11, display: "flex", gap: 9, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ fontSize: 15, flexShrink: 0 }}>{msg.role === "user" ? "🫵" : "🧠"}</div>
                  <div style={{ background: msg.role === "user" ? "#0d1a2a" : "#0a1a0a", border: `1px solid ${msg.role === "user" ? "#00CFFF22" : "#00FF8822"}`, padding: "9px 13px", fontSize: 13, lineHeight: 1.6, maxWidth: "80%", color: msg.role === "user" ? "#C0D8FF" : "#C0FFD0" }}>{msg.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 15 }}>🧠</div>
                  <div style={{ color: "#00E5FF", fontSize: 10, animation: "pulse 1s infinite" }}>{t.incoming}</div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input style={{ flex: 1, width: "auto" }} placeholder={t.drill_placeholder} value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === "Enter" && askCoach()} />
              <button className="pbtn" onClick={askCoach} disabled={aiLoading || !userInput.trim()} style={{ whiteSpace: "nowrap" }}>{t.send}</button>
            </div>
            <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {t.coach_prompts.map(q => (
                <button key={q} onClick={() => setUserInput(q)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#3a5570", padding: "4px 9px", cursor: "pointer", fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ LEADERBOARD ═══ */}
        {activeTab === "leaderboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {!state.playerName && (
              <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.15)", padding: 20, marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⚔️</div>
                <div style={{ fontSize: 11, color: "#4a6a8a", marginBottom: 16, lineHeight: 1.7 }}>
                  {lang === "es" ? "Para aparecer en el ranking, elige tu nombre de batalla." : "To appear on the leaderboard, choose your battle name."}
                </div>
                <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
                  <input placeholder={t.your_name} value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && nameInput.trim() && setState(prev => ({ ...prev, playerName: nameInput.trim() }))} style={{ flex: 1, width: "auto" }} />
                  <button className="pbtn" onClick={() => nameInput.trim() && setState(prev => ({ ...prev, playerName: nameInput.trim() }))} style={{ whiteSpace: "nowrap" }}>{t.save_name}</button>
                </div>
              </div>
            )}

            {state.playerName && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.1)", padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#00E5FF" }}>◈ {state.playerName}</div>
                <div style={{ fontSize: 11, color: "#FFD700" }}>{lang === "es" ? "Puntos" : "Score"}: <strong>{weekScore}</strong></div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#FFD700" }}>{t.leaderboard_title}</div>
              <button className="dbtn" onClick={loadLeaderboard}>{t.refresh}</button>
            </div>

            {leaderboardLoading && <div style={{ textAlign: "center", padding: 24, color: "#3a5570", fontSize: 11, animation: "pulse 1s infinite" }}>{lang === "es" ? "Cargando..." : "Loading..."}</div>}

            {!leaderboardLoading && leaderboard.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: "#3a5570", border: "1px dashed rgba(255,255,255,0.07)", fontSize: 11, marginBottom: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>{t.no_players}
              </div>
            )}

            {leaderboard.length > 0 && (
              <>
                <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)", padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>🏆</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: 2 }}>{t.week_winner}</div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#FFE44D" }}>{leaderboard[0].name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#FFD700" }}>{leaderboard[0].score}</div>
                    <div style={{ fontSize: 9, color: "#3a5570" }}>pts</div>
                  </div>
                </div>
                {leaderboard.map((player, i) => (
                  <div key={player.name} className={`lbrow ${player.name === state.playerName ? "me" : ""} ${i === 0 ? "first" : ""}`}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#3a5570", minWidth: 24, textAlign: "center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: player.name === state.playerName ? "#00E5FF" : "#E0E8FF" }}>
                        {player.name} {player.name === state.playerName && <span style={{ fontSize: 9, color: "#00E5FF" }}>{t.you_label}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#3a5570", marginTop: 2 }}>{player.xp} XP · {player.tasks} {t.tasks_done}</div>
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 15, color: i === 0 ? "#FFD700" : "#E0E8FF" }}>{player.score}</div>
                  </div>
                ))}
              </>
            )}

            <div style={{ marginTop: 24, marginBottom: 12, fontSize: 9, letterSpacing: 2, color: "#AA44FF" }}>{t.alltime_title}</div>
            {allTimeBoard.length > 0 && (
              <>
                <div style={{ background: "rgba(170,68,255,0.04)", border: "1px solid rgba(170,68,255,0.2)", padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>👑</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#AA44FF", letterSpacing: 2 }}>{t.alltime_leader}</div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#CC88FF" }}>{allTimeBoard[0].name}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#AA44FF" }}>{allTimeBoard[0].score}</div>
                    <div style={{ fontSize: 9, color: "#3a5570" }}>pts</div>
                  </div>
                </div>
                {allTimeBoard.map((player, i) => (
                  <div key={player.name} className={`lbrow ${player.name === state.playerName ? "me" : ""}`}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: i === 0 ? "#AA44FF" : "#3a5570", minWidth: 24, textAlign: "center" }}>{i === 0 ? "👑" : `#${i+1}`}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: player.name === state.playerName ? "#00E5FF" : "#E0E8FF" }}>
                        {player.name} {player.name === state.playerName && <span style={{ fontSize: 9, color: "#00E5FF" }}>{t.you_label}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#3a5570", marginTop: 2 }}>{player.xp} XP · {player.tasks} {t.tasks_done}</div>
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


