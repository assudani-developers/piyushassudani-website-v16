// Every fact here comes from Piyush's own words, piyushassudani.in, or the live sites themselves. Nothing invented.

export const PERSON = {
  name: 'Piyush Assudani',
  role: 'Full-Stack Developer',
  company: 'Assudani Group',
  location: 'Balotra, Rajasthan',
  email: 'piyushassudani96@gmail.com',
  phone: '+91 94138 79444',
  whatsapp: 'https://wa.me/919413879444',
  socials: [
    { label: 'GitHub', url: 'https://github.com/PiyushASSUDANI123' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/piyush-assudani96/' },
    { label: 'Instagram', url: 'https://www.instagram.com/piyush_assudani96/' },
    { label: 'Assudani Group', url: 'https://assudanigroup.online' },
  ],
};

/* ---------------- 01 · The story (from Piyush's own notes) ---------------- */

export interface Beat {
  kicker: string;
  title: string;
  body: string[];
  photo?: 'childhood' | 'today';
  figure?: { big: string; small: string };
}

export const STORY: Beat[] = [
  {
    kicker: 'Childhood',
    title: 'Asthma kept me indoors. Devices kept me busy.',
    body: [
      'I had asthma as a kid, so most of my time went to whatever device was in the house. I used new gadgets, opened them up to see how they worked, and tried to make something new out of them.',
      'I also knew early that one day I wanted to build a business of my own.',
    ],
    photo: 'childhood',
  },
  {
    kicker: 'The first client',
    title: 'A portrait painter, and ₹500.',
    body: [
      'I taught myself to build a very basic website from free online resources, put it live, and showed it to everyone I met. Then a portrait painter asked me to build his site. He would pay the third-party costs, and give me a portrait as a gift.',
      'He loved the site. Then the ₹500 took a long time to arrive, and I didn’t know if it ever would. It did. I bought the cheapest domain I could find (about ₹350) and some hosting, and finished at a loss. But I had learned that people pay for this.',
    ],
    figure: { big: '₹500', small: 'My first payment, and my first loss' },
  },
  {
    kicker: 'Door to door',
    title: 'I walked into every shop in Balotra.',
    body: [
      'Balotra didn’t have a culture of business websites, and most people didn’t yet see why they needed one. I went door to door anyway. There isn’t a centre or a shop that looked like it could afford a site where I didn’t walk in and pitch.',
      'I sold five or six websites and made about ₹10,000. When I finally told my parents, they were shocked. They didn’t know anyone paid for this. They didn’t fully believe it either, but they never stood in my way. After that, referrals kept coming.',
    ],
    figure: { big: '₹10k', small: 'From the first 5–6 websites, sold door to door' },
  },
  {
    kicker: 'The Play Store',
    title: '“You won’t be able to build the app.”',
    body: [
      'When I showed my IP teacher what I’d made, he set me a challenge: a real software project, and he said I wouldn’t manage the app part. That hurt my ego, so I started researching. Native Android meant Kotlin or Java, so I learned WebView, which wraps a web app inside an Android app.',
      'I had no international card for the developer account, so I bought it on my brother’s card and verified it in my mother’s name. Atteni, my first app, was rejected 4–5 times. Generating one PDF inside a WebView took seven days of trial and error before a blob download finally worked.',
      'Then Google changed its rules: every new account now needed 12 testers for 14 days. I was stuck again, until a friend introduced me to someone who ran a hardware shop in Balotra and had an old developer console in his name. He gave it to me, and that’s how Atteni and PyPocket went live.',
    ],
    figure: { big: '7 days', small: 'To make one PDF download work inside a WebView' },
  },
  {
    kicker: 'Today',
    title: 'Still in school. Still building.',
    body: [
      'I started in 2023 with simple HTML pages hosted on GitHub, because I didn’t know where else to host. Today I study PCM in Class 12, and I run Assudani Group with more than 50 websites live and 5+ products of my own.',
      'No guide and no shortcuts. Just one more thing figured out every day.',
    ],
    photo: 'today',
  },
];

/* ---------------- 02 · Toolkit ---------------- */

export const TOOLKIT = [
  { area: 'Android apps', note: 'From WebView wrappers to native code, shipped to Google Play.', tools: ['Kotlin', 'Flutter', 'Android Studio'] },
  { area: 'Websites', note: 'Every client site in the gallery below.', tools: ['React.js', 'Next.js', 'JavaScript', 'Tailwind CSS'] },
  { area: 'Backend & data', note: 'Auth, databases and the logic behind the screens.', tools: ['Node.js', 'Firebase', 'Python'] },
  { area: 'Design & the rest', note: 'Design, version control, and what I do for fun.', tools: ['Figma', 'Git & GitHub', 'Kali Linux', 'Arduino C++'] },
];

/* ---------------- 03 · Apps ---------------- */

export interface AppItem {
  id: 'atteni' | 'pypocket' | 'bandhan' | 'next';
  name: string;
  kind: string;
  status: string;
  /** a finished promo poster (used as-is) */
  poster?: string;
  /** a raw phone screenshot (placed inside a designed poster) */
  screen?: string;
  /** poster colours for designed posters */
  tone?: [string, string];
  tagline: string;
  summary: string;
  points: string[];
  gallery?: string[];
  links: { label: string; url: string }[];
}

export const APPS: AppItem[] = [
  {
    id: 'atteni',
    name: 'Atteni',
    kind: 'EdTech · School transport',
    status: 'Live on Google Play',
    screen: '/media/apps/atteni-screen.webp',
    tone: ['#1d4ed8', '#0b1a4a'],
    tagline: 'Smart school-bus tracking and student safety.',
    summary:
      'School transport still runs on paper registers that get lost and tell parents nothing. Atteni replaces them with real-time automation: alerts for parents, digital control for the school, and a faster way for bus staff to mark boarding. It is built for Tier-2 and Tier-3 cities. Atteni was also my first app on the Play Store. It began as a WebView app on local storage, was rejected 4–5 times, and has grown into the Atteni ecosystem.',
    points: ['Live status: school to home', 'Daily attendance and monthly trends', 'Parent app and school web app'],
    links: [
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.piyush.atteni' },
      { label: 'atteni.online', url: 'https://atteni.online' },
    ],
  },
  {
    id: 'pypocket',
    name: 'PyPocket',
    kind: 'EdTech · Learn Python',
    status: 'Live on Google Play + web',
    poster: '/media/apps/pypocket-poster.webp',
    tagline: 'A Python compiler and IDE in your pocket.',
    summary:
      'PyPocket lets you write and run real Python without a PC. On the web it is a free compiler and IDE powered by WebAssembly (Pyodide), with no install and no account. It supports matplotlib, pandas and numpy, and includes a variable inspector and multi-file projects. The Android app teaches Python as a structured learning path (Foundations, key concepts, OOP, async, and future tracks for FastAPI, DSA and AI) with summary notes, practice MCQs and progress for every module.',
    points: ['Structured tracks: Foundations, OOP, Async, DSA, AI', 'Runs Python 3.11 in the browser', 'Notes, MCQs and progress tracking'],
    links: [
      { label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.piyush.pypocket1' },
      { label: 'pypocket.xyz', url: 'https://pypocket.xyz' },
    ],
  },
  {
    id: 'bandhan',
    name: 'Perfect Bandhan',
    kind: 'Matchmaking · Sindhi community',
    status: 'Flagship · Web + App',
    poster: '/media/apps/bandhan-poster.webp',
    tagline: 'Premium matchmaking for the Sindhi community.',
    summary:
      'A private, premium matchmaking platform made only for the Sindhi Samaj. Every profile is checked by an admin and verified with WhatsApp OTP, so there are no fake profiles. The app has no ads, gives members full control over who sees their photos and income details, and charges a one-time registration fee instead of a subscription.',
    points: ['Admin-checked and OTP-verified profiles', 'Privacy controls for photos and income', 'Daily picks, shortlist, chat, bilingual UI'],
    gallery: ['/media/apps/bandhan-promo2.webp', '/media/apps/bandhan-promo4.webp', '/media/apps/bandhan-promo5.webp'],
    links: [{ label: 'perfectbandhan.in', url: 'https://perfectbandhan.in' }],
  },
  {
    id: 'next',
    name: 'Upcoming soon',
    kind: 'In the workshop',
    status: 'Upcoming soon',
    tagline: 'The next app is being built.',
    summary: 'More apps are in the works under Assudani Group. They will show up here first, once they’re live.',
    points: [],
    links: [],
  },
];

/* ---------------- 04 · Client work (summaries written from each live site) ---------------- */

export interface Work {
  id: string;
  name: string;
  category: string;
  place?: string;
  summary: string;
  built: string[];
  url: string;
  image: string;
}

const W = (id: string, name: string, category: string, url: string, summary: string, built: string[], place?: string): Work =>
  ({ id, name, category, url, summary, built, place, image: `/media/work/${id}.webp` });

export const WORK: Work[] = [
  W('mrk', 'MRK Engineers', 'Civil engineering & surveying', 'https://mrkengineers.site',
    'Civil engineering consultants in Balotra, specialising in DGPS surveying, GIS mapping, township planning and architectural consultation. The site presents their engineering services, masterplans, process and site gallery, and leads to a quote request.',
    ['Services & engineering suite', 'Masterplan showcase', 'Gallery & quote request'], 'Balotra'),
  W('novia', 'Novia World', 'D2C kids’ clothing', 'https://noviaworld.com',
    'Storefront for Novia’s Smart Learning Dress, an interactive cotton T-shirt and pyjama set that kids colour in, wash and colour again. The site is built to sell: an offer bar, product highlights, parent trust signals, exchange policy and FAQs.',
    ['Conversion-focused storefront', 'Offer & countdown bar', 'Exchange policy & FAQ']),
  W('aryan', 'Aryan Steel', 'Industrial metals supplier', 'https://aryansteel.online',
    'Importer, stockist and supplier of ferrous and non-ferrous metals in Delhi: stainless steel, carbon steel tubes, alloy steel and industrial raw materials. The site has a visual catalogue, material grades, founders and a direct enquiry form.',
    ['Visual product catalogue', 'Material grades', 'Enquiry form'], 'Delhi'),
  W('surya', 'Surya Steel', 'Stainless steel & alloys', 'https://suryasteel.online',
    'B2B supplier and stockist of stainless steel, alloy steel, seamless pipes, tubes, fittings and sheets. The site is heavy on the industrial look and walks buyers through a complete product range.',
    ['Product range by category', 'Industries served', 'Bold industrial design']),
  W('prowear', 'Prowear', 'Custom sock manufacturing', 'https://prowear.in',
    'A sock manufacturer in Balotra (est. 1995) making India-made custom socks in bulk for schools, corporate brands and retail chains. The site sells low minimum orders, fast delivery and fully customisable designs.',
    ['B2B landing & product range', 'How-it-works flow', 'Start-a-project funnel'], 'Balotra'),
  W('rainbow', 'Rainbow E Smart School', 'School website', 'https://rainbowesmartschoolbalotra.site',
    'An English and Hindi medium school in Balotra. The site covers leadership, academics, facilities, parent reviews and gallery, with an admissions banner for the 2026–27 session.',
    ['Admissions & updates ticker', 'Academics & facilities', 'Parent reviews & gallery'], 'Balotra'),
  W('reds', 'REDS School, Khattu', 'Hindi-first school website', 'https://redsschoolkhattu.site',
    'A primary school in Ramasar Khattu, Balotra, with a website built Hindi-first. It has a notice board, fee information, results, toppers, alumni, an admission form and an English toggle.',
    ['Hindi-first, bilingual', 'Notices, results & toppers', 'Online admission form'], 'Balotra'),
  W('debabrata', 'Debabrata Dey', 'Artist portfolio', 'https://debabratadey.site',
    'Portfolio of a fine artist whose work moves between oil painting and digital design. It covers selected curations, awards, press and works available to collect.',
    ['Gallery-style portfolio', 'Awards & press', 'Collector enquiries']),
  W('amit', 'Amit Vaishnav', 'Video editor portfolio', 'https://amitvaishnav.site',
    'Portfolio for a freelance video editor focused on cinematic storytelling, speed ramping and colour grading. It includes selected works, rates and a booking call-to-action.',
    ['Bold cinematic hero', 'Selected works & rates', 'Booking flow']),
  W('anoop', 'Anoop Kumar', 'Educator profile', 'https://anoopkumar.site',
    'Profile of a mathematics PGT and education administrator with 14+ years of experience. It covers his career timeline, credentials, a visual curriculum and batches for students to join.',
    ['Career timeline', 'Credentials', 'Class batches']),
  W('rakesh', 'Rakesh Deora', 'Digital strategy & AI educator', 'https://rakeshdeora.com',
    'Personal brand for a computer science and AI educator who also works in social media management and digital marketing. It shows expertise, selected work, plans and client voices.',
    ['Editorial personal brand', 'Services & plans', 'Client testimonials']),
  W('nexora', 'NEXORA Balotra', 'Coaching institute', 'https://nexorabalotra.com',
    'An in-person learning space in Balotra that teaches financial wisdom, real-estate knowledge and relationship skills face to face. The site explains the courses, who they’re for and how to join.',
    ['Course pages', 'WhatsApp enquiry', 'Clear join flow'], 'Balotra'),
  W('evora', 'Evora', 'Café & snacks', 'https://evora-website-8xi.pages.dev/',
    'A café-style snack and beverage stall in Balotra. The site shows the menu with prices, its best sellers, the story and where to find it, plus a festive offer pop-up.',
    ['Menu with prices', 'Best sellers', 'Visit & order'], 'Balotra'),
  W('envision', 'EnVision Foundation', 'Youth-led NGO', 'https://envision-ngo-website.pages.dev/',
    'A youth-led non-profit that educates and empowers underprivileged children. The site presents its initiatives, real stories, volunteer and donor sections, and a donation flow.',
    ['Initiatives & impact', 'Get-involved section', 'Donation call-to-action']),
  W('infrabyte', 'Infrabyte Technology', 'Software agency', 'https://infrabytetech.com',
    'Website for a software agency offering custom software, web applications, cybersecurity and digital marketing, built around its tagline “We Listen. We Build. We Deliver.”',
    ['Services & process', 'Tech stack showcase', 'Partner testimonials']),
  W('bishnoi', 'Bishnoi Digital', 'Creative agency', 'https://bishnoidigital.online',
    'A creative agency founded by Rahul Bishnoi, offering website development, video editing, SEO and digital marketing. The site has a services grid, work showcase, founder story and process.',
    ['Services & work', 'Founder section', 'Process & contact']),
  W('abhishek', 'Abhishek Tiwari', 'Student portfolio', 'https://abhishekk.site',
    'A personal site for a student learning to trade and code. It has a trading dashboard section, coding journey, photo album and contact.',
    ['Personal intro', 'Trading dashboard section', 'Album & contact']),
  W('assudanigroup', 'Assudani Group', 'My own company', 'https://assudanigroup.online',
    'The site of my own software and design company, based in Jodhpur and Balotra. It covers our services, our own products (Atteni, PyPocket and Perfect Bandhan), live client work and how a project runs.',
    ['Services & products', 'Live work showcase', 'Project process & FAQ']),
];

/** Every live site from Piyush's list (two domains that no longer resolve are left out). */
export const ALL_SITES: { name: string; url: string }[] = [
  { name: 'MRK Engineers', url: 'https://mrkengineers.site' },
  { name: 'Maya Soft Computer Centre', url: 'https://mayasoftcomputercentre.site' },
  { name: 'Debabrata Dey', url: 'https://debabratadey.site' },
  { name: 'Amit Vaishnav', url: 'https://amitvaishnav.site' },
  { name: 'Anoop Kumar', url: 'https://anoopkumar.site' },
  { name: 'Abhishek Tiwari', url: 'https://abhishekk.site' },
  { name: 'Rakesh Deora', url: 'https://rakeshdeora.com' },
  { name: 'Novia World', url: 'https://noviaworld.com' },
  { name: 'REDS School, Khattu', url: 'https://redsschoolkhattu.site' },
  { name: 'Rainbow E Smart School', url: 'https://rainbowesmartschoolbalotra.site' },
  { name: 'Prowear', url: 'https://prowear.in' },
  { name: 'Aryan Steel', url: 'https://aryansteel.online' },
  { name: 'Assudani Group', url: 'https://assudanigroup.online' },
  { name: 'Surya Steel', url: 'https://suryasteel.online' },
  { name: 'Bishnoi Digital', url: 'https://bishnoidigital.online' },
  { name: 'NEXORA Balotra', url: 'https://nexorabalotra.com' },
  { name: 'Infrabyte Technology', url: 'https://infrabytetech.com' },
  { name: 'EnVision Foundation', url: 'https://envision-ngo-website.pages.dev' },
  { name: 'Evora', url: 'https://evora-website-8xi.pages.dev' },
  { name: 'Perfect Bandhan', url: 'https://perfectbandhan.in' },
  { name: 'Atteni', url: 'https://atteni.online' },
  { name: 'PyPocket', url: 'https://pypocket.xyz' },
];

/* ---------------- 05 · Assudani Group ---------------- */

export const DIVISIONS = [
  { no: '01', name: 'Assudani Developer', kind: 'Engineering', lines: ['Android apps', 'Websites & web apps', 'Backends', 'Play Store publishing'] },
  { no: '02', name: 'Assudani Studio', kind: 'Design & media', lines: ['Graphic design', 'Video editing', 'UI/UX & motion', 'Brand identity'] },
];

/* ---------------- 06 · Words from clients (only names that match real client work) ---------------- */

// Every review published on piyushassudani.in, word for word.
export const TESTIMONIALS = [
  { who: 'MRK Engineers', stars: 5, quote: 'Piyush is a visionary developer. He understood exactly what we needed.' },
  { who: 'Novia World', stars: 5, quote: 'The marketing campaign scaled our brand visibility by 300% in a month.' },
  { who: 'Balotra Computer', stars: 5, quote: 'Incredible turnaround time and flawless code architecture.' },
  { who: 'Vikram Tech', stars: 5, quote: "Assudani Group completely transformed our website's presence." },
  { who: 'Neha Creations', stars: 5, quote: 'Loved the UI/UX design they provided for our e-commerce platform.' },
  { who: 'Rahul S.', stars: 5, quote: 'Amazing app development service. Highly recommended!' },
  { who: 'Maya Soft', stars: 4, quote: 'Excellent support even post-launch. Highly dependable team.' },
  { who: 'Aman D.', stars: 4, quote: 'Best tech solutions in Balotra! Fast, reliable, and professional.' },
];

/* ---------------- About ---------------- */

export const ABOUT = {
  fullName: 'Piyush Chandra Prakash Assudani',
  paragraphs: [
    'I’m Piyush, a full-stack developer from Balotra, a textile town in the Thar desert of Rajasthan. I’m in Class 12 studying PCM, and I run Assudani Group alongside school. That one company builds the websites, Android apps and brand work you’ve seen on this page.',
    'Nobody taught me any of this. I learned by building: first birthday pages hosted on GitHub, then a website for a portrait painter, then shop after shop in Balotra, and then the Play Store. Each project taught me what the last one couldn’t.',
    'What I care about is simple. The site has to load fast, the app has to work on a cheap phone, and the client has to understand what they’re paying for. I do the design, the code, the publishing and the follow-up myself.',
    'Off the clock I’m usually taking things apart: ethical hacking on Kali Linux, or robotics and hardware with Arduino.',
  ],
  facts: [
    ['Full name', 'Piyush Chandra Prakash Assudani'],
    ['Home', 'Balotra, Rajasthan, India'],
    ['Studying', 'Class 12 · PCM · DPS Balotra'],
    ['Founder', 'Assudani Group (Jodhpur & Balotra)'],
    ['Building since', '2023, self-taught'],
    ['Off the clock', 'Kali Linux · Arduino robotics'],
  ] as [string, string][],
  photos: [
    { src: '/media/photos/portrait.webp', cap: 'Balotra, winter' },
    { src: '/media/photos/jacket.webp', cap: 'Lights on' },
    { src: '/media/photos/city.webp', cap: 'Looking out' },
    { src: '/media/photos/palace.webp', cap: 'Rajasthan' },
  ],
};

export const STATS = { sites: '50+', products: '5+', since: '2023' };

export const CHAPTERS = [
  { id: 'home', no: '00', title: 'Home', hi: 'स्वागत' },
  { id: 'story', no: '01', title: 'The story', hi: 'कहानी' },
  { id: 'toolkit', no: '02', title: 'Toolkit', hi: 'औज़ार' },
  { id: 'apps', no: '03', title: 'Apps', hi: 'ऐप्स' },
  { id: 'work', no: '04', title: 'Client work', hi: 'काम' },
  { id: 'group', no: '05', title: 'Assudani Group', hi: 'घराना' },
  { id: 'words', no: '06', title: 'Kind words', hi: 'शब्द' },
  { id: 'about', no: '07', title: 'About me', hi: 'परिचय' },
  { id: 'contact', no: '08', title: 'Contact', hi: 'संपर्क' },
] as const;
