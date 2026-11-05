import { pageNo } from "@/lib/pages";
import { Domain } from "@/lib/client";

export interface DomainPageData {
  pageNumber: number;
  domainCode: Domain;
  mastheadLabel: string;
  headline: string;
  deck: string;
  image: string;
  imageWidth: string;
  caption: string;
  skillsBoxHeader: string;
  skills: string[];
  dropcap: string;
  col1_p1: string;
  col1_p2?: string;
  col2_p1: string;
  col2_p2?: string;
  quoteStrip: string;
  wantedHeadline: string;
  wantedTagline: string;
  footerCentre: string;
  // Compatibility fields
  topLeft?: string;
  name?: string;
  p1?: string;
  p2?: string;
  posterHeadline?: string;
  posterBlurb?: string;
}

export const DOMAIN_PAGES_DATA: DomainPageData[] = [
  {
    pageNumber: pageNo("editorial"),
    domainCode: "EDITORIAL",
    mastheadLabel: "EDITORIAL & DISPATCHES DESK",
    headline: "THE WRITTEN VOICE OF THE CLUB",
    deck: "From official institutional declarations and circulars to tech blogs, newsletters, micro-copy, and annual reports.",
    image: "/images/editorial-1.png",
    imageWidth: "22cqw",
    caption: "From rough drafts to published ink: Maintaining editorial precision and voice across the entire club",
    skillsBoxHeader: "✦ KEY RESPONSIBILITIES ✦",
    skills: [
      "Official Releases: Circulars, event invites & formal correspondence",
      "Publications: Periodic newsletters, tech blogs & the annual report",
      "Interactive Columns: Weekly tech trivia & thematic literary segments",
      "Micro-Copy: Polishing website text, poster headings & social captions",
      "Editorial Quality: Diligent proofreading, fact-checking & copy-editing",
    ],
    dropcap: "E",
    col1_p1: "very TAM initiative, workshop, and milestone depends on clear language to reach the world. The Editorial Desk is the club’s institutional voice, drafting announcements, circulars, press releases, and invitations for internal and external events, always in an articulate, authoritative and professional tone.",
    col1_p2: "Beyond formal dispatches, we create the reading material that keeps our community engaged: tech blogs, analytical articles, member features, periodic newsletters, and interactive segments from weekly AI trivia and caption challenges to literary columns.",
    col2_p1: "Our desk is both a creative studio and a quality gate. We author the annual news report, turning project outcomes, hackathon retrospectives, and milestones into structured overviews for faculty, sponsors, and students.",
    col2_p2: "Day to day, we work alongside the Design and PR desks to keep the club’s style consistent, auditing flyer copy, sharpening website text, polishing social captions, and fact-checking every public release. If you have a keen eye for grammar, love structuring compelling narratives, and value editorial integrity, your seat at the desk is ready.",
    quoteStrip: "✦ WORDS SHAPE PERCEPTION: WE SAFEGUARD CLARITY, TONE, AND FACTUAL TRUTH ✦",
    wantedHeadline: "WANTED: EDITORS, COPYWRITERS & CHRONICLERS",
    wantedTagline: "Bring sample essays, articles, or previous editorial drafts. Attention to detail and a passion for clear writing come first.",
    footerCentre: "EDITORIAL & DISPATCHES DESK",
    topLeft: "EDITORIAL & DISPATCHES DESK",
    name: "EDITORIAL",
    p1: "Every TAM initiative, workshop, and milestone depends on clear language to reach the world.",
    p2: "Beyond formal dispatches, we create the reading material that keeps our community engaged.",
  },
  {
    pageNumber: pageNo("design"),
    domainCode: "DESIGN",
    mastheadLabel: "SECTION: DESIGN & VISUAL MEDIA",
    headline: "CRAFTING OUR COMPLETE VISUAL IDENTITY",
    deck: "From digital feeds, posters, and short-form reels to immersive event decor, expo stalls, and official club merchandise.",
    image: "/images/design-2.png",
    imageWidth: "22cqw",
    caption: "From vector boards to spatial setups: Giving shape, texture, and character to everything the club presents.",
    skillsBoxHeader: "✦ WHAT WE SHAPE ✦",
    skills: [
      "Overall Identity: Color palettes, typographic balance & brand standards",
      "Graphic Design: Standout event posters, digital notices & collaterals",
      "Social Media Content: High-engagement carousels, layouts & dynamic reels",
      "Physical & Spatial: Stage backdrops, themed props & room ambiance",
      "Expos & Stalls: Interactive booth setups, banners & exhibition decor",
      "Official Merch: Badges, hoodies, stickers, lanyards & collectibles",
    ],
    dropcap: "E",
    col1_p1: "very encounter someone has with our club begins with what they see. The Design desk originates and safeguards TAM’s visual identity across every medium, defining the aesthetic ecosystem that makes the club instantly recognizable by blending modern technical sensibilities with clean, intentional art direction.",
    col1_p2: "Digitally, we drive the club’s public face: eye-catching event posters, engaging social media carousels, and the visual assets and motion pacing behind our short-form reels, all designed to make complex ideas look inviting, modern, and distinct.",
    col2_p1: "Our scope extends well beyond the screen. When expos, symposiums, and hackathons arrive, we take over physical spaces, building stage backdrops, room decor, interactive props, and exhibition stalls that draw crowds across campus halls.",
    col2_p2: "We also design the official merchandise, from hoodies, badges, and lanyards to die-cut stickers that members carry long after an event ends. Whether your craft lives in Figma, Illustrator, motion suites, or hands-on structural decor, there is space here to build work people remember.",
    quoteStrip: "✦ FROM DIGITAL PIXELS TO PHYSICAL STAGES: WE DEFINE HOW THE CAMPUS SEES TAM ✦",
    wantedHeadline: "WANTED: GRAPHIC, MOTION & SPATIAL DESIGNERS",
    wantedTagline: "Bring your posters, UI concepts, reel edits, or physical craft projects. Creativity and attention to detail come first.",
    footerCentre: "DESIGN & CREATIVE STUDIO",
    topLeft: "SECTION: DESIGN & VISUAL MEDIA",
    name: "DESIGN",
    p1: "Every encounter someone has with our club begins with what they see. The Design desk originates and safeguards TAM’s visual identity across every medium.",
    p2: "Digitally, we drive the club’s public face: eye-catching event posters, engaging social media carousels, and the visual assets behind our short-form reels.",
  },
  {
    pageNumber: pageNo("marketing"),
    domainCode: "MARKETING",
    mastheadLabel: "SECTION: MARKETING & OUTREACH",
    headline: "CONNECTING THE CLUB TO CAMPUS",
    deck: "From viral trends, short-form reels, and campaign rollouts to on-ground event coverage and behind-the-scenes stories.",
    image: "/images/marketing-1.png",
    imageWidth: "22cqw",
    caption: "Behind the lens and on the feed: Planning campaigns, capturing event energy, and keeping the campus hooked.",
    skillsBoxHeader: "✦ WHAT WE EXECUTE ✦",
    skills: [
      "Social Channels: Engaging feed posts, interactive stories & announcements",
      "Video Production: Filming, directing & editing dynamic reels",
      "Campaign Strategy: Rollouts for hackathons, workshops & recruitments",
      "Event Coverage: Photography, live updates & behind-the-scenes footage",
      "Trend Adaptation: Tapping campus culture & digital trends for tech",
      "Creative Synergy: Teaming with Design & Editorial for cohesive rollouts",
    ],
    dropcap: "A",
    col1_p1: "brilliant workshop, open-source project, or national hackathon only makes an impact when people know about it, show up, and follow along. The Marketing desk is TAM’s creative loudspeaker, planning, filming, and publishing the content on our digital channels and turning club initiatives into engaging stories and shareable reels that resonate across campus.",
    col1_p2: "Our work starts at the brainstorming table, finding relatable angles that bring technical concepts and club life to an everyday audience. We adapt fast-moving internet trends to our campus, script concepts, get behind the camera, and edit snappy video that stops people mid-scroll.",
    col2_p1: "When flagship events and multi-day workshops arrive, we run complete multi-phase campaigns: building anticipation before launch, covering the action with live photography and behind-the-scenes footage, and delivering highlight recaps afterwards.",
    col2_p2: "We work in lockstep with Design and Editorial, pairing crisp copy and striking visuals with the right timing and distribution. If you understand what makes an audience engage, love experimenting with cameras and video editors, or have an instinct for digital campaigns, grab your director's slate and join our outreach team.",
    quoteStrip: "✦ GREAT INITIATIVES DESERVE AN AUDIENCE: WE BRING STORIES TO THE FEED ✦",
    wantedHeadline: "WANTED: CONTENT CREATORS, FILMMAKERS & CAMPAIGN LEADS",
    wantedTagline: "Bring your reel concepts, video edits, social pages, or outreach ideas. A sharp creative instinct matters most.",
    footerCentre: "MEDIA & COMMUNICATIONS DESK",
    topLeft: "SECTION: MARKETING & OUTREACH",
    name: "MARKETING",
    p1: "The Marketing desk is TAM’s creative loudspeaker, planning, filming, and publishing content on our digital channels.",
    p2: "We adapt fast-moving internet trends to our campus, script concepts, get behind the camera, and edit snappy video.",
  },
  {
    pageNumber: pageNo("research"),
    domainCode: "R_AND_D",
    mastheadLabel: "SECTION: RESEARCH & DEVELOPMENT",
    headline: "DEEP CONCEPTS, PRACTICAL INQUIRY",
    deck: "Bridging core machine intelligence with disciplines across campus—from published papers to weekly open debates.",
    image: "/images/research-4.png",
    imageWidth: "22cqw",
    caption: "Beyond the surface: Dissecting new model breakthroughs, paper drafts, and interdisciplinary data.",
    skillsBoxHeader: "✦ WHAT WE PURSUE ✦",
    skills: [
      "Interdisciplinary ML: Applying AI across CSE, ECE, Mech & beyond",
      "The Publication Cycle: Literature review, methodology & journal writing",
      "Trend Tracking: Monitoring cutting-edge models, repos & papers",
      "Weekly Circles: Paper discussions, video breakdowns & open debates",
      "Mathematical Foundations: Architectures, loss curves & benchmarks",
    ],
    dropcap: "A",
    col1_p1: "rtificial intelligence does not live in an academic vacuum, nor is it only for computer scientists. TAM’s Research & Development wing has a twofold focus: a principled understanding of AI-ML fundamentals, and applying that toolkit to whatever discipline you come from, whether Mechanical, ECE, Biotech, or Computing.",
    col1_p2: "As the club’s core research division, we are the team’s radar, scouting the frontier for new models, libraries, and open breakthroughs so every TAM project is built with current methods.",
    col2_p1: "At the heart of the division is the R&D Publication Cycle. Members are mentored to pick a focused research topic they genuinely care about, design rigorous experiments, and write papers for reputable journals and conferences.",
    col2_p2: "Learning here is active and collaborative. Every week we hold open discussion circles on everything from dense arXiv papers to tech breakdowns and video essays. If you like asking why systems work and want to take ideas from theory to published print, take a seat at the research desk.",
    quoteStrip: "✦ NO DISCIPLINE IS OFF-LIMITS: WE TURN INTELLECTUAL CURIOSITY INTO PEER-REVIEWED FACT ✦",
    wantedHeadline: "WANTED: RESEARCHERS & PROBLEM SOLVERS",
    wantedTagline: "Open to all engineering branches. Bring your curiosity, favorite research questions, or papers you’ve read.",
    footerCentre: "RESEARCH & EXPERIMENTATION LAB",
    topLeft: "LABORATORY OF INQUIRY",
    name: "RESEARCH",
    p1: "TAM’s Research & Development wing has a twofold focus: a principled understanding of AI-ML fundamentals, and applying that toolkit to whatever discipline you come from.",
    p2: "Learning here is active and collaborative. Every week we hold open discussion circles on everything from dense arXiv papers to tech breakdowns.",
  },
  {
    pageNumber: pageNo("management"),
    domainCode: "MANAGEMENT",
    mastheadLabel: "SECTION: MANAGEMENT & OPERATIONS",
    headline: "THE ENGINES OF EXECUTION",
    deck: "Directing campus-scale logistics, orchestrating premier symposia, and maintaining institutional momentum with steadfast composure.",
    image: "/images/management-2.png",
    imageWidth: "22cqw",
    caption: "Executive operations: precision planning, venue coordination, and steadfast timelines.",
    skillsBoxHeader: "✦ WHAT WE ORCHESTRATE ✦",
    skills: [
      "Event Production: Campus-scale hackathons, symposia & tech summits",
      "Venue Logistics: Space coordination, AV staging & crowd navigation",
      "Financial Stewardship: Budget tracking, procurement & sponsor grants",
      "Timeline Discipline: Milestone schedules & strict ground execution",
      "Crisis Management: Rapid problem-solving & calm triage under pressure",
      "Cross-Cadre Synergy: Aligning technical, design & outreach teams",
    ],
    dropcap: "B",
    col1_p1: "ehind every seamless symposium, hackathon, and technical workshop lies a network of meticulous logistics and decisive leadership. The Management council governs venue coordination, financial budgets, corporate partnerships, and cross-cadre synchronization across the entire club, translating ambitious ideas into clockwork reality.",
    col1_p2: "We command the operational heartbeat of TAM, aligning project schedules, negotiating institutional permissions, and ensuring every initiative advances from planning spreadsheets to flawless physical execution on campus halls.",
    col2_p1: "When flagship gatherings and 36-hour hackathons go live, our organizers manage the ground: coordinating backstage flows, monitoring timelines, and resolving unexpected bottlenecks calmly before they impact attendees.",
    col2_p2: "Beyond single events, we safeguard the club’s long-term momentum through structured resource tracking and sponsor stewardship. If you possess composure amid chaos, love structured execution, and lead with clarity, take your seat at the operations desk.",
    quoteStrip: "✦ MASTER LOGISTICS, AND AMBITIOUS INVENTIONS TRANSLATE INTO UNSTOPPABLE MOMENTUM ✦",
    wantedHeadline: "WANTED: ORGANISERS & OPERATIONS MANAGERS",
    wantedTagline: "Run campus-scale events, lead teams, and keep the club moving. Composure and structured thinking come first.",
    footerCentre: "OPERATIONS DESK",
    topLeft: "SECTION: MANAGEMENT & OPERATIONS",
    name: "MANAGEMENT",
    p1: "Behind every seamless symposium, hackathon, and technical workshop lies a network of meticulous logistics and decisive leadership. The Management council governs venue coordination, financial budgets, corporate partnerships, and cross-cadre synchronization across the entire club.",
    p2: "When flagship gatherings and 36-hour hackathons go live, our organizers manage the ground with composure, translating ambitious ideas into clockwork execution.",
  },
  {
    pageNumber: pageNo("tech"),
    domainCode: "TECHNICAL",
    mastheadLabel: "SECTION: TECH & APPLIED PROJECTS",
    headline: "BUILDING, INTEGRATING & DEPLOYING TECH",
    deck: "From collaborative club builds and cross-domain integration to tech expos, external competitions, and open technical debates.",
    image: "/images/tech-3.png",
    imageWidth: "22cqw",
    caption: "From local terminals to live show floors: Engineering tools, sharing ideas, and representing the club's code in public.",
    skillsBoxHeader: "✦ WHAT WE PURSUE ✦",
    skills: [
      "Collaborative Builds: Shipping flagship web apps, tools & internal systems",
      "Cross-Domain Integration: Embedding tech into design, editorial & management",
      "External Representation: Competitive hackathons, tech summits & symposiums",
      "Expos & Showcases: Live interactive booths, demos & hardware-software setups",
      "Modern Stacks & AI: Web dev, game engines, daily-use tools & accessible AI",
      "Open Technical Forums: Debating new architectures, emerging stacks & trends",
    ],
    dropcap: "E",
    col1_p1: "ngineering at TAM is not about writing code in private; it is about collective development, crossing disciplinary borders, and shipping systems that work in the wild. The Technical & Projects division turns ideas into functional, scalable software, leading collaborative builds from multi-stack web platforms and game-engine experiments to everyday utilities that make AI accessible to ordinary users.",
    col1_p2: "Technology should not stay trapped in one engineering silo. Our members bring technical workflows into every other wing of the club, helping design build interactive 3D web canvases, giving editorial automated pipelines, and arming operations with custom management portals. When every domain has a technical edge, the whole club moves faster.",
    col2_p1: "Beyond code, we believe in open dialogue. Regular roundtables dissect emerging technologies, question mainstream AI narratives, and evaluate new frameworks before they enter our stack, cutting through hype to see how tools perform at the core.",
    col2_p2: "When projects reach deployment, we take them public: representing TAM at national hackathons, staging live demos at tech expos, and competing on collegiate stages. If you love building real software with a committed team, want to represent the club on competitive show floors, and enjoy debating the future of tech, our lab is open.",
    quoteStrip: "✦ WRITE SOLID CODE. EXPAND EVERY DOMAIN. PROVE IT ON THE EXPO FLOOR. ✦",
    wantedHeadline: "WANTED: SOFTWARE ENGINEERS, TINKERERS & TECH DELEGATES",
    wantedTagline: "Bring your repositories, game builds, web prototypes, or passion for new frameworks. Practical curiosity comes first.",
    footerCentre: "ENGINEERING DIVISION",
    topLeft: "SECTION: TECH & APPLIED PROJECTS",
    name: "TECHNICAL",
    p1: "Engineering at TAM is not about writing code in private; it is about collective development, crossing disciplinary borders, and shipping systems that work in the wild.",
    p2: "When projects reach deployment, we take them public: representing TAM at national hackathons, staging live demos at tech expos, and competing on collegiate stages.",
  },
];

export const THANK_YOU_DATA = {
  topLeft: "THE TAM TIMES",
  topCenter: "FINAL EDITION NOTICE",
  kicker: "A NOTE FROM THE EDITORS",
  headline: "THANK YOU FOR READING",
  deck: "Whether you are applying today or just browsing the pages, we are glad you stopped by.",
  image: "/images/marketing-2.png",
  caption: "Everyone who reads, asks, builds, or simply shows up makes this club what it is.",
  dropcap: "W",
  p1: "hether you read every page or only skimmed the headlines, thank you for spending a few minutes with The TAM Times. This little paper is our way of showing what The AI & ML Club is about: curious people, honest effort, and a belief that learning is better when it is shared.",
  p2: `If something here caught your eye, there is a place for you at TAM. Fill out your dispatch sheet on Page ${pageNo("coupon")} before applications close on Sunday at 11:59 PM. And if you are not ready yet, that is perfectly fine. Follow our work, come to our workshops, and ask us anything.`,
  signOff: "— The Editors, The AI & ML Club, VIT Vellore",
  quoteStrip: "✦ IT’S A PLACE FOR EVERYONE TO LEARN ✦",
  footerCentre: "THE AI & ML CLUB · VIT VELLORE",
};
