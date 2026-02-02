import HeadSection from "@/components/home/headSection";
import BodySection from "@/components/home/bodySection";
import Footer from "@/components/home/footer";

export default async function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <HeadSection />

      {/* CONTENT SECTION */}
      <BodySection />

      {/* FOOTER */}
      <Footer />
     
    </>
  );
}
