module.exports = {
  apps: [
    {
      name: 'expira',
      script: 'npm',
      args: 'start -p 3002',
      cwd: '/var/www/expira',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: '/var/log/pm2/expira-error.log',
      out_file: '/var/log/pm2/expira-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
    },
  ],
}

