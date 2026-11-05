export interface ProgramTopic {
  id: string;
  title: string;
  summary: string;
  tag?: string; // e.g. "High-Yield" | "Derivation" | "Numerical" | "Activity" | "Proof"
  estimatedMinutes: number;
}

export interface ProgramChapter {
  id: string;
  chapterNumber: number;
  title: string;
  weightage?: string;
  summary: string;
  expanded?: boolean;
  topics: ProgramTopic[];
}

export interface ProgramUnit {
  id: string;
  title: string;
  chapters: ProgramChapter[];
}

export interface ProgramSubject {
  id: string;
  name: string;
  code?: string;
  units: ProgramUnit[];
}

export interface ExamPatternInfo {
  duration?: string;
  totalMarks?: string;
  markingScheme?: string;
  sectionsSummary?: string;
  keyStrategy?: string;
}

export interface ResearchStage {
  id: string;
  stageNumber: number;
  title: string;
  objective: string;
  deliverables: string[];
  guidingQuestions: string[];
  suggestedMethods: string[];
}

export interface ResearchBlueprint {
  abstractDraft: string;
  noveltyHypothesis: string;
  prerequisiteTopics: string[];
  stages: ResearchStage[];
  sampleVivaQuestions: string[];
}

export const WORLD_COUNTRIES: string[] = [
  "Global / International",
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "Germany",
  "France",
  "Japan",
  "China",
  "South Korea",
  "United Arab Emirates",
  "Saudi Arabia",
  "Nigeria",
  "South Africa",
  "Kenya",
  "Brazil",
  "Mexico",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  "Indonesia",
  "Malaysia",
  "Philippines",
  "Vietnam",
  "Thailand",
  "Switzerland",
  "Netherlands",
  "Sweden",
  "Italy",
  "Spain",
  "Ireland",
  "New Zealand",
  "Egypt",
  "Ghana",
  "Pakistan",
  "Russia",
  "Turkey",
  "Israel",
  "Argentina",
  "Chile",
  "Colombia",
  "Poland",
  "Finland",
  "Norway",
  "Denmark",
  "Belgium",
  "Austria",
  "Portugal",
  "Greece",
  "Qatar",
  "Kuwait",
  "Oman",
];

