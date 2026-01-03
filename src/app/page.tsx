import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Hero,
  APIPlayground,
  DeveloperExperience,
  CortexSection,
  FeaturesSection,
  UseCases,
  CTASection,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <APIPlayground />
        <DeveloperExperience />
        <CortexSection />
        <FeaturesSection />
        <UseCases />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
