import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CoachConnect ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
          <p>
            CoachConnect is a marketplace platform that connects athletes with sports coaches. We facilitate discovery, communication, scheduling, and payments between athletes and coaches. CoachConnect is not a party to the coaching services provided and does not employ coaches.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Eligibility</h2>
          <p>
            You must be at least 13 years old to use CoachConnect. If you are under 18, you confirm that you have your parent or guardian's permission to use the Platform. Coaches must be at least 18 years old.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Coach Responsibilities</h2>
          <p>
            Coaches are responsible for ensuring they have the necessary qualifications, certifications, and insurance required to provide coaching services in their jurisdiction. Coaches represent that the information in their profiles is accurate and up to date. CoachConnect does not verify coach credentials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Payments and Fees</h2>
          <p>
            CoachConnect charges a platform fee of 15% on each transaction. Payment processing is handled securely by Stripe. Refund policies are determined between the athlete and coach, though CoachConnect may mediate disputes at its discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Provide false information in your profile</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Attempt to circumvent the platform to avoid fees</li>
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorised access to the Platform or its systems</li>
            <li>Post inappropriate, offensive, or defamatory content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Limitation of Liability</h2>
          <p>
            CoachConnect is provided "as is" without warranties of any kind. To the maximum extent permitted by law, CoachConnect shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to injury during coaching sessions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of significant changes via email or in-app notice. Continued use of the Platform after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">11. Contact</h2>
          <p>
            For questions about these Terms, please contact us at <a href="mailto:legal@coachconnect.app" className="text-primary underline">legal@coachconnect.app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
