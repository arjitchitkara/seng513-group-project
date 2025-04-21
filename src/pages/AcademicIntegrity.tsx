import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AcademicIntegrityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-5xl mt-20 mx-auto p-8 text-gray-800 space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Academic Integrity Policy</h1>
          <p className="text-lg text-gray-600">Promoting honest and ethical learning on EduVault</p>
        </header>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🎯 Our Mission</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Support learning through peer-shared educational content.</li>
            <li>Empower students to deepen understanding with guided help.</li>
            <li>Promote academic excellence with integrity.</li>
          </ul>
        </section>

        <section className="bg-red-50 rounded-2xl shadow-md p-6 border border-red-200">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">🚫 Prohibited Uses</h2>
          <p className="mb-4 text-red-700">You <strong>may not</strong> use EduVault for:</p>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            <li><strong>Cheating or Plagiarism</strong>: Uploading or downloading assignments to submit as your own.</li>
            <li><strong>Exam Assistance</strong>: Posting or soliciting help for in-progress exams, quizzes, or take-home tests.</li>
            <li><strong>Misrepresentation</strong>: Submitting site content to instructors as original work.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-700">Violations may result in account suspension or termination. We may cooperate with academic institutions as necessary.</p>
        </section>

        <section className="bg-green-50 rounded-2xl shadow-md p-6 border border-green-200">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">✅ Appropriate Use of Content</h2>
          <p className="mb-4 text-gray-700">You <strong>may</strong> use documents on EduVault to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Review past solutions for understanding.</li>
            <li>Compare approaches to a problem.</li>
            <li>Study how to structure responses or essays.</li>
            <li>Practice with similar problems.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">Always cite materials when appropriate, and follow your institution’s academic policies.</p>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">👤 User Responsibility</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Ensuring their use of the platform aligns with their school’s academic integrity code.</li>
            <li>Using uploaded documents ethically and responsibly.</li>
            <li>Reporting any misuse of the platform they observe.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">📩 Reporting Violations</h2>
          <p className="text-gray-700">We take academic integrity seriously. To report misuse, email us at <a className="text-blue-600 underline" href="mailto:integrity@sitename.com">integrity@eduvault.com</a>.</p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