export const BOARDS_BY_COUNTRY: Record<string, string[]> = {
  "Global / International": [
    "IB Diploma Programme (IBDP)",
    "IB Middle Years Programme (MYP)",
    "IB Primary Years Programme (PYP)",
    "Cambridge International AS & A Levels",
    "Cambridge IGCSE / O-Level",
    "Cambridge Primary & Lower Secondary",
    "MIT OpenCourseWare / Global University STEM",
    "Edexcel International (Pearson)",
  ],
  India: [
    "CBSE (Central Board of Secondary Education)",
    "CISCE — ICSE (Up to Class 10) / ISC (Class 11–12)",
    "NCERT National Curriculum Framework",
    "CHSE / BSE Odisha (Odisha State Board)",
    "NIOS (National Institute of Open Schooling)",
    "IGNOU (Indira Gandhi National Open University)",
    "MSBSHSE (Maharashtra State Board)",
    "UPMSP (Uttar Pradesh Board)",
    "Tamil Nadu State Board (TNDGE)",
    "KSEAB / DPUE (Karnataka Board)",
    "WBBSE / WBCHSE (West Bengal Board)",
    "KBPE / DHSE (Kerala State Board)",
    "BSEB (Bihar School Examination Board)",
    "RBSE (Rajasthan Board)",
    "GSEB (Gujarat Board)",
    "TSBIE / BIEAP (Telangana & Andhra Pradesh)",
    "AICTE / B.Tech Engineering University Syllabus",
    "NMC / MBBS Medical University Curriculum",
    "UGC Undergraduate / Postgraduate (NEP 2020)",
    "IIT / IISc Honours & Research Curriculum",
  ],
  "United States": [
    "US Common Core State Standards (K–12)",
    "Next Generation Science Standards (NGSS)",
    "College Board AP (Advanced Placement)",
    "Honors High School Curriculum",
    "US Accredited Undergraduate (BS / BA)",
    "MIT / Stanford / Ivy League Engineering & Science",
    "US Graduate / PhD Coursework",
  ],
  "United Kingdom": [
    "UK National Curriculum (EYFS & Key Stages 1–3)",
    "GCSE (AQA / Edexcel / OCR)",
    "GCE A-Levels (AQA / Edexcel / OCR)",
    "Scottish SQA (National 5 / Highers / Advanced Highers)",
    "BTEC National Diploma",
    "UK Russell Group / Oxbridge University",
  ],
  Canada: [
    "Ontario Curriculum (OSSD — K–12)",
    "British Columbia Curriculum",
    "Alberta Education K–12",
    "Quebec Ministère de l'Éducation (CEGEP)",
    "Canadian U15 University Curriculum",
  ],
  Australia: [
    "Australian Curriculum (Foundation – Year 10)",
    "NSW HSC (Higher School Certificate)",
    "Victoria VCE",
    "Queensland QCE / WACE / SACE",
    "Group of Eight (Go8) University Curriculum",
  ],
  Singapore: [
    "Singapore MOE Primary (PSLE)",
    "Singapore-Cambridge GCE O-Level / SEC",
    "Singapore-Cambridge GCE A-Level (JC)",
    "NUS / NTU University Curriculum",
  ],
  Germany: [
    "Gymnasium / Abitur (KMK Standards)",
    "Realschule / Hauptschule",
    "TU9 / German Technical University (Bachelor / Master)",
  ],
  France: [
    "Éducation Nationale (École / Collège)",
    "Lycée — Baccalauréat Général & Technologique",
    "Classes Préparatoires (CPGE)",
    "Grandes Écoles / French University (Licence / Master)",
  ],
  Japan: [
    "MEXT National Curriculum (Elementary / Junior High / High School)",
    "Japanese National University (Todai / Kyodai STEM)",
  ],
  China: [
    "MOE Compulsory Education & Senior High Curriculum",
    "Chinese Double First-Class University (Tsinghua / Peking)",
  ],
  "United Arab Emirates": [
    "UAE Ministry of Education (MOE) Stream",
    "CBSE Gulf / International Indian Schools",
    "British (IGCSE / A-Level) & IB UAE Schools",
    "American Curriculum UAE",
  ],
  Nigeria: [
    "NERDC / WAEC (WASSCE) Senior Secondary",
    "NECO Curriculum",
    "NUC Accredited Nigerian University",
  ],
  Bangladesh: [
    "NCTB National Curriculum (SSC & HSC)",
    "English Version / Madrasah / University UGC",
  ],
  Nepal: [
    "CDC / NEB National Examinations Board (SEE & Class 11–12)",
    "Tribhuvan / Kathmandu University",
  ],
  "Sri Lanka": [
    "NIE Sri Lanka GCE O-Level & GCE A-Level",
    "Sri Lankan State University UGC",
  ],
};

export interface AcademicGradeOption {
  id: string;
  label: string;
  group: "Early Childhood" | "Primary & Middle" | "High School / Board" | "Higher Education & Research";
  pedagogyStage: string;
}

