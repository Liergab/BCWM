module.exports = {
  apps: [
    {
      name: 'express-api',
      script: './dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode
      watch: false, // Disable watch in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 4400,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4400,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: true,
      // Advanced features
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'express-api-dev',
      script: 'ts-node',
      args: './index.ts',
      instances: 1, // Single instance for development
      exec_mode: 'fork',
      watch: true, // Enable watch in development
      ignore_watch: ['node_modules', 'logs', 'dist'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
        PORT: 4400,
      },
      error_file: './logs/pm2-dev-error.log',
      out_file: './logs/pm2-dev-out.log',
      log_file: './logs/pm2-dev-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
