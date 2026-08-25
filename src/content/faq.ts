export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "What kind of systems do you work on?",
    answer:
      "Mostly internal business and operational systems, production tracking, inventory, admin and reporting tools, alongside customer-facing websites and web applications.",
  },
  {
    question: "Do you build full-stack websites?",
    answer:
      "Yes. Frontend, backend, database, and deployment. RPOMS is built and run that way, end to end.",
  },
  {
    question: "Do you design websites as well as develop them?",
    answer:
      "Yes, when the project calls for it. For ERTH, I designed the site in Figma myself and I'm building the production website from that design.",
  },
  {
    question: "What is your role in RPOMS?",
    answer:
      "IT Systems & Operations Lead. I designed and built the system and remain its maintainer, and I work directly with the operational side it supports.",
  },
  {
    question: "What is your role in ERTH?",
    answer: "UI/UX Designer & Web Developer. I designed it in Figma, and I'm the one building it.",
  },
  {
    question: "Do you work with internal business systems?",
    answer:
      "Yes. RPOMS is one, and I also support the internal business tracking system used day to day at Blue Bee Technologies.",
  },
  {
    question: "Do you work across both IT systems and operations?",
    answer:
      "Yes, that's the core of how I work on RPOMS specifically: the software and the physical process it runs, together.",
  },
  {
    question: "Are you available for software or web development opportunities?",
    answer: "Yes. I'm open to internship and full-time roles.",
  },
];
