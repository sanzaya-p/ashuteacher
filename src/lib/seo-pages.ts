export interface SeoLandingPage {
  slug: string;
  category: "IGNOU & Distance Learning" | "Competitive Exams" | "School & Boards" | "Global & University" | "Regional Languages" | "Research & Exam Tools";
  title: string;
  metaDescription: string;
  heroBadge: string;
  h1: string;
  subtitle: string;
  defaultLanguage: string;
  defaultLevel: string;
  subjectLabel: string;
  featuredChapters: Array<{
    title: string;
    summary: string;
  }>;
  highlights: string[];
  faqs: Array<{
    q: string;
    a: string;
  }>;
}

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: "ignou-mca-syllabus-ai-tutor",
    category: "IGNOU & Distance Learning",
    title: "IGNOU MCA (MCA_NEW) Full Syllabus AI Voice Blackboard & TEE Exam Solver",
    metaDescription:
      "Master every IGNOU MCA_NEW paper (MCS-201, MCS-202, MCS-203, MCS-208, MCS-211, MCS-212, MCS-220) on a live AI Voice Blackboard in English, Hindi & regional languages. Free 30 study credits.",
    heroBadge: "IGNOU MCA_NEW • Semesters 1–4",
    h1: "IGNOU MCA Complete Course & Term-End Exam AI Voice Tutor",
    subtitle:
      "Stop struggling with dense self-learning blocks alone. Watch every IGNOU MCA_NEW unit taught live on an interactive chalkboard with step-by-step algorithms, numericals, and voice narration.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "IGNOU MCA",
    featuredChapters: [
      { title: "IGNOU MCS-201: Asymptotic Complexity & Dynamic Programming", summary: "Big-O, Master Theorem, 0/1 Knapsack, and C/Python programming patterns for TEE." },
      { title: "MCS-202: Computer Organisation, Combinational Circuits & Cache Mapping", summary: "K-maps, flip-flops, instruction pipelining, DMA, and direct/associative cache numericals." },
      { title: "MCS-203: Operating Systems — CPU Scheduling, Deadlocks & Paging", summary: "Banker's Algorithm, Dining Philosophers, LRU page replacement, and Linux internals." },
      { title: "MCS-208: Data Structures — AVL Trees, B-Trees, Graphs & Hashing", summary: "Step-by-step rotations, Dijkstra, Prim/Kruskal MST, and collision resolution." },
      { title: "MCS-211: Design & Analysis of Algorithms — NP-Completeness & Greedy", summary: "Huffman coding, Strassen matrix multiplication, backtracking, and P vs NP proofs." },
      { title: "MCS-212: Discrete Mathematics — Propositional Logic, Relations & Graph Theory", summary: "Truth tables, recurrence relations, Pigeonhole Principle, and Euler/Hamiltonian paths." },
    ],
    highlights: [
      "Covers all Semester 1–4 IGNOU MCA_NEW core & elective course codes",
      "Upload previous-year IGNOU Term-End Exam (TEE) PDFs for full step-by-step solutions",
      "Switch instantly between English, Hindi, Hinglish, Odia, Bengali, Tamil & 100+ languages",
      "Includes MCSP-232 Final Semester Project & Live AI Viva Voce Defense Simulator",
    ],
    faqs: [
      { q: "Can AshuTeacher solve previous-year IGNOU MCA TEE question papers?", a: "Yes! Upload any IGNOU TEE PDF or photo in the Classroom Paper Solver mode to get structured, full-marks step-by-step derivations and code." },
      { q: "Does it help with the IGNOU MCA Final Project Viva (MCSP-232)?", a: "Yes — open the Research & Viva Lab (/research) to architect your synopsis, 6 milestones, and practice live Q&A with an AI Viva Examiner." },
    ],
  },
  {
    slug: "ignou-mba-courses-ai-blackboard",
    category: "IGNOU & Distance Learning",
    title: "IGNOU MBA (MMPC-001 to MMPC-020) AI Voice Tutor, Notes & Case Solver",
    metaDescription:
      "Learn all IGNOU MBA core & specialization papers (MMPC-001 to MMPC-020, Finance, HR, Marketing, Operations) on an interactive AI Voice Blackboard with TEE exam prep.",
    heroBadge: "IGNOU MBA • AICTE Approved Syllabus",
    h1: "IGNOU MBA Interactive Voice Blackboard & Case-Study Tutor",
    subtitle:
      "Master Quantitative Analysis, Financial Management, Accounting, Marketing, Strategic Management, and MMPP-001 Project Viva in half the time.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "IGNOU MBA",
    featuredChapters: [
      { title: "MMPC-004: Accounting for Managers — Balance Sheet, Cash Flow & Ratio Analysis", summary: "Worked financial ratios, marginal costing, break-even numericals, and variance analysis." },
      { title: "MMPC-005: Quantitative Analysis for Managerial Applications", summary: "Probability distributions, hypothesis testing (Z, t, Chi-square), regression, and forecasting." },
      { title: "MMPC-014: Financial Management — NPV, IRR, WACC & Working Capital", summary: "Capital budgeting numericals, cost of capital derivations, and dividend theories." },
      { title: "MMPC-001 & MMPC-012: Management Functions & Strategic Management", summary: "Porter's Five Forces, BCG Matrix, SWOT, corporate governance, and TEE case frameworks." },
    ],
    highlights: [
      "Step-by-step Finance, Accounting & Statistics numerical derivations in LaTeX",
      "1-click Formula & Framework Cheat Sheets before Term-End Exams",
      "Learn complex MBA concepts in English, Hindi, or your regional mother tongue",
      "MMPP-001 MBA Dissertation & Viva Voce practice studio included",
    ],
    faqs: [
      { q: "Are numerical papers like MMPC-004, MMPC-005, and MMPC-014 explained step-by-step?", a: "Every formula, table, and worked numerical is written cleanly on the blackboard while the voice teacher explains the business logic behind each step." },
    ],
  },
  {
    slug: "ignou-bca-bag-ba-bcom-study-tutor",
    category: "IGNOU & Distance Learning",
    title: "IGNOU BCA, BAG, B.Com & BA Honours AI Voice Teacher & Exam Solver",
    metaDescription:
      "Complete chapter-by-chapter AI Voice Blackboard lectures, solved assignments guidance, and TEE exam prep for IGNOU BCA_NEW, BAG, BCOMG, BSCG, MAH, MEG & MCOM.",
    heroBadge: "IGNOU UG & PG • All Degrees & Diplomas",
    h1: "IGNOU Bachelor's, Master's & Diploma AI Classroom",
    subtitle:
      "Select India → IGNOU → Degree/Diploma → Your Exact Programme → Course Code to unlock unit-by-unit full-chapter lectures in your preferred language.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "IGNOU Degree Courses",
    featuredChapters: [
      { title: "BCS-011 & BCS-012: Computer Basics & Basic Mathematics (Matrices, Calculus)", summary: "Determinants, Cayley-Hamilton theorem, differentiation, integration, and binary arithmetic." },
      { title: "BEVAE-181: Environmental Studies (AECC Compulsory Paper)", summary: "Ecosystems, biodiversity hotspots, environmental acts, and high-scoring MCQ practice." },
      { title: "MEG & MAH: English Literature & History Master's Critical Analysis", summary: "Thematic essays, historiography, literary criticism, and structured TEE answer writing." },
      { title: "BCOMG & MCOM: Corporate Accounting, Income Tax & Business Law", summary: "Indian Contract Act essentials, tax slab computations, and company accounts." },
    ],
    highlights: [
      "6-box cascading IGNOU explorer covering Certificates, Diplomas, UG, PG & Doctoral levels",
      "Generate instant 10–25 question MCQ mock tests & 3D flashcards for any IGNOU block",
      "Ideal for working professionals and open-distance learners studying at night",
    ],
    faqs: [
      { q: "Can I study IGNOU BA/BCom/MA chapters in Hindi or Odia medium?", a: "Yes! Select Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), Bengali, Marathi, Gujarati, Tamil, Telugu, or 100+ languages in authentic native script." },
    ],
  },
  {
    slug: "upsc-cse-gs-prelims-mains-ai-tutor",
    category: "Competitive Exams",
    title: "UPSC CSE Prelims & Mains (GS 1–4, CSAT & Optional) AI Voice Blackboard",
    metaDescription:
      "Master UPSC Civil Services Prelims & Mains (Polity, Economy, History, Geography, Environment, Sci-Tech, Ethics GS-IV & CSAT) with live AI Blackboard lectures & MCQ tests.",
    heroBadge: "UPSC Civil Services • Prelims + GS Mains",
    h1: "UPSC IAS / IPS Prelims & Mains Interactive AI Classroom",
    subtitle:
      "Turn vast UPSC syllabi into crisp constitutional articles, economic flowcharts, historical timelines, and high-precision Prelims elimination drills.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "UPSC CSE",
    featuredChapters: [
      { title: "UPSC Indian Polity: Fundamental Rights (Articles 12–35)", summary: "Constitutional text, landmark Supreme Court doctrines, writs, and Prelims trap statements." },
      { title: "Indian Economy: Monetary Policy, RBI Repo Tools, BoP & Fiscal Deficit", summary: "MPC transmission, inflation targeting, FRBM Act, and capital vs current account convertibility." },
      { title: "Modern Indian History: 1857 Revolt to Gandhian Mass Movements & Cabinet Mission", summary: "Chronological cause-effect analysis, acts, sessions, and Mains 250-word frameworks." },
      { title: "Geography & Environment: Indian Monsoon Mechanism, El Niño & Biodiversity Laws", summary: "ITCZ shift, Tibetan plateau heating, Wildlife Protection Act schedules, and COP treaties." },
      { title: "GS Paper IV (Ethics): Moral Thinkers, Probity in Governance & Case Studies", summary: "Kant, Aristotle, Kautilya, Gandhi, emotional intelligence, and stakeholder dilemma frameworks." },
    ],
    highlights: [
      "Available in both English Medium and pure हिन्दी माध्यम (Hindi Medium Devanagari)",
      "Generate UPSC Prelims statement-type MCQ quizzes with detailed elimination logic",
      "Upload coaching test papers or Yojana/PIB articles for instant structured cheat sheets",
    ],
    faqs: [
      { q: "Does AshuTeacher support Hindi Medium UPSC aspirants?", a: "100% — select हिन्दी (Devanagari) to get authentic, formal UPSC Hindi terminology alongside English constitutional terms in parentheses." },
    ],
  },
  {
    slug: "jee-main-advanced-physics-maths-chemistry-solver",
    category: "Competitive Exams",
    title: "JEE Main & Advanced AI Blackboard Tutor & Tough Problem Solver",
    metaDescription:
      "Crack IIT-JEE Physics, Calculus, Coordinate Geometry, Organic & Physical Chemistry with live LaTeX derivations, photo doubt solving, and formula cheat sheets.",
    heroBadge: "IIT-JEE Main & Advanced • Class 11 & 12",
    h1: "IIT-JEE Physics, Mathematics & Chemistry Voice Blackboard",
    subtitle:
      "Watch multi-concept rotational mechanics, electromagnetism, definite integration, and reaction mechanisms derived from first principles — or snap any tough PYQ to solve it.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "IIT-JEE Prep",
    featuredChapters: [
      { title: "Rotational Dynamics: Moment of Inertia, Rolling Without Slipping & Angular Momentum", summary: "Parallel/perpendicular axis theorems, instantaneous axis of rotation, and toppling traps." },
      { title: "Electrostatics & Capacitors: Gauss's Law, Potential & DielectricInsertion", summary: "Cavity problems, earthing of concentric shells, and RC transient circuits." },
      { title: "Integral Calculus: Definite Integrals, King's Property & Differential Equations", summary: "Leibniz rule, limit of a sum, integrating factors, and area under curves." },
      { title: "Organic Chemistry: GOC, Stereochemistry, Aldol & Named Reaction Mechanisms", summary: "Carbocation rearrangements, R/S configuration, SN1/SN2/E1/E2 competition." },
    ],
    highlights: [
      "Paste (`Ctrl+V`) any screenshot of a JEE Physics/Maths problem for step-by-step LaTeX solutions",
      "Interrupt mid-derivation with 'Raise Hand' to ask why a specific substitution was made",
      "Instant 1-page Formula Cheat Sheets for rapid pre-test revision",
    ],
    faqs: [
      { q: "Can I upload a photo of a handwritten or coaching module JEE question?", a: "Yes — upload an image or PDF (or press Ctrl+V in Classroom) and choose Paper Solver mode for a complete step-by-step derivation." },
    ],
  },
  {
    slug: "neet-ug-biology-chemistry-physics-tutor",
    category: "Competitive Exams",
    title: "NEET UG NCERT Line-by-Line Biology, Chemistry & Physics AI Voice Tutor",
    metaDescription:
      "Master NEET UG Class 11 & 12 NCERT Biology, Organic/Inorganic Chemistry, and Physics numericals with voice-narrated chalkboards, 3D flashcards & MCQ drills.",
    heroBadge: "NEET UG • 720-Mark NCERT Mastery",
    h1: "NEET UG Biology, Chemistry & Physics AI Study Studio",
    subtitle:
      "Memorize complex NCERT cycles, human physiology pathways, genetics crosses, and fast Physics shortcuts with active-recall 3D flashcards and voice explanations.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "NEET UG",
    featuredChapters: [
      { title: "Molecular Basis of Inheritance: DNA Replication, Lac Operon & Genetic Code", summary: "Meselson-Stahl experiment, transcription/translation enzymes, and NCERT assertion-reason traps." },
      { title: "Human Physiology: Cardiac Cycle, ECG, Nephron Counter-Current & Sliding Filament", summary: "High-yield NCERT diagrams, hormone feedback loops, and clinical correlations." },
      { title: "Chemical Bonding & Coordination Compounds: VSEPR, MOT & Crystal Field Theory", summary: "Hybridization, bond order, magnetic moment calculations, and isomerism." },
      { title: "Current Electricity & Ray Optics: Wheatstone Bridge, Meter Bridge & Lens Combinations", summary: "Zero-error numericals and 30-second NEET calculation shortcuts." },
    ],
    highlights: [
      "Generate 30-card spaced-repetition 3D Flashcard decks for NCERT Biology examples & dates",
      "Supports English, Hindi, Odia, Bengali, Tamil, Telugu, Gujarati, Marathi & Kannada NEET mediums",
      "Timed NEET MCQ practice with instant explanations",
    ],
    faqs: [
      { q: "Does it support regional-language NEET aspirants?", a: "Yes — NEET is conducted in 13 Indian languages, and AshuTeacher teaches in all 13+ Indian languages in clean native script." },
    ],
  },
  {
    slug: "cbse-class-10-12-board-exam-ai-tutor",
    category: "School & Boards",
    title: "CBSE, ICSE & State Board Class 9, 10, 11 & 12 AI Voice Blackboard",
    metaDescription:
      "Score 95%+ in CBSE, ICSE & State Board Class 10 and Class 12 Science, Maths, Physics, Chemistry, Biology, Accountancy & Economics with live AI Blackboard lessons.",
    heroBadge: "CBSE • ICSE • NIOS • State Boards",
    h1: "Class 6–12 School & Board Exam Interactive Voice Teacher",
    subtitle:
      "Every NCERT & ICSE chapter taught like your favourite home tutor — with step-by-step theorems, board-style marking steps, Story Mode, and sample paper solving.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "CBSE / ICSE Boards",
    featuredChapters: [
      { title: "विद्युत धारा और ओम का नियम (Ohm's Law in Hindi)", summary: "Complete board-ready derivation, resistivity factors, and solved numericals in Hindi." },
      { title: "Class 10 Mathematics: Quadratic Equations, Triangles (BPT) & Trigonometry", summary: "Step-by-step NCERT proofs, discriminant cases, and heights & distances." },
      { title: "Class 12 Physics: Electromagnetic Induction, AC Phasors & Semiconductor Diodes", summary: "Faraday's law, transformer working, LCR resonance, and p-n junction rectifiers." },
      { title: "Class 12 Accountancy & Macroeconomics: National Income & Partnership Accounts", summary: "Value-added/income/expenditure methods, money multiplier, and balance of payments." },
    ],
    highlights: [
      "Story Mode turns dry History, Civics & Science chapters into unforgettable stories",
      "Solve full sample question papers (SQPs) before pre-boards and board exams",
      "Safe, encouraging adaptive modes from Kindergarten (KG) through Class 12",
    ],
    faqs: [
      { q: "Is AshuTeacher suitable for younger children (KG to Class 8)?", a: "Yes! Selecting 'KG & Early Wonder' or 'Primary / Middle School' switches the teacher into a warm, joyful storyteller with age-appropriate analogies." },
    ],
  },
  {
    slug: "odia-sambalpuri-santali-ai-voice-tutor",
    category: "Regional Languages",
    title: "Odia (ଓଡ଼ିଆ), Sambalpuri & Santali (ᱚᱞ ᱪᱤᱠᱤ) AI Voice Blackboard Tutor",
    metaDescription:
      "India's native-script AI Voice Blackboard teaching BSE Odisha, CHSE +2, OPSC, OTET, IGNOU & university STEM subjects in pure Odia (ଓଡ଼ିଆ), Sambalpuri & Santali Ol Chiki.",
    heroBadge: "ଓଡ଼ିଆ • ସମ୍ବଲପୁରୀ • ᱚᱞ ᱪᱤᱠᱤ",
    h1: "Learn Any Subject in Authentic Odia, Sambalpuri & Santali Script",
    subtitle:
      "Zero messy English transliteration. Watch Science, Mathematics, Coding, OPSC GS, and University chapters written in pure ଓଡ଼ିଆ or ᱚᱞ ᱪᱤᱠᱤ script with live voice narration.",
    defaultLanguage: "or-IN",
    defaultLevel: "Intermediate",
    subjectLabel: "ଓଡ଼ିଆ ଶିକ୍ଷା (Odia Academy)",
    featuredChapters: [
      { title: "ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ (Newton's Laws in Odia)", summary: "ଜଡ଼ତା ନିୟମ, F = ma ସୂତ୍ର, କ୍ରିୟା-ପ୍ରତିକ୍ରିୟା ଏବଂ ପରୀକ୍ଷା ଗଣିତ ସହଜ ଓଡ଼ିଆରେ।" },
      { title: "BSE Odisha Class 10 & CHSE +2 Science: ଆଲୋକର ପ୍ରତିଫଳନ ଓ ପ୍ରତିସରଣ (Light)", summary: "ଦର୍ପଣ ଓ ଲେନ୍ସ ସୂତ୍ର, ସ୍ନେଲ୍‌ଙ୍କ ନିୟମ ଓ ବୋର୍ଡ ପରୀକ୍ଷା ପ୍ରଶ୍ନୋତ୍ତର।" },
      { title: "OPSC OAS Odisha History, Geography & Polity Masterclass", summary: "Kalinga War to Modern Odisha, river systems, mineral resources, and governance in Odia." },
      { title: "Python Programming & Computer Fundamentals in Odia (ଓଡ଼ିଆରେ କମ୍ପ୍ୟୁଟର ବିଜ୍ଞାନ)", summary: "Variables, loops, functions, and data structures explained clearly in mother tongue." },
    ],
    highlights: [
      "Strict Native-Script Engine ensures pure ଓଡ଼ିଆ script for Odia, Sambalpuri, Desia & Kui",
      "Supports Santali in authentic Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ) script",
      "Covers BSE Odisha, CHSE Odisha, OPSC OAS, OSSC, OTET, and Odisha State Open University (OSOU)",
    ],
    faqs: [
      { q: "Does it write Odia in real ଓଡ଼ିଆ letters instead of English Roman script?", a: "Yes! AshuTeacher enforces strict native script purity — prose is written in authentic ଓଡ଼ିଆ script while keeping mathematical LaTeX crystal clear." },
    ],
  },
  {
    slug: "hindi-bengali-tamil-telugu-indian-languages-ai-tutor",
    category: "Regional Languages",
    title: "AI Voice Blackboard in All 22 Indian Languages (Hindi, Bengali, Tamil, Telugu, Marathi)",
    metaDescription:
      "Study school boards, JEE, NEET, UPSC, State PSC & Engineering in Hindi (हिन्दी), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi, Gujarati, Kannada, Malayalam & Punjabi.",
    heroBadge: "22 Scheduled Indian Languages + Dialects",
    h1: "Mother-Tongue AI Classroom Across Every Indian Language & Script",
    subtitle:
      "World-class STEM, Humanities, Coding, and Competitive Exam education shouldn't belong only to English speakers. Learn from KG to Ph.D. in your native script.",
    defaultLanguage: "hi-IN",
    defaultLevel: "Intermediate",
    subjectLabel: "Bharatiya Bhasha Academy",
    featuredChapters: [
      { title: "विद्युत धारा और ओम का नियम (Ohm's Law in Hindi)", summary: "देवनगरी लिपि में पूर्ण व्युत्पत्ति, सूत्र और हल किए गए संख्यात्मक प्रश्न।" },
      { title: "সালোকসংশ্লেষ ও কোষ বিভাজন (Photosynthesis & Cell Division in Bengali)", summary: "WBCHSE / Madhyamik & NEET Biology concepts taught in pure বাংলা script." },
      { title: "நியூட்டனின் இயக்க விதிகள் (Newton's Laws & Mechanics in Tamil)", summary: "TN State Board & JEE Physics concepts explained clearly in தமிழ்." },
      { title: "భారత రాజ్యాంగం - ప్రాథమిక హక్కులు (Indian Constitution in Telugu)", summary: "APPSC / TSPSC & UPSC Polity chapters explained in తెలుగు." },
    ],
    highlights: [
      "Covers Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Odia, Ol Chiki & Urdu scripts",
      "Regional dialects (Bhojpuri, Maithili, Rajasthani, Chhattisgarhi, Tulu, Konkani, Assamese, Manipuri) supported",
      "Switch script preference anytime between Native Script and Romanized Phonetic",
    ],
    faqs: [
      { q: "Can I ask mid-lesson doubts in my own regional language?", a: "Yes — tap 'Raise Hand' via microphone or keyboard in your language and the teacher replies in the same language and script." },
    ],
  },
  {
    slug: "global-sat-ap-ib-cambridge-mit-ai-tutor",
    category: "Global & University",
    title: "SAT, AP, IB Diploma, Cambridge IGCSE/A-Level & MIT University AI Blackboard",
    metaDescription:
      "Interactive AI Voice Blackboard for US Common Core, Digital SAT, AP Calculus/Physics/CS, IB HL/SL, UK GCSE & A-Levels, and MIT/University STEM across 195+ countries.",
    heroBadge: "195+ Countries • High School to MIT/Doctoral",
    h1: "Global Curriculum & University STEM AI Voice Blackboard",
    subtitle:
      "From Digital SAT Math & AP Calculus BC to Cambridge A-Levels, IB Higher Level, and MIT-grade Algorithms, Linear Algebra, and Quantum Mechanics — in 100+ world languages.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "Global STEM & Exams",
    featuredChapters: [
      { title: "How Transformer Attention Works", summary: "Scaled dot-product attention, Q/K/V matrix projections, variance scaling proof, and multi-head intuition." },
      { title: "Quantum Entanglement & Bell's Theorem", summary: "EPR singlet states, CHSH inequality derivation, and quantum correlation bounds." },
      { title: "AP Calculus BC & University Analysis: Taylor Series, Convergence & Multivariable Green's Theorem", summary: "Lagrange error bounds, radius of convergence, and vector line integrals." },
      { title: "Linear Algebra (MIT 18.06 Style): Eigenvalues, SVD & Positive Definite Matrices", summary: "Geometric intuition, spectral theorem proofs, and principal component analysis." },
    ],
    highlights: [
      "195+ Country Cascading Curriculum Explorer (/academy) covering US, UK, Canada, Australia, EU, MENA, Africa & Asia",
      "Supports Spanish, French, German, Portuguese, Arabic, Mandarin, Japanese, Korean, Swahili & Russian",
      "Adaptive rigor slider from Elementary School all the way to Doctoral First-Principles",
    ],
    faqs: [
      { q: "Does AshuTeacher cover university engineering and computer science courses?", a: "Yes — including Data Structures, Algorithms, OS, DBMS, Computer Networks, ML/DL, Signals, Thermodynamics, and Quantum Physics." },
    ],
  },
  {
    slug: "phd-masters-capstone-thesis-viva-defense-simulator",
    category: "Research & Exam Tools",
    title: "AI Thesis, Final-Year Capstone & Live Viva Voce Defense Simulator",
    metaDescription:
      "Architect your B.Tech/MCA Capstone, MBA Dissertation, Master's Thesis, or Ph.D. Proposal in 6 milestones and rehearse before a Live AI Viva Examiner Panel.",
    heroBadge: "B.Tech • MCA • MBA • M.Sc • Ph.D. Research Lab",
    h1: "6-Milestone Research Blueprint & Live AI Viva Voce Examiner",
    subtitle:
      "Eliminate thesis anxiety forever. Structure your Literature Gap, Novelty Hypothesis, Methodology, and Evaluation metrics — then defend tough cross-questions live before your real committee.",
    defaultLanguage: "en-US",
    defaultLevel: "Expert",
    subjectLabel: "Research & Viva Lab",
    featuredChapters: [
      { title: "Formulating a Defensible Research Gap, Null Hypothesis & Baseline Ablation Study", summary: "How to turn a vague project idea into a rigorous, publication-grade research problem." },
      { title: "Statistical Significance, p-Values, Confidence Intervals & Reproducibility in Thesis Defense", summary: "Answering the toughest Viva committee methodology and threats-to-validity questions." },
    ],
    highlights: [
      "Generates a complete 6-stage Research Blueprint tailored to UG Capstone, Master's, or Doctoral tier",
      "Interactive AI Viva Voce Examiner asks probing follow-up questions and critiques your answers constructively",
      "1-click launch from any prerequisite research topic straight to the Classroom Blackboard",
    ],
    faqs: [
      { q: "Where do I open the Viva Voce Defense Simulator?", a: "Visit /research (Research & Projects in the sidebar), create your project blueprint, and switch to the Live Viva Defense tab." },
    ],
  },
  {
    slug: "ai-exam-question-paper-pdf-photo-solver",
    category: "Research & Exam Tools",
    title: "AI Exam Question Paper Solver — Upload PDF or Photo for Step-by-Step Solutions",
    metaDescription:
      "Upload any scanned university exam paper, board sample paper PDF, or homework screenshot for complete, full-marks step-by-step LaTeX solutions in 100+ languages.",
    heroBadge: "PDF + Photo + Screenshot (`Ctrl+V`) Solver",
    h1: "Upload Any Exam Question Paper → Get Step-by-Step Full-Marks Solutions",
    subtitle:
      "Stuck on an unsolved previous-year university paper, GATE/JEE/NEET numerical sheet, or photographed assignment? Get clean derivations, diagrams, and exam presentation steps in seconds.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "Exam Paper Solver",
    featuredChapters: [
      { title: "IGNOU MCS-201: Asymptotic Complexity & Dynamic Programming", summary: "See how university algorithm & recurrence questions are solved step-by-step for full marks." },
      { title: "Quantum Entanglement & Bell's Theorem", summary: "See clean LaTeX derivations and exam-ready conceptual answers on the smart chalkboard." },
    ],
    highlights: [
      "Supports multi-page PDF page-range extraction, camera photos, and direct `Ctrl+V` clipboard screenshots",
      "Print or export solved papers directly as clean vector PDF study sheets",
      "Automatically generates follow-up MCQ quizzes & 3D flashcards from your uploaded paper",
    ],
    faqs: [
      { q: "How much does it cost to try the Exam Paper Solver?", a: "Every new account receives 30 Free Study Credits automatically on sign-up (no credit card required) — enough to solve 10 full exam papers or study 15 full lectures for free!" },
    ],
  },
  {
    slug: "gate-cse-engineering-btech-ai-blackboard",
    category: "Competitive Exams",
    title: "GATE CSE, ECE, EE, ME & B.Tech Semester AI Voice Blackboard Tutor",
    metaDescription:
      "Crack GATE & B.Tech University Exams in DSA, Algorithms, Operating Systems, DBMS, Computer Networks, TOC, Compiler Design & Engineering Mathematics with live LaTeX derivations.",
    heroBadge: "GATE + B.Tech / M.Tech Engineering",
    h1: "GATE & University Engineering First-Principles AI Blackboard",
    subtitle:
      "Master Engineering Mathematics, TOC, OS, DBMS, Computer Networks, Signals, and Thermodynamics with rigorous derivations and PYQ numerical solving.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "GATE & Engineering",
    featuredChapters: [
      { title: "Operating Systems: Semaphores, Deadlock Avoidance & Multi-Level Paging Numericals", summary: "Effective memory access time (EMAT), page fault rate, and synchronization proofs." },
      { title: "DBMS: B+ Trees, Functional Dependencies, 3NF/BCNF Normalization & Conflict Serializability", summary: "Closure of attributes, lossless join decomposition, and precedence graphs." },
      { title: "Computer Networks: TCP Congestion Control, Subnetting CIDR & Sliding Window Efficiency", summary: "Stop-and-Wait vs Go-Back-N vs Selective Repeat throughput formulas." },
    ],
    highlights: [
      "Upload 1-mark and 2-mark NAT / MSQ / MCQ GATE previous papers for complete solutions",
      "Generate subject-wise Formula Cheat Sheets for final-month revision",
      "Practice M.Tech / PSU technical interview questions in the Viva Lab",
    ],
    faqs: [
      { q: "Does it handle Numerical Answer Type (NAT) engineering problems?", a: "Yes — all intermediate equations, unit conversions, and decimal steps are shown clearly in LaTeX." },
    ],
  },
  {
    slug: "ssc-cgl-banking-ibps-railway-rrb-quant-reasoning",
    category: "Competitive Exams",
    title: "SSC CGL, IBPS PO/Clerk, SBI & Railway RRB AI Voice Maths & GS Tutor",
    metaDescription:
      "Learn fast Quantitative Aptitude shortcuts, Reasoning puzzles, English Grammar & General Awareness for SSC CGL, CHSL, Banking IBPS/SBI & RRB exams in Hindi & regional languages.",
    heroBadge: "SSC • IBPS / SBI Banking • Railway RRB",
    h1: "SSC, Banking & Railway Competitive Exam AI Classroom",
    subtitle:
      "Learn both the crystal-clear concept and the 15-second exam shortcut in Hindi, English, Odia, Bengali, Tamil, Telugu, or Marathi.",
    defaultLanguage: "hi-IN",
    defaultLevel: "Intermediate",
    subjectLabel: "SSC & Banking Prep",
    featuredChapters: [
      { title: "Quantitative Aptitude: Percentage, Profit-Loss, SI/CI & Time-Work Ratio Shortcuts", summary: "Fraction-to-percentage tables, successive change method, and LCM efficiency method." },
      { title: "Advance Maths for SSC CGL Tier-II: Trigonometry, Geometry Circle Theorems & Algebra", summary: "Secant-tangent theorems, cyclic quadrilaterals, and symmetric algebraic identities." },
      { title: "General Science & Static GK: Indian Constitution, Five-Year Plans & Everyday Physics", summary: "High-frequency one-liners and 25-question timed mock quizzes." },
    ],
    highlights: [
      "Instant timed 25-question MCQ drills with full step-by-step explanations",
      "Teach in pure Hindi, Hinglish, or any state language for State Police/Patwari/PSC exams",
      "Snap any tough mock-test screenshot to see the fastest solution",
    ],
    faqs: [
      { q: "Can I generate unlimited topic-wise practice quizzes for SSC & Banking?", a: "Yes — type any topic like 'Mixture and Alligation' or 'Syllogism' in Quiz & Cards (/practice) to generate instant MCQ tests." },
    ],
  },
  {
    slug: "cat-mba-ugc-net-jrf-paper-1-ai-tutor",
    category: "Competitive Exams",
    title: "CAT MBA (QA, DILR, VARC) & UGC NET / JRF Paper 1 AI Voice Tutor",
    metaDescription:
      "Prepare for CAT, XAT, SNAP MBA entrance & NTA UGC NET / CSIR JRF Paper 1 (Teaching & Research Aptitude, DI, Logical Indian Philosophy) on an interactive AI Blackboard.",
    heroBadge: "CAT / XAT MBA • NTA UGC NET / JRF",
    h1: "CAT MBA & UGC NET / JRF Interactive AI Study Studio",
    subtitle:
      "Master Number Systems, Modern Math, DILR set breakdowns, Research Aptitude, Nyaya/Pramana Indian Logic, and Ph.D. interview prep in one unified platform.",
    defaultLanguage: "en-US",
    defaultLevel: "Advanced",
    subjectLabel: "CAT & UGC NET",
    featuredChapters: [
      { title: "UGC NET Paper 1: Research Aptitude, Positivism, Sampling & Hypothesis Testing Errors", summary: "Type-I vs Type-II error, parametric vs non-parametric tests, and APA/MLA styles." },
      { title: "UGC NET Unit VI: Indian Logic — Pramanas (Pratyaksha, Anumana, Vyapti & Hetvabhasa)", summary: "Classical Nyaya syllogism, fallacies of inference, and PYQ examples." },
      { title: "CAT Quantitative Ability: Number Theory, Remainder Theorems, Functions & Combinatorics", summary: "Euler's totient, Chinese Remainder Theorem, stars-and-bars, and functional equations." },
    ],
    highlights: [
      "Covers all 10 units of UGC NET Paper 1 + Paper 2 humanities, commerce & CS subjects",
      "Built-in Research Proposal & Ph.D. Interview / Viva Simulator (/research)",
      "Available in both English and शुद्ध हिन्दी for UGC NET Hindi aspirants",
    ],
    faqs: [
      { q: "Does it help prepare Ph.D. research proposals after clearing UGC NET?", a: "Yes! Our Research & Viva Lab (/research) helps draft your Problem Statement, Literature Gap, Methodology, and Viva defense." },
    ],
  },
  {
    slug: "kindergarten-kids-primary-school-story-voice-tutor",
    category: "School & Boards",
    title: "Joyful AI Story & Voice Blackboard for Kids (Kindergarten to Grade 8)",
    metaDescription:
      "Spark early childhood wonder! Interactive AI Voice Storyteller & Chalkboard for Kindergarten (KG) and Grades 1–8 in Maths, Science, Phonics & General Knowledge.",
    heroBadge: "Ages 4–13 • KG & Wonder Story Mode",
    h1: "Warm, Musical Story-Based AI Voice Teacher for Young Learners",
    subtitle:
      "Turn fractions, planets, dinosaurs, plants, grammar, and multiplication into magical, interactive bedtime-style chalkboard stories in your family's language.",
    defaultLanguage: "en-US",
    defaultLevel: "KG & Early Wonder",
    subjectLabel: "Early Childhood & Kids",
    featuredChapters: [
      { title: "Why Is the Sky Blue & How Do Rainbows Form? (Magical Light Story)", summary: "Playful prism adventure explaining sunlight colors for curious kids." },
      { title: "The Pizza Party Adventure: Understanding Fractions & Halves", summary: "Visual, zero-fear introduction to numerators and denominators." },
      { title: "Journey Inside a Tiny Seed: How Plants Make Food (Photosynthesis Story)", summary: "Friendly story of sunlight, water, and chlorophyll." },
    ],
    highlights: [
      "Dedicated 'KG & Early Wonder' pedagogy speaks gently without scary jargon",
      "Story Mode transforms any school chapter into an engaging adventure",
      "Parents can teach children in English, Hindi, Odia, Tamil, Telugu, Spanish, or mother tongue",
    ],
    faqs: [
      { q: "How do I turn on Kids / Kindergarten mode?", a: "Simply select 'KG & Early Wonder' (Ages 4–7) or 'Primary / Middle School' in the Level selector and choose Story Mode or Lesson Mode!" },
    ],
  },
  {
    slug: "nios-state-open-university-distance-learning-ai-tutor",
    category: "IGNOU & Distance Learning",
    title: "NIOS (Class 10 & 12) & State Open University (BAOU, YCMOU, NSOU, OSOU, TNOU) AI Tutor",
    metaDescription:
      "Self-study AI Voice Blackboard for NIOS Secondary/Sr. Secondary and State Open Universities (OSOU, YCMOU, NSOU, BAOU, VMOU, KSOU, TNOU, DU SOL) in regional languages.",
    heroBadge: "NIOS • DU SOL • All State Open Universities",
    h1: "Your Personal 24×7 Professor for Open & Distance Learning",
    subtitle:
      "Studying while working a job, raising a family, or preparing from a rural town without coaching centres? AshuTeacher teaches every chapter aloud whenever you open your phone.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "Open & Distance Learning",
    featuredChapters: [
      { title: "NIOS Senior Secondary (312 Physics & 311 Mathematics) Core Chapters", summary: "TMA & public exam focused derivations, numericals, and summary cheat sheets." },
      { title: "DU SOL & State Open University B.A. / B.Com / B.Sc Semester Papers", summary: "Clear chapter-by-chapter lectures in Hindi, Marathi, Bengali, Odia, Gujarati, Tamil & English." },
    ],
    highlights: [
      "Zero monthly subscription trap — pay-per-use micro-packs starting at ₹99 only when exams approach",
      "Works smoothly on budget Android phones via lightweight PWA or direct Android APK",
      "Interrupt anytime with voice doubts without feeling shy",
    ],
    faqs: [
      { q: "Does AshuTeacher work on low-end smartphones?", a: "Yes! Both the web app and our signed Android APK are ultra-lightweight and stream text + voice smoothly even on 4G mobile networks." },
    ],
  },
  {
    slug: "spanish-french-arabic-mandarin-global-ai-voice-tutor",
    category: "Global & University",
    title: "Multilingual AI Voice Blackboard in Spanish, French, Arabic, Mandarin, Portuguese & 100+ Languages",
    metaDescription:
      "Aprende en Español, Français, العربية, 中文, Português, Deutsch & Swahili: interactive AI Voice Blackboard for K–12, Baccalaureate, ENEM, Gaokao & University STEM.",
    heroBadge: "100+ World Languages • Native Scripts & RTL",
    h1: "Global Mother-Tongue AI Classroom for 195+ Countries",
    subtitle:
      "Whether preparing for Selectividad/PAU, Baccalauréat, Abitur, ENEM Brazil, Tawjihi, WAEC/JAMB Nigeria, KCSE Kenya, or university STEM — learn in fluent native language.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "World Languages STEM",
    featuredChapters: [
      { title: "Cálculo Diferencial e Integral: Límites, Derivadas y Teorema Fundamental", summary: "Step-by-step university & high-school calculus taught natively in Spanish." },
      { title: "WAEC / JAMB & KCSE Mathematics, Physics & Chemistry Core Syllabus", summary: "Complete curriculum-aligned exam preparation across West & East Africa." },
    ],
    highlights: [
      "Covers 195+ countries in the Universal Syllabus Explorer (/academy)",
      "Synchronized speech synthesis + clean LaTeX math rendering across global scripts",
      "30 Free Study Credits on sign-up anywhere in the world",
    ],
    faqs: [
      { q: "Can international students use AshuTeacher for free?", a: "Yes — every learner worldwide receives 30 Free Study Credits immediately upon creating an account, with no credit card required." },
    ],
  },
  {
    slug: "ai-quiz-generator-3d-spaced-repetition-flashcards",
    category: "Research & Exam Tools",
    title: "Free AI MCQ Quiz Generator & 3D Spaced-Repetition Flashcard Maker (LaTeX Ready)",
    metaDescription:
      "Convert any topic, syllabus chapter, or pasted lecture notes into timed MCQ mock tests with step-by-step LaTeX explanations and 3D active-recall flashcards in 100+ languages.",
    heroBadge: "Active Recall • Timed MCQs + 3D Flip Cards",
    h1: "Turn Any Chapter or Notes Into Timed Mock Exams & 3D Flashcards",
    subtitle:
      "Reading passively causes 70% forgetting within 48 hours. Cement every formula, constitutional article, and reaction in long-term memory with active recall.",
    defaultLanguage: "en-US",
    defaultLevel: "Intermediate",
    subjectLabel: "Active Recall Arena",
    featuredChapters: [
      { title: "Quantum Entanglement & Bell's Theorem", summary: "Study the blackboard lecture, then generate a 10-question LaTeX quiz in 1 click!" },
      { title: "UPSC Indian Polity: Fundamental Rights (Articles 12–35)", summary: "Drill Articles 12–35 with statement-based MCQs and 3D active-recall flashcards." },
    ],
    highlights: [
      "Full inline & display KaTeX math rendering inside questions, options, explanations, and flashcards",
      "Tracks accuracy %, best scores, attempt history, and mastered card counts",
      "Works in all 22 Indian and 80+ international languages",
    ],
    faqs: [
      { q: "Can I generate quizzes and flashcards from my own pasted notes?", a: "Yes! Open Quiz & Cards (/practice), paste up to 28,000 characters of notes or textbook text, and generate custom MCQs or 3D flashcards in seconds." },
    ],
  },
];

export function getSeoLandingPageBySlug(slug: string): SeoLandingPage | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug);
}
