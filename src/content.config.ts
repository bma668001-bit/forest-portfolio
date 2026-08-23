import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const image = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

const base = {
  title: z.string().min(1),
  order: z.number().int(),
  draft: z.boolean().default(false),
  demo: z.boolean().default(false),
};

const workflows = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/workflows' }),
  schema: z.object({
    ...base,
    summary: z.string().min(1),
    year: z.number().int(),
    status: z.enum(['active', 'evolving', 'archived']),
    featured: z.boolean().default(false),
    cover: image,
    tools: z.array(z.string()).default([]),
    versionOf: z.string().optional(),
  }),
});

const visuals = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/visuals' }),
  schema: z.object({
    ...base,
    category: z.string().min(1),
    year: z.number().int(),
    image,
    featured: z.boolean().default(false),
    projectId: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    ...base,
    summary: z.string().min(1),
    year: z.number().int(),
    category: z.string().min(1),
    role: z.string().min(1),
    duration: z.string().min(1),
    featured: z.boolean().default(false),
    cover: image,
    gallery: z.array(image).min(1),
    tools: z.array(z.string()).default([]),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/articles' }),
  schema: z.object({
    ...base,
    summary: z.string().min(1),
    publishedAt: z.coerce.date(),
    cover: image.optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/notes' }),
  schema: z.object({
    ...base,
    text: z.string().min(1),
    publishedAt: z.coerce.date(),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/profile' }),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    status: z.string().min(1),
    bio: z.string().min(1),
    email: z.string(),
    wechatQr: z.string(),
    location: z.string().default(''),
    availability: z.string().default(''),
    resumeUrl: z.string().default(''),
    socialLinks: z.array(z.object({
      label: z.string().min(1),
      url: z.string().min(1),
    })).default([]),
    tools: z.array(z.string()),
    experience: z.array(z.object({ period: z.string(), label: z.string() })),
  }),
});

export const collections = { workflows, visuals, projects, articles, notes, profile };
