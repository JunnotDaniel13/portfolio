export const personal = {
  name: 'Jerenason Junnot Daniel',
  email: 'jerenasonjunnot@gmail.com',
  phone: '+261 34 07 677 91',
  phoneHref: '+261340767791',
  address: 'Antananarivo, Madagascar',
  resume: { en: '/Junnot-Daniel-Resume.pdf', fr: '/Junnot-Daniel-CV.pdf' }, // ATS-friendly PDFs built from cv/cv.tex and cv/cv-fr.tex
  source: 'https://github.com/JunnotDaniel13/portfolio',
  social: [
    { label: 'GitHub', href: 'https://github.com/junnot-daniel' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/junnot-daniel' },
    { label: 'X (Twitter)', href: 'https://twitter.com/junnotdaniel' },
    { label: 'Facebook', href: 'https://www.facebook.com/junnot.daniel/' },
  ],
} as const

export const sections = [
  { id: 'work', number: '01' },
  { id: 'experience', number: '02' },
  { id: 'about', number: '03' },
  { id: 'skills', number: '04' },
  { id: 'education', number: '05' },
  { id: 'contact', number: '06' },
] as const

export const projects = [
  {
    id: 'pulse',
    image: 'pulse',
    tools: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Stripe', 'Tailwind CSS'],
    // Only projects with a public URL get a link. The source repository is private, so there is no source link.
    demo: 'https://pulse-dashboard-theta-swart.vercel.app/',
  },
  {
    id: 'financial',
    image: 'financial',
    tools: ['Hono.js', 'TypeScript', 'OpenAI API', 'MongoDB', 'Docker', 'VPS'],
  },
  {
    id: 'travel',
    image: 'travel',
    tools: ['Next.js', 'Tailwind CSS', 'NestJS', 'MySQL', 'AWS S3'],
  },
  {
    id: 'real-estate',
    image: 'real-estate',
    tools: ['React', 'Express', 'TypeScript', 'MongoDB', 'Stripe'],
  },
  {
    id: 'newsroom',
    image: 'newsroom',
    tools: ['Next.js', 'Material UI', 'Redux', 'Sun Editor'],
  },
] as const

export const experiences = [
  { id: 'solar', company: 'Solar Transit Africa Ltd', bullets: 6 },
] as const

export const skillGroups = [
  { id: 'languages', skills: ['TypeScript', 'JavaScript (ES6+)', 'PHP', 'Python', 'HTML5', 'CSS3', 'SQL'] },
  { id: 'frontend', skills: ['React', 'Next.js', 'Angular', 'Tailwind CSS', 'Responsive Design', 'RESTful APIs'] },
  { id: 'backend', skills: ['Node.js', 'Express', 'FastAPI', 'Hono.js', 'Laravel', 'Microservices Architecture'] },
  { id: 'databases', skills: ['PostgreSQL', 'MySQL', 'MongoDB'] },
  { id: 'tools', skills: ['Git', 'GitHub', 'Docker', 'Postman', 'Linux/Vim', 'Nginx', 'Figma', 'Agile/Scrum'] },
] as const

export const education = [
  { id: 'byu', institution: 'BYU-Pathway Worldwide / BYU-Idaho' },
  { id: 'isim', institution: 'Institut Supérieur de l’Informatique et du Management d’Entreprise' },
] as const

export const normalizedTechnologyNames = [
  'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'NestJS', 'React', 'Angular',
  'MongoDB', 'MySQL', 'PostgreSQL', 'TypeScript', 'JavaScript (ES6+)', 'HTML5',
  'CSS3', 'SQL', 'FastAPI', 'Hono.js', 'Laravel', 'PHP', 'Python', 'Docker',
  'Git', 'GitHub', 'Postman', 'Linux/Vim', 'Nginx', 'Figma', 'Agile/Scrum',
  'Responsive Design', 'RESTful APIs', 'Microservices Architecture',
] as const
