# ScholarHub Third-Party Integrations Guide

This document explains how to set up, configure, and wire up third-party services on the ScholarHub Virtual Classroom Platform.

## Environment Variables Configuration

Copy the configuration values to your `.env.local` file:

```env
# Supabase Backend Configuration
VITE_SUPABASE_URL=https://niebnbpcmnfqfyodkqvr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_gdx1AatWLlJNUL8zFPL7FQ_rpmDvcVm

# Video Conferencing (100ms.live)
HMS_ACCESS_KEY=your_hms_access_key_here
HMS_SECRET=your_hms_secret_here

# AI Services (OpenAI)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Payment (Razorpay)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Certificate Blockchain (Polygon & Ethers)
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_CONTRACT_ADDRESS=your_deployed_contract_address_here
```

---

## 1. Video Conferencing (100ms.live)

ScholarHub uses **100ms.live** for real-time interactive classrooms with canvas whiteboards, screen sharing, and audio/video streams.

### Setup Steps:
1. Log in to [100ms Dashboard](https://dashboard.100ms.live/).
2. Navigate to **Developer Section** to retrieve your `HMS_ACCESS_KEY` and `HMS_SECRET`.
3. Create a **Classroom Template** with the default roles: `host` (for teachers) and `guest` (for students).
4. Run your server-side token generation endpoint or serverless function utilizing the access keys to sign JWTs for joining.
5. In [video.service.ts](file:///c:/Users/benny/Documents/NexLearn/src/services/video.service.ts), update the `joinRoom(roomId, role)` API endpoint to use the live token generation backend url.

---

## 2. AI Tutor & Services (OpenAI GPT-4o)

Personalized AI interactions and automated grading run on OpenAI's GPT-4o model.

### Setup Steps:
1. Go to [OpenAI API Settings](https://platform.openai.com/).
2. Generate a new secret key and set `VITE_OPENAI_API_KEY`.
3. The platform features calling endpoints:
   - **AI Tutor**: `POST /api/ai/tutor` utilizing the chat message array sequence.
   - **AI Quiz Generator**: `POST /api/ai/quiz/generate` passing category context and difficulty metrics.
   - **AI Assignment Checker**: `POST /api/ai/assignments/check` passing student text/files content.
   - **AI Course Recommender**: `POST /api/ai/recommendations` parsing user profile metrics.
   - **AI Attendance Insights**: `POST /api/ai/attendance/insights` for anomalies flag tracking.

---

## 3. Payments (Razorpay)

Course payments use Razorpay checkout flow with currency default to INR (₹).

### Setup Steps:
1. Create a [Razorpay Merchant Account](https://dashboard.razorpay.com/).
2. Toggle to **Test Mode** and copy your Key ID into `VITE_RAZORPAY_KEY_ID`.
3. Implement a backend route or edge function to generate order IDs:
   - Endpoint: `POST https://api.razorpay.com/v1/orders`
   - Content: `{ amount, currency: "INR" }`
4. The client checkout form calls Razorpay script overlay with order details, executing `verifyPayment` signature hash checks on success.

---

## 4. Blockchain Certificates (Polygon Network)

Completion certificates are minted on-chain to provide immutable verification.

### Setup Steps:
1. Deploy an **ERC721 smart contract** on Polygon mainnet or Amoy testnet.
2. In [blockchain.service.ts](file:///c:/Users/benny/Documents/NexLearn/src/services/blockchain.service.ts), import `ethers` (via `npm install ethers`) and insert your ABI.
3. Configure `VITE_POLYGON_RPC_URL` and `VITE_CONTRACT_ADDRESS` to interact with your smart contract instance.
4. Calling `issueCertificate()` signs and executes a minting transaction saving the metadata pointer to IPFS.
