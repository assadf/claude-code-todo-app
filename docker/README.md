# Docker Setup - CLAUDE.md Rule C-5 Compliant

This Docker setup is optimized for both local development and production environments as per CLAUDE.md rule C-5.

## 🏗️ Architecture Overview

### Production (Dockerfile)

- **Multi-stage build**: `deps` → `builder` → `runner`
- **Security**: Non-root user, minimal alpine image, security updates
- **Optimization**: Layer caching, standalone Next.js output
- **Health checks**: Built-in container health monitoring
- **Resource limits**: CPU and memory constraints

### Development (Dockerfile.dev)

- **Fast rebuilds**: Single-stage for development speed
- **Security**: Non-root user execution
- **Hot reloading**: Live code changes with volume mounts
- **Health checks**: Development-specific monitoring
- **Debug-friendly**: Exposed ports for database access

## 🚀 Usage

### Development Environment

```bash
# Quick start
./docker/scripts/start-dev.sh

# Manual start
docker-compose --profile dev up --build

# With logs
docker-compose --profile dev up --build --attach app-dev
```

### Production Environment

```bash
# Basic production
./docker/scripts/start-prod.sh

# Enhanced security production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With resource monitoring
docker stats
```

## 🛡️ Security Features

### Production Security

- ✅ No exposed database ports
- ✅ Required environment variable validation
- ✅ Non-root container execution
- ✅ Minimal attack surface (Alpine Linux)
- ✅ Secrets management support
- ✅ Health check endpoints

### Development Security

- ✅ Non-root user in development containers
- ✅ Environment variable validation
- ✅ Exposed ports only for debugging
- ✅ Isolated network configuration

## 📊 Performance Optimizations

### Production Optimizations

- **Multi-stage builds**: Minimize final image size
- **Layer caching**: Efficient Docker builds
- **Resource limits**: Prevent resource exhaustion
- **Health checks**: Container orchestration support
- **Standalone output**: Minimal Next.js runtime

### Development Optimizations

- **Cached volumes**: Fast dependency installations
- **Bind mounts**: Instant code reload
- **Named volumes**: Persistent node_modules caching
- **Performance monitoring**: Resource usage tracking

## 🔍 Health Monitoring

### Health Check Endpoints

- **Application**: `http://localhost:3000/api/health`
- **Container**: Built-in Docker health checks
- **Database**: MongoDB ping monitoring

### Health Check Configuration

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
  interval: 30s
  timeout: 3s
  start_period: 5s
  retries: 3
```

## 🎛️ Environment Configuration

### Required Environment Variables

```bash
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional Configuration

```bash
NEXTAUTH_URL=http://localhost:3000
PLAYWRIGHT_BASE_URL=http://localhost:3000
ALLOWED_IMAGE_DOMAINS=lh3.googleusercontent.com
```

### Environment Files

- **`.env`**: Docker Compose environment variables
- **`.env.local`**: Next.js local development (npm run dev)
- **`.env.example`**: Template with defaults

## 📦 Volume Strategy

### Production Volumes

- `mongodb_data`: Persistent database storage

### Development Volumes

- `node_modules_cache`: Fast dependency restoration
- `nextjs_cache`: Build artifact caching
- `.:/app:cached`: Source code bind mount with performance optimization

## 🚦 Service Dependencies

### Dependency Chain

```
app/app-dev → mongodb (healthy)
```

### Startup Order

1. MongoDB starts with health check
2. Application waits for MongoDB health
3. Application starts with its own health check

## 🔧 Resource Limits

### Production Resources

- **App**: 1 CPU, 1GB RAM (limit) | 0.25 CPU, 256MB RAM (reservation)
- **MongoDB**: 0.5 CPU, 512MB RAM (limit) | 0.1 CPU, 128MB RAM (reservation)

### Development Resources

- **App-dev**: 2 CPU, 2GB RAM (limit) | 0.5 CPU, 512MB RAM (reservation)
- **MongoDB**: Same as production

## 🔄 Restart Policies

All services use `restart: unless-stopped` for production resilience:

- Automatic restart on failure
- Manual stop honored
- System boot persistence

## 📋 Compliance Checklist

### ✅ C-5 Rule Requirements Met

**Production Optimization:**

- [x] Multi-stage builds for minimal image size
- [x] Security hardening (non-root, alpine, updates)
- [x] Resource constraints and limits
- [x] Health checks and monitoring
- [x] Secrets management support
- [x] Network security (no exposed DB ports)

**Development Optimization:**

- [x] Fast rebuild and hot reload
- [x] Debug-friendly configuration
- [x] Volume optimization for performance
- [x] Development-specific health checks
- [x] Security best practices maintained

**Docker Best Practices:**

- [x] Layer caching optimization
- [x] .dockerignore for build efficiency
- [x] Proper service dependencies
- [x] Environment-specific configurations
- [x] Comprehensive documentation

## 🚨 Troubleshooting

### Common Issues

1. **Permission denied**: Ensure proper user permissions in volumes
2. **Health check failures**: Verify curl installation and endpoint availability
3. **Resource limits**: Adjust based on system capabilities
4. **Port conflicts**: Change port mappings if needed

### Debug Commands

```bash
# Check container health
docker ps
docker inspect <container_name>

# View logs
docker-compose logs -f

# Execute into container
docker-compose exec app-dev sh

# Monitor resources
docker stats
```
