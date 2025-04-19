import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientHeader from "@/components/GradientHeader";
import Pixelate from "@/components/Pixelate";

import CodeInput from "@/components/CodeInput";
import CodeReview, { CodeIssue } from "@/components/CodeReview";
import { analyzeCode } from "@/utils/engineer";
import { useToast } from "@/hooks/use-toast";
import ReviewStats from "@/components/ReviewStats";

const Review = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [reviewedCode, setReviewedCode] = useState("");
    const [issues, setIssues] = useState<CodeIssue[]>([]);
    const [hasReview, setHasReview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmitCode = async (codeToAnalyze: string) => {
        setIsLoading(true);
        setCode(codeToAnalyze);

        try {
            const result = await analyzeCode(codeToAnalyze);
            setIssues(result.issues);
            setReviewedCode(codeToAnalyze);
            setHasReview(true);

            toast({
                title: "Code Review Complete",
                description: `Found ${result.issues.length} issues to address.`,
            });
        } catch (error) {
            console.error("Error during code review:", error);
            toast({
                title: "Review Failed",
                description: "There was an error analyzing your code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex flex-col">
            <GradientHeader />
            <a href="/" className="w-fit">
                <img src="/scan.svg" alt="scan" className=" w-[40px] h-[40px] absolute top-6 left-24 object-cover opacity-40 z-5" />
            </a>

            <div className="container mx-auto px-4 py-8 flex-1">
                {!hasReview ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="p-8 rounded-lg text-center flex flex-col items-center">
                            <Pixelate
                                children="Let's review your code!"
                                className="text-3xl mb-6"
                            />

                            <CodeInput onSubmitCode={handleSubmitCode} isLoading={isLoading} />
                        </div>
                    </div>) : (
                    <div className="space-y-6">
                        <div className="max-w-4xl z-10 mx-auto mb-12 flex justify-between items-center">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold">Code Review Results</h2>
                                <ReviewStats issues={issues} />
                            </div>
                            <button
                                onClick={() => setHasReview(false)}
                                className="text-sm text-primary hover:underline"
                            >
                                Review Another Snippet
                            </button>

                        </div>
                        {issues.length > 0 ? (
                            <>
                                <CodeReview code={reviewedCode} issues={issues} />
                            </>
                        ) : (
                            <div className="bg-secondary/50 p-6 rounded-lg text-center">
                                <h3 className="text-xl font-medium mb-2">No issues found</h3>
                                <p className="text-muted-foreground">
                                    Your code looks great! No improvements or issues were detected.
                                </p>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;