import { Github, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gradient">eduVAULT</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              A secure platform for students to access study resources and course materials with integrity.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-all-ease">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all-ease">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all-ease">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/documents" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Documents
                </Link>
              </li>
              <li>
                <Link to="/study-guides" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link to="/practice" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Practice Problems
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/academic-integrity" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Academic Integrity
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-muted-foreground hover:text-primary transition-all-ease text-sm">
                  Copyright
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} eduVAULT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
