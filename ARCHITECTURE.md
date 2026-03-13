# Architecture Document

## System Overview

The AI-Assisted Journal System is a full-stack application that provides emotion analysis for journal entries using LLM (Large Language Models).

---

## Architecture Questions

### 1. How would you scale this to 100k users?

**Database Scaling:**
- **Sharding**: Partition MongoDB by `userId` to distribute data across multiple shards
- **Read Replicas**: Add replica sets for read-heavy operations (fetching entries, insights)
- **Indexing**: Create indexes on `userId`, `createdAt`, `emotion` for faster queries
- **Connection Pooling**: Use MongoDB connection pooling to handle concurrent connections

**Application Scaling:**
- **Horizontal Scaling**: Deploy multiple backend instances behind a load balancer (NGINX, AWS ALB)
- **Stateless API**: Keep API servers stateless for easy horizontal scaling
- **Microservices**: Split into separate services (Auth, Journal, Analysis, Insights)

**Caching Layer:**
- **Redis**: Cache frequently accessed data (user insights, recent entries)
- **CDN**: Serve static frontend assets via CDN (Cloudflare, AWS CloudFront)

**Infrastructure:**
- **Containerization**: Docker + Kubernetes for orchestration
- **Auto-scaling**: Scale backend pods based on CPU/memory usage
- **Queue System**: Use RabbitMQ/Kafka for async LLM analysis jobs

---

### 2. How would you reduce LLM cost?

**Request Optimization:**
- **Batch Processing**: Combine multiple analysis requests into single API calls
- **Smaller Models**: Use cheaper/faster models (Llama 3.1 8B vs 70B) for simple emotion detection
- **Prompt Optimization**: Reduce token count with concise prompts

**Caching Strategy:**
- Cache results for identical text inputs (hash-based lookup)
- Cache similar sentiment patterns using embeddings

**Tiered Analysis:**
- **Rule-based First**: Use simple keyword/regex for basic emotions (happy, sad)
- **LLM Fallback**: Only use LLM for complex/ambiguous entries
- **Confidence Threshold**: Re-analyze low-confidence results only

**Rate Limiting:**
- Limit free tier users to N analyses per day
- Queue non-urgent analyses during peak hours

**Cost Estimates:**
| Strategy | Savings |
|----------|---------|
| Caching (30% hit rate) | ~30% |
| Smaller models | ~60% |
| Rule-based prefilter | ~40% |
| **Combined** | **~80%** |

---

### 3. How would you cache repeated analysis?

**Cache Implementation:**

```javascript
// Hash-based cache key
const cacheKey = crypto.createHash('md5').update(text).digest('hex');

// Redis cache structure
{
  "analysis:abc123": {
    "emotion": "calm",
    "keywords": ["rain", "nature"],
    "summary": "...",
    "timestamp": 1234567890
  }
}
```

**Multi-Level Caching:**

1. **In-Memory Cache (L1)**
   - Node.js Map for hot data (last 1000 requests)
   - TTL: 5 minutes

2. **Redis Cache (L2)**
   - Persistent cache for all analyses
   - TTL: 24 hours (configurable)

3. **Database Cache**
   - Store analysis results with journal entry
   - Re-analyze only when user requests

**Cache Invalidation:**
- Invalidate on entry update/delete
- Background job to clear expired cache
- Manual invalidation via admin API

**Cache Hit Optimization:**
- Normalize text before hashing (lowercase, trim, remove punctuation)
- Fuzzy matching for similar texts using cosine similarity

---

### 4. How would you protect sensitive journal data?

**Authentication & Authorization:**
```javascript
// JWT-based auth with short expiry
const token = jwt.sign({ userId }, SECRET, { expiresIn: '1h' });

// Middleware protection
router.get('/:userId', authenticate, (req, res) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
});
```

**Data Encryption:**
- **At Rest**: MongoDB encrypted storage (AES-256)
- **In Transit**: HTTPS/TLS for all API calls
- **Field-level**: Encrypt journal text before storing

```javascript
// Encrypt sensitive fields
const encryptedText = crypto.encrypt(text, ENCRYPTION_KEY);
const decryptedText = crypto.decrypt(encryptedText, ENCRYPTION_KEY);
```

**Security Best Practices:**

| Layer | Protection |
|-------|------------|
| Network | HTTPS, CORS, Rate Limiting |
| Application | Input Validation, SQL Injection Prevention |
| Database | Encrypted connections, IP whitelisting |
| Access | RBAC, MFA for admin access |
| Audit | Log all access attempts |

**Privacy Features:**
- **Data Retention**: Auto-delete entries after user-defined period
- **Export**: Allow users to download their data (GDPR compliance)
- **Anonymization**: Remove PII before LLM analysis
- **Opt-out**: Allow users to disable AI analysis

**Compliance:**
- GDPR (EU users)
- HIPAA (if used for mental health)
- SOC 2 Type II certification

---

## Current Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│   MongoDB   │
│  (Next.js)  │     │  (Express)   │     │  (Atlas)    │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Groq LLM    │
                    │  (API)       │
                    └──────────────┘
```

## Future Architecture (100k users)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Load        │────▶│  API        │
│  (Next.js)  │     │  Balancer    │     │  Servers    │
│   + CDN     │     │  (NGINX)     │     │  (Cluster)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
           ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
           │    Redis     │            │   MongoDB    │            │  Message     │
           │   (Cache)    │            │   (Sharded)  │            │  Queue       │
           └──────────────┘            └──────────────┘            └──────┬───────┘
                                                                          │
                                                                          ▼
                                                                   ┌──────────────┐
                                                                   │  LLM Worker  │
                                                                   │  (Groq API)  │
                                                                   └──────────────┘
```

---

## Performance Metrics

| Metric | Current | Target (100k) |
|--------|---------|---------------|
| API Response Time | <500ms | <200ms |
| LLM Analysis Time | 2-5s | <2s (async) |
| Database Queries | <50ms | <20ms |
| Cache Hit Rate | N/A | >70% |
| Uptime | N/A | 99.9% |
