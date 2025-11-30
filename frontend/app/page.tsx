import HeroSection from '@/components/hero-section'
import FooterSection from '@/components/footer'
import FeaturesSection from '@/components/features-4'
import LogoCloud from '@/components/logo-cloud'

export default function Home() {
  return (
    <>
      <HeroSection />
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="clients">
        <LogoCloud />
      </section>
      <FooterSection />
    </>
  )
}

