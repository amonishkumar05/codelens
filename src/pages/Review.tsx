import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GradientHeader from "@/components/GradientHeader";
import Pixelate from "@/components/Pixelate";

import CodeInput from "@/components/CodeInput";
import CodeReview, { CodeIssue, SecurityVulnerability } from "@/components/CodeReview";
import { analyzeCode } from "@/utils/analyzeCode";
import { scanForVulnerabilities, VulnerabilityResult } from "@/utils/vulnerabilityScanner";
import { useToast } from "@/hooks/use-toast";
import ReviewStats from "@/components/ReviewStats";
import AnalysisLoader from "@/components/AnalysisLoader";
import { Shield, AlertTriangle } from "lucide-react";

const Review = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [reviewedCode, setReviewedCode] = useState("");
    const [issues, setIssues] = useState<CodeIssue[]>([]);
    const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
    const [hasReview, setHasReview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmitCode = async (codeToAnalyze: string) => {
        setIsLoading(true);
        setCode(codeToAnalyze);

        try {

            const [codeAnalysis, vulnerabilityAnalysis] = await Promise.all([
                analyzeCode(codeToAnalyze),
                scanForVulnerabilities(codeToAnalyze)
            ]);

            setIssues(codeAnalysis.issues);
            setVulnerabilities(vulnerabilityAnalysis.vulnerabilities);
            setReviewedCode(codeToAnalyze);
            setHasReview(true);

            const totalIssues = codeAnalysis.issues.length + vulnerabilityAnalysis.vulnerabilities.length;
            const securityIssues = vulnerabilityAnalysis.vulnerabilities.length;

            toast({
                title: "Code Review Complete",
                description: `Found ${totalIssues} issues (including ${securityIssues} security vulnerabilities).`,
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

    const getSecuritySummary = () => {
        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

        if (criticalCount > 0) {
            return {
                text: "",
                color: "text-red-600",
                icon: <Shield className="h-4 w-4 text-red-600" />
            };
        } else if (highCount > 0) {
            return {
                text: "",
                color: "text-red-500",
                icon: <Shield className="h-4 w-4 text-red-500" />
            };
        } else if (mediumCount > 0 || lowCount > 0) {
            return {
                text: "",
                color: "text-yellow-500",
                icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />
            };
        }
        return {
            text: "No security issues",
            color: "text-green-500",
            icon: <Shield className="h-5 w-5 text-green-500" />
        };
    };

    const securitySummary = getSecuritySummary();
    const hasCodeIssues = issues.length > 0;
    const hasSecurityIssues = vulnerabilities.length > 0;
    const hasAnyIssues = hasCodeIssues || hasSecurityIssues;

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


                            {isLoading ? (
                                <AnalysisLoader />
                            ) : <CodeInput onSubmitCode={handleSubmitCode} isLoading={isLoading} />}
                        </div>
                    </div>) : (
                    <div className="space-y-6">
                        <div className="max-w-4xl z-10 mx-auto mb-8 flex justify-between items-center">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold">Code Review Results</h2>
                                    <div className="flex items-center gap-4 mb-4">
                                    <ReviewStats issues={issues} />
                                    <div className="flex items-center gap-2">
                                        {securitySummary.icon}
                                        <span className={securitySummary.color}>{securitySummary.text}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setHasReview(false)}
                                className="text-sm text-primary hover:underline"
                            >
                                Review Another Snippet
                            </button>
                        </div>

                        {hasAnyIssues ? (
                            <CodeReview
                                code={reviewedCode}
                                issues={issues}
                                vulnerabilities={vulnerabilities}
                            />
                        ) : (
                            <div className="p-6 rounded-lg text-center">
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