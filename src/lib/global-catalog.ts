export interface ProgramTopic {
  id: string;
  title: string;
  summary: string;
  tag?: string;
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

export interface TreeOptionItem {
  id: string;
  code?: string;
  label: string;
  badge?: string;
}

export interface TreeChildrenPayload {
  stepLabel: string;
  placeholder: string;
  isPaperLevel: boolean;
  items: TreeOptionItem[];
}

export interface PaperSyllabusChapter {
  id: string;
  chapterNumber: number;
  title: string;
  weightage?: string;
  estimatedMinutes: number;
  summary: string;
  syllabusTopics: string[];
}

export interface PaperSyllabusUnit {
  id: string;
  unitTitle: string;
  chapters: PaperSyllabusChapter[];
}

export interface PaperSyllabusPayload {
  paperTitle: string;
  paperCode: string;
  overview: string;
  pedagogyStage: string;
  examPattern: ExamPatternInfo;
  units: PaperSyllabusUnit[];
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
  "India",
  "Global / International",
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
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  // Full A-Z world countries
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Belarus",
  "Belgium",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brunei",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "Georgia",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Jordan",
  "Kazakhstan",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malaysia",
  "Maldives",
  "Malta",
  "Mauritius",
  "Mexico",
  "Mongolia",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Senegal",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Zambia",
  "Zimbabwe",
];

export type AcademyDomain =
  | "UNIVERSITY"
  | "SCHOOL_BOARD"
  | "COMPETITIVE_EXAM"
  | "CERTIFICATION";

export const UNIVERSITIES_BY_COUNTRY: Record<string, string[]> = {
  India: [
    "IGNOU (Indira Gandhi National Open University)",
    "University of Delhi (DU — NEP / UGCF)",
    "IIT System (Indian Institutes of Technology)",
    "NIT / AICTE B.Tech Model Curriculum",
    "BPUT Odisha (Biju Patnaik University of Technology)",
    "Utkal University / Sambalpur University / Berhampur University (Odisha)",
    "JNU (Jawaharlal Nehru University)",
    "BHU (Banaras Hindu University)",
    "Anna University (Chennai)",
    "University of Mumbai",
    "University of Calcutta",
    "Savitribai Phule Pune University (SPPU)",
    "VTU (Visvesvaraya Technological University)",
    "AKTU (Dr. A.P.J. Abdul Kalam Technical University)",
    "NMC MBBS / AIIMS Medical Curriculum",
    "UGC Model NEP-2020 Curriculum (BA / BSc / BCom / MA / MSc)",
    "IISc Bangalore (Research & Integrated PhD)",
  ],
  "United States": [
    "MIT (Massachusetts Institute of Technology)",
    "Stanford University",
    "Harvard University",
    "UC Berkeley (University of California)",
    "Carnegie Mellon University (CMU)",
    "Caltech (California Institute of Technology)",
    "Georgia Tech",
    "University of Texas / State University System",
  ],
  "United Kingdom": [
    "The Open University (UK)",
    "University of Oxford",
    "University of Cambridge",
    "Imperial College London",
    "UCL (University College London)",
    "University of Edinburgh",
    "London School of Economics (LSE)",
  ],
  "Global / International": [
    "MIT OpenCourseWare (Global)",
    "ACM / IEEE Global Computer Science Curriculum",
    "University of London International Programmes",
    "Bologna Process European University Standard",
  ],
  Canada: [
    "University of Toronto",
    "University of British Columbia (UBC)",
    "McGill University",
    "University of Waterloo",
  ],
  Australia: [
    "University of Melbourne",
    "University of Sydney",
    "Australian National University (ANU)",
    "UNSW Sydney",
  ],
  Singapore: [
    "NUS (National University of Singapore)",
    "NTU (Nanyang Technological University)",
  ],
  Germany: [
    "TU Munich (TUM)",
    "RWTH Aachen University",
    "ETH / German TU9 Engineering Standard",
    "FernUniversität in Hagen (Open University)",
  ],
  China: [
    "Tsinghua University",
    "Peking University",
    "Zhejiang / Shanghai Jiao Tong University",
  ],
  Japan: [
    "The University of Tokyo (Todai)",
    "Kyoto University",
    "The Open University of Japan",
  ],
};

export const BOARDS_BY_COUNTRY: Record<string, string[]> = {
  India: [
    "CBSE (Central Board of Secondary Education)",
    "CISCE — ICSE (KG–Class 10) & ISC (Class 11–12)",
    "NCERT National Curriculum Framework",
    "BSE / CHSE Odisha (Odisha State Board)",
    "NIOS (National Institute of Open Schooling)",
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
    "PSEB / HBSE / MPBSE / JKBOSE / SEBA Assam",
  ],
  "Global / International": [
    "IB Primary Years Programme (PYP — Ages 3–12)",
    "IB Middle Years Programme (MYP — Ages 11–16)",
    "IB Diploma Programme (IBDP — Ages 16–19)",
    "Cambridge Primary & Lower Secondary",
    "Cambridge IGCSE / O-Level",
    "Cambridge International AS & A Levels",
    "Pearson Edexcel International GCSE & A-Levels",
  ],
  "United States": [
    "US Common Core State Standards (Kindergarten – Grade 12)",
    "Next Generation Science Standards (NGSS K–12)",
    "College Board AP (Advanced Placement Courses)",
    "Texas TEKS / California / New York Regents K–12",
  ],
  "United Kingdom": [
    "UK National Curriculum (Early Years EYFS & Key Stages 1–3)",
    "GCSE (AQA / Edexcel / OCR — Years 10–11)",
    "GCE A-Levels (AQA / Edexcel / OCR — Years 12–13)",
    "Scottish SQA (Curriculum for Excellence / National 5 / Highers)",
  ],
  Canada: [
    "Ontario Curriculum (Kindergarten – Grade 12 OSSD)",
    "British Columbia K–12 Curriculum",
    "Alberta K–12 Curriculum",
  ],
  Australia: [
    "Australian Curriculum (Foundation – Year 10)",
    "NSW HSC / Victoria VCE / Queensland QCE (Years 11–12)",
  ],
  Singapore: [
    "Singapore MOE Primary (P1–P6 / PSLE)",
    "Singapore MOE Secondary (GCE O-Level / SEC)",
    "Singapore Junior College (GCE A-Level)",
  ],
  Germany: [
    "Grundschule (Grades 1–4) & Gymnasium / Abitur (Grades 5–12/13)",
    "Realschule / Gesamtschule",
  ],
  France: [
    "Éducation Nationale — Maternelle, Élémentaire & Collège",
    "Lycée — Baccalauréat Général & Spécialités",
  ],
};

export const EXAMS_BY_COUNTRY: Record<string, string[]> = {
  India: [
    "UPSC Civil Services Examination (CSE — IAS / IPS / IFS)",
    "JEE Main (NTA Engineering Entrance)",
    "JEE Advanced (IIT Entrance)",
    "NEET UG (Medical Entrance)",
    "GATE (Graduate Aptitude Test in Engineering)",
    "CUET UG & CUET PG (Central Universities Entrance)",
    "CAT (Common Admission Test — IIM MBA)",
    "OPSC OAS (Odisha Civil Services Examination)",
    "State PSCs (UPPSC / BPSC / MPSC / WBCS / TNPSC / KPSC / RAS)",
    "CLAT (Common Law Admission Test)",
    "NDA & NA / CDS (Defence Services)",
    "SSC CGL / CHSL (Staff Selection Commission)",
    "IBPS PO / SBI PO / RBI Grade B (Banking & Finance)",
    "UGC NET / CSIR NET (JRF & Assistant Professor)",
    "ICAI CA (Foundation / Intermediate / Final)",
    "ICSI CS / ICMAI CMA",
    "RRB NTPC / RRB JE / ESE (Engineering Services)",
    "NEET PG / INI-CET (Medical PG)",
    "Olympiads (IOQM / RMO / INMO / NSEP / NSEC / NSO)",
    "CTET / OSSTET / State TET (Teaching Eligibility)",
  ],
  "Global / International": [
    "GRE General & GRE Subject Tests",
    "GMAT Focus Edition",
    "SAT (Digital SAT)",
    "ACT",
    "IELTS Academic & General Training",
    "TOEFL iBT",
    "CFA (Chartered Financial Analyst — Levels I, II, III)",
    "FRM (Financial Risk Manager — Part I & II)",
    "ACCA / USCPA Global Accounting",
    "International Olympiads (IMO / IPhO / IChO / IOI / IBO)",
    "JLPT (Japanese-Language Proficiency N5–N1)",
    "DELF / DALF (French) & Goethe-Zertifikat (German)",
  ],
  "United States": [
    "SAT (Digital SAT)",
    "ACT",
    "MCAT (Medical College Admission Test)",
    "USMLE (Step 1, Step 2 CK, Step 3)",
    "LSAT (Law School Admission Test)",
    "GRE General & Subject Tests",
    "GMAT Focus Edition",
    "AP (Advanced Placement) Examinations",
    "FE & PE Engineering Licensure Exams",
    "USCPA (Uniform CPA Examination)",
    "Bar Exam (UBE / MBE) & NCLEX-RN",
    "AMC 8 / AMC 10 / AMC 12 / AIME / Putnam",
  ],
  "United Kingdom": [
    "UCAT (University Clinical Aptitude Test)",
    "LNAT (National Admissions Test for Law)",
    "TMUA / MAT / STEP (Oxbridge Mathematics & CS)",
    "ESAT / PAT (Oxbridge Engineering & Physics)",
    "11+ Selective Entrance Exam",
    "PLAB 1 & 2 / UKMLA & MRCP",
    "SQE 1 & SQE 2 (Solicitors Qualifying Examination)",
  ],
  China: [
    "Gaokao (National College Entrance Examination)",
    "Kaoyan (National Postgraduate Entrance Examination)",
    "Guokao (National Civil Service Examination)",
  ],
  Japan: [
    "Common Test for University Admissions (Kyotsu Test)",
    "National Civil Service Exam Japan",
    "JLPT (Levels N5–N1)",
  ],
  "South Korea": [
    "CSAT / Suneung (College Scholastic Ability Test)",
    "PSAT / Civil Service Exam Korea",
    "TOPIK I & II",
  ],
};

export const CERTIFICATIONS_BY_COUNTRY: Record<string, string[]> = {
  "Global / International": [
    "AWS Certified Solutions Architect / AI Practitioner",
    "Google Cloud Professional Architect / ML Engineer",
    "Microsoft Azure Solutions Architect / AI Engineer",
    "Linux Foundation CKA / CKAD (Kubernetes)",
    "Cisco CCNA / CCNP & CompTIA Security+ / OSCP",
    "PMP (Project Management Professional)",
    "Full-Stack Web, AI & Systems Engineering Mastery",
    "Data Science, Deep Learning & Generative AI Track",
  ],
};

export interface AcademicGradeOption {
  id: string;
  label: string;
  group: string;
  pedagogyStage: string;
}

export const ACADEMIC_GRADES: AcademicGradeOption[] = [
  { id: "KG / Pre-Primary (Ages 4–6)", label: "🧸 KG / Nursery / Pre-School (Ages 4–6)", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 1 / Grade 1", label: "Class 1 / Grade 1", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 2 / Grade 2", label: "Class 2 / Grade 2", group: "Early Childhood", pedagogyStage: "KG & Early Wonder" },
  { id: "Class 3 / Grade 3", label: "Class 3 / Grade 3", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 6 / Grade 6", label: "Class 6 / Grade 6", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 8 / Grade 8", label: "Class 8 / Grade 8", group: "Primary & Middle", pedagogyStage: "Primary & Middle School" },
  { id: "Class 10 / Grade 10 (Board / GCSE)", label: "Class 10 / Grade 10 (Board / GCSE)", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Class 11 / Grade 11 (AS / Junior)", label: "Class 11 / Grade 11", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Class 12 / Grade 12 (Board / A-Level / Senior)", label: "Class 12 / Grade 12", group: "High School / Board", pedagogyStage: "Intermediate" },
  { id: "Undergraduate", label: "Undergraduate", group: "Higher Education & Research", pedagogyStage: "Advanced" },
  { id: "Postgraduate / Master's", label: "Postgraduate / Master's", group: "Higher Education & Research", pedagogyStage: "Expert" },
  { id: "Doctoral / PhD / MIT Research Level", label: "Doctoral / PhD / MIT Research", group: "Higher Education & Research", pedagogyStage: "Expert" },
];

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
