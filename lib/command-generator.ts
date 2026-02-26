export type OS = 'ubuntu' | 'wsl' | 'virtualbox' | 'macos';
export type WebServer = 'nginx' | 'apache' | 'none';
export type Language = 'python' | 'nodejs' | 'go' | 'cpp' | 'rust';
export type Database = 'postgresql' | 'mysql' | 'redis';

export interface Config {
  baseOS: OS;
  docker: boolean;
  dockerCompose: boolean;
  webServer: WebServer;
  languages: Language[];
  databases: Database[];
}

export interface Step {
  title: string;
  description: string;
  code: string | null;
}

interface CommandLabels {
  startSetup: string;
  installWSL: string;
  afterWSLInstallation: string;
  virtualBoxHostSetup: string;
  virtualBoxGuestSetup: string;
  installBrew: string;
  updateSystemPackages: string;
  installDocker: string;
  installDockerCompose: string;
  installNginx: string;
  installApache: string;
  installPython: string;
  installNodejs: string;
  installGo: string;
  installCpp: string;
  installRust: string;
  installAdditionalTools: string;
  installPostgreSQL: string;
  installMySQL: string;
  installRedis: string;
  setupCompleted: string;
  startCleanup: string;
  uninstallDocker: string;
  uninstallNginx: string;
  uninstallApache: string;
  uninstallPython: string;
  uninstallNodejs: string;
  uninstallGo: string;
  uninstallCpp: string;
  uninstallRust: string;
  uninstallPostgreSQL: string;
  uninstallMySQL: string;
  uninstallRedis: string;
  cleanupCompleted: string;
  environmentInfo: string;
  osInfo: string;
  bashVersion: string;
  pythonVersion: string;
  nodeVersion: string;
  npmVersion: string;
  goVersion: string;
  instructions1: string;
  instructions2: string;
  instructions3: string;
}