export const ACADEMIC_GRADES: AcademicGradeOption[] = [
  { id: "KG / Pre-Primary (Ages 4–6)", label: "🧸 KG / Nursery / Pre-School (Ages 4–6)", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 1 / Grade 1", label: "Class 1 / Grade 1", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 2 / Grade 2", label: "Class 2 / Grade 2", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 3 / Grade 3", label: "Class 3 / Grade 3", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 4 / Grade 4", label: "Class 4 / Grade 4", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 5 / Grade 5", label: "Class 5 / Grade 5", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 6 / Grade 6", label: "Class 6 / Grade 6", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 7 / Grade 7", label: "Class 7 / Grade 7", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 8 / Grade 8", label: "Class 8 / Grade 8", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 9 / Grade 9", label: "Class 9 / Grade 9 (Freshman)", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Class 10 / Grade 10 (Board / GCSE)", label: "Class 10 / Grade 10 (Board / Matric / GCSE)", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Class 11 / Grade 11 (AS / Junior)", label: "Class 11 / Grade 11 (Plus-Two Yr 1 / AS-Level)", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Class 12 / Grade 12 (Board / A-Level / Senior)", label: "Class 12 / Grade 12 (Board / A-Level / IB Year 2)", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Undergraduate — Year 1 (Sem 1–2)", label: "🎓 Undergraduate — Year 1 (Semesters 1–2)", group: "Higher Education & Research", pedagogyStage: "Advanced" },
  { id: "Undergraduate — Year 2 (Sem 3–4)", label: "🎓 Undergraduate — Year 2 (Semesters 3–4)", group: "Higher Education & Research", pedagogyStage: "Advanced" },
  { id: "Undergraduate — Year 3 (Sem 5–6)", label: "🎓 Undergraduate — Year 3 (Semesters 5–6)", group: "Higher Education & Research", pedagogyStage: "Advanced" },
  { id: "Undergraduate — Year 4 / Honours (Sem 7–8)", label: "🎓 Undergraduate — Year 4 / Final Year", group: "Higher Education & Research", pedagogyStage: "Advanced" },
  { id: "Postgraduate / Master's (M.Sc / M.Tech / MBA / MA)", label: "🏛️ Postgraduate / Master's Degree", group: "Higher Education & Research", pedagogyStage: "Expert" },
  { id: "Doctoral / PhD / MIT Research Level", label: "🔬 Doctoral / PhD / MIT-Level Frontier Research", group: "Higher Education & Research", pedagogyStage: "Expert" },
];

export interface StreamPreset {
  id: string;
  label: string;
  subjects: string[];
}

export function getStreamPresetsForGrade(gradeId: string): StreamPreset[] {
  if (gradeId.includes("KG") || gradeId.includes("Class 1 ") || gradeId.includes("Class 2 ")) {
    return [
      {
        id: "early-all",
        label: "🌈 Complete Early Wonder Pack",
        subjects: [
          "Numbers, Counting & Shapes Fun",
          "Phonics, Reading & Storytelling",
          "Nature, Animals & World Around Us",
          "Logic Puzzles & Creative Curiosity",
        ],
      },
    ];
  }

  if (
    gradeId.includes("Class 3") ||
    gradeId.includes("Class 4") ||
    gradeId.includes("Class 5")
  ) {
    return [
      {
        id: "primary-core",
        label: "📘 Full Primary Core Subjects",
        subjects: [
          "Mathematics",
          "Environmental Studies (EVS) / General Science",
          "English Language & Grammar",
          "Computer & Logical Thinking",
        ],
      },
    ];
  }

  if (
    gradeId.includes("Class 6") ||
    gradeId.includes("Class 7") ||
    gradeId.includes("Class 8") ||
    gradeId.includes("Class 9") ||
    gradeId.includes("Class 10")
  ) {
    return [
      {
        id: "sec-all",
        label: "📚 Complete All-Subject Board Track",
        subjects: [
          "Mathematics",
          "Science (Physics, Chemistry & Biology)",
          "Social Science (History, Geography, Civics & Economics)",
          "English Literature & Communicative Grammar",
          "Computer Applications / Artificial Intelligence",
        ],
      },
      {
        id: "sec-stem",
        label: "🔬 Science & Mathematics Focus",
        subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"],
      },
    ];
  }

  if (gradeId.includes("Class 11") || gradeId.includes("Class 12")) {
    return [
      {
        id: "pcm",
        label: "⚛️ Science — PCM + CS (Engineering / Physical Sciences)",
        subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science", "English Core"],
      },
      {
        id: "pcb",
        label: "🧬 Science — PCB (Medical / Life Sciences)",
        subjects: ["Physics", "Chemistry", "Biology", "English Core"],
      },
      {
        id: "pcmb",
        label: "🔬 Science — PCMB (Full 4-Science Stream)",
        subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      },
      {
        id: "commerce",
        label: "📊 Commerce & Finance Stream",
        subjects: ["Accountancy", "Business Studies", "Economics", "Applied Mathematics", "English Core"],
      },
      {
        id: "humanities",
        label: "🌍 Humanities / Arts Stream",
        subjects: ["History", "Political Science", "Geography", "Economics", "Sociology / Psychology"],
      },
    ];
  }

  // Higher Ed / Undergraduate / Master's / Doctoral
  return [
    {
      id: "cs-ai",
      label: "💻 Computer Science, AI & Systems",
      subjects: [
        "Data Structures & Algorithms",
        "Operating Systems & Computer Networks",
        "Database Systems",
        "Machine Learning & Deep Learning",
      ],
    },
    {
      id: "ece-ee",
      label: "⚡ Electrical, Electronics & VLSI",
      subjects: [
        "Signals & Systems",
        "Analog & Digital Electronics",
        "Control Systems",
        "Electromagnetics & Communication",
      ],
    },
    {
      id: "mech-civil",
      label: "⚙️ Mechanical & Core Engineering",
      subjects: [
        "Engineering Mechanics & Strength of Materials",
        "Thermodynamics & Fluid Mechanics",
        "Heat Transfer & Machine Design",
      ],
    },
    {
      id: "pure-math-phys",
      label: "📐 Pure Mathematics & Theoretical Physics",
      subjects: [
        "Linear Algebra & Multivariable Calculus",
        "Real & Complex Analysis",
        "Classical & Quantum Mechanics",
        "Statistical Mechanics & Electrodynamics",
      ],
    },
    {
      id: "med-bio",
      label: "🩺 Medicine (MBBS / Pre-Med) & Biotechnology",
      subjects: [
        "Human Anatomy & Physiology",
        "Biochemistry & Molecular Biology",
        "Pathology, Pharmacology & Microbiology",
      ],
    },
    {
      id: "econ-mba",
      label: "📈 Economics, Finance & Management (MBA / BBA)",
      subjects: [
        "Microeconomics & Macroeconomics",
        "Corporate Finance & Financial Accounting",
        "Econometrics & Quantitative Methods",
        "Strategic Management",
      ],
    },
  ];
}

export const EXAMS_BY_COUNTRY: Record<string, string[]> = {
  "Global / International": [
    "GRE (Graduate Record Examinations)",
    "GMAT Focus Edition",
    "SAT (Scholastic Assessment Test)",
    "ACT",
    "IELTS Academic & General",
    "TOEFL iBT",
    "CFA (Chartered Financial Analyst — Level I / II / III)",
    "FRM (Financial Risk Manager)",
    "ACCA / CPA Global Accounting",
    "PMP (Project Management Professional)",
    "International Mathematical / Physics / Informatics Olympiad (IMO / IPhO / IOI)",
    "AWS / Google Cloud / Azure Solutions Architect",
    "JLPT (Japanese-Language Proficiency N5–N1)",
    "DELF / DALF (French) & Goethe-Zertifikat (German)",
  ],
  India: [
    "JEE Main (NTA Engineering Entrance)",
    "JEE Advanced (IIT Entrance)",
    "NEET UG (Medical Entrance)",
    "CUET UG / PG (Central Universities Entrance)",
    "UPSC Civil Services — IAS / IPS (Prelims + Mains)",
    "GATE (Graduate Aptitude Test in Engineering)",
    "CAT (Common Admission Test — IIM MBA)",
    "CLAT (Common Law Admission Test)",
    "NDA & NA (National Defence Academy)",
    "CDS (Combined Defence Services)",
    "SSC CGL (Staff Selection Commission)",
    "IBPS PO / SBI PO (Banking Exams)",
    "RRB NTPC / Railways",
    "UGC NET / CSIR NET (JRF & Assistant Professor)",
    "ICAI CA (Foundation / Intermediate / Final)",
    "OPSC OAS (Odisha Civil Services)",
    "State PSC (UPPSC / BPSC / MPSC / WBCS / KPSC / TNPSC)",
    "IISER IAT /KVPY / Olympiads (IOQM / NSEP / NSEC)",
    "CTET / State TET (Teaching Eligibility)",
  ],
  "United States": [
    "SAT (Digital SAT)",
    "ACT",
    "MCAT (Medical College Admission Test)",
    "USMLE Step 1 / Step 2 CK",
    "LSAT (Law School Admission Test)",
    "GRE General & Subject Tests",
    "GMAT Focus Edition",
    "AP (Advanced Placement) Exams",
    "FE / PE Engineering Licensure Exam",
    "USCPA (Certified Public Accountant)",
    "NCLEX-RN (Nursing Licensure)",
    "AMC 10 / AMC 12 / AIME (Math Competitions)",
  ],
  "United Kingdom": [
    "UCAT (University Clinical Aptitude Test)",
    "LNAT (National Admissions Test for Law)",
    "TMUA / MAT / STEP (Oxbridge Mathematics & CS)",
    "ESAT / PAT (Oxford & Cambridge Engineering/Physics)",
    "11+ Grammar School Entrance",
    "PLAB 1 & 2 / UKMLA (Medical Licensing)",
    "SQE (Solicitors Qualifying Examination)",
  ],
  China: [
    "Gaokao (National College Entrance Examination)",
    "Kaoyan (National Postgraduate Entrance Examination)",
    "Guokao (National Civil Service Exam)",
  ],
  Japan: [
    "Common Test for University Admissions (Kyotsu Test)",
    "Todai / Imperial University Secondary Exam",
    "EJU (Examination for Japanese University Admission)",
    "JLPT (N5–N1)",
  ],
  "South Korea": [
    "CSAT / Suneung (College Scholastic Ability Test)",
    "TOPIK (Test of Proficiency in Korean)",
  ],
  France: [
    "Concours Grandes Écoles (Polytechnique / ENS / Centrale)",
    "PASS / LAS (Medical Entrance)",
  ],
  Germany: [
    "TMS (Test für Medizinische Studiengänge)",
    "TestAS (Test for Academic Studies)",
    "Staatsexamen (Medicine / Law)",
  ],
  Australia: [
    "GAMSAT (Graduate Medical School Admissions Test)",
    "UCAT ANZ",
    "NAPLAN & Selective School Placement",
  ],
  Canada: [
    "MCAT Canada",
    "LSAT Canada",
    "CASPer & MCCQE (Medical Council of Canada)",
  ],
  Singapore: [
    "PSLE (Primary School Leaving Examination)",
    "GCE O-Level & GCE A-Level Singapore",
  ],
};

export const RESEARCH_TIERS = [
  {
    id: "School Science & Innovation Project",
    label: "🎒 School Science Fair / Exhibition Project (Classes 1–12)",
    desc: "Hands-on working model, clear hypothesis, chart/poster & viva prep",
    pedagogyLevel: "Intermediate",
  },
  {
    id: "Undergraduate / B.Tech Capstone",
    label: "💻 Undergraduate / B.Tech Major Capstone Project",
    desc: "End-to-end system architecture, implementation milestones, benchmarks & report",
    pedagogyLevel: "Advanced",
  },
  {
    id: "Master's Dissertation / Thesis",
    label: "🎓 Master's Thesis / Postgraduate Dissertation",
    desc: "Systematic literature review, rigorous methodology, experiments & thesis chapters",
    pedagogyLevel: "Expert",
  },
  {
    id: "PhD / MIT-Level Frontier Research",
    label: "🔬 PhD / MIT-Level Novel Research & Publication",
    desc: "Open research gap discovery, mathematical/theoretical rigor, baselines, IEEE/ACM/Nature paper structure & committee defense",
    pedagogyLevel: "Expert",
  },
] as const;

export const RESEARCH_DOMAINS = [
  "Artificial Intelligence, LLMs & Computer Science",
  "Robotics, Embedded Systems, IoT & VLSI",
  "Quantum Computing, Physics & Astrophysics",
  "Mathematics, Cryptography & Theoretical CS",
  "Biotechnology, Genomics, Medicine & Healthcare",
  "Clean Energy, Climate Science & Sustainability",
  "Mechanical, Aerospace & Materials Engineering",
  "Chemistry, Nanotechnology & Drug Discovery",
  "Economics, FinTech, Public Policy & Management",
  "Education Technology, Psychology & Social Sciences",
  "Literature, Linguistics, Law & Humanities",
];
