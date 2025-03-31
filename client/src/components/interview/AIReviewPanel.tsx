"use client";
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Code,
  MemoryStick,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-select";

interface AIReviewPanelProps {
  aiReview: {
    overallFeedback: string;
    codeQuality: string;
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
    correctness: string;
    efficiency: string;
    readability: string;
    bestPractices: string;
  };
  onClose: () => void;
}

export default function AIReviewPanel({
  aiReview,
  onClose,
}: AIReviewPanelProps) {
  if (!aiReview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-scroll no-scrollbar flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">AI Code Review</CardTitle>
            <CardDescription>
              Detailed feedback on your solution
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Overall Feedback */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Overall Feedback
              </h3>
              <p className="text-muted-foreground">
                {aiReview.overallFeedback}
              </p>
            </div>

            <Separator />

            {/* Code Quality */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Code className="h-5 w-5 mr-2 text-blue-500" />
                Code Quality
              </h3>
              <p className="text-muted-foreground">{aiReview.codeQuality}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Complexity */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Time Complexity
                  </h4>
                  <p className="text-sm">{aiReview.timeComplexity}</p>
                </CardContent>
              </Card>

              {/* Space Complexity */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <MemoryStick className="h-4 w-4 mr-2 text-purple-500" />
                    Space Complexity
                  </h4>
                  <p className="text-sm">{aiReview.spaceComplexity}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Detailed Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Detailed Analysis</h3>

              <div className="space-y-4">
                {/* Correctness */}
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {aiReview.correctness?.includes("correct") ||
                    aiReview.correctness?.includes("good") ? (
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Correctness</h4>
                    <p className="text-sm text-muted-foreground">
                      {aiReview.correctness}
                    </p>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {aiReview.efficiency?.includes("efficient") ||
                    aiReview.efficiency?.includes("good") ? (
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Efficiency</h4>
                    <p className="text-sm text-muted-foreground">
                      {aiReview.efficiency}
                    </p>
                  </div>
                </div>

                {/* Readability */}
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {aiReview.readability?.includes("readable") ||
                    aiReview.readability?.includes("good") ? (
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Readability</h4>
                    <p className="text-sm text-muted-foreground">
                      {aiReview.readability}
                    </p>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {aiReview.bestPractices?.includes("follow") ||
                    aiReview.bestPractices?.includes("good") ? (
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Best Practices</h4>
                    <p className="text-sm text-muted-foreground">
                      {aiReview.bestPractices}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Suggestions */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Suggestions for Improvement
              </h3>

              <ul className="space-y-2 mt-3">
                {aiReview.suggestions?.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <Badge className="mr-2 mt-0.5">{index + 1}</Badge>
                    <p className="text-sm">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
        <div className="p-4">
          <div className="border-t">
            <Button onClick={onClose} className="w-full">
              Close Review
            </Button>
          </div>
          <div className="text-xs mt-2 text-muted-foreground">
            Feedback generated by AI
          </div>
        </div>
      </Card>
    </div>
  );
}
