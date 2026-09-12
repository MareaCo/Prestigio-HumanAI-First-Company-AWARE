import { Linkedin, Twitter, Github, Globe } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="app-footer"
      className="mt-16 border-t border-ink/10 py-8 px-4 text-ink-soft text-[13px] font-sans"
    >
      <div
        id="footer-container"
        className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Left Side: Copyright */}
        <div
          id="footer-copyright-container"
          className="flex flex-col gap-1 text-center md:text-left"
        >
          <p id="footer-copyright-text" className="font-medium">
            © {currentYear} HumanAI First CompanyⓇ. Todos los derechos
            reservados.
          </p>
          <p id="footer-subtext" className="text-ink-muted text-[11px]">
            Liderando la gobernanza y adopción ética de Inteligencia Artificial
            en las organizaciones.
          </p>
        </div>

        {/* Center/Right Side: Quick Links */}
        <div
          id="footer-links-container"
          className="flex flex-wrap justify-center gap-6 text-ink-soft/80"
        >
          <a
            id="footer-link-privacy"
            href="#"
            className="hover:text-ink transition-colors font-medium"
          >
            Aviso de Privacidad
          </a>
          <a
            id="footer-link-terms"
            href="#"
            className="hover:text-ink transition-colors font-medium"
          >
            Términos de Servicio
          </a>
          <a
            id="footer-link-support"
            href="#"
            className="hover:text-ink transition-colors font-medium"
          >
            Soporte
          </a>
        </div>

        {/* Right Side: Social Media Icons */}
        <div id="footer-social-container" className="flex items-center gap-4">
          <a
            id="footer-social-linkedin"
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-ink/5 hover:text-ink transition-all text-ink-soft"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            id="footer-social-twitter"
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-ink/5 hover:text-ink transition-all text-ink-soft"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            id="footer-social-github"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-ink/5 hover:text-ink transition-all text-ink-soft"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            id="footer-social-website"
            href="https://humanaifirst.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-ink/5 hover:text-ink transition-all text-ink-soft"
            aria-label="Website"
          >
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