function generateSetupScript(config: Config, labels: CommandLabels): string {
  const commands: string[] = [];
  const isMacOS = config.baseOS === 'macos';

  commands.push('#!/bin/bash');
  commands.push('set -e');
  commands.push('');

  if (isMacOS) {
    // Update Homebrew on macOS
    commands.push(`${labels.updateSystemPackages}`);
    commands.push('brew update');
    commands.push('brew upgrade');
    commands.push('');
  } else {
    // Update system packages on Linux
    commands.push(`${labels.updateSystemPackages}`);
    commands.push('sudo apt-get update');
    commands.push('sudo apt-get upgrade -y');
    commands.push('sudo apt-get install -y build-essential curl wget git');
    commands.push('');
  }

  // Docker setup
  if (config.docker || config.dockerCompose) {
    commands.push(`${labels.installDocker}`);
    if (isMacOS) {
      commands.push('brew install --cask docker');
    } else {
      commands.push('sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release');
      commands.push('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg');
      commands.push('echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null');
      commands.push('sudo apt-get update');
      commands.push('sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin');
      commands.push('sudo usermod -aG docker $USER');
    }
    commands.push('');
  }

  if (config.dockerCompose && !isMacOS) {
    commands.push(`${labels.installDockerCompose}`);
    commands.push('sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose');
    commands.push('sudo chmod +x /usr/local/bin/docker-compose');
    commands.push('docker-compose --version');
    commands.push('');
  }

  // Web Server setup
  if (config.webServer === 'nginx') {
    commands.push(`${labels.installNginx}`);
    if (isMacOS) {
      commands.push('brew install nginx');
      commands.push('brew services start nginx');
    } else {
      commands.push('sudo apt-get install -y nginx');
      commands.push('sudo systemctl start nginx');
      commands.push('sudo systemctl enable nginx');
    }
    commands.push('');
  } else if (config.webServer === 'apache') {
    commands.push(`${labels.installApache}`);
    if (isMacOS) {
      commands.push('brew install httpd');
      commands.push('brew services start httpd');
    } else {
      commands.push('sudo apt-get install -y apache2');
      commands.push('sudo systemctl start apache2');
      commands.push('sudo systemctl enable apache2');
    }
    commands.push('');
  }

  // Programming languages setup
  if (config.languages.includes('python')) {
    commands.push(`${labels.installPython}`);
    if (isMacOS) {
      commands.push('brew install python');
    } else {
      commands.push('sudo apt-get install -y python3 python3-pip python3-venv');
      commands.push('pip3 install --upgrade pip setuptools wheel');
    }
    commands.push('');
  }

  if (config.languages.includes('nodejs')) {
    commands.push(`${labels.installNodejs}`);
    if (isMacOS) {
      commands.push('brew install node');
    } else {
      commands.push('curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -');
      commands.push('sudo apt-get install -y nodejs');
      commands.push('npm install -g npm@latest');
    }
    commands.push('');
  }

  if (config.languages.includes('go')) {
    commands.push(`${labels.installGo}`);
    if (isMacOS) {
      commands.push('brew install go');
    } else {
      commands.push('sudo apt-get install -y golang-go');
      commands.push('echo "export GOPATH=$HOME/go" >> ~/.bashrc');
      commands.push('echo "export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin" >> ~/.bashrc');
      commands.push('source ~/.bashrc');
    }
    commands.push('');
  }

  if (config.languages.includes('cpp')) {
    commands.push(`${labels.installCpp}`);
    if (isMacOS) {
      commands.push('brew install gcc make');
    } else {
      commands.push('sudo apt-get install -y gcc g++ make');
    }
    commands.push('');
  }

  if (config.languages.includes('rust')) {
    commands.push(`${labels.installRust}`);
    commands.push('curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y');
    commands.push('source "$HOME/.cargo/env"');
    commands.push('');
  }

  // Database setup
  if (config.databases.includes('postgresql')) {
    commands.push(`${labels.installPostgreSQL}`);
    if (isMacOS) {
      commands.push('brew install postgresql');
      commands.push('brew services start postgresql');
    } else {
      commands.push('sudo apt-get install -y postgresql postgresql-contrib');
      commands.push('sudo systemctl start postgresql');
      commands.push('sudo systemctl enable postgresql');
    }
    commands.push('');
  }

  if (config.databases.includes('mysql')) {
    commands.push(`${labels.installMySQL}`);
    if (isMacOS) {
      commands.push('brew install mysql');
      commands.push('brew services start mysql');
    } else {
      commands.push('sudo apt-get install -y mysql-server');
      commands.push('sudo systemctl start mysql');
      commands.push('sudo systemctl enable mysql');
    }
    commands.push('');
  }

  if (config.databases.includes('redis')) {
    commands.push(`${labels.installRedis}`);
    if (isMacOS) {
      commands.push('brew install redis');
      commands.push('brew services start redis');
    } else {
      commands.push('sudo apt-get install -y redis-server');
      commands.push('sudo systemctl start redis-server');
      commands.push('sudo systemctl enable redis-server');
    }
    commands.push('');
  }

  // Additional utilities
  commands.push(`${labels.installAdditionalTools}`);
  if (isMacOS) {
    commands.push('brew install git vim nano wget curl');
  } else {
    commands.push('sudo apt-get install -y git vim nano');
  }
  commands.push('');

  // Completion message
  commands.push(`echo "${labels.setupCompleted}"`);
  commands.push(`echo "${labels.environmentInfo}"`);
  commands.push(`echo "${labels.osInfo}"`);
  commands.push(`echo "${labels.bashVersion}"`);
  if (config.languages.includes('python')) {
    commands.push(`echo "${labels.pythonVersion}"`);
  }
  if (config.languages.includes('nodejs')) {
    commands.push(`echo "${labels.nodeVersion}"`);
    commands.push(`echo "${labels.npmVersion}"`);
  }
  if (config.languages.includes('go')) {
    commands.push(`echo "${labels.goVersion}"`);
  }

  return commands.join('\n');
}

