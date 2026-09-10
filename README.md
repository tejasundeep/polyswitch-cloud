# Polyswitch Cloud 🌐

**The 24/7 Web & Mobile Control Plane for Polyswitch AI Agents.**

Polyswitch Cloud is the responsive companion web application for [Polyswitch](https://github.com/tejasundeep/polyswitch). Monitor your AI bot fleet, track 24/7 background routines, review action approvals on your phone, and chat with your agents from anywhere.

---

## 🚀 1-Click Cloud Deploy

Deploy the web control plane in seconds with zero terminal setup:

### Deploy with Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftejasundeep%2Fpolyswitch-cloud&env=POLYSWITCH_RUNNER_URL,POLYSWITCH_AUTH_TOKEN)

### Deploy with Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tejasundeep/polyswitch-cloud)

### Deploy with Railway
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template?template=https%3A%2F%2Fgithub.com%2Ftejasundeep%2Fpolyswitch-cloud)

### Deploy with Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tejasundeep/polyswitch-cloud)

---

## ⚡ 1-Line VPS / Linux Server Installer

On any Linux VPS or server (Hetzner, DigitalOcean, AWS, Linode), run:

```bash
curl -fsSL https://raw.githubusercontent.com/tejasundeep/polyswitch-cloud/main/install.sh | bash
```

This automatically sets up Docker, builds the lightweight standalone container, and starts Polyswitch Cloud on port `3000`.

---

## 🐳 Docker Deployment

You can also run Polyswitch Cloud directly using Docker or Docker Compose:

```bash
# Using Docker Compose
docker compose up -d

# Or with Docker run
docker build -t polyswitch-cloud .
docker run -d -p 3000:3000 --name polyswitch-cloud polyswitch-cloud
```

---

## ⚙️ Environment Variables

Configure these in your cloud provider settings or in `.env`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `POLYSWITCH_RUNNER_URL` | The endpoint of your local or remote Polyswitch runner | `http://localhost:8799` |
| `POLYSWITCH_AUTH_TOKEN` | Bearer token secret matching `PSB_AUTH_TOKEN` on your runner | *(empty)* |

---

## ✨ Features

* 📱 **Mobile & Desktop First** — Access your agent team from any phone browser (iOS Safari, Android Chrome) or desktop.
* ⚡ **24/7 Autonomous Routines 2.0** — Monitor recurring schedules, view deliverables, check countdown timers, and trigger runs on demand.
* 🛡️ **Remote Governance Approvals** — Review and approve sensitive commands or tool calls with 1 click from your phone.
* 🤖 **Bot Fleet Overview** — View all registered bots (Claude, Grok, Codex, Antigravity), assigned models, and live telemetry.
* 💬 **Live Chat** — Send prompts and converse with any bot in real time.
* 🔒 **Zero-CORS Proxy Gateway** — Built-in Next.js Route Handlers transparently relay requests to remote runners securely.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/tejasundeep/polyswitch-cloud.git
cd polyswitch-cloud

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
