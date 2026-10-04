export type ResumeEntry = {
  id: string
  period: string
  place: string
  role: string
  points: string[]
  focus: { x: number; y: number; rotation: number }
  mark: string
  logoUrl?: string
}

export type WorkItem = {
  name: string
  meta?: string
  tags?: string[]
  description: string
  link?: string
  coverUrl?: string
  coverFit?: 'contain'
}

export type WorkSection = {
  id: string
  number: string
  title: string
  tagline: string
  coverLabel: string
  coverUrl?: string
  coverFit?: 'contain'
  items: WorkItem[]
  footer?: string
}

export const portfolio = {
  identity: {
    name: 'Vasundhara',
    role: 'FullStack Developer',
    location: 'Hyderabad, India',
    discipline: '',
    intro: "I've rewritten the same button four times because the corner radius felt wrong. It's still not perfect. It's very good though.",
  },
  links: {
    github: 'https://github.com/CocoCodes1518',
    resume: `${import.meta.env.BASE_URL}resume.pdf`,
    socials: [] as { label: string; url: string; mark: string }[],
  },
  resume: [
    {
      id: 'focus-1',
      period: '4 YEARS',
      place: 'NIMS University',
      role: 'B.Tech · Computer Science',
      points: ['I just finished my degree, which taught me how computers think, and I picked up the design part on my own.'],
      focus: { x: 0.02, y: 1.64, rotation: -0.045 },
      mark: '01',
      logoUrl: `${import.meta.env.BASE_URL}assets/Screenshot2026-10-04072457.png`,
    },
    {
      id: 'focus-2',
      period: 'May 2025',
      place: 'Deloitte',
      role: 'Virtual Simulation Intern at Deloitte',
      points: ['A self-paced Deloitte simulation where no one was checking in, so the only deadline was the one I set. I worked through a consulting-style brief and learned to structure a problem before solving it.'],
      focus: { x: -0.82, y: 0.12, rotation: 0.04 },
      mark: '02',
      logoUrl: `${import.meta.env.BASE_URL}assets/deloitte-logo.png`,
    },
    {
      id: 'focus-3',
      period: 'August 2025',
      place: 'CodeAlpha',
      role: 'Virtual Intern at CodeAlpha',
      points: ["Built and shipped hands-on projects through CodeAlpha's virtual program, where the only way forward was to make things work. Less theory, more finished work."],
      focus: { x: 0.72, y: 0.08, rotation: -0.04 },
      mark: '03',
      logoUrl: `${import.meta.env.BASE_URL}assets/code-alpha-logo.png`,
    },
    {
      id: 'focus-4',
      period: 'February 2026- May 2026',
      place: 'GyaanGeeks',
      role: 'Full Stack Developer Intern at GyaanGeeks',
      points: ['Spent three months at GyaanGeeks, where good-looking had to ship on a deadline. Wrote the code, sweated the interface, and got real feedback from people who design for a living.'],
      focus: { x: -0.58, y: -0.58, rotation: 0.045 },
      mark: '04',
      logoUrl: `${import.meta.env.BASE_URL}assets/gyaan-geeks-logo.png`,
    },
    {
      id: 'focus-5',
      period: 'NOW',
      place: 'AWS & serverless',
      role: 'Current focus · Independent work',
      points: ['Now exploring: AWS, serverless, and faster ways to ship good-looking things.'],
      focus: { x: 0.3, y: -0.78, rotation: -0.025 },
      mark: '05',
    },
  ] satisfies ResumeEntry[],
  works: [
    {
      id: 'project-1', number: '01', title: 'Project 1',
      tagline: 'My Portfolio', coverLabel: 'MY PORTFOLIO', coverUrl: `${import.meta.env.BASE_URL}assets/portfolio-cover.png`,
      items: [
        { name: 'My Portfolio', meta: '2026', tags: ['Portfolio'], coverUrl: `${import.meta.env.BASE_URL}assets/portfolio-cover.png`, description: 'A playful developer portfolio built around an interactive 3D character, a scroll-driven résumé timeline, and an editorial Works gallery. It turns my background, experiments, and way of working into a visual, scroll-led experience instead of a traditional static résumé.' },
      ],
    },
    {
      id: 'project-2', number: '02', title: 'Project 2',
      tagline: 'Roam Cafe Finder', coverLabel: 'ROAM CAFE FINDER', coverUrl: `${import.meta.env.BASE_URL}assets/roam-cafe-finder-cover.png`,
      items: [
        { name: 'Roam Cafe Finder', meta: 'JAVASCRIPT / GOOGLE PLACES / OPENSTREETMAP', tags: ['Maps', 'Google Places'], coverUrl: `${import.meta.env.BASE_URL}assets/roam-cafe-finder-cover.png`, description: 'An India-only cafe discovery app that finds real nearby cafes using Google Places data. Search a city, neighborhood, address, or landmark, such as Secunderabad, Telangana, and browse real place names, exact addresses, ratings, review totals, operating hours, phone numbers, photos, and directions. Features: India-only location search using managed Google Geocoding; real Google Places cafe listings tied to Google place IDs; up to 60 nearby cafes per search within an 8 km radius; ratings, review totals, price levels, opening status, addresses, phones, websites, and place photos; an interactive OpenStreetMap basemap with cafe markers and synchronized results; filters for open status, work-friendly, quiet, outdoor, distance, rating, and price level; and an accessible detail modal with a Google place photo, formatted address, open/closed status, day-by-day hours, up to five recent review excerpts with reviewer names, star ratings and relative dates, and directions and save-place actions.' },
      ],
    },
    {
      id: 'project-3', number: '03', title: 'Project 3',
      tagline: 'CloudOrder', coverLabel: 'CLOUDORDER', coverUrl: `${import.meta.env.BASE_URL}assets/cloudorder-cover.png`,
      items: [
        { name: 'CloudOrder', meta: 'HCL / PYTHON / JAVASCRIPT', tags: ['AWS', 'Serverless'], coverUrl: `${import.meta.env.BASE_URL}assets/cloudorder-cover.png`, description: 'CloudOrder is a portfolio project that demonstrates a production-style AWS serverless architecture. Its dashboard simulates API validation, queueing, asynchronous processing, and database storage in the browser so it can be published free of charge without an AWS account. What it shows: a polished operations dashboard, run locally or at a public HTTPS URL after free deployment; an API Gateway + Lambda API with request validation; an SQS queue and DLQ for durable asynchronous processing; and a deployable AWS implementation with idempotent DynamoDB writes and a GET /orders/{order_id} status API, plus EventBridge audit events, a CloudWatch DLQ alarm, scoped IAM, Terraform, tests, and CI.', link: 'https://github.com/CocoCodes1518/cloudorder.git' },
      ],
    },
    {
      id: 'project-4', number: '04', title: 'Project 4',
      tagline: 'CodeAlpha Music Player', coverLabel: 'CODEALPHA MUSIC PLAYER', coverUrl: `${import.meta.env.BASE_URL}assets/music-player-cover.png`, coverFit: 'contain',
      items: [
        { name: 'CodeAlpha Music Player', meta: 'HTML / CSS / JAVASCRIPT', tags: ['Music', 'Interactive'], coverUrl: `${import.meta.env.BASE_URL}assets/music-player-cover.png`, coverFit: 'contain', description: 'A manually listed music player built to showcase how web development tech stack concepts come together in a simulation of a music player. This project is an assignment proposed by CodeAlpha.' },
      ],
    },
  ] satisfies WorkSection[],
  whyNotHire: {
    intro: '',
    items: [
      { title: 'I learn quickly, then ask a hundred questions anyway', note: "I pick things up fast, but I'm never satisfied with 'it works.' I want to know why. If curiosity makes you nervous, don't hire me." },
      { title: 'I actually care about people', note: "I'm sincere to a fault, and I notice when a teammate is stuck or a user is confused. If you want someone who treats empathy as a soft skill, look elsewhere." },
      { title: "I'm a lone wolf, but I'm working on it", note: "I do my best work solo, and I'll put in the hours to prove it. I'm actively learning to bring others along, and I'm getting better at it fast. If you want a perfect team player on day one, I'm not your hire. If you want someone who grows quickly, your competitor will happily take me." },
    ],
    photoUrl: `${import.meta.env.BASE_URL}assets/portrait.jpg`,
  },
  contact: {
    intro: '',
    email: 'pattnayakvasundhara@gmail.com',
    phone: '+91 9226330940',
    location: 'Hyderabad, India',
  },
}
