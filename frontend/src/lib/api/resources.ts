import { apiClient } from './client';

export interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  techStack: string[];
  url: string;
  folder?: ResourceFolder;
  publishedBy?: { id: string, name: string };
  createdAt?: string;
}

const mockFolders: ResourceFolder[] = [
  {
    id: "web-dev-101",
    name: "Web Development & Frontend",
    description: "Curated guides, roadmaps, and cheat sheets for modern Web Architecture, React, and Next.js.",
  },
  {
    id: "backend-cloud",
    name: "Backend & Systems",
    description: "Deep dive into Spring Boot, Node.js, Microservices, Databases, and Docker containers.",
  },
  {
    id: "ai-ml-data",
    name: "AI & Machine Learning",
    description: "Roadmaps, datasets, PyTorch guides, and prompt engineering resources for developers.",
  },
  {
    id: "mobile-dev",
    name: "Mobile App Development",
    description: "Cross-platform and native mobile app development guides for Flutter, React Native, and Android.",
  },
  {
    id: "cp-dsa",
    name: "DSA & Interview Prep",
    description: "Problem sets, algorithm visualizers, patterns, and technical interview roadmaps.",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & DevOps",
    description: "Security best practices, OWASP top 10, network security, and CI/CD automation pipelines.",
  }
];

const mockItems: Record<string, ResourceItem[]> = {
  "web-dev-101": [
    {
      id: "item-w1",
      title: "Developer Roadmap - Frontend 2026",
      description: "Step-by-step guide to becoming a modern frontend developer with recommended technologies.",
      techStack: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js"],
      url: "https://roadmap.sh/frontend",
      publishedBy: { id: "1", name: "MMIL Tech Team" }
    },
    {
      id: "item-w2",
      title: "React Official Documentation & Guides",
      description: "Interactive learning platform and official guides for React 19 and Server Components.",
      techStack: ["React", "JSX", "Hooks"],
      url: "https://react.dev",
      publishedBy: { id: "1", name: "MMIL Core" }
    },
    {
      id: "item-w3",
      title: "Tailwind CSS & Design Systems",
      description: "Utility-first CSS framework patterns, modern glassmorphism, and dynamic layout design.",
      techStack: ["CSS", "TailwindCSS", "UI Design"],
      url: "https://tailwindcss.com/docs",
      publishedBy: { id: "1", name: "Design Club" }
    }
  ],
  "backend-cloud": [
    {
      id: "item-b1",
      title: "Spring Boot 3 Enterprise Guide",
      description: "Production-ready Spring Boot backend architectural guide, Spring Security, and JPA.",
      techStack: ["Java", "Spring Boot", "Spring Security", "PostgreSQL"],
      url: "https://spring.io/guides",
      publishedBy: { id: "1", name: "Backend Lead" }
    },
    {
      id: "item-b2",
      title: "Docker & Containerization Handbook",
      description: "Learn containerization from basic Dockerfiles to Docker Compose and Kubernetes deployment.",
      techStack: ["Docker", "DevOps", "Containers"],
      url: "https://docs.docker.com/get-started/",
      publishedBy: { id: "1", name: "Cloud Team" }
    }
  ],
  "ai-ml-data": [
    {
      id: "item-a1",
      title: "Deep Learning Specialization & PyTorch",
      description: "Complete hands-on reference for neural networks, transformers, and model optimization.",
      techStack: ["Python", "PyTorch", "TensorFlow", "NumPy"],
      url: "https://pytorch.org/tutorials/",
      publishedBy: { id: "1", name: "AI Research Wing" }
    }
  ],
  "mobile-dev": [
    {
      id: "item-m1",
      title: "Flutter & Dart Blueprint",
      description: "Build beautiful cross-platform iOS and Android apps with declarative state management.",
      techStack: ["Flutter", "Dart", "Mobile"],
      url: "https://flutter.dev/docs",
      publishedBy: { id: "1", name: "App Dev Wing" }
    }
  ],
  "cp-dsa": [
    {
      id: "item-d1",
      title: "NeetCode 150 & Algorithm Patterns",
      description: "Curated 150 Data Structures and Algorithms questions categorized by patterns.",
      techStack: ["DSA", "C++", "Java", "Python"],
      url: "https://neetcode.io",
      publishedBy: { id: "1", name: "Competitive Programming Wing" }
    }
  ],
  "cybersecurity": [
    {
      id: "item-c1",
      title: "OWASP Top 10 Web Vulnerabilities",
      description: "Comprehensive overview of critical security risks to web applications and defense mechanisms.",
      techStack: ["Security", "OWASP", "Penetration Testing"],
      url: "https://owasp.org/www-project-top-ten/",
      publishedBy: { id: "1", name: "Cyber Sec Club" }
    }
  ]
};

export const resourcesApi = {
  getAllFolders: async (): Promise<ResourceFolder[]> => {
    try {
      const response = await apiClient.get('/resources/folders');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return mockFolders;
    } catch (e) {
      console.warn("Could not fetch folders from backend, using fallback data");
      return mockFolders;
    }
  },
  getItemsByFolder: async (folderId: string): Promise<ResourceItem[]> => {
    try {
      const response = await apiClient.get(`/resources/folders/${folderId}/items`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return mockItems[folderId] || mockItems["web-dev-101"] || [];
    } catch (e) {
      console.warn("Could not fetch items from backend, using fallback data");
      return mockItems[folderId] || mockItems["web-dev-101"] || [];
    }
  },
  createFolder: async (data: Partial<ResourceFolder>) => {
    const response = await apiClient.post('/resources/folders', data);
    return response.data;
  },
  deleteFolder: async (folderId: string) => {
    const response = await apiClient.delete(`/resources/folders/${folderId}`);
    return response.data;
  },
  createItem: async (folderId: string, data: Partial<ResourceItem>) => {
    const response = await apiClient.post(`/resources/folders/${folderId}/items`, data);
    return response.data;
  },
  deleteItem: async (itemId: string) => {
    const response = await apiClient.delete(`/resources/items/${itemId}`);
    return response.data;
  }
};
