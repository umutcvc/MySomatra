# How to Deploy MySomatra to the Web

Since your project has both a **Frontend** (React) and a **Backend** (Express/Node.js), the best place to host it for free/cheap is **Render**.

Follow these exact steps to get your website online.

## Step 1: Create a Render Account
1.  Go to [https://dashboard.render.com/](https://dashboard.render.com/).
2.  Sign up or Log in (you can use your GitHub account).

## Step 2: Create a New Web Service
1.  On the Render Dashboard, click the **"New +"** button.
2.  Select **"Web Service"**.
3.  Under "Connect a repository", you should see your GitHub repos.
4.  Find **`umutcvc/MySomatra`** and click **"Connect"**.

## Step 3: Configure the Service
Render will ask for some settings. Fill them in exactly like this:

| Setting | Value |
| :--- | :--- |
| **Name** | `mysomatra` (or any unique name you want) |
| **Region** | Choose the one closest to you (e.g., US East) |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank)* |
| **Runtime** | **Node** |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

## Step 4: Add Environment Variables (Crucial!)
Scroll down to the **"Environment Variables"** section. You need to add the secrets from your local `.env` file so the online server can connect to your database.

Click **"Add Environment Variable"** for each of these:

1.  **Variable 1**:
    *   **Key**: `DATABASE_URL`
    *   **Value**: `postgresql://neondb_owner:npg_oW9trhQIJ5Zx@ep-super-flower-ahzhdzk8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`

2.  **Variable 2**:
    *   **Key**: `SESSION_SECRET`
    *   **Value**: `mysomatra_secret_key_2024`

3.  **Variable 3**:
    *   **Key**: `NODE_ENV`
    *   **Value**: `production`

## Step 5: Deploy
1.  Click **"Create Web Service"**.
2.  Render will start building your app. You will see a terminal log showing the progress.
3.  It may take 3-5 minutes.
4.  Once finished, you will see a green **"Live"** badge.
5.  Your website URL will be at the top (e.g., `https://mysomatra.onrender.com`).

## Troubleshooting
*   **Build Failed?** Check the logs. If it says "npm install failed", make sure you didn't change `package.json` recently.
*   **App Crashes?** Check the "Logs" tab. Usually, this happens if the `DATABASE_URL` is missing or incorrect.
