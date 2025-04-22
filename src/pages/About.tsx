import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="max-w-5xl mt-20 mx-auto p-8 text-gray-800 dark:text-gray-200 space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">About Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Learn more about the mission and team behind EduVault</p>
        </header>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">🌱 Our Purpose</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              EduVault was founded with a simple mission: to make academic resources more accessible and to foster a collaborative learning environment for students everywhere. We believe that shared knowledge can empower learners to reach their full potential.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Whether you're studying for exams, exploring new topics, or looking to deepen your understanding, EduVault provides the tools and community to help you succeed—with integrity.
            </p>
          </div>
          <div className="flex-1">
            <img src="/img/studentsLearning.jpg" alt="Students learning together" className="rounded-xl shadow-md w-full" />
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row-reverse items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">👥 Our Team</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We are a group of educators, developers, and learners who are passionate about making education more collaborative and ethical. Our team brings together experience in technology, pedagogy, and community development to build a safe, student-focused platform.
            </p>
          </div>
          <div className="flex-1">
            <img src="/img/collaboration.jpg" alt="Team collaboration" className="rounded-xl shadow-md w-full" />
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex justify-evenly">
          <div>
            <h2 className="text-2xl font-semibold mb-4">📢 Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
                Have questions or feedback? Reach out to us at <a className="text-blue-600 dark:text-blue-400 underline" href="mailto:hello@sitename.com">hello@eduvault.com</a>. We'd love to hear from you!
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
