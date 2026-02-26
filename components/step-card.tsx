'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

interface StepCardProps {
  title: string;
  description: string;
  code: string | null;
  stepNumber: number;
}

export default function StepCard({ title, description, code, stepNumber }: StepCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t.common.copied, {
        duration: 2000,
        position: 'top-right',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightCode = (code: string) => {
    // Simple syntax highlighting
    return code
      .split('\n')
      .map((line) => {
        // Comments
        if (line.trim().startsWith('#')) {
          return `<span class="text-green-400">${escapeHtml(line)}</span>`;
        }
        // Strings
        let highlighted = line.replace(
          /(['"][^'"]*['"])/g,
          '<span class="text-yellow-300">$1</span>'
        );
        // Keywords
        highlighted = highlighted.replace(
          /\b(sudo|apt-get|install|update|upgrade|curl|chmod|cat|EOF|export|echo)\b/g,
          '<span class="text-blue-300">$&</span>'
        );
        return highlighted;
      })
      .join('\n');
  };

  const escapeHtml = (text: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return (
    <Card className="border-border bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      {code && (
        <CardContent className="space-y-4">
          <div className="relative">
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              size="sm"
              className={`absolute right-3 top-3 ${
                copied ? 'bg-accent text-accent-foreground' : 'border-border'
              }`}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t.common.copied}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t.common.copy}
                </>
              )}
            </Button>

            {/* Code Block */}
            <div className="rounded-lg bg-[#0f0f0f] p-4 pt-12 font-mono text-sm overflow-x-auto">
              <div className="text-[#e4e4e7] whitespace-pre-wrap break-words">
                {code
                  .split('\n')
                  .map((line, idx) => {
                    let highlighted = line;
                    // Comments - green
                    if (line.trim().startsWith('#')) {
                      highlighted = `\u001b[32m${line}\u001b[0m`;
                    }

                    return (
                      <div key={idx} className="flex">
                        <span className="mr-4 select-none text-[#71717a] min-w-8 text-right">
                          {idx + 1}
                        </span>
                        <span className="flex-1">
                          {highlighted
                            .split(/(sudo|apt-get|install|update|upgrade|curl|chmod|cat|EOF|export|echo|#[^\n]*)/g)
                            .map((part, i) => {
                              // Keywords - blue
                              if (
                                [
                                  'sudo',
                                  'apt-get',
                                  'install',
                                  'update',
                                  'upgrade',
                                  'curl',
                                  'chmod',
                                  'cat',
                                  'EOF',
                                  'export',
                                  'echo',
                                ].includes(part)
                              ) {
                                return (
                                  <span key={i} className="text-blue-400">
                                    {part}
                                  </span>
                                );
                              }
                              // Comments - green
                              if (part.startsWith('#')) {
                                return (
                                  <span key={i} className="text-green-400">
                                    {part}
                                  </span>
                                );
                              }
                              // Strings - yellow
                              if (part.includes('"') || part.includes("'")) {
                                return (
                                  <span key={i} className="text-yellow-300">
                                    {part}
                                  </span>
                                );
                              }
                              return part;
                            })}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
