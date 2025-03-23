import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-white font-sans">EduHub</span>
            </div>
            <p className="text-gray-400 mb-4">Empowering learners worldwide with high-quality online education.</p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition duration-150"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white transition duration-150">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link href={category.href}>
                    <a className="text-gray-400 hover:text-white transition duration-150">
                      {category.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white transition duration-150">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© {new Date().getFullYear()} EduHub. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <select className="bg-gray-800 border border-gray-700 text-gray-400 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Icons for social links
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "LinkedIn", href: "#", icon: Linkedin },
];

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Become an Instructor", href: "/contact" },
];

const categories = [
  { name: "Web Development", href: "/courses?category=Web Development" },
  { name: "Data Science", href: "/courses?category=Data Science" },
  { name: "UI/UX Design", href: "/courses?category=Design" },
  { name: "Business & Marketing", href: "/courses?category=Business" },
  { name: "Mobile Development", href: "/courses?category=Mobile Development" },
];

const supportLinks = [
  { name: "Help Center", href: "/contact" },
  { name: "FAQ", href: "/about" },
  { name: "Terms of Service", href: "/about" },
  { name: "Privacy Policy", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];
