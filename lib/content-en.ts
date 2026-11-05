/**
 * English texts for the content in lib/data.ts. Only the words live here; icons, colours,
 * slugs, years and tech stacks are shared with the Dutch version.
 */

export const departmentsEn: Record<string, { title: string; tagline: string; description: string }> = {
  software: {
    title: "Software",
    tagline: "Bots, web & automation",
    description: "From powerful Discord bots to lightning-fast web apps. Scalable code, cleanly built with modern stacks.",
  },
  game: {
    title: "Game Development",
    tagline: "FiveM & Minecraft",
    description: "Unique FiveM scripts and fully configured Minecraft networks that keep players coming back.",
  },
  media: {
    title: "Media",
    tagline: "Branding & UI/UX",
    description: "A brand that sticks. Logos, brand identities and interfaces that work as well as they look.",
  },
};

/** Same order as `services` in lib/data.ts */
export const servicesEn: { title: string; description: string; features: string[]; from: string }[] = [
  {
    title: "Discord Bots",
    description: "Custom bots with moderation, tickets, economies, dashboards and integrations with your own APIs.",
    features: ["Slash commands", "Web dashboard", "24/7 hosting", "Database integration"],
    from: "€149",
  },
  {
    title: "Websites & Web Apps",
    description: "Fast, SEO-friendly sites and applications built with Next.js, TypeScript and Tailwind.",
    features: ["Next.js / React", "CMS integration", "Animations", "Performance 95+"],
    from: "€499",
  },
  {
    title: "Automation",
    description: "Connect your tools. Webhooks, APIs and workflows that save you hours of work every week.",
    features: ["API integrations", "Webhooks", "Cron jobs", "Monitoring"],
    from: "€199",
  },
  {
    title: "FiveM Scripts",
    description: "Optimised ESX/QBCore scripts with sleek NUI interfaces and 0.00 ms idle resmon.",
    features: ["ESX & QBCore", "Custom NUI", "Optimised", "Escrow support"],
    from: "€79",
  },
  {
    title: "Minecraft Servers",
    description: "Complete networks: setup, plugins, custom configuration, anti-cheat and performance tuning.",
    features: ["Velocity / Paper", "Custom plugins", "Anti-cheat", "Server tuning"],
    from: "€129",
  },
  {
    title: "Server Hosting & Management",
    description: "Managed game and bot servers with monitoring, backups and DDoS protection.",
    features: ["Daily backups", "DDoS protection", "99.9% uptime", "Support"],
    from: "€15 /mo",
  },
  {
    title: "Branding",
    description: "Logo, colour palette, typography and a complete brand guide for a consistent look.",
    features: ["Logo design", "Brand guide", "Social kit", "Merchandise"],
    from: "€249",
  },
  {
    title: "UI/UX Design",
    description: "Interfaces designed around your users, from wireframe to pixel-perfect Figma prototype.",
    features: ["Wireframes", "Figma prototypes", "Design systems", "User testing"],
    from: "€349",
  },
  {
    title: "Content & Socials",
    description: "Trailers, banners, thumbnails and social content that stand out in every feed.",
    features: ["Trailers", "Thumbnails", "Banners", "Motion graphics"],
    from: "€59",
  },
];

export const projectFiltersEn: Record<string, string> = { all: "All", bots: "Bots", websites: "Websites", servers: "Servers" };