function generateCleanupScript(config: Config, labels: CommandLabels): string {
  const commands: string[] = [];
  const isMacOS = config.baseOS === 'macos';
  const isLinux = config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox';

  commands.push('#!/bin/bash');
  commands.push('set -e');
  commands.push('');
  commands.push(`echo "${labels.startCleanup}"`);
  commands.push('');

  // Remove Docker
  if (config.docker || config.dockerCompose) {
    commands.push(`${labels.uninstallDocker}`);
    if (isMacOS) {
      commands.push('brew uninstall --cask docker');
    } else if (isLinux) {
      commands.push('sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  // Remove Web Server
  if (config.webServer === 'nginx') {
    commands.push(`${labels.uninstallNginx}`);
    if (isMacOS) {
      commands.push('brew services stop nginx');
      commands.push('brew uninstall nginx');
    } else if (isLinux) {
      commands.push('sudo systemctl stop nginx');
      commands.push('sudo systemctl disable nginx');
      commands.push('sudo apt-get purge -y nginx');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  } else if (config.webServer === 'apache') {
    commands.push(`${labels.uninstallApache}`);
    if (isMacOS) {
      commands.push('brew services stop httpd');
      commands.push('brew uninstall httpd');
    } else if (isLinux) {
      commands.push('sudo systemctl stop apache2');
      commands.push('sudo systemctl disable apache2');
      commands.push('sudo apt-get purge -y apache2');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  // Remove Programming Languages
  if (config.languages.includes('python')) {
    commands.push(`${labels.uninstallPython}`);
    if (isMacOS) {
      commands.push('brew uninstall python');
    } else if (isLinux) {
      commands.push('sudo apt-get purge -y python3 python3-pip python3-venv');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.languages.includes('nodejs')) {
    commands.push(`${labels.uninstallNodejs}`);
    if (isMacOS) {
      commands.push('brew uninstall node');
    } else if (isLinux) {
      commands.push('sudo apt-get purge -y nodejs');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.languages.includes('go')) {
    commands.push(`${labels.uninstallGo}`);
    if (isMacOS) {
      commands.push('brew uninstall go');
    } else if (isLinux) {
      commands.push('sudo apt-get purge -y golang-go');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.languages.includes('cpp')) {
    commands.push(`${labels.uninstallCpp}`);
    if (isMacOS) {
      commands.push('brew uninstall gcc make');
    } else if (isLinux) {
      commands.push('sudo apt-get purge -y gcc g++ make');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.languages.includes('rust')) {
    commands.push(`${labels.uninstallRust}`);
    commands.push('rustup self uninstall -y');
    commands.push('');
  }

  // Remove Databases
  if (config.databases.includes('postgresql')) {
    commands.push(`${labels.uninstallPostgreSQL}`);
    if (isMacOS) {
      commands.push('brew services stop postgresql');
      commands.push('brew uninstall postgresql');
    } else if (isLinux) {
      commands.push('sudo systemctl stop postgresql');
      commands.push('sudo systemctl disable postgresql');
      commands.push('sudo apt-get purge -y postgresql postgresql-contrib');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.databases.includes('mysql')) {
    commands.push(`${labels.uninstallMySQL}`);
    if (isMacOS) {
      commands.push('brew services stop mysql');
      commands.push('brew uninstall mysql');
    } else if (isLinux) {
      commands.push('sudo systemctl stop mysql');
      commands.push('sudo systemctl disable mysql');
      commands.push('sudo apt-get purge -y mysql-server');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  if (config.databases.includes('redis')) {
    commands.push(`${labels.uninstallRedis}`);
    if (isMacOS) {
      commands.push('brew services stop redis');
      commands.push('brew uninstall redis');
    } else if (isLinux) {
      commands.push('sudo systemctl stop redis-server');
      commands.push('sudo systemctl disable redis-server');
      commands.push('sudo apt-get purge -y redis-server');
      commands.push('sudo apt-get autoremove -y');
    }
    commands.push('');
  }

  // Completion message
  commands.push(`echo "${labels.cleanupCompleted}"`);

  return commands.join('\n');
}

export interface StepLabels {
  wslStep1Title: string;
  wslStep1Description: string;
  wslStep2Title: string;
  wslStep2Description: string;
  ubuntuStep1Title: string;
  ubuntuStep1Description: string;
  vboxStep1Title: string;
  vboxStep1Description: string;
  vboxStep2Title: string;
  vboxStep2Description: string;
  macosStep1Title: string;
  macosStep1Description: string;
  macosStep2Title: string;
  macosStep2Description: string;
  cleanupStepTitle: string;
  cleanupStepDescription: string;
}

export function generateSteps(config: Config, labels: CommandLabels, stepLabels: StepLabels): Step[] {
  const steps: Step[] = [];
  const setupScript = generateSetupScript(config, labels);

  if (config.baseOS === 'wsl') {
    // Step 1: Install WSL
    steps.push({
      title: stepLabels.wslStep1Title,
      description: stepLabels.wslStep1Description,
      code: 'wsl --install',
    });

    // Step 2: Run setup script on Ubuntu
    steps.push({
      title: stepLabels.wslStep2Title,
      description: stepLabels.wslStep2Description,
      code: `cat << 'EOF' > setup.sh\n${setupScript}\nEOF\nchmod +x setup.sh\n./setup.sh`,
    });
  } else if (config.baseOS === 'virtualbox') {
    // Step 1: Install VirtualBox and Ubuntu
    steps.push({
      title: stepLabels.vboxStep1Title,
      description: stepLabels.vboxStep1Description,
      code: null,
    });

    // Step 2: Run setup script on Ubuntu
    steps.push({
      title: stepLabels.vboxStep2Title,
      description: stepLabels.vboxStep2Description,
      code: `cat << 'EOF' > setup.sh\n${setupScript}\nEOF\nchmod +x setup.sh\n./setup.sh`,
    });
  } else if (config.baseOS === 'macos') {
    // Step 1: Install Homebrew
    steps.push({
      title: stepLabels.macosStep1Title,
      description: stepLabels.macosStep1Description,
      code: 'xcode-select --install\n/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    });

    // Step 2: Run setup script on macOS
    steps.push({
      title: stepLabels.macosStep2Title,
      description: stepLabels.macosStep2Description,
      code: `cat << 'EOF' > setup.sh\n${setupScript}\nEOF\nchmod +x setup.sh\n./setup.sh`,
    });
  } else {
    // Ubuntu Native: Single step
    steps.push({
      title: stepLabels.ubuntuStep1Title,
      description: stepLabels.ubuntuStep1Description,
      code: `cat << 'EOF' > setup.sh\n${setupScript}\nEOF\nchmod +x setup.sh\n./setup.sh`,
    });
  }

  return steps;
}

export function generateCleanupSteps(config: Config, labels: CommandLabels, stepLabels: StepLabels): Step[] {
  const steps: Step[] = [];
  const cleanupScript = generateCleanupScript(config, labels);

  // All OS types use the same cleanup step title and description
  steps.push({
    title: stepLabels.cleanupStepTitle,
    description: stepLabels.cleanupStepDescription,
    code: `cat << 'EOF' > cleanup.sh\n${cleanupScript}\nEOF\nchmod +x cleanup.sh\n./cleanup.sh`,
  });

  return steps;
}

export function generateCommand(config: Config, labels: CommandLabels): string {
  const commands: string[] = [];

  // Add shebang
  commands.push('#!/bin/bash');
  commands.push('set -e');
  commands.push('');
  commands.push(`echo "${labels.startSetup}"`);
  commands.push('');

  // Base OS setup
  if (config.baseOS === 'wsl') {
    commands.push(`# ${labels.installWSL}`);
    commands.push('wsl --install');
    commands.push(`# ${labels.afterWSLInstallation}`);
    commands.push('');
  }

  if (config.baseOS === 'virtualbox') {
    commands.push(`# ${labels.virtualBoxHostSetup}`);
    commands.push('# Download from: https://www.virtualbox.org/');
    commands.push('');
    commands.push(`# ${labels.virtualBoxGuestSetup}`);
    commands.push('');
  }

  // Update system packages
  if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
    commands.push(`# ${labels.updateSystemPackages}`);
    commands.push('sudo apt-get update');
    commands.push('sudo apt-get upgrade -y');
    commands.push('sudo apt-get install -y build-essential curl wget git');
    commands.push('');
  }

  // Docker setup
  if (config.docker || config.dockerCompose) {
    commands.push(`# ${labels.installDocker}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release');
      commands.push('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg');
      commands.push('echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null');
      commands.push('sudo apt-get update');
      commands.push('sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin');
      commands.push('sudo usermod -aG docker $USER');
      commands.push('');
    }
  }

  if (config.dockerCompose) {
    commands.push(`# ${labels.installDockerCompose}`);
    commands.push('sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose');
    commands.push('sudo chmod +x /usr/local/bin/docker-compose');
    commands.push('docker-compose --version');
    commands.push('');
  }

  // Web Server setup
  if (config.webServer === 'nginx') {
    commands.push(`# ${labels.installNginx}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('sudo apt-get install -y nginx');
      commands.push('sudo systemctl start nginx');
      commands.push('sudo systemctl enable nginx');
    }
    commands.push('');
  } else if (config.webServer === 'apache') {
    commands.push(`# ${labels.installApache}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('sudo apt-get install -y apache2');
      commands.push('sudo systemctl start apache2');
      commands.push('sudo systemctl enable apache2');
    }
    commands.push('');
  }

  // Programming languages setup
  if (config.languages.includes('python')) {
    commands.push(`# ${labels.installPython}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('sudo apt-get install -y python3 python3-pip python3-venv');
      commands.push('pip3 install --upgrade pip setuptools wheel');
    }
    commands.push('');
  }

  if (config.languages.includes('nodejs')) {
    commands.push(`# ${labels.installNodejs}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -');
      commands.push('sudo apt-get install -y nodejs');
      commands.push('npm install -g npm@latest');
    }
    commands.push('');
  }

  if (config.languages.includes('go')) {
    commands.push(`# ${labels.installGo}`);
    if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
      commands.push('sudo apt-get install -y golang-go');
      commands.push('echo "export GOPATH=$HOME/go" >> ~/.bashrc');
      commands.push('echo "export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin" >> ~/.bashrc');
      commands.push('source ~/.bashrc');
    }
    commands.push('');
  }

  // Additional utilities
  commands.push(`# ${labels.installAdditionalTools}`);
  if (config.baseOS === 'ubuntu' || config.baseOS === 'wsl' || config.baseOS === 'virtualbox') {
    commands.push('sudo apt-get install -y git vim nano');
  }
  commands.push('');

  // Completion message
  commands.push(`echo "${labels.setupCompleted}"`);
  commands.push(`echo "${labels.environmentInfo}"`);
  commands.push(`echo "${labels.osInfo}"`);
  commands.push(`echo "${labels.bashVersion}"`);
  if (config.languages.includes('python')) {
    commands.push(`echo "${labels.pythonVersion}"`);
  }
  if (config.languages.includes('nodejs')) {
    commands.push(`echo "${labels.nodeVersion}"`);
    commands.push(`echo "${labels.npmVersion}"`);
  }
  if (config.languages.includes('go')) {
    commands.push(`echo "${labels.goVersion}"`);
  }

  return commands.join('\n');
}
