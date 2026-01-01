# Vercel Deployment Guide for Clash Royale Wizard

## Prerequisites
- GitHub/GitLab account with your code
- Vercel account (free to start)
- Groq API key (free tier available)

## Step 1: Prepare Your Code

1. **Add Groq API Key to local environment**:
   ```bash
   cd frontend
   echo "GROQ_API_KEY=your_groq_api_key_here" >> .env.local
   ```

2. **Create vercel.json for configuration**:
   ```json
   {
     "functions": {
       "app/api/decks/route.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add enhanced battle analysis and LLM integration"
   git push origin main
   ```

## Step 2: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Connect your GitHub/GitLab repository
   - Select the `frontend` folder as root directory

2. **Configure Environment Variables**:
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   ```
   CLASH_ROYALE_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9...
   GROQ_API_KEY=gsk_your_groq_api_key_here
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

## Step 3: Get Free Groq API Key

1. Go to https://console.groq.com
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy the key (starts with `gsk_`)

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Search for a Clash Royale player
3. Try the deck suggestions feature
4. Check if battle analysis works (if you have Pro plan)

## Optimization Tips

### For Free Tier (10s limit):
```typescript
// Add timeout handling in API routes
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

try {
  const response = await fetch(groqAPI, {
    signal: controller.signal,
    // ... other options
  });
} finally {
  clearTimeout(timeoutId);
}
```

### For Pro Tier (60s limit):
- Full battle analysis and LLM guidance works perfectly
- Can process larger battle logs
- More sophisticated AI responses

## Alternative Free LLM Options

If you want to stay on free tier:

1. **Hugging Face Inference API** (slower but free):
   ```typescript
   const response = await fetch(
     'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
     {
       headers: { 'Authorization': `Bearer ${process.env.HF_TOKEN}` },
       method: 'POST',
       body: JSON.stringify({ inputs: prompt }),
     }
   );
   ```

2. **OpenAI-compatible endpoints** with free tiers:
   - Together.AI (free credits)
   - Replicate (pay-per-use)

## Monitoring and Debugging

- Check Vercel Function Logs for errors
- Monitor API call duration
- Set up error boundaries in React components
- Use Vercel Analytics for performance monitoring

## Cost Estimation

- **Vercel Hobby**: Free (with 10s function limit)
- **Vercel Pro**: $20/month (with 60s function limit)
- **Groq API**: Very generous free tier
- **Clash Royale API**: Free

Total cost: $0-20/month depending on function timeout needs.
