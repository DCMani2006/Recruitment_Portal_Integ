import { Domain } from "@/lib/client";

export interface DomainContent {
  domain: Domain;
  pageNumber: number;
  kicker: string;
  headline: string;
  deck: string;
  leadImage: string;
  imageCaption: string;
  bodyParagraphs: string[];
  wantedSkills: string[];
  testNotice: string;
}

export const EDITION_META = {
  volume: "VOL. I",
  number: "NO. 1",
  price: "FREE OF CHARGE",
  dateLine: "MONDAY, NOVEMBER 2, 2026",
  subTitle: "THE VOICE OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING",
  specialNotice: "OFFICIAL CALL FOR RECRUITS — CANDIDATES INVITED FOR AUTUMN SESSION",
};

export const INDEX_ENTRIES = [
  { domain: "EDITORIAL" as Domain, title: "Editorial & Dispatches", page: 2 },
  { domain: "DESIGN" as Domain, title: "Design & Visual Media", page: 3 },
  { domain: "MARKETING" as Domain, title: "Marketing & Outreach", page: 4 },
  { domain: "R_AND_D" as Domain, title: "Research & Development", page: 5 },
  { domain: "MANAGEMENT" as Domain, title: "Management & Operations", page: 6 },
  { domain: "TECHNICAL" as Domain, title: "Tech & Applied Projects", page: 7 },
];

export const INTRO_PAGE_CONTENT = {
  kicker: "AN EDITORIAL PROCLAMATION",
  headline: "THE CALL TO INTELLECT & EXPERIMENT",
  deck: "TAM opens its doors to freshmen, sophomores, and scholars seeking to advance intelligence.",
  leadImage: "/images/editorial-2.png",
  imageCaption: "TYPESETTING AND MODEL WEIGHTS IN SYNCHRONY.",
  body: [
    "From its founding hours, The AI & ML Club has stood as the foremost guild for computational inquiry and automated reasoning. We operate not as passive observers of machine intellect, but as active architects—training large models, publishing open scholarship, and engineering campus systems.",
    "Induction into our ranks is rigorous yet democratic. Every candidate is evaluated on tenacity, curiosity, and demonstrable craft rather than prior pedigree alone. Choose your discipline, formulate your answers, and seal your dispatch at the Subscriber's Desk.",
  ],
  howToApply: [
    { step: "I", title: "Select Disciplines", desc: "Choose up to six domains reflecting your talents and ambition." },
    { step: "II", title: "Submit Dispatches", desc: "Answer technical and philosophical inquiries at the Subscriber's Desk." },
    { step: "III", title: "Interviews & Selection", desc: "Shortlisted candidates reserve discussion slots for final induction." },
  ],
};

