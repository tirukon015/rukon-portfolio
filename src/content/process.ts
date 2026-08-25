export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export const process: ProcessStep[] = [
  {
    number: "01",
    title: "Understand",
    description:
      "Understand the business, the operational environment, and the actual problem, not just the requested feature.",
  },
  {
    number: "02",
    title: "Plan",
    description: "Define the system, workflow, interface, or data structure the problem actually needs.",
  },
  {
    number: "03",
    title: "Build",
    description: "Design and develop the software, website, or workflow.",
  },
  {
    number: "04",
    title: "Deploy & Improve",
    description:
      "Test, deploy, support, and maintain the system, then keep improving it as requirements change.",
  },
];

export const processNote =
  "This isn't the same for every project. For an operational system like RPOMS, understanding starts on the floor: the physical process comes first, then the operational requirement it creates, then the system built to meet it. The software is one step in that chain, not the starting point.";
