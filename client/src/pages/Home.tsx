"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  BrainCircuit,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Cpu,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <Code2 className="h-10 w-10 text-yellow-600" />,
      title: "Interactive Coding Environment",
      description:
        "Write, run, and test your code in our feature-rich editor with syntax highlighting and autocompletion.",
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-yellow-600" />,
      title: "AI-Powered Feedback",
      description:
        "Receive detailed code reviews and suggestions from our advanced AI system.",
    },
    {
      icon: <Briefcase className="h-10 w-10 text-yellow-600" />,
      title: "Job-Specific Questions",
      description:
        "Practice with questions tailored to specific job roles and skill requirements.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-yellow-600" />,
      title: "Comprehensive Test Cases",
      description:
        "Validate your solutions against multiple test cases, including hidden edge cases.",
    },
    {
      icon: <Cpu className="h-10 w-10 text-yellow-600" />,
      title: "Performance Metrics",
      description:
        "Track execution time and memory usage to optimize your solutions.",
    },
    {
      icon: <Users className="h-10 w-10 text-yellow-600" />,
      title: "Mock Interview Simulation",
      description:
        "Experience realistic interview conditions with timed challenges and pressure scenarios.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Ace Your Next Technical Interview
              </motion.h1>
              <motion.p
                className="text-xl mb-8 text-secondary-foreground/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Practice with our AI-powered mock interview platform. Solve real
                coding challenges, receive instant feedback, and improve your
                skills.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {isAuthenticated ? (
                  <Link to="/jobs">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Start Practicing
                      <ChevronRight
                        className={`ml-2 transition-transform duration-300 ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      Get Started
                      <ChevronRight
                        className={`ml-2 transition-transform duration-300 ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-card rounded-lg shadow-xl overflow-hidden border border-border">
                <div className="bg-muted px-4 py-2 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <div className="text-muted-foreground text-sm ml-2">
                    mock-interview.js
                  </div>
                </div>
                <div className="bg-zinc-900 p-4 text-zinc-300 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null;
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent dark:to-zinc-900"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered mock interview system helps you prepare for
              technical interviews with real-world coding challenges and instant
              feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-yellow-600/20 hover:border-yellow-600/50">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of developers who have improved their interview
            skills with our platform.
          </p>
          {isAuthenticated ? (
            <Link to="/jobs">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse Job Challenges
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
