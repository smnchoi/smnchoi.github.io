import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "smnchoi's Blog",
  DESCRIPTION: "is doing something fun, interested in mobile dev.",
  EMAIL: "soomin.float@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Astro Micro is an accessible theme for Astro.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/smnchoi",
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/smnchoi",
  },
];