export const DOMAIN_PAGES: DomainContent[] = [
  {
    domain: "DESIGN",
    pageNumber: 3,
    kicker: "BUREAU OF AESTHETICS",
    headline: "CRAFTING THE FORM OF INTELLIGENCE",
    deck: "Bridging human cognition and mathematical apparatus through typography, interface, and print.",
    leadImage: "/images/design-2.png",
    imageCaption: "THE DRAFTING TABLE: BALANCING GRIDS AND PIXELS.",
    bodyParagraphs: [
      "The Design Bureau is charged with rendering complex neural architectures comprehensible and commanding. Designers here shape everything from tactile gazettes and exhibition posters to interactive web canvases and product design.",
      "We seek visual thinkers who respect classical hierarchy while daring to innovate on modern viewports. You will collaborate directly with engineering to forge memorable digital artifacts.",
    ],
    wantedSkills: [
      "Figma & vector typography",
      "Editorial print layouts",
      "Component systems & UI",
      "Motion graphics & branding",
    ],
    testNotice: "Portfolio reviews and design prompts are unlocked upon application at the Desk.",
  },
  {
    domain: "MARKETING",
    pageNumber: 4,
    kicker: "DIVISION OF PUBLICITY",
    headline: "CHAMPIONING THE MACHINE ERA",
    deck: "Broadcasting breakthroughs, staging high-impact symposia, and capturing collective attention.",
    leadImage: "/images/marketing-1.png",
    imageCaption: "THE TELEGRAPH ROOM: TRANSMITTING IDEAS ACROSS CAMPUS.",
    bodyParagraphs: [
      "The Marketing cadre commands the airwaves and print dispatches of TAM. It is not enough to invent; one must summon the campus to engage, debate, and participate in technical discourse.",
      "You will author viral narratives, orchestrate flagship launch events, analyze digital engagement funnels, and represent our work to international collegiate communities.",
    ],
    wantedSkills: [
      "Viral campaign strategy",
      "Data-driven growth metrics",
      "Public relations & copy",
      "Sponsorship negotiation",
    ],
    testNotice: "Campaign scenarios and case prompts will be revealed upon entry to the Desk.",
  },
  {
    domain: "R_AND_D",
    pageNumber: 5,
    kicker: "LABORATORY OF INQUIRY",
    headline: "EXPLORING THE FRONTIERS OF LEARNING",
    deck: "Investigating foundation models, mathematical theorems, and multimodal representations.",
    leadImage: "/images/research-4.png",
    imageCaption: "THE RESEARCH CRUCIBLE: WHERE HYPOTHESES MEET COMPUTE.",
    bodyParagraphs: [
      "Our Research & Development laboratory questions current assumptions in deep learning. Members read foundational literature weekly, replicate benchmark papers, and develop novel architectures for vision and language.",
      "If you relish mathematical rigor, loss landscapes, and empirical experimentation on high-performance compute clusters, your seat awaits among our research fellows.",
    ],
    wantedSkills: [
      "PyTorch & JAX proficiency",
      "Linear algebra & calculus",
      "Paper replication rigor",
      "Statistical evaluation",
    ],
    testNotice: "Theoretical problem sets and paper critique questions are issued at the Desk.",
  },
  {
    domain: "MANAGEMENT",
    pageNumber: 6,
    kicker: "CHAMBERS OF LOGISTICS",
    headline: "THE ENGINE BEHIND THE GUILD",
    deck: "Directing resource allocation, orchestrating major hackathons, and fostering institutional partnerships.",
    leadImage: "/images/management-2.png",
    imageCaption: "EXECUTIVE OPERATIONS: PRECISION AND STEADFAST TIMELINES.",
    bodyParagraphs: [
      "No technological guild thrives without decisive administrative leadership. The Management council oversees venue logistics, industry sponsorships, financial stewardship, and cross-team coordination.",
      "We value leaders who thrive amid chaotic environments, maintain composure under unforgiving deadlines, and convert ambitious visions into flawless logistical execution.",
    ],
    wantedSkills: [
      "Symposium & hackathon ops",
      "Financial budget oversight",
      "Crisis triage & delegation",
      "Corporate liaison mastery",
    ],
    testNotice: "Operational case studies and triage scenarios are answered at the Desk.",
  },
  {
    domain: "EDITORIAL",
    pageNumber: 7,
    kicker: "THE PRINTING PRESS",
    headline: "CHRONICLERS OF ARTIFICIAL THOUGHT",
    deck: "Authoring deep technical treatises, reviewing papers, and curating The TAM Times dispatches.",
    leadImage: "/images/editorial-1.png",
    imageCaption: "THE COMPOSITOR'S SLATE: INKING TRUTH AND INTELLECT.",
    bodyParagraphs: [
      "The Editorial desk is the philosophical conscience of the club. Our writers distill intricate mathematical concepts into lucid, captivating technical prose that both novices and seasoned researchers admire.",
      "From running our blog and investigative interviews to crafting physical print gazettes, editorial fellows preserve our institutional history and shape the intellectual culture of the club.",
    ],
    wantedSkills: [
      "Technical writing precision",
      "Deep literature analysis",
      "Proofreading & line editing",
      "Storytelling & journalism",
    ],
    testNotice: "Editorial prompts and headline editing challenges are presented at the Desk.",
  },
  {
    domain: "TECHNICAL",
    pageNumber: 8,
    kicker: "DEPARTMENT OF SYSTEMS",
    headline: "ENGINEERING REAL-WORLD SCALE",
    deck: "Building resilient distributed backends, ultra-low latency inference, and robust infrastructure.",
    leadImage: "/images/tech-1.png",
    imageCaption: "THE ENGINE HOUSE: SYSTEM DAEMONS RUNNING AT LOW LATENCY.",
    bodyParagraphs: [
      "The Technical division builds the digital backbone supporting all club initiatives. We architect high-concurrency web systems, optimize distributed GPU pipelines, and ship production tools used by thousands.",
      "We seek coders who care deeply about algorithmic speed, reliability, and clean system design. Here, your code is tested in production under actual campus load.",
    ],
    wantedSkills: [
      "TypeScript, Go & Python",
      "High-scale cloud infra & k8s",
      "Distributed model serving",
      "Database schema optimization",
    ],
    testNotice: "System architecture and coding tasks are disclosed at the Subscriber's Desk.",
  },
];

