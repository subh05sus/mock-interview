import OpenAI from "openai";
import type { IQuestion } from "../models/Question";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
// Ensure OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OpenAI API key is not set in environment variables.");
}
// Configure OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  // Generate a question based on job details and difficulty
  static async generateQuestion(job: any, difficulty: string): Promise<any> {
    try {
      const prompt = `
        Generate a coding interview question for a ${job.title} position at ${
        job.company
      }.
        
        Job Description: ${job.description}
        
        Required Skills: ${job.requiredSkills.join(", ")}
        
        Difficulty Level: ${difficulty}
        
        The question should:
        1. Be relevant to the job and required skills
        2. Be at the appropriate difficulty level (${difficulty})
        3. Include a clear problem statement
        4. Include 2-3 examples with input and expected output
        5. Include constraints on the input
        6. Include 2-3 hints that help solve the problem without giving away the solution
        7. Include a detailed solution approach
        8. Include time and space complexity analysis
        9. Include 3-5 relevant tags (e.g., "Array", "Dynamic Programming", etc.)
        
        Format the response as a JSON object with the following structure:
        {
          "title": "Question title",
          "description": "Detailed problem statement",
          "difficulty": "${difficulty}",
          "examples": ["Example 1: Input... Output...", "Example 2: Input... Output..."],
          "constraints": "Constraints on input parameters",
          "hints": ["Hint 1", "Hint 2", "Hint 3"],
          "preferredLanguage": "javascript", // or another language that fits the job
          "solutionApproach": "Detailed explanation of the solution approach",
          "timeComplexity": "O(n) where n is...",
          "spaceComplexity": "O(n) where n is...",
          "tags": ["Array", "Two Pointers", "etc."]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert coding interview question creator.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      console.log(response);
      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error("Failed to generate question");
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse question JSON");
      }

      const questionData = JSON.parse(jsonMatch[0]);

      // Add job ID to question data
      questionData.jobId = job._id;

      return questionData;
    } catch (error) {
      console.error("Error generating question:", error);
      throw new Error("Failed to generate question");
    }
  }

  // Generate test cases for a question
  static async generateTestCases(question: IQuestion): Promise<any[]> {
    try {
      const prompt = `
        Generate 5 test cases for the following coding interview question:
        
        Title: ${question.title}
        
        Description: ${question.description}
        
        Examples: ${question.examples.join("\n")}
        
        Constraints: ${question.constraints}
        
        Generate 5 test cases with varying complexity:
        - 2 simple test cases (visible to the user)
        - 2 medium test cases (visible to the user)
        - 1 complex edge case (hidden from the user)
        
        Format the response as a JSON array with the following structure for each test case:
        [
          {
            "input": {}, // The input parameters as a JSON object
            "expectedOutput": {}, // The expected output as a JSON value
            "explanation": "Explanation of why this is the expected output",
            "isHidden": false // Whether this test case should be hidden from the user
          },
          // More test cases...
        ]
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating test cases for coding interview questions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error("Failed to generate test cases");
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to parse test cases JSON");
      }

      const testCases = JSON.parse(jsonMatch[0]);

      // Add question ID to each test case
      return testCases.map((testCase: any) => ({
        ...testCase,
        questionId: question._id,
      }));
    } catch (error) {
      console.error("Error generating test cases:", error);
      throw new Error("Failed to generate test cases");
    }
  }

  // Review code submission
  static async reviewCode(
    code: string,
    language: string,
    question: IQuestion
  ): Promise<any> {
    try {
      const prompt = `
        Review the following ${language} code solution for this coding interview question:
        
        Question: ${question.title}
        
        Description: ${question.description}
        
        Code:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Provide a comprehensive code review including:
        1. Overall feedback on the solution
        2. Code quality assessment
        3. Time complexity analysis
        4. Space complexity analysis
        5. Correctness evaluation
        6. Efficiency evaluation
        7. Readability evaluation
        8. Best practices evaluation
        9. Specific suggestions for improvement
        
        Format the response as a JSON object with the following structure:
        {
          "overallFeedback": "Overall assessment of the solution",
          "codeQuality": "Assessment of code quality, style, and organization",
          "timeComplexity": "Analysis of time complexity with Big O notation",
          "spaceComplexity": "Analysis of space complexity with Big O notation",
          "correctness": "Evaluation of solution correctness",
          "efficiency": "Evaluation of solution efficiency",
          "readability": "Evaluation of code readability",
          "bestPractices": "Evaluation of adherence to best practices",
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer for coding interviews.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error("Failed to generate code review");
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse code review JSON");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error reviewing code:", error);
      throw new Error("Failed to review code");
    }
  }

  // Add this function to the AIService class

  static async generateLanguageTemplates(question: any): Promise<any> {
    try {
      const prompt = `
Generate code templates for the following coding question in JavaScript, Python, Java, and C++.
The templates should include the function signature and any necessary imports or class definitions.

Question: ${question.title}
Description: ${question.description}
Examples: ${question.examples.join("\n")}
Constraints: ${question.constraints}

Please provide templates in the following format:
1. JavaScript template
2. Python template
3. Java template
4. C++ template

Each template should include proper function signatures, parameter types, and return types based on the question.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a coding assistant that generates code templates for programming questions.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message?.content || "";

      // Parse the response to extract templates
      const templates = {
        javascript: AIService.extractTemplate(content, "JavaScript"),
        python: AIService.extractTemplate(content, "Python"),
        java: AIService.extractTemplate(content, "Java"),
        cpp: AIService.extractTemplate(content, "C++"),
      };

      return templates;
    } catch (error) {
      console.error("Error generating language templates:", error);
      // Provide default templates if AI generation fails
      return AIService.getDefaultTemplates(question.title);
    }
  }

  // Helper method to extract templates from AI response
  private static extractTemplate(content: string, language: string): string {
    const regex = new RegExp(
      `${language}[\\s\\S]*?\`\`\`(?:${language.toLowerCase()}|javascript|python|java|cpp)([\\s\\S]*?)\`\`\``,
      "i"
    );
    const match = content.match(regex);

    if (match && match[1]) {
      return match[1].trim();
    }

    // Return default template if extraction fails
    return AIService.getDefaultTemplate(language);
  }

  // Default templates if AI generation fails
  private static getDefaultTemplates(title: string): any {
    const functionName = title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/^[0-9]+/, "");

    return {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var ${functionName} = function(nums1, m, nums2, n) {
    // Write your solution here
};`,
      python: `class Solution:
    def ${functionName}(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """
        Do not return anything, modify nums1 in-place instead.
        """
        # Write your solution here
        pass`,
      java: `class Solution {
    public void ${functionName}(int[] nums1, int m, int[] nums2, int n) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    void ${functionName}(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        // Write your solution here
    }
};`,
    };
  }

  // Get a single default template
  private static getDefaultTemplate(language: string): string {
    const templates = AIService.getDefaultTemplates("merge");
    return templates[language.toLowerCase()] || "";
  }
}
