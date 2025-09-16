import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div>
      <Navbar />
      <main className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold my-8">About Us</h1>
        {/* Add about content here */}
      </main>
    </div>
  );
}