import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Account information:</strong> Name, email address, phone number, and profile photo</li>
            <li><strong>Profile data:</strong> Location, age, skill level, coaching experience, and pricing</li>
            <li><strong>Usage data:</strong> Pages visited, features used, and interaction patterns</li>
            <li><strong>Payment information:</strong> Processed securely by Stripe — we do not store card details</li>
            <li><strong>Communications:</strong> Messages sent between athletes and coaches on the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Provide, maintain, and improve the Platform</li>
            <li>Match athletes with suitable coaches</li>
            <li>Process payments and manage transactions</li>
            <li>Send service notifications and updates</li>
            <li>Respond to support requests</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Information Sharing</h2>
          <p>We do not sell your personal information. We share information only in the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>With other users:</strong> Your public profile is visible to other Platform users. Coaches' profiles are visible to all visitors.</li>
            <li><strong>With service providers:</strong> Stripe (payments), Supabase (database), Resend (email). These providers are bound by confidentiality agreements.</li>
            <li><strong>Legal requirements:</strong> If required by law, court order, or government authority.</li>
            <li><strong>Business transfers:</strong> In the event of a merger or acquisition, your information may be transferred as a business asset.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active, or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. Some data may be retained for legal and audit purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Cookies</h2>
          <p>
            We use session cookies to keep you logged in. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but this may affect Platform functionality.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Security</h2>
          <p>
            We use industry-standard security measures including HTTPS encryption, secure password hashing, and limited access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability (receive your data in a structured format)</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@coachconnect.app" className="text-primary underline">privacy@coachconnect.app</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Children's Privacy</h2>
          <p>
            CoachConnect is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided personal information, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent notice on the Platform. Your continued use of the Platform constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at <a href="mailto:privacy@coachconnect.app" className="text-primary underline">privacy@coachconnect.app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
