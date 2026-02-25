import { motion } from "framer-motion";
import { Zap, Shield, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra rápido",
    description: "Rendimiento optimizado para que tu experiencia sea fluida y sin interrupciones.",
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Protección de datos de nivel empresarial integrada desde el primer día.",
  },
  {
    icon: Layers,
    title: "Escalable",
    description: "Crece sin límites. La arquitectura se adapta a tus necesidades.",
  },
];

const Features = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Diseñado para <span className="text-gradient">el futuro</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Herramientas modernas que se adaptan a tu flujo de trabajo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:glow transition-shadow duration-500">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
