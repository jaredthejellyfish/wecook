import { useEffect, useState } from 'react';

import { SignInButton, SignedIn, SignedOut } from '@clerk/tanstack-start';
import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  ShoppingCart,
  Sparkles,
  Twitter,
  Utensils,
  Youtube,
} from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

import AnimatedUnderlineLink from '@/components/animated-underline-link';
import HamburgerButton from '@/components/hamburger-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  if (userId) {
    throw redirect({
      to: '/dashboard',
    });
  }

  return { userId };
});

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: () => authStateFn(),
});

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      name: 'AI Recipe Generation',
      description:
        'Get personalized recipes based on your preferences and dietary requirements.',
      icon: Sparkles,
    },
    {
      name: 'Smart Meal Planning',
      description:
        'Effortlessly plan your meals for the week with AI-powered suggestions.',
      icon: Calendar,
    },
    {
      name: 'Automatic Shopping Lists',
      description:
        'Generate comprehensive shopping lists for your planned meals.',
      icon: ShoppingCart,
    },
    {
      name: 'Step-by-Step Cooking Guide',
      description: 'Follow easy-to-understand instructions for each recipe.',
      icon: Utensils,
    },
  ];

  const steps = [
    {
      name: 'Set Preferences',
      description: 'Tell us about your dietary needs and taste preferences.',
    },
    {
      name: 'Generate Plan',
      description:
        'Our AI creates a personalized weekly meal plan just for you.',
    },
    {
      name: 'Shop with Ease',
      description:
        'Use the auto-generated shopping list for efficient grocery runs.',
    },
    {
      name: 'Cook and Enjoy',
      description: 'Follow our step-by-step guides to prepare delicious meals.',
    },
  ];

  const testimonials = [
    {
      body: 'WeCook has transformed my meal planning. I save time and money, and my family loves the variety of dishes!',
      author: {
        name: 'Emily Johnson',
        handle: 'emilycooks',
      },
    },
    {
      body: 'As a busy professional, WeCook is a game-changer. Healthy, delicious meals without the stress of planning.',
      author: {
        name: 'Michael Chen',
        handle: 'mikechef',
      },
    },
    {
      body: 'The AI-generated recipes are creative and always spot-on with my dietary needs. Highly recommended!',
      author: {
        name: 'Sarah Patel',
        handle: 'sarahpeats',
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
      question: 'Can I customize my meal plans?',
      answer:
        'You can set preferences for cuisine types, dietary restrictions, and even specify ingredients you want to use or avoid. The AI will take all of these factors into account when creating your personalized meal plan.',
    },
    {
      question: 'How accurate are the generated shopping lists?',
      answer:
        'Our shopping lists are highly accurate and based on the exact ingredients needed for your meal plan. The AI also considers common pantry items you might already have, helping to minimize waste and save money.',
    },
    {
      question: 'Is WeCook suitable for people with specific dietary needs?',
      answer:
        'Yes! WeCook caters to a wide range of dietary needs, including vegetarian, vegan, gluten-free, keto, and many more. You can specify your dietary requirements, and the AI will ensure all generated recipes and meal plans comply with your needs.',
    },
  ];

  const footerNavigation = {
    main: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Jobs', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Accessibility', href: '#' },
      { name: 'Partners', href: '#' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: Facebook },
      { name: 'Instagram', href: '#', icon: Instagram },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'YouTube', href: '#', icon: Youtube },
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
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div
      className={
        'min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
      }
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-primary dark:text-primary-dark font-serif"
          >
            WeCook
          </Link>
          <nav className="hidden md:flex space-x-6">
            <AnimatedUnderlineLink href="#features">
              Features
            </AnimatedUnderlineLink>

            <AnimatedUnderlineLink href="#how-it-works">
              How It Works
            </AnimatedUnderlineLink>
            <AnimatedUnderlineLink href="#testimonials">
              Testimonials
            </AnimatedUnderlineLink>
            <AnimatedUnderlineLink href="#faq">FAQ</AnimatedUnderlineLink>
          </nav>

          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <ThemeToggle />
            <HamburgerButton
              isOpen={isMenuOpen}
              toggleMenu={() => setIsMenuOpen((o) => !o)}
            />
          </div>
        </div>

        <motion.div
          className="md:hidden bg-white dark:bg-neutral-800 overflow-hidden border-y border-neutral-200 dark:border-neutral-700"
          initial={false}
          animate={isMenuOpen ? 'open' : 'closed'}
          variants={{
            open: {
              height: 'auto',
              opacity: 1,
              padding: '1rem 0',
              transition: {
                height: { duration: 0.2, ease: 'easeOut' },
                opacity: { duration: 0.3, ease: 'easeIn' },
              },
            },
            closed: {
              height: 0,
              opacity: 0,
              padding: 0,
              transition: {
                height: { duration: 0.2, ease: 'easeIn' },
                opacity: { duration: 0.3, ease: 'easeOut' },
              },
            },
          }}
        >
          <nav className="flex flex-col space-y-4 px-4">
            <a
              href="#features"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              FAQ
            </a>
            {/* <ThemeToggle /> */}
            <div className="relative w-full h-9">
              <SignedIn>
                <Link to="/dashboard">
                  <Button className="absolute top-0 bottom-0 right-0 left-0 z-10">
                    Dashboard
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <Button className="absolute top-0 bottom-0 right-0 left-0 z-10">
                    Get Started
                  </Button>
                </SignInButton>
              </SignedOut>
              <Skeleton className="absolute top-0 bottom-0 right-0 left-0 z-0 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                <span>Loading...</span>
              </Skeleton>
            </div>
          </nav>
        </motion.div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-white dark:from-primary-dark/10 dark:to-neutral-900 h-[calc(100vh-5vh)] flex items-center justify-center"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.h1
                variants={itemVariants}
                className="font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl"
              >
                AI-Powered Meal Planning Made Simple
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300"
              >
                WeCook uses cutting-edge AI to plan your meals, generate
                recipes, and create shopping lists. Say goodbye to meal prep
                stress and hello to delicious, effortless cooking.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <div className="relative w-[154px] h-9">
                  <SignInButton>
                    <Button className="absolute top-0 bottom-0 right-0 left-0 z-10 hover:bg-secondary hover:text-white">
                      Get Started
                    </Button>
                  </SignInButton>

                  <Button
                    disabled
                    className="absolute top-0 bottom-0 right-0 left-0 z-0"
                  >
                    Get Started
                  </Button>
                </div>
                <AnimatedUnderlineLink href="#how-it-works">
                  Learn more <span aria-hidden="true">→</span>
                </AnimatedUnderlineLink>
              </motion.div>
            </motion.div>
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              animate={{
                rotate: isScrolled ? 180 : 0,
                scale: isScrolled ? 1.2 : 0.9,
              }}
            >
              <ChevronDown
                className="h-6 w-6 text-neutral-600 dark:text-neutral-400"
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth',
                  });
                }}
              />
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
              repeatType: 'reverse',
            }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.8, 0.7],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5,
            }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-200 dark:bg-yellow-800 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
          ></motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          id="features"
          className="py-24 sm:py-32 bg-white dark:bg-neutral-800"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto
