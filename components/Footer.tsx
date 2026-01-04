import React from 'react'
import Image from 'next/image'
import { PhoneIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-500 text-black pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* About Us Section */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-black">About आरोग्यPath</h3>
            <p className="text-gray-900 mb-3 text-sm leading-relaxed">
              आरोग्यPath is your comprehensive healthcare companion, helping you find PMJAY empaneled hospitals 
              across India and providing AI-powered medical assistance for better healthcare decisions.
            </p>
            <p className="text-black text-xs font-semibold">
              Connecting patients with quality healthcare since 2025.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-black">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2 text-black" />
                <div>
                  <a href="tel:8595018808" className="text-black hover:text-gray-900 transition-colors text-sm font-semibold">
                    +91 8595018808
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-black" />
                <div>
                  <a 
                    href="https://www.linkedin.com/in/dhruv-kumar-85a513250/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-900 transition-colors text-sm font-semibold"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-black" />
                <div>
                  <p className="text-black text-sm font-semibold">India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Features */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-black">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1 mb-4">
              <a href="/" className="text-black hover:text-gray-900 transition-colors text-sm font-semibold">
                Home
              </a>
              <a href="/hospitals" className="text-black hover:text-gray-900 transition-colors text-sm font-semibold">
                Find Hospitals
              </a>
              <a href="#feedback" className="text-black hover:text-gray-900 transition-colors text-sm font-semibold">
                Feedback
              </a>
              <a href="#about" className="text-black hover:text-gray-900 transition-colors text-sm font-semibold">
                About Us
              </a>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2 text-black">Features</h4>
              <div className="grid grid-cols-2 gap-x-2 text-gray-900 text-xs font-semibold">
                <div>• Hospital Finder</div>
                <div>• PMJAY Support</div>
                <div>• AI Assistant</div>
                <div>• State-wise Search</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-black mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <Image 
                src="/logo.jpeg" 
                alt="आरोग्यPath Logo" 
                width={100} 
                height={30}
                className="h-8 w-auto"
              />
            </div>
            
            <div className="text-black text-xs text-center md:text-right font-semibold">
              <p>&copy; 2025 आरोग्यPath. All rights reserved.</p>
              <p className="mt-0.5">Made with ❤️ for better healthcare access in India</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer