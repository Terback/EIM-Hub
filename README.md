# EIM Hub 🚀

### Centralized Gateway for EIM Technology & Academy

This repository hosts the **EIM Hub**, a minimalist dashboard designed to unify all internal tools and external portals into a single, high-performance interface.

---

## 🔗 Integrated Tools

- **[Invoice Generator](https://invoice.eimtechnology.com)**: Billing and automated invoices.
- **[Team Schedule](https://teamschedule.eimtechnology.com/)**: Resource allocation and time tracking.
- **[Training Intro](https://training.eimacademy.com/)**: Course curriculum and academy info.
- **[Report Generator](https://eim-training-report-generator.vercel.app/)**: Automated student performance reporting.

---

## 🛠 Tech & Deployment

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: [Vercel](https://vercel.com)
- **Domain**: `hub.eimtechnology.com` (Managed via **Cloudflare**)

---

## 🚀 Deployment Steps

1. **Vercel**: Link this GitHub repo and set the domain to `hub.eimtechnology.com`.
2. **Cloudflare**: 
   - Add **CNAME** record.
   - **Name**: `hub`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy Status**: `DNS Only` (for SSL handshake).

---

© 2026 **Terrence Dai / EIM Technology**.
