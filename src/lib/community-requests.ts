export type StakeholderCategory =
  "Venue Partner" | "Sponsorship Partner" | "Guest Speaker" | "Volunteer";

export const stakeholderCategories: StakeholderCategory[] = [
  "Venue Partner",
  "Sponsorship Partner",
  "Guest Speaker",
  "Volunteer",
];

export const stakeholderCategoryLabel: Record<StakeholderCategory, string> = {
  "Venue Partner": "Venue Partner",
  "Sponsorship Partner": "Sponsorship Partner",
  "Guest Speaker": "Domain Experts",
  Volunteer: "Volunteer",
};

export interface Stakeholder {
  id: string;
  name: string;
  category: StakeholderCategory;
  org?: string;
  title?: string;
  avatarInitials: string;
  bio?: string;
  tags?: string[];
}

export const mockStakeholders: Stakeholder[] = [
  {
    id: "iit-delhi-innovation-hub",
    name: "IIT Delhi Innovation Hub",
    category: "Venue Partner",
    org: "IIT Delhi",
    title: "Venue Partnerships Lead",
    avatarInitials: "ID",
    bio: "Campus auditoriums and labs available for hackathons and symposiums.",
    tags: ["Auditorium", "Up to 500 seats"],
  },
  {
    id: "wework-koramangala",
    name: "WeWork Koramangala",
    category: "Venue Partner",
    org: "WeWork India",
    title: "Community Manager",
    avatarInitials: "WK",
    bio: "Flexible event spaces in Bangalore, ideal for meetups and workshops.",
    tags: ["Meetup Space", "Up to 120 seats"],
  },
  {
    id: "nasscom-coe",
    name: "NASSCOM CoE",
    category: "Venue Partner",
    org: "NASSCOM Center of Excellence",
    title: "Venue Coordinator",
    avatarInitials: "NC",
    bio: "Deep-tech focused venue with demo labs and breakout rooms.",
    tags: ["Demo Labs", "Up to 200 seats"],
  },
  {
    id: "razorpay-for-startups",
    name: "Razorpay for Startups",
    category: "Sponsorship Partner",
    org: "Razorpay",
    title: "Partnerships Lead",
    avatarInitials: "RZ",
    bio: "Sponsors community hackathons and ideathons with credits and prizes.",
    tags: ["Prize Sponsor", "API Credits"],
  },
  {
    id: "aws-activate",
    name: "AWS Activate",
    category: "Sponsorship Partner",
    org: "Amazon Web Services",
    title: "Startup Programs Manager",
    avatarInitials: "AA",
    bio: "Cloud credits and infra support for founder-focused events.",
    tags: ["Cloud Credits", "Infra Support"],
  },
  {
    id: "zerodha-rainmatter",
    name: "Zerodha Rainmatter",
    category: "Sponsorship Partner",
    org: "Rainmatter",
    title: "Ecosystem Partnerships",
    avatarInitials: "ZR",
    bio: "Backs fintech and climate-tech community events.",
    tags: ["Fintech", "Climate-Tech"],
  },
  {
    id: "ananya-rao",
    name: "Dr. Ananya Rao",
    category: "Guest Speaker",
    org: "Google DeepMind",
    title: "AI/ML Research Lead",
    avatarInitials: "AR",
    bio: "Speaks on applied ML and responsible AI for builder audiences.",
    tags: ["AI/ML", "Keynote"],
  },
  {
    id: "karan-mehta",
    name: "Karan Mehta",
    category: "Guest Speaker",
    org: "DeepStack Robotics",
    title: "Founder & CTO",
    avatarInitials: "KM",
    bio: "Hardware startup founder, covers robotics and deep-tech fundraising.",
    tags: ["Hardware", "Fundraising"],
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    category: "Guest Speaker",
    org: "Microsoft Research India",
    title: "Principal Engineer",
    avatarInitials: "PN",
    bio: "Distributed systems expert, popular at hackathon office hours.",
    tags: ["Systems", "Office Hours"],
  },
  {
    id: "rohan-gupta",
    name: "Rohan Gupta",
    category: "Volunteer",
    org: "BITS Pilani",
    title: "CS Undergrad",
    avatarInitials: "RG",
    bio: "Available for on-ground event logistics and registration desks.",
    tags: ["On-Ground Support"],
  },
  {
    id: "sneha-iyer",
    name: "Sneha Iyer",
    category: "Volunteer",
    org: "GCODE Community",
    title: "Design Intern",
    avatarInitials: "SI",
    bio: "Helps with event branding, signage, and social media coverage.",
    tags: ["Design", "Social Coverage"],
  },
  {
    id: "aditya-verma",
    name: "Aditya Verma",
    category: "Volunteer",
    org: "NIT Trichy",
    title: "CS Fresher",
    avatarInitials: "AV",
    bio: "Comfortable with AV setup, live streaming, and participant support.",
    tags: ["AV Setup", "Live Stream"],
  },
];

export function getStakeholderById(id: string): Stakeholder | undefined {
  return mockStakeholders.find((stakeholder) => stakeholder.id === id);
}

export type CommunityRequestStatus = "interested" | "helping" | "passed";

export interface CommunityRequest {
  id: string;
  eventId: string;
  stakeholderId: string;
  category: StakeholderCategory;
  message: string;
  status: CommunityRequestStatus;
  responseMessage?: string;
  createdAt: string;
  respondedAt?: string;
  remindedAt?: string;
}
