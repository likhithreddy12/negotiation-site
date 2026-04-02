export type TopicKey = "car" | "laptop" | "mobile" | "job" | "rent";

export type StrategyKey =
  | "tough"
  | "soft"
  | "friendly"
  | "analytical"
  | "urgent"
  | "balanced";

export type TopicField = {
  key: string;
  label: string;
  placeholder: string;
};

export type TopicFactor = {
  key: string;
  label: string;
  defaultWeight: number;
};

export type TopicConfig = {
  key: TopicKey;
  navTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  startButtonText: string;
  fields: TopicField[];
  factors: TopicFactor[];
};

export const TOPIC_CONFIGS: Record<TopicKey, TopicConfig> = {
  car: {
    key: "car",
    navTitle: "AI Car Negotiation Assistant",
    heroTitle: "Negotiate Cars Smarter with AI",
    heroSubtitle:
      "Compare and negotiate car deals based on price, reliability, fuel efficiency, safety, and horsepower.",
    startButtonText: "Start Car Negotiation",
    fields: [
      { key: "budget", label: "Budget", placeholder: "Enter your budget" },
      { key: "make", label: "Make", placeholder: "Enter preferred make" },
      { key: "model", label: "Model", placeholder: "Enter preferred model" },
      { key: "year", label: "Year", placeholder: "Enter preferred year" },
    ],
    factors: [
      { key: "price", label: "Price", defaultWeight: 30 },
      { key: "reliability", label: "Reliability", defaultWeight: 25 },
      { key: "fuelEfficiency", label: "Fuel Efficiency", defaultWeight: 15 },
      { key: "safety", label: "Safety", defaultWeight: 15 },
      { key: "horsepower", label: "Horsepower", defaultWeight: 15 },
    ],
  },

  laptop: {
    key: "laptop",
    navTitle: "AI Laptop Negotiation Assistant",
    heroTitle: "Negotiate Better Laptop Deals with AI",
    heroSubtitle:
      "Choose and negotiate laptops using performance, price, battery life, portability, and brand reputation.",
    startButtonText: "Start Laptop Negotiation",
    fields: [
      { key: "budget", label: "Budget", placeholder: "Enter your budget" },
      { key: "brand", label: "Brand", placeholder: "Enter preferred brand" },
      { key: "ram", label: "RAM", placeholder: "Enter RAM requirement" },
      { key: "processor", label: "Processor", placeholder: "Enter preferred processor" },
      { key: "storage", label: "Storage", placeholder: "Enter storage requirement" },
    ],
    factors: [
      { key: "performance", label: "Performance", defaultWeight: 30 },
      { key: "price", label: "Price", defaultWeight: 25 },
      { key: "batteryLife", label: "Battery Life", defaultWeight: 15 },
      { key: "portability", label: "Portability", defaultWeight: 15 },
      { key: "brandReputation", label: "Brand Reputation", defaultWeight: 15 },
    ],
  },

  mobile: {
    key: "mobile",
    navTitle: "AI Mobile Negotiation Assistant",
    heroTitle: "Negotiate Better Mobile Deals with AI",
    heroSubtitle:
      "Find the best smartphone deal using price, performance, camera quality, battery life, and brand reputation.",
    startButtonText: "Start Mobile Negotiation",
    fields: [
      { key: "budget", label: "Budget", placeholder: "Enter your budget" },
      { key: "brand", label: "Brand", placeholder: "Enter preferred brand" },
      { key: "storage", label: "Storage", placeholder: "Enter storage needed" },
      {
        key: "cameraPreference",
        label: "Camera Preference",
        placeholder: "Enter camera preference",
      },
      {
        key: "batteryCapacity",
        label: "Battery Capacity",
        placeholder: "Enter battery requirement",
      },
    ],
    factors: [
      { key: "price", label: "Price", defaultWeight: 25 },
      { key: "performance", label: "Performance", defaultWeight: 20 },
      { key: "cameraQuality", label: "Camera Quality", defaultWeight: 20 },
      { key: "batteryLife", label: "Battery Life", defaultWeight: 20 },
      { key: "brandReputation", label: "Brand Reputation", defaultWeight: 15 },
    ],
  },

  job: {
    key: "job",
    navTitle: "AI Job Negotiation Assistant",
    heroTitle: "Negotiate Job Offers with AI Confidence",
    heroSubtitle:
      "Prepare for job offer discussions using salary, benefits, work-life balance, career growth, and job security.",
    startButtonText: "Start Job Negotiation",
    fields: [
      {
        key: "expectedSalary",
        label: "Expected Salary",
        placeholder: "Enter expected salary",
      },
      {
        key: "experienceLevel",
        label: "Experience Level",
        placeholder: "Enter experience level",
      },
      { key: "jobRole", label: "Job Role", placeholder: "Enter job role" },
      { key: "location", label: "Location", placeholder: "Enter preferred location" },
    ],
    factors: [
      { key: "salary", label: "Salary", defaultWeight: 30 },
      { key: "careerGrowth", label: "Career Growth", defaultWeight: 25 },
      { key: "workLifeBalance", label: "Work-Life Balance", defaultWeight: 20 },
      { key: "benefits", label: "Benefits", defaultWeight: 15 },
      { key: "jobSecurity", label: "Job Security", defaultWeight: 10 },
    ],
  },

  rent: {
    key: "rent",
    navTitle: "AI Rent Negotiation Assistant",
    heroTitle: "Negotiate Rental Decisions with AI",
    heroSubtitle:
      "Evaluate rental options using location, rent price, amenities, lease flexibility, and maintenance quality.",
    startButtonText: "Start Rent Negotiation",
    fields: [
      {
        key: "monthlyBudget",
        label: "Monthly Budget",
        placeholder: "Enter monthly budget",
      },
      { key: "location", label: "Location", placeholder: "Enter preferred location" },
      {
        key: "propertyType",
        label: "Property Type",
        placeholder: "Apartment, Studio, Condo, etc.",
      },
      {
        key: "leaseDuration",
        label: "Lease Duration",
        placeholder: "Enter lease duration",
      },
    ],
    factors: [
      { key: "location", label: "Location", defaultWeight: 30 },
      { key: "rentPrice", label: "Rent Price", defaultWeight: 25 },
      { key: "amenities", label: "Amenities", defaultWeight: 15 },
      { key: "leaseFlexibility", label: "Lease Flexibility", defaultWeight: 15 },
      { key: "maintenanceQuality", label: "Maintenance Quality", defaultWeight: 15 },
    ],
  },
};

export const STRATEGIES: StrategyKey[] = [
  "tough",
  "soft",
  "friendly",
  "analytical",
  "urgent",
  "balanced",
];

export const DEFAULT_ADMIN_SETTINGS = {
  activeTopic: "car" as TopicKey,
  selectedStrategy: "balanced" as StrategyKey,
};

export function getDefaultWeights(topic: TopicKey) {
  return TOPIC_CONFIGS[topic].factors.reduce((acc, factor) => {
    acc[factor.key] = factor.defaultWeight;
    return acc;
  }, {} as Record<string, number>);
}
