import Navbar from '../components/Navbar';

export default function BlogPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold my-8">Blog</h1>
        {/* Add blog posts here */}
      </main>
    </div>
  );
}