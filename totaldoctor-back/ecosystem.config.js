module.exports = {
  apps : [{
    name: "totalmedi-back-v2",
    script: "./src/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "400M",
    env: {
      NODE_ENV: "production"
    }
  }]
};