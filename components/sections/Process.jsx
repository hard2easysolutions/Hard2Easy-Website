import { site } from "@/content/site";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ProcessSteps from "./process/ProcessSteps";

export default function Process() {
  const { process } = site;
  return (
    <section id="process" aria-labelledby="process-title" className="relative bg-bg py-24 md:py-32 lg:py-40">
      <Container className="relative">
        <SectionHeader id="process-title" title={process.title} intro={process.intro} />
        <div className="mt-16 md:mt-20 lg:mt-24">
          <ProcessSteps steps={process.steps} visual={process.visual} />
        </div>
      </Container>
    </section>
  );
}
