"use client"
import Head from "next/head";
import { useEffect, useState } from "react";
import Footer from "@/components/home/footer";

export default function Terms() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 80) {
          current = section.getAttribute("id");
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "usage", label: "Using Our Website" },
    { id: "accounts", label: "Accounts and Security" },
    { id: "intellectual-property", label: "Intellectual Property" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "privacy", label: "Privacy and Data" },
    { id: "termination", label: "Termination of Access" },
    { id: "changes", label: "Changes to Terms" },
    { id: "contact", label: "Contact Us" },
  ];

  return (
    <>
      <Head>
        <title>Terms of Service - Eduliver</title>
        <meta name="description" content="Terms of Service for Eduliver.com" />
      </Head>

      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto px-4 py-12 gap-8">
        {/* Table of Contents */}
        <aside className="hidden lg:block w-1/4 sticky top-20 h-[80vh] overflow-y-auto border-r pr-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Table of Contents</h2>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block hover:text-blue-600 transition-colors ${
                    activeSection === section.id ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Eduliver.com Terms of Service</h1>

          {/* Section 1 */}
          <section id="introduction" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">1. Introduction</h2>
            <p>
              Welcome to <strong>Eduliver.com</strong>. By using our website, you agree to follow these Terms of Service. 
              These rules are designed to protect both you and Eduliver while ensuring a safe, fair, and effective learning experience.
            </p>
          </section>

          {/* Section 2 */}
          <section id="usage" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">2. Using Our Website</h2>
            <p>When using Eduliver.com, you agree to:</p>
            <ul className="list-disc ml-6 mb-2">
              <li>Use the website for <strong>educational purposes only</strong>.</li>
              <li>Provide accurate information if you register an account or contact us.</li>
              <li>Not disrupt, hack, or attempt to damage our website.</li>
              <li>Respect other users and avoid posting offensive content.</li>
            </ul>
            <p>You are <strong>not allowed</strong> to:</p>
            <ul className="list-disc ml-6">
              <li>Copy, sell, or distribute our content without permission.</li>
              <li>Use our website for commercial purposes without consent.</li>
              <li>Engage in illegal activities while using Eduliver.com.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="accounts" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-600">3. Accounts and Security</h2>
            <ul className="list-disc ml-6">
              <li>If you create an account, keep your password <strong>secure and private</strong>.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>Notify us immediately if you suspect unauthorized use of your account.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="intellectual-property" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">4. Intellectual Property</h2>
            <p>
              All content on Eduliver.com, including text, images, questions, and study materials, is <strong>protected by copyright and other intellectual property laws</strong>.
            </p>
            <ul className="list-disc ml-6">
              <li>You may use content <strong>for personal educational purposes only</strong>.</li>
              <li>You may <strong>not reproduce, distribute, or modify</strong> content without our written permission.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="liability" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">5. Limitation of Liability</h2>
            <p>
              Eduliver.com provides educational content for learning purposes. We do <strong>not guarantee</strong> the accuracy or completeness of our materials. 
              We are <strong>not liable for any direct or indirect damages</strong> arising from your use of the website, including lost results, mistakes, or technical issues.
            </p>
          </section>

          {/* Section 6 */}
          <section id="privacy" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">6. Privacy and Data</h2>
            <p>Your use of Eduliver.com is also governed by our <strong>Privacy Policy</strong>. By using the website, you consent to how we collect, store, and use your data.</p>
          </section>

          {/* Section 7 */}
          <section id="termination" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">7. Termination of Access</h2>
            <ul className="list-disc ml-6">
              <li>We reserve the right to <strong>suspend or terminate your access</strong> if you violate these Terms of Service.</li>
              <li>You may also terminate your account at any time by contacting us.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="changes" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">8. Changes to Terms</h2>
            <p>
              Eduliver.com may update these Terms from time to time. Updates will be posted on this page with a new revision date. Continued use of the website after updates means you accept the revised Terms.
            </p>
            <p><strong>Last Updated:</strong> February 7, 2026</p>
          </section>

          {/* Section 9 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-blue-700">9. Contact Us</h2>
            <p>If you have questions or concerns about these Terms of Service, you can contact us at:</p>
            <ul className="list-disc ml-6">
              <li>Email: <a href="mailto:support@eduliver.com" className="text-blue-600">eduliver1@gmail.com</a></li>
              <li>Phone: +234 814 748 2298</li>
            </ul>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
