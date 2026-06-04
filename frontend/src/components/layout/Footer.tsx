import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { BsLinkedin, BsGithub, BsTwitter } from "react-icons/bs";
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold">DropZone</span>
            </div>
            <p className="text-gray-400 text-sm">
              Limited-stock product drop system for exclusive releases.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/health" className="hover:text-white">
                  System Health
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/term-of-service" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="hover:text-white">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Me</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/haftamudesta"
                className="text-gray-400 hover:text-white"
              >
                <BsGithub className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/DestaHftamu?t=NQ4ovkdWbsfsjh62NFEXFg&s=09"
                className="text-gray-400 hover:text-white"
              >
                <BsTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/haftamudesta/"
                className="text-gray-400 hover:text-white"
              >
                <BsLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Haftamu Desta. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
