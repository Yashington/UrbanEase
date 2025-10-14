import React from "react";

// You can use react-icons for these icons, or include SVG inline if you prefer.
// Here we'll use react-icons (install with: npm install react-icons)
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#f5f6f8] border-t border-gray-200 text-[#22223B]">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* SHOP */}
          <div>
            <h3 className="font-semibold text-lg mb-4">SHOP</h3>
            <ul className="space-y-2">
              <li><a href="/products?category=women" className="hover:underline text-[#2563eb]">Women</a></li>
              <li><a href="/products?category=men" className="hover:underline text-[#2563eb]">Men</a></li>
              <li><a href="/products?category=accessories" className="hover:underline text-[#2563eb]">Accessories</a></li>
              <li><a href="/products?category=new" className="hover:underline text-[#2563eb]">New Arrivals</a></li>
              <li><a href="/products?category=sale" className="hover:underline text-[#2563eb]">Sale</a></li>
            </ul>
          </div>
          {/* INFORMATION */}
          <div>
            <h3 className="font-semibold text-lg mb-4">INFORMATION</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:underline text-[#2563eb]">About Us</a></li>
              <li><a href="/sustainability" className="hover:underline text-[#2563eb]">Sustainability</a></li>
              <li><a href="/careers" className="hover:underline text-[#2563eb]">Careers</a></li>
              <li><a href="/press" className="hover:underline text-[#2563eb]">Press</a></li>
              <li><a href="/contact" className="hover:underline text-[#2563eb]">Contact</a></li>
            </ul>
          </div>
          {/* CUSTOMER SERVICE */}
          <div>
            <h3 className="font-semibold text-lg mb-4">CUSTOMER SERVICE</h3>
            <ul className="space-y-2">
              <li><a href="/shipping-returns" className="hover:underline text-[#2563eb]">Shipping &amp; Returns</a></li>
              <li><a href="/faq" className="hover:underline text-[#2563eb]">FAQ</a></li>
              <li><a href="/size-guide" className="hover:underline text-[#2563eb]">Size Guide</a></li>
              <li><a href="/track-order" className="hover:underline text-[#2563eb]">Track Order</a></li>
              <li><a href="/gift-cards" className="hover:underline text-[#2563eb]">Gift Cards</a></li>
            </ul>
          </div>
          {/* CONNECT WITH US */}
          <div>
            <h3 className="font-semibold text-lg mb-4">CONNECT WITH US</h3>
            <div className="flex space-x-6 mb-4 text-[#51546E]">
              <a
                href="https://instagram.com/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563eb] text-2xl"
              >
                <FaInstagram />
              </a>
              <a
                href="https://facebook.com/"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563eb] text-2xl"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com/"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563eb] text-2xl"
              >
                <FaTwitter />
              </a>
              <a
                href="https://youtube.com/"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563eb] text-2xl"
              >
                <FaYoutube />
              </a>
            </div>
            <div className="text-[#51546E] text-sm mb-1">Questions? Contact us:</div>
            <a href="mailto:support@elegance.com" className="block text-[#2563eb] text-sm hover:underline">support@elegance.com</a>
            <span className="block text-[#2563eb] text-sm">+1 (800) 123-4567</span>
          </div>
        </div>
        <hr className="border-gray-200 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#51546E]">
          <div className="mb-2 md:mb-0">© 2025 YourBrand. All rights reserved.</div>
          <div className="space-x-6">
            <a href="/privacy-policy" className="hover:underline text-[#2563eb]">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline text-[#2563eb]">Terms of Service</a>
            <a href="/accessibility" className="hover:underline text-[#2563eb]">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;