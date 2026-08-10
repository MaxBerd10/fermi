import Hero from "@/pages/home/components/Hero";
import NewsAnnouncements from "@/pages/home/components/NewsAnnouncements";
import About from "@/pages/home/components/About";
import FacultiesNews from "@/pages/home/components/FacultiesNews";
import WhyUs from "@/pages/home/components/WhyUs";
import PathFinder from "@/pages/home/components/PathFinder";
import StudentVoices from "@/pages/home/components/StudentVoices";
import Leadership from "@/pages/home/components/Leadership";
import Gallery from "@/pages/home/components/Gallery";
import EventsJournal from "@/pages/home/components/EventsJournal";
import Partners from "@/pages/home/components/Partners";
import OurProjects from "@/pages/home/components/OurProjects";
import ContactMap from "@/pages/home/components/ContactMap";

export default function Home() {
  return (
    <div className="text-foreground-950 bg-transparent">
      <main>
        <Hero />
        <NewsAnnouncements />
        <About />
        <FacultiesNews />
        <WhyUs />
        <PathFinder />
        <StudentVoices />
        <Leadership />
        <Gallery />
        <EventsJournal />
        <Partners />
        <OurProjects />
        <ContactMap />
      </main>
    </div>
  );
}
