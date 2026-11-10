export interface ShowcaseLecture {
  slug: string;
  title: string;
  subject: string;
  language: string;
  languageBadge: string;
  level: string;
  badge: string;
  content: string;
}

export const SHOWCASE_LECTURES: ShowcaseLecture[] = [
  {
    slug: "quantum-entanglement",
    title: "Quantum Entanglement & Bell's Theorem",
    subject: "Physics",
    language: "en-US",
    languageBadge: "English",
    level: "Intermediate",
    badge: "Live Physics Demo",
    content: `# Quantum Entanglement & Bell's Theorem

Welcome to the blackboard! Imagine two coins spun in opposite galaxies — yet the instant one lands **Heads**, the other *instantaneously* lands **Tails**, with zero classical signal travelling between them. Einstein famously called this *"spooky action at a distance."* Let's derive why quantum mechanics wins!

---

## 1. The Singlet Spin State (EPR Pair)

Consider two spin-$\\frac{1}{2}$ particles (say, two electrons $A$ and $B$) prepared in the **Bell singlet state**:

$$|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}\\Big(|\\uparrow\\rangle_A |\\downarrow\\rangle_B - |\\downarrow\\rangle_A |\\uparrow\\rangle_B\\Big)$$

Notice two extraordinary properties on the board:
1. **Neither particle has a definite spin** before measurement — tracing out $B$ leaves $A$ with density matrix $\\rho_A = \\frac{1}{2}I$ (pure randomness: $50\\%$ up, $50\\%$ down).
2. **100% Perfect Anti-Correlation:** The moment Alice measures spin along *any* unit axis $\\hat{a}$ and gets $+1$, Bob's state collapses to $|-\\hat{a}\\rangle_B$, guaranteeing $-1$ along $\\hat{a}$!

---

## 2. Einstein's Hidden Variables vs. John Bell (1964)

Einstein, Podolsky, and Rosen (EPR, 1935) argued that particles must carry pre-programmed instruction sheets — **local hidden variables** $\\lambda$ — deciding outcomes $A(\\hat{a}, \\lambda) = \\pm 1$ and $B(\\hat{b}, \\lambda) = \\pm 1$ locally.

In **CHSH form**, for any four measurement axes $(\\hat{a}, \\hat{a}', \\hat{b}, \\hat{b}')$, notice that for every $\\lambda$:

$$A(\\hat{a})B(\\hat{b}) + A(\\hat{a})B(\\hat{b}') + A(\\hat{a}')B(\\hat{b}) - A(\\hat{a}')B(\\hat{b}') = \\pm 2$$

Taking the expectation value $E(\\hat{a}, \\hat{b})$ over any classical probability distribution $\\rho(\\lambda)$ gives the **CHSH Bell Inequality**:

$$|S| = \\big|E(\\hat{a}, \\hat{b}) + E(\\hat{a}, \\hat{b}') + E(\\hat{a}', \\hat{b}) - E(\\hat{a}', \\hat{b}')\\big| \\le 2$$

---

## 3. Quantum Mechanics Breaks the Classical Limit!

In quantum mechanics, the spin correlation of the singlet state at relative angle $\\theta_{ab}$ is:

$$E_{\\text{QM}}(\\hat{a}, \\hat{b}) = \\langle \\Psi^- | (\\vec{\\sigma}\\cdot\\hat{a}) \\otimes (\\vec{\\sigma}\\cdot\\hat{b}) | \\Psi^- \\rangle = -\\cos\\theta_{ab}$$

Choose coplanar detector angles separated by $45^\\circ$ ($\\frac{\\pi}{4}$ radians):
- $\\theta_{ab} = 45^\\circ$, $\\theta_{ab'} = 45^\\circ$, $\\theta_{a'b} = 45^\\circ$, and $\\theta_{a'b'} = 135^\\circ$.

Substitute directly:

$$|S_{\\text{QM}}| = \\left|-\\cos 45^\\circ - \\cos 45^\\circ - \\cos 45^\\circ + \\cos 135^\\circ\\right| = 4 \\times \\frac{\\sqrt{2}}{2} = 2\\sqrt{2} \\approx 2.828 > 2$$

**Result ($2\\sqrt{2} > 2$):** Confirmed experimentally by Aspect, Clauser, and Zeilinger (*2022 Nobel Prize in Physics*), proving nature violates **local realism** while still respecting special relativity (no faster-than-light communication because Alice's marginal outcomes remain $50/50$ random!).

---

## 4. Quick Exam Check
- **Q:** Can entanglement transmit a message faster than light $c$?
- **A:** **No** (No-Communication Theorem) — Bob sees $50\\%$ $+1$ and $50\\%$ $-1$ regardless of Alice's axis choice until they compare classical notes!`,
  },
  {
    slug: "ignou-mcs-201-dp",
    title: "IGNOU MCS-201: Asymptotic Complexity & Dynamic Programming",
    subject: "IGNOU MCA (MCS-201)",
    language: "en-US",
    languageBadge: "English • IGNOU MCA",
    level: "Advanced",
    badge: "IGNOU MCA Special",
    content: `# IGNOU MCS-201: Asymptotic Complexity & Dynamic Programming

Welcome IGNOU MCA scholars! This topic carries **20–25 marks** almost every Term-End Examination (TEE). Let's master both **Asymptotic Notations** and **0/1 Knapsack Dynamic Programming** step-by-step on the board.

---

## 1. The Three Core Asymptotic Bounds

Let $f(n)$ be your algorithm's exact running time and $g(n)$ be the reference growth rate:

1. **Big-Oh $O(g(n))$ — Tight/Loose Upper Bound (Worst Case):**
   $$f(n) = O(g(n)) \\iff \\exists\\, c > 0,\\, n_0 \\ge 1 \\text{ such that } 0 \\le f(n) \\le c\\cdot g(n) \\;\\forall n \\ge n_0$$
2. **Big-Omega $\\Omega(g(n))$ — Lower Bound (Best Case):**
   $$f(n) = \\Omega(g(n)) \\iff \\exists\\, c > 0,\\, n_0 \\ge 1 \\text{ such that } 0 \\le c\\cdot g(n) \\le f(n) \\;\\forall n \\ge n_0$$
3. **Theta $\\Theta(g(n))$ — Asymptotically Tight Bound:**
   $$f(n) = \\Theta(g(n)) \\iff c_1 g(n) \\le f(n) \\le c_2 g(n) \\;\\forall n \\ge n_0$$

**Worked TEE Proof:** Show $f(n) = 3n^2 + 5n + 2 = O(n^2)$.
For all $n \\ge 1$: $3n^2 + 5n + 2 \\le 3n^2 + 5n^2 + 2n^2 = 10n^2$. Pick $c = 10, n_0 = 1$. Hence proved!

---

## 2. Master Theorem Quick Formula

For divide-and-conquer recurrences $T(n) = aT(n/b) + f(n)$ where $a \\ge 1, b > 1$, compare $f(n)$ with $n^{\\log_b a}$:
- **Case 1:** $f(n) = O(n^{\\log_b a - \\epsilon}) \\implies T(n) = \\Theta(n^{\\log_b a})$
- **Case 2:** $f(n) = \\Theta(n^{\\log_b a}) \\implies T(n) = \\Theta(n^{\\log_b a} \\log n)$ *(e.g. Merge Sort: $T(n)=2T(n/2)+n \\implies \\Theta(n\\log n)$)*
- **Case 3:** $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ + regularity $\\implies T(n) = \\Theta(f(n))$

---

## 3. Dynamic Programming: 0/1 Knapsack Recurrence

When subproblems **overlap** and exhibit **optimal substructure**, Memoization / Tabulation reduces exponential $O(2^n)$ recursion to pseudo-polynomial $O(nW)$!

Given $n$ items with weights $w_i$, profits $p_i$, and knapsack capacity $W$, let $DP[i][w]$ be the maximum profit using a subset of items $1..i$ within capacity $w$:

$$DP[i][w] = \\begin{cases} 0 & \\text{if } i = 0 \\text{ or } w = 0 \\\\ DP[i-1][w] & \\text{if } w_i > w \\\\ \\max\\big(DP[i-1][w],\\; p_i + DP[i-1][w - w_i]\\big) & \\text{if } w_i \\le w \\end{cases}$$

- **Time Complexity:** $\\Theta(n \\cdot W)$
- **Space Complexity:** $\\Theta(n \\cdot W)$ (optimizable to $O(W)$ using a 1D reverse loop!).`,
  },
  {
    slug: "upsc-polity-fundamental-rights",
    title: "UPSC Indian Polity: Fundamental Rights (Articles 12–35)",
    subject: "UPSC CSE GS Paper II",
    language: "en-US",
    languageBadge: "English • UPSC CSE",
    level: "Advanced",
    badge: "UPSC GS-II Masterclass",
    content: `# UPSC Indian Polity: Fundamental Rights (Part III, Articles 12–35)

Welcome future Civil Servants! Part III of the Constitution of India is rightly called the **Magna Carta of India**. Both Prelims trap questions and GS-II 15-mark Mains answers revolve around the architecture below.

---

## 1. Structural Overview of Part III

- **Article 12 ("The State"):** Includes Union & State Executive/Legislature, local authorities (Panchayats, Municipalities), and statutory/non-statutory bodies acting as agencies of the State (*RD Shetty & Ajay Hasia doctrines*).
- **Article 13 (Judicial Review Shield):** Any pre-constitutional or post-constitutional *law* inconsistent with Fundamental Rights is **void** to the extent of inconsistency (*Doctrine of Severability* & *Doctrine of Eclipse*). Under *Kesavananda Bharati (1973)*, a Constitutional Amendment under Art. 368 can be struck down if it violates the **Basic Structure**.

---

## 2. The Six Pillars of Fundamental Rights

1. **Right to Equality (Articles 14–18):**
   - **Art. 14:** *Equality before Law* (British negative concept — Rule of Law) + *Equal Protection of Laws* (American positive concept — reasonable classification, non-arbitrariness under *E.P. Royappa*).
   - **Art. 15 & 16:** Prohibition of discrimination & equality of opportunity in public employment (including 103rd Amendment EWS quota upheld in *Janhit Abhiyan*).
   - **Art. 17 & 18:** Abolition of Untouchability (absolute right!) and Abolition of Titles.
2. **Right to Freedom (Articles 19–22):**
   - **Art. 19(1)(a)–(g):** Six democratic freedoms subject *only* to explicit reasonable restrictions in Art. 19(2)–(6).
   - **Art. 20:** Protection against *ex-post-facto* criminal law, *double jeopardy*, and *self-incrimination*.
   - **Art. 21:** Protection of Life & Personal Liberty — transformed by *Maneka Gandhi (1978)* from narrow *"procedure established by law"* into substantive **fair, just, and reasonable due process** (incorporating Privacy under *Puttaswamy 2017*, Clean Environment, Legal Aid, and Dignity).
   - **Art. 21A:** Free & compulsory education (ages 6–14, 86th Amendment, 2002).
3. **Right Against Exploitation (Articles 23–24):** Prohibits *begar*/human trafficking and hazardous child labour below 14.
4. **Right to Freedom of Religion (Articles 25–28):** Individual conscience (Art. 25, subject to public order, morality, health *and* other FRs!) + denominational management (Art. 26).
5. **Cultural & Educational Rights (Articles 29–30):** Protection of distinct language/script/culture & right of religious/linguistic minorities to establish and administer educational institutions.
6. **Right to Constitutional Remedies (Article 32):** Called the *"Heart and Soul of the Constitution"* by Dr. B.R. Ambedkar — empowers the Supreme Court to issue **5 Writs**: *Habeas Corpus, Mandamus, Prohibition, Certiorari,* and *Quo-Warranto*.

---

## 3. High-Yield UPSC Prelims Trap Check
- **Rights available ONLY to Citizens (NOT Foreigners):** **Articles 15, 16, 19, 29, and 30** *(Mnemonic: 15-16-19-29-30)*.
- **Rights never suspended even during National Emergency (Art. 359, 44th Amendment):** **Articles 20 and 21**!`,
  },
  {
    slug: "transformer-attention",
    title: "How Transformer Attention Works",
    subject: "Computer Science",
    language: "en-US",
    languageBadge: "English • AI & CS",
    level: "Intermediate",
    badge: "AI Architecture",
    content: `# How Transformer Self-Attention Works

Before 2017 (*"Attention Is All You Need"*, Vaswani et al.), sequence models like RNNs and LSTMs read words strictly one-by-one from left to right — creating a severe bottleneck over long sentences. **Self-Attention** lets every token attend directly to every other token in $O(1)$ sequential path length!

---

## 1. Queries ($Q$), Keys ($K$), and Values ($V$)

Think of a smart university library lookup for each token embedding $x_i \\in \\mathbb{R}^{d_{\\text{model}}}$:
- **Query ($q_i = x_i W_Q$):** *"What information am I looking for?"*
- **Key ($k_j = x_j W_K$):** *"What label describes what I contain?"*
- **Value ($v_j = x_j W_V$):** *"What actual payload do I pass forward if selected?"*

Packing all $n$ tokens into matrices $Q, K \\in \\mathbb{R}^{n \\times d_k}$ and $V \\in \\mathbb{R}^{n \\times d_v}$, the **Scaled Dot-Product Attention** equation is:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

---

## 2. Why Divide by $\\sqrt{d_k}$? (Crucial Interview Derivation!)

Suppose components of $q$ and $k$ are independent random variables with mean $0$ and variance $1$. Then their dot product $q \\cdot k = \\sum_{m=1}^{d_k} q_m k_m$ has:
- **Mean:** $0$
- **Variance:** $d_k$ (standard deviation $\\sqrt{d_k}$!)

When $d_k$ is large (e.g., $d_k = 64$ or $128$), unscaled dot products grow large in magnitude, pushing $\\text{softmax}$ into regions with **vanishingly tiny gradients** ($\\approx 0$). Dividing by $\\sqrt{d_k}$ restores unit variance ($\\text{Var} = 1$), keeping gradients healthy!

---

## 3. Multi-Head Attention

Instead of computing one single attention map, we project into $h$ parallel subspaces ("heads"):

$$\\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W_O$$

- Head 1 might track **pronoun resolution** (*"it"* $\\to$ *"blackboard"*),
- Head 2 tracks **verb-object syntax**, and
- Head 3 tracks **mathematical variable scope**!`,
  },
  {
    slug: "hindi-ohms-law",
    title: "विद्युत धारा और ओम का नियम (Ohm's Law in Hindi)",
    subject: "भौतिक विज्ञान (Physics)",
    language: "hi-IN",
    languageBadge: "हिन्दी • Hindi",
    level: "Intermediate",
    badge: "हिन्दी माध्यम डेमो",
    content: `# विद्युत धारा और ओम का नियम (Ohm's Law & Electric Current)

नमस्ते विद्यार्थियों! आज हम बोर्ड परीक्षा (CBSE / State Boards) और प्रतियोगी परीक्षाओं के सबसे महत्वपूर्ण अध्याय **विद्युत धारा (Electric Current)** और **ओम के नियम (Ohm's Law)** को श्यामपट्ट (Blackboard) पर चरण-दर-चरण समझेंगे।

---

## 1. विद्युत धारा (Electric Current) की परिभाषा

किसी चालक (Conductor) के अनुप्रस्थ काट से प्रति एकांक समय में प्रवाहित होने वाले विद्युत आवेश ($Q$) की दर को **विद्युत धारा ($I$)** कहते हैं:

$$I = \\frac{Q}{t} = \\frac{n \\cdot e}{t}$$

- यहाँ $Q$ = कुल आवेश (कूलाम्ब $\\text{C}$ में), $t$ = समय (सेकंड $\\text{s}$ में), और $e = 1.6 \\times 10^{-19}\\,\\text{C}$ है।
- विद्युत धारा का SI मात्रक **एम्पियर (Ampere, $\\text{A}$)** होता है।

---

## 2. ओम का नियम (Ohm's Law — 1827)

जॉर्ज साइमन ओम के अनुसार, **यदि किसी चालक की भौतिक अवस्थाएँ (जैसे ताप, दाब, लंबाई) अपरिवर्तित रहें**, तो उसके सिरों के बीच लगाया गया विभवांतर ($V$) उसमें प्रवाहित विद्युत धारा ($I$) के समानुपाती होता है:

$$V \\propto I \\implies V = I \\cdot R$$

यहाँ $R$ एक नियतांक है जिसे चालक का **विद्युत प्रतिरोध (Electrical Resistance)** कहते हैं। इसका मात्रक **ओम ($\\Omega$)** है।

---

## 3. प्रतिरोध किन कारकों पर निर्भर करता है?

किसी तार का प्रतिरोध ($R$) उसकी लंबाई ($L$) के समानुपाती तथा अनुप्रस्थ काट के क्षेत्रफल ($A$) के व्युत्क्रमानुपाती होता है:

$$R = \\rho \\frac{L}{A}$$

जहाँ $\\rho$ (रो) पदार्थ की **प्रतिरोधकता (Resistivity)** है, जिसका मात्रक $\\Omega\\cdot\\text{m}$ है।

---

## 4. बोर्ड परीक्षा के लिए हल किया गया प्रश्न (Worked Numerical)

**प्रश्न:** यदि $12\\,\\text{V}$ की बैटरी को $4\\,\\Omega$ प्रतिरोध वाले बल्ब से जोड़ा जाए, तो परिपथ में कितनी धारा बहेगी और $10\\,\\text{s}$ में कितनी ऊष्मा उत्पन्न होगी?

**हल:**
1. ओम के नियम से धारा:
   $$I = \\frac{V}{R} = \\frac{12}{4} = 3\\,\\text{A}$$
2. जूल के तापन नियम ($H = I^2 R t$) से ऊष्मा:
   $$H = (3)^2 \\times 4 \\times 10 = 9 \\times 40 = 360\\,\\text{J}$$

**उत्तर:** परिपथ में $3\\,\\text{A}$ धारा प्रवाहित होगी तथा $360\\,\\text{J}$ ऊष्मा उत्पन्न होगी!`,
  },
  {
    slug: "odia-newtons-laws",
    title: "ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ (Newton's Laws in Odia)",
    subject: "ପଦାର୍ଥ ବିଜ୍ଞାନ (Physics)",
    language: "or-IN",
    languageBadge: "ଓଡ଼ିଆ • Odia",
    level: "Intermediate",
    badge: "ଓଡ଼ିଆ ଭାଷା କ୍ଲାସ୍",
    content: `# ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ (Newton's Laws of Motion)

ନମସ୍କାର ଛାତ୍ରଛାତ୍ରୀମାନେ! ଆଜି ଆମେ ପଦାର୍ଥ ବିଜ୍ଞାନର ସବୁଠାରୁ ମୂଳ ଓ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଅଧ୍ୟାୟ **ସାର୍ ଆଇଜାକ୍ ନିଉଟନ୍‌ଙ୍କ ତିନୋଟି ଗତି ନିୟମ**କୁ ବ୍ଲାକବୋର୍ଡରେ ଅତି ସହଜ ଓଡ଼ିଆ ଭାଷାରେ ବୁଝିବା।

---

## ୧. ନିଉଟନ୍‌ଙ୍କ ପ୍ରଥମ ଗତି ନିୟମ (ଜଡ଼ତା ନିୟମ — Law of Inertia)

କୌଣସି ବସ୍ତୁ ଉପରେ ବାହ୍ୟ ଅସନ୍ତୁଳିତ ବଳ ($F_{\\text{net}}$) ପ୍ରୟୋଗ ନ ହେলে, ସ୍ଥିର ବସ୍ତୁ ଚିରକାଳ ସ୍ଥିର ରହେ ଏବଂ ସମବେଗରେ ଗତିଶୀଳ ବସ୍ତୁ ସରଳରେଖାରେ ସେହି ସମବେଗରେ ଗତି କରୁଥାଏ:

$$\\sum \\vec{F} = 0 \\implies \\vec{v} = \\text{ସ୍ଥିରାଙ୍କ (Constant)}$$

- **ଉଦାହରଣ:** ଚଳନ୍ତା ବସ୍ ହଠାତ୍ ବ୍ରେକ୍ ମାରିଲେ ଯାତ୍ରୀମାନେ ଆଗକୁ ଝୁଙ୍କି ପଡ଼ନ୍ତି — ଏହା **ଗତି ଜଡ଼ତା (Inertia of Motion)** ଯୋଗୁଁ ହୁଏ।

---

## ୨. ନିଉଟନ୍‌ଙ୍କ ଦ୍ୱିତୀୟ ଗତି ନିୟମ (ବଳ ଓ ସଂବେଗ — $F = ma$)

କୌଣସି ବସ୍ତୁର ସଂବେଗ ($\vec{p} = m\vec{v}$) ପରିବର୍ତ୍ତନର ହାର ତାହା ଉପରେ ପ୍ରୟୋଗ ହୋଇଥିବା ବାହ୍ୟ ବଳ ($\vec{F}$) ସହିତ ସମାନୁପାତୀ ଅଟେ:

$$\\vec{F} = \\frac{d\\vec{p}}{dt} = m \\frac{d\\vec{v}}{dt} = m\\vec{a}$$

- ଏଠାରେ $m$ = ବସ୍ତୁର ବସ୍ତୁତ୍ୱ ($\text{kg}$), $\vec{a}$ = ତ୍ୱରଣ ($\text{m/s}^2$), ଏବଂ ବଳର SI ଏକକ **ନିଉଟନ୍ ($\text{N}$)** ଅଟେ।

---

## ୩. ନିଉଟନ୍‌ଙ୍କ ତୃତୀୟ ଗତି ନିୟମ (କ୍ରିୟା ଓ ପ୍ରତିକ୍ରିୟା)

**ପ୍ରତ୍ୟେକ କ୍ରିୟାର ଏକ ସମାନ ଓ ବିପରୀତମୁଖୀ ପ୍ରତିକ୍ରିୟା ଥାଏ:**

$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$

- ରକେଟ୍ ମହାକାଶକୁ ଉଡ଼ିବା ନିଉଟନ୍‌ଙ୍କ ତୃତୀୟ ନିୟମ ଓ ସଂବେଗ ସଂରକ୍ଷଣ ନିୟମ ଉପରେ ଆଧାରିତ!

---

## ୪. ପରୀକ୍ଷା ପାଇଁ ଗାଣିତିକ ପ୍ରଶ୍ନ (Solved Numerical)

**ପ୍ରଶ୍ନ:** $5\\,\\text{kg}$ ବସ୍ତୁତ୍ୱ ବିଶିଷ୍ଟ ଏକ ବସ୍ତୁ ଉପରେ $20\\,\\text{N}$ ବଳ ପ୍ରୟୋଗ କଲେ ଏହାର ତ୍ୱରଣ କେତେ ହେବ?

**ସମାଧାନ:**
$$a = \\frac{F}{m} = \\frac{20}{5} = 4\\,\\text{m/s}^2$$

**ଉତ୍ତର:** ବସ୍ତୁଟିର ତ୍ୱରଣ $4\\,\\text{m/s}^2$ ହେବ!`,
  },
];

export function findShowcaseLecture(
  topic: string,
  language?: string
): ShowcaseLecture | null {
  const normTopic = String(topic || "")
    .trim()
    .toLowerCase();
  if (!normTopic) return null;

  for (const item of SHOWCASE_LECTURES) {
    const itemTitle = item.title.toLowerCase();
    if (
      normTopic === itemTitle ||
      normTopic === item.slug ||
      (normTopic.length >= 14 && itemTitle.includes(normTopic)) ||
      (itemTitle.length >= 14 && normTopic.includes(itemTitle))
    ) {
      if (
        !language ||
        language.toLowerCase().startsWith(item.language.slice(0, 2).toLowerCase()) ||
        item.language === "en-US"
      ) {
        return item;
      }
      return item;
    }
  }
  return null;
}
