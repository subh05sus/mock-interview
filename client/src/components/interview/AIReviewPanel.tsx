"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Code,
  Clock,
  MemoryStick,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
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
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { toast } from "react-hot-toast";
import api from "../../services/api";

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
  questionId: string;
  submissionId: string;
  onClose: () => void;
}

export default function AIReviewPanel({
  aiReview,
  questionId,
  submissionId,
  onClose,
}: AIReviewPanelProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<string>("helpful");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  if (!aiReview) return null;

  const handleSubmitFeedback = async () => {
    try {
      setIsSubmittingFeedback(true);
      console.log({
        submissionId,
        questionId,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      await api.post("/submissions/feedback", {
        submissionId,
        questionId,
        rating: feedbackRating,
        comment: feedbackComment,
      });

      toast.success("Thank you for your feedback!");
      setShowFeedbackForm(false);
      setIsSubmittingFeedback(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
      setIsSubmittingFeedback(false);
    }
  };

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

        <div className="space-y-6 py-4 flex-1 px-6">
          {/* Overall Feedback */}
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Overall Feedback
            </h3>
            <p className="text-muted-foreground">{aiReview.overallFeedback}</p>
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

          {/* Feedback Form */}
          {showFeedbackForm ? (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                Your Feedback on This Review
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">
                    How helpful was this review?
                  </p>
                  <RadioGroup
                    value={feedbackRating}
                    onValueChange={setFeedbackRating}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_helpful" id="very_helpful" />
                      <Label htmlFor="very_helpful">Very Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="helpful" id="helpful" />
                      <Label htmlFor="helpful">Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="somewhat_helpful"
                        id="somewhat_helpful"
                      />
                      <Label htmlFor="somewhat_helpful">Somewhat Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_helpful" id="not_helpful" />
                      <Label htmlFor="not_helpful">Not Helpful</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label
                    htmlFor="feedback-comment"
                    className="text-sm font-medium"
                  >
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="feedback-comment"
                    placeholder="What did you like or dislike about this review?"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback}
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackForm(true)}
                className="flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Provide Feedback on This Review
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close Review
          </Button>
        </div>
      </Card>
    </div>
  );
}
