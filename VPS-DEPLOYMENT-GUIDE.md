# VPS Deployment Guide

This guide will help you set up automated deployment from GitHub to your VPS server using Docker.

## Overview

When you push code to the `main` branch, GitHub Actions will:
1. Build a Docker image
2. Push it to Docker Hub
3. Connect to your VPS via SSH
4. Pull the latest image and restart containers

## Prerequisites

- A VPS server (Ubuntu 20.04+ recommended)
- Docker Hub account
- Domain name (optional)
- SSH access to your VPS

## Step 1: VPS Initial Setup

1. **Connect to your VPS**:
   ```bash
   ssh root@your-vps-ip
   ```

2. **Download and run the setup script**:
   ```bash
   wget https://raw.githubusercontent.com/your-username/ecommerce-api/main/scripts/vps-setup.sh
   chmod +x vps-setup.sh
   # To use custom SSH port (default is 2222):
   SSH_PORT=2222 sudo -E ./vps-setup.sh
   # Or to use default port 22:
   sudo ./vps-setup.sh
   ```

   > **⚠️ Important**: If you change the SSH port, you'll need to reconnect using the new port:
   ```bash
   ssh ecommerce@your-vps-ip -p 2222
   ```

3. **Configure environment variables**:
   ```bash
   cd /opt/ecommerce-api
   sudo nano .env
   ```
   Update the values in `.env` file (use `.env.vps` as template).

## Step 2: GitHub Repository Configuration

### 2.1 Update Repository URL
Update the repository URL in:
- `scripts/vps-setup.sh` (line 15)
- `.github/workflows/deploy-vps.yml` if needed

### 2.2 Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `johndoe` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_xxxxx` |
| `VPS_HOST` | Your VPS IP address | `192.168.1.100` |
| `VPS_USER` | VPS user for deployment | `ecommerce` |
| `VPS_SSH_KEY` | Private SSH key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | SSH port (set to your custom port) | `2222` |

### 2.3 Generate SSH Key for Deployment
On your local machine:
```bash
ssh-keygen -t ed25519 -C "deployment@ecommerce-api"
```

Copy the public key to your VPS (use your custom SSH port):
```bash
# If using custom SSH port (e.g., 2222):
ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 2222 ecommerce@your-vps-ip

# If using default port 22:
ssh-copy-id -i ~/.ssh/id_ed25519.pub ecommerce@your-vps-ip
```

Copy the private key content to GitHub secret `VPS_SSH_KEY`.

### 2.4 Get Docker Hub Token
1. Go to Docker Hub → Account Settings → Security
2. Create a new Access Token
3. Copy the token to GitHub secret `DOCKERHUB_TOKEN`

## Step 3: Test Deployment

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Monitor the deployment**:
   - Go to GitHub → Actions tab
   - Watch the "Deploy to VPS" workflow

3. **Verify deployment**:
   ```bash
   curl http://your-vps-ip:3000/api/v1/categories
   ```

## Step 4: Domain Configuration (Optional)

If you have a domain name:

1. **Update Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/ecommerce-api
   ```
   Replace `your-domain.com` with your actual domain.

2. **Update DNS records**:
   Point your domain's A record to your VPS IP.

3. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Step 5: Monitoring and Maintenance

### View logs:
```bash
cd /opt/ecommerce-api
docker-compose -f docker-compose.vps.yml logs -f
```

### Manual deployment:
```bash
cd /opt/ecommerce-api
./scripts/deploy.sh
```

### Update environment variables:
```bash
cd /opt/ecommerce-api
sudo nano .env
docker-compose -f docker-compose.vps.yml restart
```

## Troubleshooting

### Common Issues:

1. **Docker permission denied**:
   ```bash
   sudo usermod -aG docker ecommerce
   # Then reconnect SSH session
   ```

2. **Port already in use**:
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo fuser -k 3000/tcp
   ```

3. **Database connection failed**:
   - Check if PostgreSQL container is running
   - Verify environment variables in `.env`

4. **GitHub Actions deployment fails**:
   - Verify SSH key permissions
   - Check VPS firewall settings
   - Ensure deployment directory exists

### Health Checks:
```bash
# Check containers
docker ps

# Check API health
curl http://localhost:3000/api/v1/categories

# Check database
docker-compose -f docker-compose.vps.yml exec postgres psql -U postgres -d ecommerce_db -c "\dt"
```

## Security Considerations

1. **Change default SSH port** (setup script defaults to 2222)
2. **Change default passwords** in `.env`
3. **Use strong JWT secret** (min 32 characters)
4. **Enable firewall** (done by setup script)
5. **SSH key-only authentication** (password auth disabled)
6. **Root login disabled** (use ecommerce user)
7. **Regular security updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
8. **Monitor logs** for suspicious activity

## File Structure on VPS

```
/opt/ecommerce-api/
├── .env                      # Environment configuration
├── docker-compose.vps.yml    # Docker compose for VPS
├── scripts/
│   ├── deploy.sh            # Deployment script
│   └── vps-setup.sh         # Initial setup script
└── [other project files]
```

Your API will be available at:
- **Direct access**: `http://your-vps-ip:3000`
- **With domain**: `http://your-domain.com`
- **API docs**: `http://your-vps-ip:3000/api/docs`