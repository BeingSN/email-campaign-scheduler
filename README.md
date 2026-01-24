# Email Campaign Scheduler

> **A production-grade, event-driven microservice for orchestrating email campaigns at scale**

[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-3.3+-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-4.0+-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.8+-orange.svg)](https://www.rabbitmq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Overview

A distributed email campaign scheduler built to handle millions of emails with intelligent rate limiting, multi-provider support, and complex drip campaign orchestration. This system was designed to solve the critical problem of **preventing email service provider throttling** while maintaining high throughput and reliability.

### Key Problem Solved

Email service providers (AWS SES, SendGrid, Gmail, etc.) enforce strict rate limits. Sending too many emails too quickly results in:
- Account suspension
- IP blacklisting  
- Reputation damage
- Lost revenue

This system **intelligently manages these limits** across multiple providers, users, and campaigns simultaneously.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Systems                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Main App API │  │  SMTP Service │  │  Monitoring   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Message Queue Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    RabbitMQ                               │  │
│  │  ┌──────────────┐              ┌──────────────┐          │  │
│  │  │ scheduler.q  │              │   smtp.q     │          │  │
│  │  │ (campaign    │              │  (email send) │          │  │
│  │  │  events)     │              │              │          │  │
│  │  └──────────────┘              └──────────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Scheduler Service (This Service)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Cron-Based Schedulers (Every 1 min)         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Initial    │  │    Child     │  │    Main      │   │  │
│  │  │   Email      │  │    Email     │  │  Scheduler   │   │  │
│  │  │  Scheduler   │  │  Scheduler   │  │  (Sender)    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐                     │  │
│  │  │   Campaign   │  │   Campaign   │                     │  │
│  │  │   Item       │  │   Watcher    │                     │  │
│  │  │   Watcher    │  │              │                     │  │
│  │  └──────────────┘  └──────────────┘                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Event-Driven Components                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Campaign    │  │   Rate       │  │   Mail       │   │  │
│  │  │  Operations  │  │   Limiter    │  │   Service     │   │  │
│  │  │  Consumer    │  │              │  │               │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │    Redis     │  │   (External)  │          │
│  │  (Campaigns, │  │  (Mail Items,│  │   SMTP APIs   │          │
│  │  Recipients, │  │  Rate Limits)│  │               │          │
│  │  Config)     │  │              │  │               │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant API as Main Application
    participant MQ as RabbitMQ
    participant Consumer as Campaign Ops Consumer
    participant ISched as Initial Email Scheduler
    participant CSched as Child Email Scheduler
    participant MSched as Main Scheduler
    participant RL as Rate Limiter
    participant Redis as Redis
    participant SMTP as SMTP Service
    participant MongoDB as MongoDB

    API->>MQ: campaign.start event
    MQ->>Consumer: Consume message
    Consumer->>MongoDB: Update campaign status to 'awaited'
    
    Note over ISched: Cron: Every 1 minute
    ISched->>MongoDB: Query campaigns (status='awaited', scheduled_at <= now)
    ISched->>MongoDB: Get initial campaign item & recipients
    ISched->>Redis: Store mail items (key: mailItem|userId|campaignId)
    ISched->>MongoDB: Mark campaign as 'running'
    
    Note over MSched: Cron: Every 1 minute
    MSched->>Redis: Get all mail item groups
    loop For each user/campaign group
        MSched->>RL: Check rate limits (per user, per service)
        alt Rate limit OK
            MSched->>MQ: Publish to smtp.q queue
            MSched->>Redis: Remove sent items
            MSched->>RL: Record hit
        else Rate limit exceeded
            MSched->>MSched: Skip batch, log warning
        end
    end
    
    MQ->>SMTP: Consume mail items
    SMTP->>SMTP: Send emails via provider API
    SMTP->>MQ: Publish smtp.done/completed events
    
    MQ->>Consumer: Consume smtp.done
    Consumer->>MongoDB: Mark child items as 'awaited'
    
    Note over CSched: Cron: Every 1 minute
    CSched->>MongoDB: Query ready child items
    CSched->>MongoDB: Get recipients (filtered by interactions)
    CSched->>Redis: Store mail items
    
    Note over MongoDB: Campaign Watchers run every minute
    MongoDB->>MongoDB: Check completion status
    MongoDB->>API: Send completion notifications
```

---

## 🔑 Core Components

### 1. Initial Email Scheduler
**Purpose**: Identifies campaigns ready to start and schedules their initial emails.

**Process**:
1. Queries MongoDB for campaigns with `status='awaited'` and `scheduled_at <= now`
2. Retrieves initial campaign item and recipient lists
3. Generates mail items (one per recipient)
4. Stores in Redis with key format: `mailItem|{userId}|{campaignId}`
5. Updates campaign status to `running`

**File**: `App/Services/Scheduler/InitialEmailScheduler.js`  
**Schedule**: Cron job running every minute

### 2. Child Email Scheduler
**Purpose**: Schedules follow-up emails in drip campaigns based on parent email completion.

**Process**:
1. Queries campaign items with `status='awaited'` and `scheduled_at <= now`
2. Filters recipients based on interaction triggers (reply, open, click, no-open)
3. Generates and stores mail items in Redis
4. Marks campaign item as `running`

**File**: `App/Services/Scheduler/ChildEmailScheduler.js`  
**Schedule**: Cron job running every minute

### 3. Main Scheduler (Email Sender)
**Purpose**: Processes queued mail items and sends them via RabbitMQ with rate limiting.

**Process**:
1. Retrieves all mail item groups from Redis
2. For each group:
   - Creates `SendBatchService` instance
   - Batches mail items using `MailBatchHelper`
   - For each batch:
     - **Rate Limiting Check**: Per-user, per-service limits
     - **Daily Limit Check**: Maximum emails per day per user
     - **Blocker Service Check**: Additional blocking criteria
     - Sends to RabbitMQ `smtp.q` queue
     - Removes sent items from Redis
     - Records rate limiter hits

**File**: `App/Services/Scheduler/Scheduler.js`  
**Schedule**: Cron job running every minute

### 4. Rate Limiting System
**Purpose**: Prevents email service provider throttling.

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              Rate Limiting Architecture                  │
│                                                          │
│  ┌──────────────┐                                       │
│  │   Flow       │  Determines rate limits per          │
│  │   Control    │  user/email service from config      │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │   Rate       │  Redis-based sliding window           │
│  │   Limiter    │  counter (e.g., 100 emails/min)      │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │   Daily      │  Tracks daily email counts            │
│  │   Count      │  per user (e.g., 10,000/day)          │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │   Blocker    │  Additional blocking criteria        │
│  │   Service    │  (provider-specific rules)            │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
- **Per-User Limits**: Each user has individual rate limits
- **Per-Service Limits**: Different limits for AWS SES, SendGrid, Gmail, etc.
- **Sliding Window**: Redis-based time-windowed counters
- **Daily Limits**: Maximum emails per day per user
- **Configurable**: Limits stored in MongoDB `RateLimitingConfig` collection

**Files**:
- `App/Services/RateLimiter/RateLimiter.js` - Core rate limiting logic
- `App/Services/RateLimiter/FlowControlService.js` - Determines limits
- `App/Services/RateLimiter/DailyCountManager.js` - Daily tracking
- `App/Services/RateLimiter/BlockerService.js` - Additional blocking

### 5. Campaign Operations Consumer
**Purpose**: Handles campaign control operations via RabbitMQ.

**Supported Events**:
- `campaign.start` → Marks campaign as `awaited`
- `campaign.pause` → Pauses campaign and all items
- `campaign.delete` → Deletes campaign
- `smtp.done` → Marks child items as `awaited` (triggered after parent email sent)
- `smtp.completed` → Marks campaign/campaign items as `completed`
- `smtp.rescheduled` → Removes campaign from Redis store

**File**: `App/Services/RabbitMQ/Consumer.js`  
**Queue**: `scheduler.q`

### 6. Campaign Watchers
**Purpose**: Monitor and update campaign statuses.

**Running Campaign Item Watcher**:
- Checks campaign items with `status='running'`
- If all recipients processed → marks as `completed`
- If item has children → marks them as `awaited`

**Running Campaign Watcher**:
- Checks campaigns with `status='running'`
- If all items `completed` → marks campaign as `completed`
- Sends notification via `NotificationService`

**Files**:
- `App/Services/Watcher/RunningCampaignItemWatcher.js`
- `App/Services/Watcher/RunningCampaignWatcher.js`

**Schedule**: Both run every minute via cron

---

## 📊 Data Models

### Campaign Schema
```javascript
{
  title: String,
  user_id: ObjectId,
  email_id: String,
  service_type: Enum['gauth', 'custom-smtp', 'sendgrid', 'amazonses', 'office365'],
  sender_name: String,
  reply_to: String,
  drip: Number,
  team_id: ObjectId,
  recipient_groups: [ObjectId],
  stop_follow_up: Boolean,
  status: Enum['draft', 'running', 'paused', 'stopped', 'completed', 'awaited'],
  recipient_count: Number,
  scheduled_at: Date,
  access: [{ user_id: ObjectId, role: Enum['admin', 'manager'] }]
}
```

### Campaign Item Schema
```javascript
{
  campaign_id: ObjectId,
  status: Enum['draft', 'awaited', 'running', 'completed', 'paused', 'stopped', 'pending'],
  scheduled_at: Date,
  delay: Number,
  item_type: Enum['initial', 'reply', 'open', 'click', 'noopen', 'drip'],
  parent_id: ObjectId,
  emailtemplate: { value: ObjectId, label: String },
  intendedRecipients: [ObjectId],
  replied: [ObjectId],
  opened: [{ recipient_id: ObjectId, opened_at: Date }],
  clicked: [{ recipient_id: ObjectId, link: String, clicked_at: Date }],
  hasChild: Boolean,
  childElem: [ObjectId],
  node_id: String
}
```

### Redis Mail Item Structure
**Key Format**: `mailItem|{userId}|{campaignId}`

```javascript
{
  userId: String,
  team_id: String,
  service_type: String,
  sender_email_id: String,
  campaignId: String,
  campaignItemId: String,
  recipient_id: ObjectId,
  recipient_groups: [String],
  // ... recipient subscriber fields
}
```

---

## 🚀 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | - | JavaScript runtime |
| **Framework** | Express.js | 4.17.1 | HTTP server |
| **Database** | MongoDB | 3.3.0 | Primary data store |
| **ODM** | Mongoose | 5.6.9 | MongoDB object modeling |
| **Cache/Queue** | Redis | 2.8.0 | Mail item storage & rate limiting |
| **Message Queue** | RabbitMQ (amqplib) | 0.5.5 | Async message processing |
| **Scheduling** | node-cron | 2.0.3 | Cron job execution |
| **Email Services** | AWS SDK, Nodemailer | 2.521.0, 6.3.0 | Multi-provider email sending |
| **Logging** | Bunyan, LogDNA | 1.8.12, 3.3.0 | Structured logging |
| **Monitoring** | Sentry | 5.5.0 | Error tracking |
| **Testing** | Mocha, Chai | 6.2.0, 4.2.0 | Test framework |

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js v12+
- MongoDB 3.3+
- Redis 4.0+
- RabbitMQ 3.8+

### Quick Start

```bash
# Clone repository
git clone https://github.com/tal95shah/email-campaign-scheduler.git
cd email-campaign-scheduler

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
npm start
```

### Environment Variables

```bash
# MongoDB
MONGODB_CONN_URL=mongodb://localhost:27017/email-scheduler

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_CONN_URL=amqp://guest:guest@localhost:5672

# AWS SES (if using)
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
MAIL_AWS_REGION=your_aws_region_here

# Application
PORT=3000
APPLICATION_NAME=email-scheduler
LOGGING_NAME=email-scheduler
MAIL_FROM=noreply@example.com
```

### Running Individual Services

```bash
npm run initialEmails      # Initial email scheduler
npm run childEmails        # Child email scheduler  
npm run scheduler          # Main scheduler
npm run watcherCampaignItems  # Campaign item watcher
npm run watcherCampaigns      # Campaign watcher
npm run consume            # RabbitMQ consumer
```

---

## 🐳 Deployment

### Docker

```bash
# Build image
docker build -t email-scheduler:1.0.0 . -f ops/docker/Dockerfile

# Run container
docker run -d \
  -e MONGODB_CONN_URL="mongodb://host.docker.internal:27017/email-scheduler" \
  -e REDIS_HOST="redis" \
  -e RABBITMQ_CONN_URL="amqp://guest:guest@rabbitmq:5672" \
  email-scheduler:1.0.0
```

### Kubernetes/Helm

```bash
# Install Helm chart
helm install email-scheduler ops/helm/email-scheduler

# Update values
helm upgrade email-scheduler ops/helm/email-scheduler -f custom-values.yaml
```

**Helm Chart Structure**:
```
ops/helm/email-scheduler/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── email-scheduler-config.yaml
```

---

## 📈 Performance & Scalability

### Current Capabilities
- **Throughput**: Handles 1000+ emails/minute per user (configurable)
- **Concurrency**: Multiple scheduler instances can run simultaneously
- **Scalability**: Horizontal scaling via stateless design
- **Rate Limiting**: Prevents provider throttling across multiple users/services

### Scaling Considerations
1. **Horizontal Scaling**: Multiple instances can run, but Redis key coordination needed
2. **Database Load**: Frequent MongoDB queries (every minute) may need optimization
3. **Redis Dependency**: High availability required for rate limiting
4. **Message Queue**: RabbitMQ should be configured for HA

### Optimization Opportunities
- Database indexing on frequently queried fields
- Redis connection pooling
- Batch processing optimization
- Adaptive rate limiting based on provider feedback

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Test structure
Test/
├── DbHandlers/        # Database handler tests
├── Services/          # Service integration tests
│   ├── RateLimiter/
│   ├── Scheduler/
│   └── Watcher/
```

---

## 📝 API Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed technical documentation including:
- Complete system architecture
- Data flow diagrams
- Component details
- Deployment guides
- Troubleshooting

---

## 🔒 Security Considerations

1. **Credentials Management**: Use secret management (AWS Secrets Manager, HashiCorp Vault) instead of config files
2. **Authentication**: Add authentication middleware for Express endpoints
3. **Input Validation**: Validate all RabbitMQ messages
4. **Rate Limiting**: Already implemented to prevent abuse
5. **Error Handling**: Comprehensive error logging without exposing sensitive data

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

[**Talha Gillani**](https://github.com/tal95shah) - Built as a production microservice for email campaign orchestration at scale.

### 🔗 Follow Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/stalhagillani/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tal95shah)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@talhagillani96)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@LearnwithTalhaGillani)


---

## 🎯 Key Achievements

- ✅ **Multi-Provider Support**: AWS SES, SendGrid, Gmail OAuth, Office365, Custom SMTP
- ✅ **Intelligent Rate Limiting**: Prevents provider throttling across multiple users/services
- ✅ **Drip Campaign Support**: Complex email sequences with conditional logic
- ✅ **Event-Driven Architecture**: Decoupled, scalable design
- ✅ **Production-Ready**: Docker, Kubernetes/Helm deployment support
- ✅ **Comprehensive Monitoring**: Sentry, LogDNA integration

---

**⚠️ Important**: Before committing, ensure `.env` and `.env.development` files are deleted or excluded (they're in `.gitignore` but contain sensitive credentials).
