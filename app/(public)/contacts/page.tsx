'use client';

import { useState, useRef, FormEvent } from 'react';
import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const metadata: Metadata = {
  title: 'Contact Us - QuietShelter Empowerment Foundation',
  description: 'Get in touch with QuietShelter Empowerment Foundation for inquiries, support, or partnership opportunities.',
  openGraph: {
    title: 'Contact Us - QuietShelter Empowerment Foundation',
    description: 'Get in touch with QuietShelter Empowerment Foundation for inquiries, support, or partnership opportunities.',
    url: 'https://your-domain.com/contact',
    images: ['/images/cham.jpg'],
  },
};

export default function ContactPage() {
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null); // Added ref for the form

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');

    const formData = new FormData(e.currentTarget); // Safe to use synchronously
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      createdAt: serverTimestamp(), // Firebase timestamp for submission time
    };

    try {
      // Submit to Firestore 'contacts' collection
      const docRef = await addDoc(collection(db, 'contacts'), data);
      console.log('Contact form submitted with ID:', docRef.id);
      setResponseMessage('Message sent successfully!');

      // Use the ref to reset the form
      if (formRef.current) {
        formRef.current.reset();
      } else {
        console.error('Form ref is not attached');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setResponseMessage('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 py-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
          Contact Us
        </h1>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Google Maps Embed */}
          <div className="w-full lg:w-1/2">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15751.525817862223!2d12.4759197!3d9.2548883!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10fc6b18a4048b59%3A0x123996bf4d72c749!2sQuiet%20Shelter%20Empowerment%20Foundation!5e0!3m2!1sen!2sng!4v1730356075855!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full lg:w-1/2 bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center">Get in Touch</h2>
            <form id="contactForm" ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all duration-300 placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="E-Mail"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all duration-300 placeholder-gray-400"
                />
              </div>
              <div>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Type Your Message"
                  required
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all duration-300 placeholder-gray-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
            {responseMessage && (
              <p
                className={`mt-4 text-center text-sm md:text-base ${
                  responseMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {responseMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}