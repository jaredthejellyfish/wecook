// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  ShoppingCart,
  Utensils,
  X,
  Menu,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
    {
      name: "AI Recipe Generation",
      description:
        "Get personalized recipes based on your preferences and dietary requirements.",
      icon: Sparkles,
    },
    {
      name: "Smart Meal Planning",
      description:
        "Effortlessly plan your meals for the week with AI-powered suggestions.",
      icon: Calendar,
    },
    {
      name: "Automatic Shopping Lists",
      description:
        "Generate comprehensive shopping lists for your planned meals.",
      icon: ShoppingCart,
    },
    {
      name: "Step-by-Step Cooking Guide",
      description: "Follow easy-to-understand instructions for each recipe.",
      icon: Utensils,
    },
  ];

  const steps = [
    {
      name: "Set Preferences",
      description: "Tell us about your dietary needs and taste preferences.",
    },
    {
      name: "Generate Plan",
      description:
        "Our AI creates a personalized weekly meal plan just for you.",
    },
    {
      name: "Shop with Ease",
      description:
        "Use the auto-generated shopping list for efficient grocery runs.",
    },
    {
      name: "Cook and Enjoy",
      description: "Follow our step-by-step guides to prepare delicious meals.",
    },
  ];

  const testimonials = [
    {
      body: "WeCook has transformed my meal planning. I save time and money, and my family loves the variety of dishes!",
      author: {
        name: "Emily Johnson",
        handle: "emilycooks",
      },
    },
    {
      body: "As a busy professional, WeCook is a game-changer. Healthy, delicious meals without the stress of planning.",
      author: {
        name: "Michael Chen",
        handle: "mikechef",
      },
    },
    {
      body: "The AI-generated recipes are creative and always spot-on with my dietary needs. Highly recommended!",
      author: {
        name: "Sarah Patel",
        handle: "sarahpeats",
      },
    },
  ];

  const faqs = [
    {
      question: "How does WeCook's AI generate recipes?",
      answer:
        "WeCook's AI analyzes your preferences, dietary requirements, and available ingredients to create personalized recipes. It combines this information with a vast database of culinary knowledge to generate unique and delicious meal ideas.",
    },
    {
      question: "Can I customize my meal plans?",
      answer:
        "You can set preferences for cuisine types, dietary restrictions, and even specify ingredients you want to use or avoid. The AI will take all of these factors into account when creating your personalized meal plan.",
    },
    {
      question: "How accurate are the generated shopping lists?",
      answer:
        "Our shopping lists are highly accurate and based on the exact ingredients needed for your meal plan. The AI also considers common pantry items you might already have, helping to minimize waste and save money.",
    },
    {
      question: "Is WeCook suitable for people with specific dietary needs?",
      answer:
        "Yes! WeCook caters to a wide range of dietary needs, including vegetarian, vegan, gluten-free, keto, and many more. You can specify your dietary requirements, and the AI will ensure all generated recipes and meal plans comply with your needs.",
    },
  ];

  const footerNavigation = {
    main: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Jobs", href: "#" },
      { name: "Press", href: "#" },
      { name: "Accessibility", href: "#" },
      { name: "Partners", href: "#" },
    ],
    social: [
      { name: "Facebook", href: "#", icon: Facebook },
      { name: "Instagram", href: "#", icon: Instagram },
      { name: "Twitter", href: "#", icon: Twitter },
      { name: "YouTube", href: "#", icon: Youtube },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-primary">
            WeCook
          </a>
          <nav className="hidden md:flex space-x-6">
            <a
              href="#features"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              FAQ
            </a>
          </nav>
          <div className="hidden md:block">
            <Button>Get Started</Button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4">
            <nav className="flex flex-col space-y-4 px-4">
              <a
                href="#features"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <Button className="w-full">Get Started</Button>
            </nav>
          </div>
        )}
      </motion.header>

      <main>
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-white py-20 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.h1
                variants={itemVariants}
                className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
              >
                AI-Powered Meal Planning Made Simple
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-6 text-lg leading-8 text-gray-600"
              >
                WeCook uses cutting-edge AI to plan your meals, generate
                recipes, and create shopping lists. Say goodbye to meal prep
                stress and hello to delicious, effortless cooking.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <Button size="lg">Start Cooking Smarter</Button>
                <a
                  href="#how-it-works"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.8, 0.7],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.8, 0.7],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
          ></motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          id="features"
          className="py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary">
                Features
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to become a master chef
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                WeCook combines cutting-edge AI technology with user-friendly
                features to revolutionize your cooking experience.
              </p>
            </motion.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    variants={itemVariants}
                    custom={index}
                    className="flex flex-col"
                  >
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <feature.icon
                        className="h-5 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          id="how-it-works"
          className="bg-white py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary">
                How It Works
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Four simple steps to culinary success
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                WeCook simplifies your cooking journey from start to finish.
                Here's how our AI-powered platform works:
              </p>
            </motion.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.name}
                    variants={itemVariants}
                    custom={index}
                    className="relative pl-16"
                  >
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <CheckCircle
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      {step.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {step.description}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          id="testimonials"
          className="bg-white py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary">
                Testimonials
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Hear from our happy cooks
              </p>
            </motion.div>
            <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.author.handle}
                    variants={itemVariants}
                    custom={index}
                    className="flex flex-col justify-between bg-white p-8 shadow-lg ring-1 ring-gray-900/5 rounded-lg"
                  >
                    <blockquote className="text-gray-900">
                      <p className="text-lg">{`"${testimonial.body}"`}</p>
                    </blockquote>
                    <div className="mt-6 flex items-center gap-x-4">
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-gray-900">
                          {testimonial.author.name}
                        </p>
                        <p className="text-gray-600">{`@${testimonial.author.handle}`}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          id="faq"
          className="bg-gray-50 py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary">
                FAQ
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently asked questions
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Can't find the answer you're looking for? Reach out to our
                customer support team.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mx-auto mt-16 max-w-2xl"
            >
              <dl className="space-y-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    variants={itemVariants}
                    custom={index}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <button
                        onClick={() =>
                          setOpenFaqIndex(openFaqIndex === index ? null : index)
                        }
                        className="flex w-full items-start justify-between text-left"
                        aria-expanded={openFaqIndex === index}
                      >
                        <span>{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          <AnimatePresence initial={false} mode="wait">
                            <motion.div
                              key={openFaqIndex === index ? "minus" : "plus"}
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: openFaqIndex === index ? 180 : 0,
                              }}
                              exit={{ rotate: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {openFaqIndex === index ? (
                                <ChevronUp
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronDown
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </span>
                      </button>
                    </dt>
                    <AnimatePresence initial={false}>
                      {openFaqIndex === index && (
                        <motion.dd
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="mt-2 pr-12"
                        >
                          <p className="text-base leading-7 text-gray-600">
                            {faq.answer}
                          </p>
                        </motion.dd>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white"
      >
        <div className="container mx-auto px-4 py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            {footerNavigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} WeCook, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 border-t border-gray-200">
          <nav
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            {footerNavigation.main.map((item) => (
              <div key={item.name} className="px-5 py-2">
                <a
                  href={item.href}
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  {item.name}
                </a>
              </div>
            ))}
          </nav>
        </div>
      </motion.footer>
    </div>
  );
}
