import { Hero } from "@/components/Hero";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { Contact2 } from "@/components/ui/contact-2";
import { Footer } from "@/components/ui/footer";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesSectionWithHoverEffects />
      <Contact2 
        title="Get In Touch"
        description="Have questions about our AI multi-agent system? We'd love to hear from you. Reach out for demos, partnerships, or support."
        phone="(555) 123-4567"
        email="hello@jhc.ai"
        web={{ label: "jhc.ai", url: "https://github.com/coderhormaz/multimind-arena" }}
      />
      <Footer
        logo={<Brain className="h-10 w-10" />}
        brandName="JHC"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com",
            label: "GitHub",
          },
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: "https://linkedin.com",
            label: "LinkedIn",
          },
        ]}
        mainLinks={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/about", label: "About" },
          { href: "/docs", label: "Documentation" },
          { href: "/contact", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
        ]}
        copyright={{
          text: "© 2025 JHC AI Systems",
          license: "All rights reserved",
        }}
      />
    </>
  );
}
