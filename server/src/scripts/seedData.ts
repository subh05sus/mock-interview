import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job";
import Question from "../models/Question";

dotenv.config();

// Sample jobs data
const jobsData = [
  {
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    description:
      "We are looking for a skilled Frontend Developer to join our team.",
    requirements: ["React", "JavaScript", "TypeScript", "CSS", "HTML"],
    salary: "$120,000 - $150,000",
  },
  {
    title: "Backend Developer",
    company: "DataSystems",
    location: "New York, NY",
    description: "Join our backend team to build scalable APIs and services.",
    requirements: ["Node.js", "Express", "MongoDB", "SQL", "AWS"],
    salary: "$130,000 - $160,000",
  },
  {
    title: "Full Stack Engineer",
    company: "StartupX",
    location: "Remote",
    description:
      "Looking for a versatile developer who can work on both frontend and backend.",
    requirements: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
    salary: "$140,000 - $170,000",
  },
];

// Sample questions data
const questionsData = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    jobTags: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Engineer",
      "JavaScript",
      "TypeScript",
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]",
      },
    ],
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'",
    ],
    jobTags: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Engineer",
      "JavaScript",
      "TypeScript",
    ],
    testCases: [
      {
        input: '"()"',
        output: "true",
      },
      {
        input: '"()[]{}"',
        output: "true",
      },
      {
        input: '"(]"',
        output: "false",
      },
      {
        input: '"([)]"',
        output: "false",
      },
      {
        input: '"{[]}"',
        output: "true",
      },
    ],
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
      },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    jobTags: [
      "Backend Developer",
      "Full Stack Engineer",
      "JavaScript",
      "TypeScript",
      "Node.js",
    ],
    testCases: [
      {
        input: "[1,2,4]\n[1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "[]\n[]",
        output: "[]",
      },
      {
        input: "[]\n[0]",
        output: "[0]",
      },
    ],
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
      },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    jobTags: [
      "Backend Developer",
      "Full Stack Engineer",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Algorithms",
    ],
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
      },
      {
        input: "[1]",
        output: "1",
      },
      {
        input: "[5,4,-1,7,8]",
        output: "23",
      },
    ],
  },
  {
    title: "LRU Cache",
    difficulty: "Medium",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) Initialize the LRU cache with positive size capacity. int get(int key) Return the value of the key if the key exists, otherwise return -1. void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
    examples: [
      {
        input:
          '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation:
          "LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    jobTags: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Engineer",
      "JavaScript",
      "TypeScript",
      "Data Structures",
    ],
    testCases: [
      {
        input:
          '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
      },
    ],
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mock-interview"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Job.deleteMany({});
    await Question.deleteMany({});
    console.log("Cleared existing data");

    // Insert jobs
    await Job.insertMany(jobsData);
    console.log("Inserted jobs");

    // Insert questions
    await Question.insertMany(questionsData);
    console.log("Inserted questions");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
