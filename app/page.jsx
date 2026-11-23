import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Numbers from "@/components/sections/Numbers";
import Process from "@/components/sections/Process";
import Services from "@/components/sections/Services";
import Clients from "@/components/sections/Clients";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Numbers />
        <Process />
        <Services />
        <Clients />
        <Testimonials />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
