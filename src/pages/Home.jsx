import { FaBook, FaGraduationCap, FaRobot, FaUtensils, FaUserPlus, FaSearch, 
    FaHandHoldingHeart, FaChevronDown,FaChevronUp,FaChevronRight,FaTimes   } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust the import path as necessary
export default function Home() {
const [expandedQuestion , setExpandedQuestion] = useState([]);
 const navigate = useNavigate();
//   const toggleQuestion = (id) => {
//     setExpandedQuestions(prev =>
//       prev.includes(id) 
//         ? prev.filter(qId => qId !== id)
//         : [...prev, id]
//     );
//   };
const toggleQuestion = (id) => {
    setExpandedQuestion(prev => prev === id ? null : id);
  };
  const questions = [
    {
      id: 1,
      question: "How can I make a donation?",
      answer: "You can make a donation through our website, mobile app, or by visiting our office. We accept various payment methods including credit cards, mobile banking, and direct bank transfers."
    },
    {
      id: 2,
      question: "Where will my donation be used?",
      answer: "Your donation will be used to support students in need by providing them with essential resources such as food, clothing, educational supplies, and access to learning opportunities. We ensure that every contribution directly impacts the lives of those who require assistance."
    },
    {
      id: 3,
      question: "Can I donate to a specific Student or Institute?",
      answer: "Yes, you can choose to sponsor a specific student or institution. During the donation process, you'll have the option to select your preferred beneficiary from our verified list."
    },
    {
      id: 4,
      question: "Will I receive a receipt or confirmation?",
      answer: "Yes, we provide immediate electronic receipts for all donations. For larger donations, we can also provide official stamped receipts upon request."
    },
    {
      id: 5,
      question: "How can I be assured that my donation is used appropriately?",
      answer: "We maintain complete transparency through regular reports, financial audits, and progress updates. Donors receive impact reports showing how their contributions were used."
    }
  ];

   // Sample student data with image URLs
  const urgentStudents = [
    {
      id: 1,
      amount: "3500/MON",
      name: "Abdur Rahman",
      description: "Help Students in Need- Share Food and Make a",
      rank: "Urgent",
      image: "https://www.gage.odi.org/wp-content/uploads/2019/05/09_Junaid.Bangladesh.jpg"
    },
    {
      id: 2,
      amount: "2500/MON",
      name: "Saidur Rahman",
      description: "Education Support- Help Continue Studies",
      rank: "Urgent",
      image: "https://www.gage.odi.org/wp-content/uploads/2019/05/09_Junaid.Bangladesh.jpg"
    },
    {
      id: 3,
      amount: "4000/MON",
      name: "Mohammad Ali",
      description: "Medical Assistance- Treatment Needed",
      rank: "Very Poor",
      image: "https://www.gage.odi.org/wp-content/uploads/2019/05/09_Junaid.Bangladesh.jpg"
    },
    {
      id: 4,
      amount: "3000/MON",
      name: "Ayesha Akter",
      description: "Food and Shelter Support",
      rank: "Urgent",
      image: "https://www.gage.odi.org/wp-content/uploads/2019/05/09_Junaid.Bangladesh.jpg"
    }
  ];

const donationPosts = [
    {
      id: 1,
      image: "https://childrights.thedailystar.net/campus/2012/07/02/sp02.jpg", // Replace with your image path
      title: "Giving to Madrasah Students: A Path to Sadaqah Jariyah",
      excerpt: "Lorem ipsum dolor sit amet consectetur. Amet mattis tellus et as ectus orc.",
      link: "/posts/madrasah-students" // Your actual post link
    },
    {
      id: 2,
      image: "https://www.tbsnews.net/sites/default/files/styles/infograph/public/images/2021/06/03/final.jpg", // Replace with your image path
      title: "Your Kindness, Their Success: Real Stories of Impact",
      excerpt: "Lorem ipsum dolor sit amet consectetur. Amet mattis tellus et as ectus orc.",
      link: "/posts/success-stories" // Your actual post link
    }
  ];

const handleDonorClick = () => {
    navigate("/login/donor");
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4">
       {/* Header with Search */}
        <Navbar />
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Hero Image with CTA Button - takes full width on mobile, half on larger screens */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src="https://ecdn.dhakatribune.net/contents/cache/images/900x0x1/uploads/dten/2018/01/20180116-Mahmud-Hossain-Opu_MHO1487.jpg"
              alt="Main"
              className="w-full h-auto md:h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <button
              onClick={handleDonorClick}
               className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                Be Part of Lift A Kids
              </button>
            </div>
          </div>
        </div>

        {/* Donation Card - appears below hero on mobile, to the right on desktop */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col">
            <img
              src="https://cdn.daily-sun.com/public/news_images/2015/10/17/madrasa_1598.jpg"
              alt="Donation"
              className="w-full h-48 md:h-64 object-cover"
            />
            <div className="p-4 md:p-6 flex-grow">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl">
                EDUCATION FOR POOR CHILDREN
              </h2>
              <p className="text-teal-600 text-sm md:text-base mt-2 md:mt-4">
                MONTHLY REQUIREMENT: <span className="font-bold">৳ 3500</span>
              </p>
              <button
                onClick={handleDonorClick}
               className="mt-4 md:mt-6 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors w-full md:w-auto">
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
          <FaBook className="mx-auto text-teal-600 text-3xl md:text-4xl mb-2" />
          <p className="text-sm md:text-base font-medium">BOOK</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
          <FaGraduationCap className="mx-auto text-teal-600 text-3xl md:text-4xl mb-2" />
          <p className="text-sm md:text-base font-medium">EDUCATION</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
          <FaRobot className="mx-auto text-teal-600 text-3xl md:text-4xl mb-2" />
          <p className="text-sm md:text-base font-medium">LEARNING</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
          <FaUtensils className="mx-auto text-teal-600 text-3xl md:text-4xl mb-2" />
          <p className="text-sm md:text-base font-medium">FOOD</p>
        </div>
      </div>
{/* How to Start Help Section */}
      <div className="my-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-teal-700 mb-8">How to Start Help</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          In carrying out their duties, Lift a kids provide a student education, food, medicine and others
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserPlus className="text-teal-600 text-2xl" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-teal-800">Register Yourself</h3>
            <p className="text-gray-600 text-sm">
              Sign up to join and be part of the good people who love to share
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-teal-600 text-2xl" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-teal-800">Search Student</h3>
            <p className="text-gray-600 text-sm">
              There are many Student you can choose to share goodness with
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHandHoldingHeart className="text-teal-600 text-2xl" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-teal-800">Add Sponsor</h3>
            <p className="text-gray-600 text-sm">
              Sharing happiness with those less and doing more good for others
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdMedicalServices className="text-teal-600 text-2xl" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-teal-800">Provide Support</h3>
            <p className="text-gray-600 text-sm">
              Contribute to education, food, medicine and other essential needs
            </p>
          </div>
        </div>
      </div>
{/* Urgent Help Section */}
      <div className="my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's Give Help To</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Those In Urgent Need</h3>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {urgentStudents.map((student) => (
            <div key={student.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Card with image on left */}
              <div className="flex">
                {/* Student Image */}
                <div className="w-1/3">
                  <img 
                    src={student.image} 
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Student Details */}
                <div className="w-2/3 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-red-600 font-bold text-sm">{student.amount}</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{student.rank}</span>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-3">{student.description}</p>
                  
                  <div className="bg-red-50 p-2 rounded-lg mb-3">
                    <p className="text-xs text-gray-500">Name:</p>
                    <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                  </div>
                  
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg text-xs">
                    Donate Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-6">
          <button className="flex items-center justify-center mx-auto text-red-600 font-medium">
            Show More <FaChevronDown className="ml-1" />
          </button>
        </div>
      </div>

{/* Donation Questions Section */}
      <div className="my-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
          Find Answers to Your
        </h2>
        <h3 className="text-xl md:text-2xl font-semibold text-center text-gray-700 mb-8">
          Donation Questions
        </h3>

       <div className="space-y-4 max-w-3xl mx-auto">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-gray-200 pb-4">
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => toggleQuestion(q.id)}
              aria-expanded={expandedQuestion === q.id}
            >
              <h4 className="text-lg font-semibold text-gray-800">
                {q.question}
              </h4>
              {expandedQuestion === q.id ? (
                <FaChevronUp className="text-gray-500 ml-2 transition-transform duration-200" />
              ) : (
                <FaChevronDown className="text-gray-500 ml-2 transition-transform duration-200" />
              )}
            </button>
            
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedQuestion === q.id ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="text-gray-600 pt-2 pl-2 text-justify">
                {q.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
</div>

{/* Benefits of Donation Section */}
      <div className="my-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
          Try to Find Why need and
        </h2>
        <h3 className="text-xl md:text-2xl font-semibold text-center text-gray-700 mb-8">
          Benefit of Donation
        </h3>

        {/* Donation Posts with Image Left Layout */}
        <div className="grid grid-cols-1 gap-8">
          {donationPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left Side - Image */}
                <div className="md:w-2/5">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Right Side - Content */}
                <div className="md:w-3/5 p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">
                    {post.title.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </h4>
                  <p className="text-gray-600 mb-6">{post.excerpt}</p>
                  <a 
                    href={post.link}
                    className="inline-block text-teal-600 font-medium hover:text-teal-800 transition-colors"
                  >
                    <span className="flex items-center">
                      Read Post <FaChevronRight className="ml-1" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Additional Content Section - appears on larger screens */}
      <div className="hidden md:block bg-teal-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-teal-800 mb-4">Our Mission</h2>
        <p className="text-gray-700">
          We are dedicated to providing education, nutrition, and care to underprivileged children 
          across Bangladesh. Join us in our mission to lift up these kids and give them a brighter future.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 md:mt-12">
        <p>© {new Date().getFullYear()} Lift A Kids. All rights reserved.</p>
      </div>
    </div>
  );
}