max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary dark:text-primary-dark">
                Features
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Everything you need to become a master chef
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
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
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                      <feature.icon
                        className="h-5 w-5 flex-none text-primary dark:text-primary-dark"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-300">
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
          className="bg-white dark:bg-neutral-900 py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary dark:text-primary-dark">
                How It Works
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Four simple steps to culinary success
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
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
                    <dt className="text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary dark:bg-primary-dark">
                        <CheckCircle
                          className="h-6 w-6 text-white dark:text-black"
                          aria-hidden="true"
                        />
                      </div>
                      {step.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-neutral-600 dark:text-neutral-300">
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
          className="bg-white dark:bg-neutral-800 py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary dark:text-primary-dark">
                Testimonials
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
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
                    className="flex flex-col justify-between bg-white dark:bg-neutral-700 p-8 shadow-lg ring-1 ring-neutral-900/5 rounded-lg"
                  >
                    <blockquote className="text-neutral-900 dark:text-white">
                      <p className="text-lg">{`"${testimonial.body}"`}</p>
                    </blockquote>
                    <div className="mt-6 flex items-center gap-x-4">
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {testimonial.author.name}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-300">{`@${testimonial.author.handle}`}</p>
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
          className="bg-neutral-50 dark:bg-neutral-900 py-24 sm:py-32"
        >
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="mx-auto max-w-2xl lg:text-center"
            >
              <h2 className="text-base font-semibold leading-7 text-primary dark:text-primary-dark">
                FAQ
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Frequently asked questions
              </p>
              <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
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
                    className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md"
                  >
                    <dt className="text-base font-semibold leading-7 text-neutral-900 dark:text-white">
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
                              key={openFaqIndex === index ? 'minus' : 'plus'}
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: openFaqIndex === index ? 180 : 0,
                              }}
                              exit={{ rotate: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {openFaqIndex === index ? (
                                <ChevronUp
                                  className="h-6 w-6 text-neutral-600 dark:text-neutral-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronDown
                                  className="h-6 w-6 text-neutral-600 dark:text-neutral-400"
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
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="mt-2 pr-12"
                        >
                          <p className="text-base leading-7 text-neutral-600 dark:text-neutral-300">
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
        className="bg-white dark:bg-neutral-800"
      >
        <div className="container mx-auto px-4 py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            {footerNavigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} WeCook, Inc. All rights
              reserved.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <nav
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            {footerNavigation.main.map((item) => (
              <div key={item.name} className="px-5 py-2">
                <a
                  href={item.href}
                  className="text-base text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300"
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