export const projectsEn: Record<string, { duration: string; summary: string; challenge: string; solution: string; results: string[] }> = {
  "aurora-ticket-bot": {
    duration: "3 weeks",
    summary: "A ticket system that lets a roleplay community of thousands of members handle support without losing track.",
    challenge:
      "Support questions came in through DMs and scattered channels. Nothing could be found again, staff members got in each other's way and there was no insight into how long people waited for an answer.",
    solution:
      "A bot that opens a dedicated channel for every question, with the right roles, categories and a transcript when it closes. Staff see waiting times in a dashboard, and recurring questions are handled with buttons instead of text.",
    results: ["Average response time", "Tickets per month", "Manual work"],
  },
  "pixel-studio": {
    duration: "5 weeks",
    summary: "A portfolio site for a media studio where the work itself takes centre stage, not the text around it.",
    challenge: "The old site was a slow page builder full of plugins. Pages took seconds to load, editing was cumbersome and the layout fell apart on mobile.",
    solution:
      "A new site in Next.js with a headless CMS, so the studio adds its own cases. Images are optimised automatically and animations are deliberately kept light, so the work stands out rather than the effects.",
    results: ["Lighthouse performance", "Load time", "Enquiries"],
  },
  "skyline-network": {
    duration: "4 weeks",
    summary: "A Minecraft network where players jump between game modes without ever losing their connection.",
    challenge:
      "Separate servers meant separate worlds: players had to log in again, ranks and balances drifted apart and the tick rate collapsed with more than a hundred players.",
    solution:
      "A Velocity proxy for the whole fleet, with shared data in a central database and a custom plugin that keeps ranks and the economy in sync. Plus tuning of the Paper configuration and an anti-cheat listening in on every backend.",
    results: ["Tick rate at peak", "Concurrent players", "Uptime"],
  },
  "nova-economy": {
    duration: "2 weeks",
    summary: "An economy bot that keeps a community active with daily rewards, a shop and a leaderboard.",
    challenge: "The server was quiet outside of events. There was no reason to come back every day and no way to reward active members.",
    solution:
      "A bot with a currency, daily streaks, a shop for roles and colours, and seasonal leaderboards. All balances run through Redis, so nothing stalls even during busy events.",
    results: ["Daily active members", "Messages per day", "Commands per day"],
  },
  "velocity-garage": {
    duration: "3 weeks",
    summary: "A garage system for FiveM where players manage, store and upgrade their vehicles through a custom interface.",
    challenge:
      "The existing garage script cost noticeable performance on every spawn and sometimes made vehicles disappear. Its interface also clashed with the server's branding.",
    solution:
      "A rewritten resource on QBCore with a custom NUI that shows vehicles per garage with their condition, damage and storage costs. Queries run asynchronously and the resource never goes above 0.00 ms at rest.",
    results: ["Resmon at rest", "Lost vehicles", "Garage load time"],
  },
  "lumen-dashboard": {
    duration: "7 weeks",
    summary: "An analytics dashboard where customers manage their usage, invoices and team members in one place.",
    challenge: "Customer data was scattered across an admin panel, loose exports and email. Every question about usage ended up with support.",
    solution:
      "A self-service dashboard with charts per period, downloadable invoices and role management per team. Type-safe from database to interface with tRPC, so a change in the data model shows up in the code straight away.",
    results: ["Support questions", "Time to insight", "Teams using it"],
  },
  "guardian-mod": {
    duration: "4 weeks",
    summary: "A moderation bot that stops spam and scam links before a human moderator even sees them.",
    challenge:
      "During tournaments the server grew faster than the moderation team could keep up with. Scam links and spam waves stayed up for minutes, exactly when it was busiest.",
    solution:
      "A bot that judges messages on content, link reputation and account behaviour. Doubtful cases go to a moderator queue instead of being deleted straight away, with a log in which every decision can be reviewed.",
    results: ["Scam links blocked", "Response time", "Wrongful actions"],
  },
  "craftopia-survival": {
    duration: "6 weeks",
    summary: "A survival server with its own mechanics: skills, quests and a player market that keeps the economy in balance.",
    challenge:
      "Standard survival was played out within a week. Players dropped off as soon as they had everything, and the economy drained because of unlimited selling to the server.",
    solution:
      "A custom plugin with skills you train by playing, quests that grow with your progress, and a market where players trade with each other instead of with a bottomless shop.",
    results: ["Players after 30 days", "Average session", "Quests completed"],
  },
  "orbit-landing": {
    duration: "2 weeks",
    summary: "A landing page for a product launch, built to turn visitors into sign-ups.",
    challenge: "The launch was two weeks away and there was no page yet. The story had to be clear in a single scroll, even for people who had never seen the product.",
    solution:
      "One page with a clear structure: what it is, who it is for and what it costs. The sign-up form sits at the top and returns at the bottom, with A/B tests on the headline and the button text.",
    results: ["Conversion", "Sign-ups in week 1", "Delivered in"],
  },
};

/** Values that contain words (the rest, like "15 min" or "+40%", are the same in both languages) */
export const resultValuesEn: Record<string, string> = {
  "2 klikken": "2 clicks",
  "11 dagen": "11 days",
  "0,8 s": "0.8 s",
  "99,9%": "99.9%",
  "99,2%": "99.2%",
  "0,3%": "0.3%",
  "+1.200": "+1,200",
  "4.000": "4,000",
  "25.000": "25,000",
  "2.100": "2,100",
  "8,4%": "8.4%",
};

export const statsEn = ["Community members", "Projects delivered", "Uptime"];

export const processEn = [
  { title: "Introduction", text: "We discuss your idea, goals and budget in our Discord or on a call." },
  { title: "Design & Plan", text: "You receive a clear proposal with a schedule, mockups and a fixed price." },
  { title: "Build", text: "We build in sprints. In the client portal you follow every step live." },
  { title: "Launch", text: "Delivery, deployment and aftercare. We stay available for support." },
];

export const faqEn = [
  {
    question: "How long does an average project take?",
    answer:
      "A Discord bot or FiveM script is usually done within one to two weeks. A complete website takes three to six weeks, depending on its size and how quickly we receive content and feedback. Every quote comes with a concrete schedule.",
  },
  {
    question: "What exactly does it cost?",
    answer:
      "The services page lists indicative prices per service. After a short introduction you get a fixed price, so you never face surprises. Larger projects are split into phases, each with its own amount.",
  },
  {
    question: "Do I own the code?",
    answer:
      "Yes. After the final payment, all code and design are yours, including the repository. For FiveM scripts you can choose escrow protection if you plan to resell the work yourself.",
  },
  {
    question: "Do you offer maintenance after delivery?",
    answer:
      "We do. You get thirty days of bug aftercare by default. After that you can take out a maintenance subscription for updates, monitoring, backups and support through our Discord.",
  },
  {
    question: "How does communication work during the project?",
    answer:
      "Most of it happens in a dedicated channel in our Discord, so you can reach us directly. In the client portal you also see the status of your project and your open tickets.",
  },
  {
    question: "Can I order individual parts?",
    answer:
      "Absolutely. Everything is modular. If you only want a logo, only a bot or only hosting, we can arrange that. If you combine several services, we align the designs with each other.",
  },
];

/** Same order as `values` in lib/data.ts (about page) */
export const valuesEn = [
  { title: "Honest about what's possible", text: "We'd rather give a tight schedule that holds than a nice promise we can't keep. If something doesn't fit your budget, we say so straight away." },
  { title: "Code that lasts", text: "We build as if someone else has to maintain it tomorrow. Readable, tested and documented, even when it could be done faster." },
  { title: "Short lines", text: "No ticket system you disappear into. You talk directly to the people working on your project, through your own channel in our Discord." },
  { title: "Built for communities", text: "We come from the world of Discord servers and game communities ourselves. We know what players expect and where they drop off." },
];

