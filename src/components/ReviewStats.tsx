
import { FC } from "react";
import { CodeIssue } from "./CodeReview";

interface ReviewStatsProps {
  issues: CodeIssue[];
}

const ReviewStats: FC<ReviewStatsProps> = ({ issues }) => {
  const errorCount = issues.filter(issue => issue.severity === "error").length;
  const warningCount = issues.filter(issue => issue.severity === "warning").length;
  const infoCount = issues.filter(issue => issue.severity === "info").length;
  
  return (
    <div className="flex space-x-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-code-error"></div>
        <span className="text-sm">
          {errorCount} {errorCount === 1 ? "Error" : "Errors"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-code-warning"></div>
        <span className="text-sm">
          {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-code-info"></div>
        <span className="text-sm">
          {infoCount} {infoCount === 1 ? "Suggestion" : "Suggestions"}
        </span>
      </div>
    </div>
  );
};

export default ReviewStats;
