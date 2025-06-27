# 🚀 Deployment Guide - Al-Hikmah Academy Quran Section

This guide covers various deployment options for the Al-Hikmah Academy Quran Section.

## 🌐 Deployment Options

### 1. 🆓 Free Hosting Platforms

#### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: [your account]
# - Link to existing project: N
# - Project name: al-hikmah-academy-quran
# - Directory: ./
# - Override settings: N
```

**Benefits:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ GitHub integration
- ✅ Perfect for Node.js apps

#### **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=./
```

**Setup for Netlify:**
1. Create `netlify.toml`:
```toml
[build]
  command = "npm install && npm run build"
  publish = "."

[functions]
  directory = "server"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Heroku**
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Initialize Heroku app
heroku create al-hikmah-academy-quran

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### **Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### 2. 🏢 VPS/Server Deployment

#### **Ubuntu Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/YOUR_USERNAME/al-hikmah-academy-quran.git
cd al-hikmah-academy-quran

# Install dependencies
npm install

# Create PM2 ecosystem file
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'al-hikmah-quran',
    script: 'server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Setup PM2 startup
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/al-hikmah-quran
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files directly
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/al-hikmah-quran /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. ☁️ Cloud Deployment

#### **AWS EC2**
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Configure security groups (ports 22, 80, 443)
# Connect via SSH

# Install Node.js and dependencies (same as VPS setup above)
# Configure Application Load Balancer for scaling
# Use Route 53 for DNS management
# Setup CloudFront for CDN
```

#### **Google Cloud Platform**
```bash
# Use Google App Engine for easy deployment
# Create app.yaml:
```

**app.yaml:**
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

```bash
# Deploy
gcloud app deploy
```

#### **DigitalOcean**
```bash
# Create Droplet
# Use DigitalOcean App Platform for managed deployment
# Or setup manually on Droplet (similar to VPS setup)
```

### 4. 🐳 Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  al-hikmah-quran:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - al-hikmah-quran
    restart: unless-stopped
```

## 🔧 Environment Configuration

### Environment Variables
```bash
# Production environment variables
NODE_ENV=production
PORT=3000
API_BASE_URL=https://your-domain.com
CACHE_DURATION=86400
```

### Performance Optimization
```javascript
// Add to server.js for production
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
  app.use(helmet());
  
  // Enable caching
  app.use(express.static('public', {
    maxAge: '1y',
    etag: false
  }));
}
```

## 📊 Monitoring & Analytics

### Health Monitoring
```javascript
// Add to server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Logging Setup
```bash
# Install winston for logging
npm install winston

# Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🔒 Security Considerations

### SSL/TLS Setup
- Always use HTTPS in production
- Setup proper SSL certificates
- Configure security headers
- Use environment variables for sensitive data

### API Security
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🌟 Post-Deployment Checklist

- [ ] ✅ Application loads correctly
- [ ] ✅ All Surahs can be selected and loaded
- [ ] ✅ Audio playback works
- [ ] ✅ Translations display properly
- [ ] ✅ Mobile responsiveness
- [ ] ✅ PWA installation works
- [ ] ✅ Offline functionality
- [ ] ✅ SSL certificate valid
- [ ] ✅ Performance monitoring setup
- [ ] ✅ Error logging configured
- [ ] ✅ Backup strategy in place

## 🤲 Final Dua

**اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا**

*"O Allah, bless us in what You have provided us"*

May Allah (SWT) make this deployment successful and beneficial for the Ummah. Ameen!

---

**Need help with deployment? Create an issue on GitHub with the `deployment` label.**
