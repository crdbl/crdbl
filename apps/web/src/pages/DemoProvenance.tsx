import { DemoLevel } from '../components/DemoLevel';
import { CrdblCard } from '../components/CrdblCard';

const crdbls = {
  A1: 'CtmBhBMRjm',
  A2: 'k7HjHgkwTF',
  A3: 'f9DNrWL6mq',
  B1: 'B9HqCmmJRM',
  B2: 'Frrm6hJCbD',
  C1: 'd686n8ww8R',
};

const data = {
  A1: {
    title: 'Basic Climate Data',
    content:
      "The global average temperature has increased by 1.1°C since pre-industrial times according to NASA's 2023 climate report.",
    context: [],
    whyWorks: ["Clear, factual, measurable claim that's easy to verify."],
    contradictions: ['Global temperatures have decreased recently'],
  },
  A2: {
    title: 'Renewable Energy Stat',
    content:
      'Solar panel costs decreased by 90% between 2010 and 2023, according to the International Renewable Energy Agency.',
    context: [],
    whyWorks: ['Specific, quantifiable fact with clear attribution.'],
    contradictions: ['Solar panel costs have increased significantly'],
  },
  A3: {
    title: 'Tech Adoption Rate',
    content:
      'Electric vehicle sales grew 35% globally in 2023, reaching 14.1 million units sold worldwide.',
    context: [],
    whyWorks: ["Recent, specific data that's verifiable."],
    contradictions: ['Electric vehicle sales declined in 2023'],
  },
  B1: {
    title: 'Climate Impact Analysis',
    content:
      'Rising global temperatures of 1.1°C are driving increased adoption of clean energy solutions, with solar power becoming the most cost-effective energy source in most regions.',
    context: ['A1', 'A2'],
    whyWorks: ['Logically connects two facts without contradicting either.'],
  },
  B2: {
    title: 'Market Trend Analysis',
    content:
      'The dramatic 90% cost reduction in solar technology is accelerating the transition to electric vehicles, as cheaper renewable energy makes EV charging more economical.',
    context: ['A2', 'A3'],
    whyWorks: [
      'Shows logical connection between renewable energy costs and EV adoption.',
    ],
  },
  C1: {
    title: 'Investment Recommendation',
    content:
      'Given the 1.1°C temperature rise driving clean energy demand, combined with 90% solar cost reductions and 35% EV growth, renewable energy infrastructure represents the highest-opportunity investment sector for 2024-2025.',
    context: ['A1', 'A2', 'A3', 'B1', 'B2'],
    whyWorks: [
      'Synthesizes all lower-level facts',
      'Makes a logical conclusion',
      'Demonstrates real-world application',
    ],
  },
};

function getLabel(crdblId: string): string {
  return Object.entries(crdbls).find(([, id]) => id === crdblId)?.[0] || '';
}

function getRefData(ref: string) {
  return data[ref as keyof typeof data];
}

const provenanceSteps = [
  { label: 'Facts', path: '/demo/provenance/a', dataContent: 'A' },
  { label: 'Analysis', path: '/demo/provenance/b', dataContent: 'B' },
  { label: 'Strategy', path: '/demo/provenance/c', dataContent: 'C' },
];

export function DemoProvenanceA() {
  return (
    <DemoLevel
      title="Foundation Facts"
      description="Basic, verifiable facts that serve as the foundation for analysis"
      nextPath="/demo/provenance/b"
      currentStep="/demo/provenance/a"
      steps={provenanceSteps}
    >
      <CrdblCard
        {...data.A1}
        crdblId={crdbls.A1}
        label={getLabel(crdbls.A1)}
        getRefData={getRefData}
      />
      <CrdblCard
        {...data.A2}
        crdblId={crdbls.A2}
        label={getLabel(crdbls.A2)}
        getRefData={getRefData}
      />
      <CrdblCard
        {...data.A3}
        crdblId={crdbls.A3}
        label={getLabel(crdbls.A3)}
        getRefData={getRefData}
      />
    </DemoLevel>
  );
}

export function DemoProvenanceB() {
  return (
    <DemoLevel
      title="Analysis Building on Facts"
      description="Analysis that builds upon and connects foundation facts"
      prevPath="/demo/provenance/a"
      nextPath="/demo/provenance/c"
      currentStep="/demo/provenance/b"
      steps={provenanceSteps}
    >
      <CrdblCard
        {...data.B1}
        crdblId={crdbls.B1}
        label={getLabel(crdbls.B1)}
        getRefData={getRefData}
      />
      <CrdblCard
        {...data.B2}
        crdblId={crdbls.B2}
        label={getLabel(crdbls.B2)}
        getRefData={getRefData}
      />
    </DemoLevel>
  );
}

export function DemoProvenanceC() {
  return (
    <DemoLevel
      title="Strategic Conclusions"
      description="Strategic conclusions that synthesize all previous levels"
      prevPath="/demo/provenance/b"
      currentStep="/demo/provenance/c"
      steps={provenanceSteps}
    >
      <CrdblCard
        {...data.C1}
        crdblId={crdbls.C1}
        label={getLabel(crdbls.C1)}
        getRefData={getRefData}
      />
    </DemoLevel>
  );
}
