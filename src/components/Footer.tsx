import { Facebook, Twitter, Instagram, Youtube, Github } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    'Acerca de': ['Quiénes Somos', 'Trabaja con Nosotros', 'Prensa', 'Blog'],
    'Ayuda': ['Centro de Ayuda', 'Contacto', 'Preguntas Frecuentes', 'Dispositivos'],
    'Legal': ['Términos de Uso', 'Privacidad', 'Cookies', 'Aviso Legal'],
    'Cuenta': ['Mi Cuenta', 'Suscripción', 'Cancelar', 'Recuperar Contraseña'],
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, href: '#', label: 'YouTube' },
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 py-12 lg:py-16">
        {/* Social Links */}
        <div className="flex items-center gap-4 mb-10">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 text-sm hover:text-white hover:underline transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">STREAMFLIX</span>
          </div>

          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} StreamFlix. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">Idioma:</span>
            <select className="bg-gray-800 text-white text-sm rounded px-3 py-1 border border-gray-700 focus:outline-none focus:border-red-500">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs max-w-3xl mx-auto">
            StreamFlix es un servicio de streaming por suscripción. El contenido disponible puede variar según la región. 
            Se requiere conexión a internet. Los precios están sujetos a cambios. 
            Algunos títulos pueden no estar disponibles en HD o 4K.
          </p>
        </div>
      </div>
    </footer>
  );
}
