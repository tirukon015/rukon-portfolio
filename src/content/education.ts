export type EducationEntry = {
  degree: string;
  institution: string;
  period: string;
  status: "In Progress" | "Completed";
  description: string;
};

export const education: EducationEntry[] = [
  {
    degree: "B.Sc. in Information Technology",
    institution: "University of Cyberjaya, Malaysia",
    period: "2024 - 2027 (expected)",
    status: "In Progress",
    description:
      "Focus on IT support, system administration, and software operations.",
  },
  {
    degree: "B.Sc. in Computer Science & Engineering",
    institution: "Daffodil International University, Bangladesh",
    period: "2024",
    status: "Completed",
    description:
      "Foundational coursework in programming and software development principles (one semester).",
  },
  {
    degree: "Higher Secondary Certificate (Science)",
    institution: "Milestone College, Dhaka, Bangladesh",
    period: "2023",
    status: "Completed",
    description: "Mathematics, Physics, and Chemistry.",
  },
];

export type CertificationEntry = {
  title: string;
  issuer: string;
  date: string;
  verifyHref?: string;
};

export const certifications: CertificationEntry[] = [
  {
    title: "Google IT Support Professional",
    issuer: "Google / Coursera",
    date: "2024",
    verifyHref:
      "https://www.coursera.org/account/accomplishments/specialization/G5J77W7G86HU",
  },
  {
    title: "Coding for Everyone: C & C++",
    issuer: "University of Colorado / Coursera",
    date: "2024",
  },
];
