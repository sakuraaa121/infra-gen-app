'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import ConfigPanel from '@/components/config-panel';
import TerminalDisplay from '@/components/terminal-display';
import AiSuggestPanel from '@/components/ai-suggest-panel';
import { generateSteps, generateCleanupSteps } from '@/lib/command-generator';
import { useLanguage } from '@/hooks/use-language';
import type { Config } from '@/lib/command-generator';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [config, setConfig] = useState<Config>({
    baseOS: 'ubuntu',
    docker: false,
    dockerCompose: false,
    webServer: 'none',
    languages: [],
    databases: [],
  });
  const [activeTab, setActiveTab] = useState<'setup' | 'cleanup'>('setup');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps = generateSteps(config, t.commands, t.steps);
  const cleanupSteps = generateCleanupSteps(config, t.commands, t.steps);

  const handleConfigChange = (newConfig: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t.common.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.common.subtitle}
              </p>
            </div>
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {language === 'ja' ? (
                  <>
                    <span className="text-xs mr-2">EN</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-xs ml-2 font-semibold">{t.common.japanese}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs mr-2 font-semibold">{t.common.english}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-xs ml-2">日本語</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            <AiSuggestPanel onSuggest={handleConfigChange} />
            <ConfigPanel config={config} onConfigChange={handleConfigChange} />
          </div>

          {/* Right Panel - Terminal Display */}
          <div>
            <TerminalDisplay
              steps={steps}
              cleanupSteps={cleanupSteps}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
