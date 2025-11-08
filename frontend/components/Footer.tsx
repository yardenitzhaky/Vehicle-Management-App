import React from "react";
import { Linkedin, Github, Mail, Copyright, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      icon: Globe,
      url: "https://yardenitzhaky.github.io/Portfolio/",
      label: "Portfolio"
    },
    {
      icon: Linkedin,
      url: "https://www.linkedin.com/in/yardenitzhaky",
      label: "LinkedIn"
    },
    {
      icon: Github,
      url: "https://github.com/yardenitzhaky",
      label: "GitHub"
    },
    {
      icon: Mail,
      url: "mailto:yardene015@gmail.com",
      label: "Email"
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Social Links Section */}
          <div className="flex items-center space-x-6">
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200 transform hover:scale-110"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>

          {/* Copyright Section */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Copyright size={16} />
            <span>{currentYear}</span>
            <span className="text-gray-400">|</span>
            <span>Created by Yarden Itzhaky</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
