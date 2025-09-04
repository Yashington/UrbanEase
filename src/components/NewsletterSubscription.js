import React, { useState, useEffect, useRef } from "react";

function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage("Thank you for subscribing!");
    setEmail("");
  };

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Automatically hide the success message after 3 seconds, and re-enable the form
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <section className="w-full flex flex-col items-center py-16 bg-transparent">
      <h2 className="text-3xl font-light tracking-wide text-center mb-4">JOIN OUR COMMUNITY</h2>
      <p className="text-md text-gray-700 mb-8 text-center max-w-2xl">
        Subscribe to our newsletter for exclusive updates, early access to new collections, and special offers.
      </p>
      <form
        className="flex flex-col md:flex-row items-center gap-4 w-full justify-center"
        style={{ maxWidth: 800 }}
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          required
          placeholder="Your email address"
          className="w-full md:w-[400px] border border-gray-300 rounded px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={submitted}
          ref={inputRef}
        />
        <button
          type="submit"
          className="bg-black text-white px-10 py-3 rounded font-semibold text-lg hover:bg-gray-800 transition"
          disabled={submitted}
        >
          SUBSCRIBE
        </button>
      </form>
      <div className="mt-7 text-gray-600 text-sm text-center max-w-xl">
        By subscribing, you agree to our <a href="/privacy-policy" className="text-blue-700 underline">Privacy Policy</a> and consent to receive updates from our company.
      </div>
      {message && (
        <div className="mt-4 text-green-600 font-medium text-center">{message}</div>
      )}
    </section>
  );
}

export default NewsletterSubscription;