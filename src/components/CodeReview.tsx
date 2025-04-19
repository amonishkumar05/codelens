import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-json";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";

export type IssueSeverity = "error" | "warning" | "info";

export interface CodeIssue {
  line: number;
  message: string;
  severity: IssueSeverity;
}

interface CodeReviewProps {
  code: string;
  issues: CodeIssue[];
}

const CodeReview = ({ code, issues }: CodeReviewProps) => {
  const codeLines = code.split("\n");
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (code) {
      const language = detectLanguage(code);

      if (codeRef.current) {
        codeRef.current.innerHTML = codeLines
          .map(line => Prism.highlight(line || " ", Prism.languages[language], language))
          .join('\n');
      }
    }
  }, [code, codeLines]);

  const detectLanguage = (code: string): string => {
    if (code.includes('import React') || code.includes('export interface') || code.includes('<React.') || code.includes('</>')) {
      return code.includes(':') && (code.includes('interface') || code.includes('type ')) ? 'tsx' : 'jsx';
    }
    if (code.includes('export') && code.includes('interface') || code.includes('type ') && code.includes('=') && code.includes(':')) {
      return 'typescript';
    }
    if (code.includes('import ') && code.includes('from ') || code.includes('const ') && code.includes('=>')) {
      return 'javascript';
    }


    if (code.includes('def ') && code.includes(':') && !code.includes('=>') ||
      code.includes('import ') && code.includes('as ') && !code.includes('from \'') ||
      code.includes('class ') && code.includes(':') && !code.includes('{')) {
      return 'python';
    }


    if ((code.includes('public class') || code.includes('private') || code.includes('protected')) &&
      code.includes('{') && code.includes(';')) {
      return 'java';
    }


    if (code.includes('#include <') ||
      (code.includes('int ') && code.includes(';') && code.includes('{') && code.includes('}'))) {
      return code.includes('::') || code.includes('template<') ? 'cpp' : 'c';
    }


    if (code.includes('namespace ') && code.includes('using ') && code.includes(';')) {
      return 'csharp';
    }


    if (code.includes('<!DOCTYPE html>') ||
      (code.includes('<') && code.includes('>') &&
        (code.includes('<div') || code.includes('<span') || code.includes('<html')))) {
      return 'markup';
    }


    if (code.includes('{') && code.includes('}') &&
      (code.includes(':') && !code.includes('=>')) &&
      (code.includes(';') || code.includes('px') || code.includes('em') || code.includes('rem'))) {
      return 'css';
    }


    if ((code.startsWith('{') && code.endsWith('}') || code.startsWith('[') && code.endsWith(']')) &&
      code.includes('"') && code.includes(':')) {
      return 'json';
    }


    if (code.includes('package ') && code.includes('import (') || code.includes('func ') && code.includes('() {')) {
      return 'go';
    }


    if (code.includes('fn ') && code.includes('-> ') || code.includes('let mut ') || code.includes('impl ')) {
      return 'rust';
    }


    if (code.includes('#!/bin/') || code.includes('echo ') && code.includes('$') ||
      code.includes('while ') && code.includes('do') && code.includes('done')) {
      return 'bash';
    }


    if ((code.includes(':') && !code.includes('{') && !code.includes(';')) ||
      (code.includes('- ') && code.includes(':') && !code.includes('{'))) {
      return 'yaml';
    }


    return 'typescript';
  };

  const issuesByLine = issues.reduce((acc, issue) => {
    if (!acc[issue.line]) {
      acc[issue.line] = [];
    }
    acc[issue.line].push(issue);
    return acc;
  }, {} as Record<number, CodeIssue[]>);

  return (
    <div className="code-container overflow-hidden rounded-lg">
      <pre ref={codeRef} className="hidden">{code}</pre>
      <div className="flex">
        {/* Code Panel */}
        <div className="w-full overflow-auto">
          <table className="w-full border-collapse table-auto">
            <tbody>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const lineIssues = issuesByLine[lineNumber] || [];
                const severityClass = lineIssues.length > 0
                  ? `line-highlight-${lineIssues[0].severity}`
                  : "";

                const language = detectLanguage(code);
                const highlightedCode = Prism.highlight(
                  line || " ",
                  Prism.languages[language],
                  language
                );

                return (
                  <tr key={index} className={`${severityClass} group hover:bg-secondary/80`}>
                    <td className="px-2 text-right border-r border-border line-number w-12">
                      {lineNumber}
                    </td>
                    <td className="px-4 py-1 font-mono text-sm whitespace-pre">
                      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Comments Panel */}
        <div className="w-full max-w-md border-l border-border overflow-auto">
          <table className="w-full border-collapse table-auto">
            <tbody>
              {codeLines.map((_, index) => {
                const lineNumber = index + 1;
                const lineIssues = issuesByLine[lineNumber] || [];

                return (
                  <tr key={index} className="hover:bg-secondary/80">
                    <td className="py-1 px-4 h-[32px]">
                      {lineIssues.map((issue, i) => (
                        <div
                          key={i}
                          className={`mb-2 p-2 rounded text-sm ${issue.severity === "error"
                            ? "bg-code-error/20 border-l-2 border-code-error"
                            : issue.severity === "warning"
                              ? "bg-code-warning/20 border-l-2 border-code-warning"
                              : "bg-code-info/20 border-l-2 border-code-info"
                            }`}
                        >
                          {issue.message}
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CodeReview;
