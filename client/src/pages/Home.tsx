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
      icon: <Code2 className="h-10 w-10 text-indigo-500" />,
      title: "Interactive Coding Environment",
      description:
        "Write, run, and test your code in our feature-rich editor with syntax highlighting and autocompletion.",
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-indigo-500" />,
      title: "AI-Powered Feedback",
      description:
        "Receive detailed code reviews and suggestions from our advanced AI system.",
    },
    {
      icon: <Briefcase className="h-10 w-10 text-indigo-500" />,
      title: "Job-Specific Questions",
      description:
        "Practice with questions tailored to specific job roles and skill requirements.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-indigo-500" />,
      title: "Comprehensive Test Cases",
      description:
        "Validate your solutions against multiple test cases, including hidden edge cases.",
    },
    {
      icon: <Cpu className="h-10 w-10 text-indigo-500" />,
      title: "Performance Metrics",
      description:
        "Track execution time and memory usage to optimize your solutions.",
    },
    {
      icon: <Users className="h-10 w-10 text-indigo-500" />,
      title: "Mock Interview Simulation",
      description:
        "Experience realistic interview conditions with timed challenges and pressure scenarios.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
                className="text-xl mb-8 text-indigo-100"
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
                      className="bg-white text-indigo-600 hover:bg-indigo-100"
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
                      className="bg-white text-indigo-600 hover:bg-indigo-100"
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
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="text-gray-400 text-sm ml-2">
                    mock-interview.js
                  </div>
                </div>
                <div className="bg-gray-900 p-4 text-gray-300 font-mono text-sm">
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
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
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
                <Card className="h-full hover:shadow-lg transition-shadow">
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
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Join thousands of developers who have improved their interview
            skills with our platform.
          </p>
          {isAuthenticated ? (
            <Link to="/jobs">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Browse Job Challenges
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
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
