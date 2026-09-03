import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustSection } from '../components/landing/TrustSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ServicesPreviewSection } from '../components/landing/ServicesPreviewSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { MedicalDisclaimerSection } from '../components/landing/MedicalDisclaimerSection';
import { FAQSection } from '../components/landing/FAQSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <ServicesPreviewSection />
      <HowItWorksSection />
      <ComparisonSection />
      <SecuritySection />
      <MedicalDisclaimerSection />
      <FAQSection />
    </div>
  );
};
