'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { Config, OS, WebServer, Language, Database } from '@/lib/command-generator';
import { useLanguage } from '@/hooks/use-language';

interface ConfigPanelProps {
  config: Config;
  onConfigChange: (newConfig: Partial<Config>) => void;
}

export default function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  const { t } = useLanguage();
  const languages: Language[] = ['python', 'nodejs', 'go', 'cpp', 'rust'];
  const databases: Database[] = ['postgresql', 'mysql', 'redis'];

  const toggleLanguage = (lang: Language) => {
    const newLanguages = config.languages.includes(lang)
      ? config.languages.filter(l => l !== lang)
      : [...config.languages, lang];
    onConfigChange({ languages: newLanguages });
  };

  const toggleDatabase = (db: Database) => {
    const newDatabases = config.databases.includes(db)
      ? config.databases.filter(d => d !== db)
      : [...config.databases, db];
    onConfigChange({ databases: newDatabases });
  };

  const getOSLabel = (os: OS): string => {
    const labels: Record<OS, string> = {
      ubuntu: t.common.ubuntuNative,
      wsl: t.common.wslWindows,
      virtualbox: t.common.virtualbox,
      macos: t.common.macos,
    };
    return labels[os];
  };

  const getWebServerLabel = (ws: WebServer): string => {
    const labels: Record<WebServer, string> = {
      nginx: t.common.nginx,
      apache: t.common.apache,
      none: t.common.none,
    };
    return labels[ws];
  };

  const getLanguageLabel = (lang: Language): string => {
    const labels: Record<Language, string> = {
      python: t.common.python,
      nodejs: t.common.nodejs,
      go: t.common.go,
      cpp: t.common.cpp,
      rust: t.common.rust,
    };
    return labels[lang];
  };

  const getDatabaseLabel = (db: Database): string => {
    const labels: Record<Database, string> = {
      postgresql: t.ui.postgresql,
      mysql: t.ui.mysql,
      redis: t.ui.redis,
    };
    return labels[db];
  };

  return (
    <Card className="h-full border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t.common.configuration}</CardTitle>
        <CardDescription>
          {t.common.selectYourEnvironment}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Base OS Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">{t.common.baseOS}</label>
          <Select value={config.baseOS} onValueChange={(value) => 
            onConfigChange({ baseOS: value as OS })
          }>
            <SelectTrigger className="border-border bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ubuntu">{t.common.ubuntuNative}</SelectItem>
              <SelectItem value="wsl">{t.common.wslWindows}</SelectItem>
              <SelectItem value="virtualbox">{t.common.virtualbox}</SelectItem>
              <SelectItem value="macos">{t.common.macos}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Docker Options */}
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <h3 className="font-semibold">{t.common.containerTechnology}</h3>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">{t.common.docker}</label>
            <Switch
              checked={config.docker}
              onCheckedChange={(checked) => 
                onConfigChange({ docker: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">{t.common.dockerCompose}</label>
            <Switch
              checked={config.dockerCompose}
              onCheckedChange={(checked) => 
                onConfigChange({ dockerCompose: checked })
              }
            />
          </div>
        </div>

        {/* Web Server Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">{t.common.webServer}</label>
          <Select value={config.webServer} onValueChange={(value) => 
            onConfigChange({ webServer: value as WebServer })
          }>
            <SelectTrigger className="border-border bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t.common.none}</SelectItem>
              <SelectItem value="nginx">{t.common.nginx}</SelectItem>
              <SelectItem value="apache">{t.common.apache}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Programming Languages */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">{t.common.programmingLanguages}</label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Button
                key={lang}
                variant={config.languages.includes(lang) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleLanguage(lang)}
                className={config.languages.includes(lang) ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'border-border'}
              >
                {getLanguageLabel(lang)}
              </Button>
            ))}
          </div>
        </div>

        {/* Database Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold">{t.ui.database}</label>
          <div className="flex flex-wrap gap-2">
            {databases.map((db) => (
              <Button
                key={db}
                variant={config.databases.includes(db) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDatabase(db)}
                className={config.databases.includes(db) ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'border-border'}
              >
                {getDatabaseLabel(db)}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
          <h3 className="text-sm font-semibold">{t.common.configurationSummary}</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{t.labels.os}{getOSLabel(config.baseOS)}</p>
            {config.docker && <p>{t.labels.dockerEnabled}</p>}
            {config.dockerCompose && <p>{t.labels.dockerComposeEnabled}</p>}
            <p>{t.labels.webServerLabel}{getWebServerLabel(config.webServer)}</p>
            {config.languages.length > 0 && (
              <p>{t.labels.languages}{config.languages.map(l => getLanguageLabel(l)).join(', ')}</p>
            )}
            {config.databases.length > 0 && (
              <p>{t.labels.databases}{config.databases.map(d => getDatabaseLabel(d)).join(', ')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
