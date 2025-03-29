import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Job from "../models/Job";
import Question from "../models/Question";
import TestCase from "../models/TestCase";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mock-interview"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Question.deleteMany({});
    await TestCase.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Admin User",
      email: "sahasubhadip54@gmail.com",
      password: adminPassword,
      isAdmin: true,
    });
    await admin.save();
    console.log("Created admin user");

    // Create regular user
    const userPassword = await bcrypt.hash("user123", 10);
    const user = new User({
      name: "Regular User",
      email: "user@example.com",
      password: userPassword,
      isAdmin: false,
    });
    await user.save();
    console.log("Created regular user");

    // Create jobs
    const jobs = [
      {
        title: "Frontend Developer",
        company: "TechCorp",
        description:
          "We are looking for a skilled Frontend Developer proficient in React.js to join our team. The ideal candidate should have experience with modern JavaScript frameworks and responsive design principles.",
        requiredSkills: ["React", "JavaScript", "HTML", "CSS", "TypeScript"],
        slug: "frontend-developer",
        difficulty: "Mid Level",
        position: "Frontend Developer",
        location: "San Francisco, CA",
        salaryRange: "$90,000 - $120,000",
        jobType: "Full-time",
      },
      {
        title: "Backend Engineer",
        company: "DataSystems",
        description:
          "Join our backend team to build scalable APIs and services. You should be familiar with Node.js, Express, and database design.",
        requiredSkills: ["Node.js", "Express", "MongoDB", "SQL", "API Design"],
        slug: "backend-engineer",
        difficulty: "Senior Level",
        position: "Backend Engineer",
        location: "New York, NY",
        salaryRange: "$110,000 - $150,000",
        jobType: "Full-time",
      },
      {
        title: "Full Stack Developer",
        company: "WebSolutions",
        description:
          "Looking for a versatile developer who can work on both frontend and backend technologies. Experience with React and Node.js is required.",
        requiredSkills: ["React", "Node.js", "MongoDB", "JavaScript", "Git"],
        slug: "full-stack-developer",
        difficulty: "Mid Level",
        position: "Full Stack Developer",
        location: "Remote",
        salaryRange: "$100,000 - $130,000",
        jobType: "Remote",
      },
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log("Created jobs");

    // Create questions for Frontend Developer job
    const frontendQuestions = [
      {
        title: "Two Sum",
        description:
          "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        examples: [
          "Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
          "Example 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\nExplanation: Because nums[1] + nums[2] == 6, we return [1, 2].",
          "Example 3:\nInput: nums = [3,3], target = 6\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 6, we return [0, 1].",
        ],
        constraints:
          "- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
        hints: [
          "Try using a hash map to store the values you've seen so far.",
          "For each number, check if target - current number exists in the hash map.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[0]._id,
        slug: "two-sum",
        solutionApproach:
          "Use a hash map to store the values and their indices. For each number, check if the complement (target - num) exists in the hash map.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        tags: ["Array", "Hash Table"],
      },
      {
        title: "Valid Parentheses",
        description:
          "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        difficulty: "Easy",
        examples: [
          'Example 1:\nInput: s = "()"\nOutput: true',
          'Example 2:\nInput: s = "()[]{}"\nOutput: true',
          'Example 3:\nInput: s = "(]"\nOutput: false',
        ],
        constraints:
          "- 1 <= s.length <= 10^4\n- s consists of parentheses only '()[]{}'.",
        hints: [
          "Use a stack to keep track of opening brackets.",
          "When you encounter a closing bracket, check if it matches the most recent opening bracket.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[0]._id,
        slug: "valid-parentheses",
        solutionApproach:
          "Use a stack to keep track of opening brackets. When encountering a closing bracket, check if it matches the top of the stack.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        tags: ["String", "Stack"],
      },
    ];

    const createdFrontendQuestions = await Question.insertMany(
      frontendQuestions
    );
    console.log("Created frontend questions");

    // Create test cases for Two Sum
    const twoSumTestCases = [
      {
        questionId: createdFrontendQuestions[0]._id,
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1],
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[0]._id,
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2],
        explanation: "nums[1] + nums[2] = 2 + 4 = 6",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[0]._id,
        input: { nums: [3, 3], target: 6 },
        expectedOutput: [0, 1],
        explanation: "nums[0] + nums[1] = 3 + 3 = 6",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[0]._id,
        input: { nums: [1, 2, 3, 4, 5], target: 9 },
        expectedOutput: [3, 4],
        explanation: "nums[3] + nums[4] = 4 + 5 = 9",
        isHidden: true,
      },
      {
        questionId: createdFrontendQuestions[0]._id,
        input: { nums: [-1, -2, -3, -4, -5], target: -8 },
        expectedOutput: [2, 4],
        explanation: "nums[2] + nums[4] = -3 + (-5) = -8",
        isHidden: true,
      },
    ];

    await TestCase.insertMany(twoSumTestCases);
    console.log("Created test cases for Two Sum");

    // Create test cases for Valid Parentheses
    const validParenthesesTestCases = [
      {
        questionId: createdFrontendQuestions[1]._id,
        input: { s: "()" },
        expectedOutput: true,
        explanation: "The string contains a valid pair of parentheses.",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[1]._id,
        input: { s: "()[]{}" },
        expectedOutput: true,
        explanation:
          "The string contains valid pairs of parentheses in the correct order.",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[1]._id,
        input: { s: "(]" },
        expectedOutput: false,
        explanation: "The closing bracket does not match the opening bracket.",
        isHidden: false,
      },
      {
        questionId: createdFrontendQuestions[1]._id,
        input: { s: "([)]" },
        expectedOutput: false,
        explanation: "The brackets are not closed in the correct order.",
        isHidden: true,
      },
      {
        questionId: createdFrontendQuestions[1]._id,
        input: { s: "{[]}" },
        expectedOutput: true,
        explanation: "The string contains nested valid pairs of brackets.",
        isHidden: true,
      },
    ];

    await TestCase.insertMany(validParenthesesTestCases);
    console.log("Created test cases for Valid Parentheses");

    // Create questions for Backend Engineer job
    const backendQuestions = [
      {
        title: "Reverse Linked List",
        description:
          "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nA linked list can be reversed either iteratively or recursively. Could you implement both?",
        difficulty: "Easy",
        examples: [
          "Example 1:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
          "Example 2:\nInput: head = [1,2]\nOutput: [2,1]",
          "Example 3:\nInput: head = []\nOutput: []",
        ],
        constraints:
          "- The number of nodes in the list is the range [0, 5000].\n- -5000 <= Node.val <= 5000",
        hints: [
          "A simple and intuitive way is to use a stack.",
          "You can also use three pointers: prev, curr, and next to reverse the links.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[1]._id,
        slug: "reverse-linked-list",
        solutionApproach:
          "Use three pointers (prev, curr, next) to reverse the links between nodes.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        tags: ["Linked List", "Recursion"],
      },
      {
        title: "Implement Queue using Stacks",
        description:
          "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (`push`, `peek`, `pop`, and `empty`).\n\nImplement the `MyQueue` class:\n\n- `void push(int x)` Pushes element x to the back of the queue.\n- `int pop()` Removes the element from the front of the queue and returns it.\n- `int peek()` Returns the element at the front of the queue.\n- `boolean empty()` Returns `true` if the queue is empty, `false` otherwise.",
        difficulty: "Medium",
        examples: [
          'Example 1:\nInput:\n["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]\nOutput:\n[null, null, null, 1, 1, false]\nExplanation:\nMyQueue myQueue = new MyQueue();\nmyQueue.push(1); // queue is: [1]\nmyQueue.push(2); // queue is: [1, 2] (leftmost is front of the queue)\nmyQueue.peek(); // return 1\nmyQueue.pop(); // return 1, queue is [2]\nmyQueue.empty(); // return false',
        ],
        constraints:
          "- 1 <= x <= 9\n- At most 100 calls will be made to push, pop, peek, and empty.\n- All the calls to pop and peek are valid.",
        hints: [
          "You can use two stacks to simulate a queue.",
          "One stack for pushing elements, and another for popping elements.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[1]._id,
        slug: "implement-queue-using-stacks",
        solutionApproach:
          "Use two stacks: one for pushing elements and another for popping elements. Transfer elements from the push stack to the pop stack when needed.",
        timeComplexity: "Push: O(1), Pop: Amortized O(1)",
        spaceComplexity: "O(n)",
        tags: ["Stack", "Queue", "Design"],
      },
    ];

    const createdBackendQuestions = await Question.insertMany(backendQuestions);
    console.log("Created backend questions");

    // Create test cases for Reverse Linked List
    // Note: For simplicity, we'll represent linked lists as arrays in the test cases
    const reverseLinkedListTestCases = [
      {
        questionId: createdBackendQuestions[0]._id,
        input: { head: [1, 2, 3, 4, 5] },
        expectedOutput: [5, 4, 3, 2, 1],
        explanation: "Reverse the linked list [1,2,3,4,5] to get [5,4,3,2,1].",
        isHidden: false,
      },
      {
        questionId: createdBackendQuestions[0]._id,
        input: { head: [1, 2] },
        expectedOutput: [2, 1],
        explanation: "Reverse the linked list [1,2] to get [2,1].",
        isHidden: false,
      },
      {
        questionId: createdBackendQuestions[0]._id,
        input: { head: [] },
        expectedOutput: [],
        explanation: "An empty linked list remains empty when reversed.",
        isHidden: false,
      },
      {
        questionId: createdBackendQuestions[0]._id,
        input: { head: [1] },
        expectedOutput: [1],
        explanation:
          "A linked list with a single node remains the same when reversed.",
        isHidden: true,
      },
      {
        questionId: createdBackendQuestions[0]._id,
        input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        expectedOutput: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        explanation: "Reverse a longer linked list.",
        isHidden: true,
      },
    ];

    await TestCase.insertMany(reverseLinkedListTestCases);
    console.log("Created test cases for Reverse Linked List");

    // Create questions for Full Stack Developer job
    const fullStackQuestions = [
      {
        title: "Merge Two Sorted Lists",
        description:
          "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        difficulty: "Easy",
        examples: [
          "Example 1:\nInput: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
          "Example 2:\nInput: list1 = [], list2 = []\nOutput: []",
          "Example 3:\nInput: list1 = [], list2 = [0]\nOutput: [0]",
        ],
        constraints:
          "- The number of nodes in both lists is in the range [0, 50].\n- -100 <= Node.val <= 100\n- Both list1 and list2 are sorted in non-decreasing order.",
        hints: [
          "Compare the first nodes of both lists and pick the smaller one.",
          "Recursively merge the remaining lists.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[2]._id,
        slug: "merge-two-sorted-lists",
        solutionApproach:
          "Use a dummy head node and iterate through both lists, always choosing the smaller value to add to the result list.",
        timeComplexity: "O(n + m)",
        spaceComplexity: "O(1)",
        tags: ["Linked List", "Recursion"],
      },
      {
        title: "Maximum Subarray",
        description:
          "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.",
        difficulty: "Medium",
        examples: [
          "Example 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.",
          "Example 2:\nInput: nums = [1]\nOutput: 1",
          "Example 3:\nInput: nums = [5,4,-1,7,8]\nOutput: 23",
        ],
        constraints: "- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
        hints: [
          "Try using Kadane's algorithm.",
          "Keep track of the current sum and the maximum sum seen so far.",
        ],
        preferredLanguage: "javascript",
        jobId: createdJobs[2]._id,
        slug: "maximum-subarray",
        solutionApproach:
          "Use Kadane's algorithm to find the maximum subarray sum by keeping track of the current sum and the maximum sum seen so far.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
      },
    ];

    const createdFullStackQuestions = await Question.insertMany(
      fullStackQuestions
    );
    console.log("Created full stack questions");

    // Create test cases for Merge Two Sorted Lists
    const mergeTwoSortedListsTestCases = [
      {
        questionId: createdFullStackQuestions[0]._id,
        input: { list1: [1, 2, 4], list2: [1, 3, 4] },
        expectedOutput: [1, 1, 2, 3, 4, 4],
        explanation:
          "Merge the two sorted lists [1,2,4] and [1,3,4] to get [1,1,2,3,4,4].",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[0]._id,
        input: { list1: [], list2: [] },
        expectedOutput: [],
        explanation: "Merging two empty lists results in an empty list.",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[0]._id,
        input: { list1: [], list2: [0] },
        expectedOutput: [0],
        explanation:
          "Merging an empty list with a non-empty list results in the non-empty list.",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[0]._id,
        input: { list1: [1, 3, 5, 7, 9], list2: [2, 4, 6, 8, 10] },
        expectedOutput: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        explanation: "Merge two sorted lists with alternating values.",
        isHidden: true,
      },
      {
        questionId: createdFullStackQuestions[0]._id,
        input: { list1: [1, 1, 1], list2: [2, 2, 2] },
        expectedOutput: [1, 1, 1, 2, 2, 2],
        explanation: "Merge two sorted lists with duplicate values.",
        isHidden: true,
      },
    ];

    await TestCase.insertMany(mergeTwoSortedListsTestCases);
    console.log("Created test cases for Merge Two Sorted Lists");

    // Create test cases for Maximum Subarray
    const maximumSubarrayTestCases = [
      {
        questionId: createdFullStackQuestions[1]._id,
        input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expectedOutput: 6,
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6.",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[1]._id,
        input: { nums: [1] },
        expectedOutput: 1,
        explanation:
          "The array has only one element, so the maximum subarray sum is 1.",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[1]._id,
        input: { nums: [5, 4, -1, 7, 8] },
        expectedOutput: 23,
        explanation: "The entire array [5,4,-1,7,8] has the largest sum = 23.",
        isHidden: false,
      },
      {
        questionId: createdFullStackQuestions[1]._id,
        input: { nums: [-1, -2, -3, -4, -5] },
        expectedOutput: -1,
        explanation:
          "All elements are negative, so the maximum subarray contains only the largest element, -1.",
        isHidden: true,
      },
      {
        questionId: createdFullStackQuestions[1]._id,
        input: { nums: [0, 0, 0, 0, 0] },
        expectedOutput: 0,
        explanation: "All elements are zero, so the maximum subarray sum is 0.",
        isHidden: true,
      },
    ];

    await TestCase.insertMany(maximumSubarrayTestCases);
    console.log("Created test cases for Maximum Subarray");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
