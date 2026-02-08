"use client"

import Head from "next/head";
import { useEffect, useState } from "react";
import Footer from "@/components/home/footer";

export default function Policy() {
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: "introduction", label: "1. Introduction" },
    { id: "privacy", label: "2. Privacy Policy" },
    { id: "terms", label: "3. Terms of Use" },
    { id: "cookies", label: "4. Cookies and Tracking" },
    { id: "security", label: "5. Security" },
    { id: "third-party", label: "6. Third-Party Links" },
    { id: "liability", label: "7. Limitation of Liability" },
    { id: "changes", label: "8. Changes to Policy" },
    { id: "contact", label: "9. Contact Us" },
  ];

  useEffect(() => {
    // Intersection Observer to highlight TOC items as you scroll
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Triggers when section is near top
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Policy - Eduliver</title>
        <meta name="description" content="Privacy and policy page for Eduliver.com" />
        <style>{`
          html { scroll-behavior: smooth; }
        `}</style>
      </Head>

      {/* Mobile Floating Menu Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl active:scale-95 transition-transform"
        >
          {isMobileMenuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {/* Mobile Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute bottom-20 right-6 left-6 bg-white rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[60vh]">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Jump to Section</h2>
            <ul className="space-y-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`block w-full text-left text-lg ${activeSection === section.id ? "text-blue-600 font-bold" : "text-gray-600"}`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto px-6 py-12 gap-12">
        {/* Desktop Sidebar Table of Contents */}
        <aside className="hidden lg:block lg:w-1/4">
          <div className="sticky top-24 border-l-2 border-gray-100 pl-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">In this policy</h2>
            <ul className="space-y-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`block text-left transition-all duration-200 hover:translate-x-1 ${
                      activeSection === section.id 
                      ? "text-blue-600 font-bold border-l-2 border-blue-600 -ml-[26px] pl-[24px]" 
                      : "text-gray-500 hover:text-blue-500"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:w-3/4 leading-relaxed text-gray-700">
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold mb-4 text-blue-700">Eduliver.com Policy</h1>
            <p className="text-gray-500 italic">Last Updated: February 7, 2026</p>
          </header>

          <section id="introduction" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">1. Introduction</h2>
            <p className="mb-4">
              Welcome to <strong>Eduliver.com</strong>. Your trust and privacy are important to us. 
              This policy page explains how we collect, use, and protect your information, as well as the rules for using our website. 
            </p>
            <p>By accessing or using Eduliver.com, you agree to follow the terms outlined in this policy.</p>
          </section>

          <section id="privacy" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">2. Privacy Policy</h2>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
              <h3 className="font-bold mb-2 text-blue-900">2.1 Information We Collect</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Personal information such as name, email address, and phone number (when you register).</li>
                <li>Non-personal information such as browser type, IP address, and usage patterns.</li>
              </ul>
            </div>
            <h3 className="font-bold mb-2">2.2 How We Use Your Information</h3>
            <ul className="list-disc ml-6 mb-6 space-y-2">
              <li>Provide and improve our educational services.</li>
              <li>Communicate regarding updates, promotions, or support.</li>
              <li>Monitor website performance via analytics.</li>
            </ul>
          </section>

          <section id="terms" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">3. Terms of Use</h2>
            <p className="mb-4">By using Eduliver.com, you agree to comply with all applicable laws and regulations.</p>
            <div className="border-l-4 border-gray-200 pl-4 py-2 italic">
              "All content, including articles and images, is protected under copyright law. You may access content for personal educational purposes only."
            </div>
          </section>

          <section id="cookies" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">4. Cookies and Tracking</h2>
            <p>Eduliver.com uses cookies to remember preferences and analyze traffic. You can disable cookies in your browser settings, though some features may be limited.</p>
          </section>

          <section id="security" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">5. Security</h2>
            <p>We prioritize data protection using industry-standard measures. While we strive for absolute security, no internet transmission is 100% immune to risks.</p>
          </section>

          <section id="third-party" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">6. Third-Party Links</h2>
            <p>We are not responsible for the privacy practices of external websites linked from Eduliver.com.</p>
          </section>

          <section id="liability" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">7. Limitation of Liability</h2>
            <p>Educational content is for informational purposes. We are not liable for damages resulting from incorrect or outdated information.</p>
          </section>

          <section id="changes" className="mb-12 scroll-mt-24 text-gray-500">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">8. Changes to Policy</h2>
            <p>Updates will be posted here. Please review this policy periodically to stay informed.</p>
          </section>

          <section id="contact" className="mb-24 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 border-t pt-8">9. Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="mailto:support@eduliver.com" className="p-4 rounded-lg bg-gray-50 border hover:border-blue-300 transition-colors">
                <span className="block font-bold">Email</span>
                <span className="text-blue-600">eduliver1@gmail.com</span>
              </a>
              <div className="p-4 rounded-lg bg-gray-50 border">
                <span className="block font-bold">Phone</span>
                <span>+234 814 748 2298</span>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}