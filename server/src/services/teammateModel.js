const LEVELS = { Beginner: 1, Intermediate: 2, Advanced: 3 };
const AVAILABLE = new Set([
  "Available",
  "Available for Projects",
  "Available for Team",
]);

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function overlap(left = [], right = []) {
  const rightValues = right.map(normalize).filter(Boolean);
  return left.filter((value) => {
    const normalized = normalize(value);
    return (
      normalized &&
      rightValues.some(
        (candidate) =>
          normalized === candidate ||
          normalized.includes(candidate) ||
          candidate.includes(normalized),
      )
    );
  }).length;
}

function ratio(value, total) {
  return total > 0 ? Math.min(1, value / total) : 0;
}

function buildFeatures(candidate, context, currentProfile = {}) {
  const candidateSkills = [
    ...(candidate.skills || []),
    ...(candidate.technicalSkills || []),
  ];
  const currentSkills = [
    ...(currentProfile.skills || []),
    ...(currentProfile.technicalSkills || []),
  ];
  const candidateDomains = [
    ...(candidate.preferredDomains || []),
    ...(candidate.interests || []),
  ];
  const requestedDomains = [
    context.domain,
    ...(context.interests || []),
  ].filter(Boolean);
  const candidateRoles = candidate.preferredRoles || [];
  const requestedRoles = context.roles || [];
  const candidateExperience = LEVELS[candidate.experienceLevel] || 2;
  const requestedExperience = LEVELS[context.experienceLevel] || 2;
  const skillRequirements = context.requiredSkills || [];
  const complementarySkills = candidateSkills.filter(
    (skill) =>
      !currentSkills.some((current) => normalize(current) === normalize(skill)),
  );
  const requestedHours = Number(context.weeklyHours) || 15;
  const candidateHours = Number(candidate.weeklyHours) || 0;

  return [
    ratio(
      overlap(skillRequirements, candidateSkills),
      skillRequirements.length,
    ),
    ratio(
      complementarySkills.length,
      Math.max(5, skillRequirements.length || 5),
    ),
    ratio(overlap(requestedDomains, candidateDomains), requestedDomains.length),
    requestedRoles.length > 0
      ? ratio(overlap(requestedRoles, candidateRoles), requestedRoles.length)
      : 0.5,
    AVAILABLE.has(candidate.availability) ? 1 : 0,
    candidateHours > 0
      ? Math.max(0, 1 - Math.abs(requestedHours - candidateHours) / 20)
      : 0.5,
    Math.max(0, 1 - Math.abs(requestedExperience - candidateExperience) / 2),
    Math.min(
      1,
      ((candidate.projectsCompleted || 0) +
        (candidate.projectsInProgress || 0)) /
        6,
    ),
    candidate.cgpa ? Math.max(0, Math.min(1, (candidate.cgpa - 5) / 5)) : 0.5,
    context.teamSize
      ? Math.max(
          0,
          1 -
            Math.abs(
              Number(context.teamSize) - (candidate.preferredTeamSize || 4),
            ) /
              6,
        )
      : 0.5,
  ];
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function trainSyntheticModel() {
  const weights = Array(10).fill(0);
  let bias = -4;
  const samples = [];

  // Deterministic synthetic interaction records stand in for unavailable historical outcomes.
  for (let index = 0; index < 240; index += 1) {
    const features = [
      ((index * 7) % 11) / 10,
      ((index * 5 + 2) % 11) / 10,
      ((index * 3 + 1) % 11) / 10,
      ((index * 9 + 4) % 11) / 10,
      index % 5 === 0 ? 0 : 1,
      ((index * 4 + 3) % 11) / 10,
      ((index * 6 + 2) % 11) / 10,
      ((index * 8 + 1) % 7) / 6,
      ((index * 2 + 5) % 11) / 10,
      ((index * 10 + 3) % 11) / 10,
    ];
    const latent =
      features[0] * 2.4 +
      features[1] * 1.1 +
      features[2] * 1.8 +
      features[3] * 1.3 +
      features[4] * 0.8 +
      features[5] * 0.9 +
      features[6] * 0.9 +
      features[7] * 0.6 +
      features[8] * 0.35 +
      features[9] * 0.45 -
      4.3;
    samples.push({ features, label: latent > 0 ? 1 : 0 });
  }

  for (let epoch = 0; epoch < 180; epoch += 1) {
    const gradients = Array(10).fill(0);
    let biasGradient = 0;
    samples.forEach(({ features, label }) => {
      const prediction = sigmoid(
        weights.reduce(
          (sum, weight, index) => sum + weight * features[index],
          bias,
        ),
      );
      const error = prediction - label;
      features.forEach((feature, index) => {
        gradients[index] += error * feature;
      });
      biasGradient += error;
    });
    weights.forEach((_, index) => {
      weights[index] -= (0.08 * gradients[index]) / samples.length;
    });
    bias -= (0.08 * biasGradient) / samples.length;
  }

  return { weights, bias };
}

const MODEL = trainSyntheticModel();

export function scoreTeammate(candidate, context, currentProfile) {
  const features = buildFeatures(candidate, context, currentProfile);
  const probability = sigmoid(
    MODEL.weights.reduce(
      (sum, weight, index) => sum + weight * features[index],
      MODEL.bias,
    ),
  );
  const matchScore = Math.max(1, Math.min(98, Math.round(probability * 100)));
  const featureBreakdown = {
    skillMatch: Math.round(features[0] * 100),
    skillCompatibility: Math.round(features[1] * 100),
    domainMatch: Math.round(features[2] * 100),
    roleMatch: Math.round(features[3] * 100),
    availability: Math.round(features[4] * 100),
    hoursMatch: Math.round(features[5] * 100),
    experienceMatch: Math.round(features[6] * 100),
    projectExperience: Math.round(features[7] * 100),
    cgpaMatch: Math.round(features[8] * 100),
  };
  const reasons = [
    featureBreakdown.skillMatch >= 50
      ? "Skill compatibility"
      : "Complementary skill coverage",
    featureBreakdown.domainMatch >= 50
      ? "Domain compatibility"
      : "Adjacent domain experience",
    featureBreakdown.roleMatch >= 50
      ? "Role compatibility"
      : "Complementary role profile",
    featureBreakdown.availability >= 50 && featureBreakdown.hoursMatch >= 50
      ? "Availability and weekly hours"
      : "Availability reviewed",
    featureBreakdown.projectExperience >= 40 ||
    featureBreakdown.experienceMatch >= 70
      ? "Complementary experience"
      : "Growth-compatible experience",
  ];

  return { matchScore, featureBreakdown, reasons };
}

export const modelMetadata = {
  name: "Project Match synthetic logistic model",
  trainingRecords: 240,
  features: [
    "skill compatibility",
    "domain compatibility",
    "role compatibility",
    "availability",
    "weekly hours",
    "experience",
    "project history",
    "CGPA",
    "team size",
  ],
};
