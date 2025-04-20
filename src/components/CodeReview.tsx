import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "../prismdark.css";

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
export type VulnerabilitySeverity = "critical" | "high" | "medium" | "low" | "info";

export interface CodeIssue {
  line: number;
  message: string;
  severity: IssueSeverity;
}

export interface SecurityVulnerability {
  line: number;
  description: string;
  severity: VulnerabilitySeverity;
  type: string;
  recommendation: string;
}

interface CodeReviewProps {
  code: string;
  issues: CodeIssue[];
  vulnerabilities?: SecurityVulnerability[];
}

const CodeReview = ({ code, issues, vulnerabilities = [] }: CodeReviewProps) => {
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


  const linesToAllItemsMap = React.useMemo(() => {
    const lineMap = {} as Record<number, Array<CodeIssue | SecurityVulnerability & { type: string }>>;


    issues.forEach(issue => {
      const lineNum = issue.line;

      if (!lineMap[lineNum]) {
        lineMap[lineNum] = [];
      }

      lineMap[lineNum].push({
        ...issue,
        type: 'code-issue'
      });
    });


    vulnerabilities.forEach(vuln => {
      const lineNum = vuln.line;

      if (!lineMap[lineNum]) {
        lineMap[lineNum] = [];
      }


      const isDuplicate = lineMap[lineNum].some(item => {
        if ('message' in item && item.message) {

          return stringSimilarity(item.message, vuln.description) > 0.7;
        }
        return false;
      });

      if (!isDuplicate) {
        lineMap[lineNum].push({
          ...vuln,
          type: 'security-vulnerability'
        });
      }
    });

    return lineMap;
  }, [issues, vulnerabilities]);


  const stringSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    const shorterLength = Math.min(str1.length, str2.length);

    if (shorterLength < 10) return 0;

    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();


    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.8;
    }


    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 3));

    let matchCount = 0;
    for (const word of words1) {
      if (words2.has(word)) matchCount++;
    }

    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return totalUniqueWords > 0 ? matchCount / totalUniqueWords : 0;
  };

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

  const getVulnerabilitySeverityClass = (severity: VulnerabilitySeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-800/20 border-l-2 border-red-800';
      case 'high':
        return 'bg-red-600/20 border-l-2 border-red-600';
      case 'medium':
        return 'bg-amber-500/20 border-l-2 border-amber-500';
      case 'low':
        return 'bg-yellow-500/20 border-l-2 border-yellow-500';
      case 'info':
        return 'bg-blue-500/20 border-l-2 border-blue-500';
      default:
        return 'bg-blue-500/20 border-l-2 border-blue-500';
    }
  };

  return (
    <div className="code-container overflow-hidden rounded-lg">
      <pre ref={codeRef} className="hidden">{code}</pre>
      <div className="flex">
        {/* Code Panel */}
        <div className="w-full overflow-auto code-panel">
          <table className="w-full border-collapse table-auto">
            <tbody>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const language = detectLanguage(code);
                const highlightedCode = Prism.highlight(
                  line || " ",
                  Prism.languages[language],
                  language
                );

                return (
                  <tr
                    key={index}
                    data-line={lineNumber}
                    className={`group hover:bg-secondary/80 relative`}
                  >
                    <td className="px-2 text-right border-r border-border line-number w-12 sticky left-0 bg-inherit">
                      {lineNumber}
                    </td>
                    <td className="px-4 py-1 font-mono text-sm whitespace-pre-wrap">
                      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Comments Panel */}
        <div className="w-full max-w-md border-l border-border overflow-auto comments-panel">
          <table className="w-full border-collapse table-auto">
            <tbody>
              {codeLines.map((_, index) => {
                const lineNumber = index + 1;
                const lineItems = linesToAllItemsMap[lineNumber] || [];

                if (!lineItems.length) {
                  return (
                    <tr key={index} data-line={lineNumber} className="hover:bg-secondary/80">
                      <td className="px-4 py-1">
                        <div className="min-h-[1.5rem]"></div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={index} data-line={lineNumber} className="hover:bg-secondary/80">
                    <td className="px-4 py-1">
                      {lineItems.map((item, i) => {
                        if ((item as CodeIssue & { type: string }).type === 'code-issue') {
                          const issue = item as CodeIssue & { type: string };
                          return (
                            <div
                              key={i}
                              className={`p-2 rounded text-sm ${issue.severity === "error"
                                ? "bg-code-error/20 border-l-2 border-code-error"
                                : issue.severity === "warning"
                                  ? "bg-code-warning/20 border-l-2 border-code-warning"
                                  : "bg-code-info/20 border-l-2 border-code-info"
                                } ${i < lineItems.length - 1 ? 'mb-2' : ''}`}
                            >
                              {issue.message}
                            </div>
                          );
                        } else {
                          const vuln = item as SecurityVulnerability & { type: string };
                          return (
                            <div
                              key={i}
                              className={`p-2 rounded text-sm ${getVulnerabilitySeverityClass(vuln.severity)} ${i < lineItems.length - 1 ? 'mb-2' : ''}`}
                            >
                              <div className="flex items-center mb-1">
                                <span className="font-medium mr-2">{vuln.type}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${vuln.severity === 'critical' ? 'bg-red-800/50' :
                                  vuln.severity === 'high' ? 'bg-red-600/50' :
                                    vuln.severity === 'medium' ? 'bg-amber-500/50' :
                                      vuln.severity === 'low' ? 'bg-yellow-500/50' :
                                        'bg-blue-500/50'
                                  }`}>
                                  {vuln.severity}
                                </span>
                              </div>
                              <p>{vuln.description}</p>
                              <div className="mt-2 text-xs border-t border-border/50 pt-1">
                                <span className="font-semibold">Recommendation: </span>{vuln.recommendation}
                              </div>
                            </div>
                          );
                        }
                      })}
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
