import { apiClient } from './client';

export const REAL_PROJECTS = [
  {
    id: 'voxtrace-ai',
    slug: 'voxtrace-ai',
    title: 'VoxTrace.AI',
    description: 'AI-powered automated calling and real-time voice analytics platform designed to trace conversation insights and streamline customer phone interactions.',
    liveDemoUrl: 'https://voxtraceai.vercel.app/',
    repositoryUrl: 'https://github.com',
    thumbnailImage: '/images/projects/VoxTrace.jpg',
    image: '/images/projects/VoxTrace.jpg',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Python'],
    submittedByName: 'VoxTrace Team',
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'vaultmeet',
    slug: 'vaultmeet',
    title: 'VaultMeet',
    description: 'Spatial virtual event platform enabling attendees to navigate a 2D interactive world, join breakout rooms, and connect with spatial audio and video.',
    liveDemoUrl: 'https://www.vaultmeet.in/',
    repositoryUrl: 'https://github.com/KuldeepPandit75/vaultmeet',
    thumbnailImage: '/images/projects/vaultMeet.jpg',
    image: '/images/projects/vaultMeet.jpg',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'WebRTC'],
    submittedByName: 'Kuldeep Pandit',
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'clientflow',
    slug: 'clientflow',
    title: 'ClientFlow',
    description: 'Multi-agent WhatsApp inbox management system that unifies customer messaging, chat assignments, and QR code device pairing into one dashboard.',
    liveDemoUrl: 'https://client-flow-sage.vercel.app/landing',
    repositoryUrl: 'https://github.com',
    thumbnailImage: '/images/projects/ClientFlow.jpg',
    image: '/images/projects/ClientFlow.jpg',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Node.js'],
    submittedByName: 'ClientFlow Team',
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'vaultrade',
    slug: 'vaultrade',
    title: 'VaulTrade',
    description: 'Modern fintech trading platform featuring live TradingView price charts, Razorpay payment gateway integration, and real-time portfolio tracking.',
    liveDemoUrl: 'https://vault-trade-omega.vercel.app/login',
    repositoryUrl: 'https://github.com',
    thumbnailImage: '/images/projects/vaultTrade.jpg',
    image: '/images/projects/vaultTrade.jpg',
    technologies: ['React', 'Tailwind CSS', 'Firebase', 'JavaScript'],
    submittedByName: 'VaulTrade Team',
    createdAt: '2026-03-12T00:00:00.000Z'
  },
  {
    id: 'tech-taste-foods',
    slug: 'tech-taste-foods',
    title: 'Tech Taste Foods',
    description: 'Full-stack online food ordering and catering web platform featuring dynamic menus, Cloudinary image optimization, and seamless cart checkout.',
    liveDemoUrl: 'https://techtastefoods.com',
    repositoryUrl: 'https://github.com',
    thumbnailImage: '/images/projects/teachTasteFoods.jpg',
    image: '/images/projects/teachTasteFoods.jpg',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    submittedByName: 'Tech Taste Foods Team',
    createdAt: '2026-04-05T00:00:00.000Z'
  },
  {
    id: 'parthdev-portfolio',
    slug: 'parthdev-portfolio',
    title: 'Parth Chaturvedi Portfolio',
    description: 'Interactive developer portfolio highlighting full-stack web applications, UI/UX designs, animations, and software engineering projects.',
    liveDemoUrl: 'https://parthdev-portfolio.vercel.app/',
    repositoryUrl: 'https://github.com/parthchaturvedi',
    thumbnailImage: '/images/projects/portfolioParth.jpg',
    image: '/images/projects/portfolioParth.jpg',
    technologies: ['React', 'JavaScript', 'Tailwind CSS', 'HTML'],
    submittedByName: 'Parth Chaturvedi',
    createdAt: '2026-04-20T00:00:00.000Z'
  },
  {
    id: 'kuldeep-pandit-portfolio',
    slug: 'kuldeep-pandit-portfolio',
    title: 'Kuldeep Pandit Portfolio',
    description: 'Personal developer portfolio highlighting full-stack web development, open-source software engineering, and interactive web projects.',
    liveDemoUrl: 'https://kuldeepandit-portfolio.vercel.app/',
    repositoryUrl: 'https://github.com/kuldeeppandit75',
    thumbnailImage: '/images/projects/PortfolioKuldeep.jpg',
    image: '/images/projects/PortfolioKuldeep.jpg',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Python'],
    submittedByName: 'Kuldeep Pandit',
    createdAt: '2026-05-01T00:00:00.000Z'
  },
  {
    id: 'study-smart',
    slug: 'study-smart',
    title: 'Study Smart',
    description: 'Android application designed to help students manage study schedules by organizing subject tasks, setting priority due dates, and tracking focus sessions.',
    liveDemoUrl: 'https://github.com/vaishnavgupta/Study-Smart',
    repositoryUrl: 'https://github.com/vaishnavgupta/Study-Smart',
    thumbnailImage: '/images/projects/studySmart.jpeg',
    image: '/images/projects/studySmart.jpeg',
    technologies: ['Android', 'Kotlin', 'Jetpack Compose', 'Mobile'],
    submittedByName: 'Vaishnav Gupta',
    createdAt: '2026-05-15T00:00:00.000Z'
  },
  {
    id: 'guardian-safety-app',
    slug: 'guardian-safety-app',
    title: 'Guardian Safety App',
    description: 'Emergency safety Android application offering one-tap SOS alerts, live GPS location sharing, and emergency ambient audio recording for personal safety.',
    liveDemoUrl: 'https://github.com/vaishnavgupta/Guardian-The-Safety-App',
    repositoryUrl: 'https://github.com/vaishnavgupta/Guardian-The-Safety-App',
    thumbnailImage: '/images/projects/gurdain.jpeg',
    image: '/images/projects/gurdain.jpeg',
    technologies: ['Android', 'Kotlin', 'Firebase', 'Mobile'],
    submittedByName: 'Vaishnav Gupta',
    createdAt: '2026-06-01T00:00:00.000Z'
  }
];

export const projectsApi = {
  getPublicProjects: async () => {
    return REAL_PROJECTS;
  },
  getProjectBySlug: async (slug: string) => {
    return REAL_PROJECTS.find(p => p.slug === slug || p.id === slug) || null;
  },
  getAllProjects: async () => {
    return REAL_PROJECTS;
  },
  updateStatus: async (slug: string, status: string) => {
    return { success: true };
  }
};


