# The Resin Grove — Deployment & Customization Guide

Welcome to **The Resin Grove**, a highly-polished, responsive showcase and customizer application designed for high-end boutique resin-and-wood craftsmanship. 

To keep checkout secure, lightweight, and conversational, the application implements a **Direct Studio Coordination** model instead of an automated payment gateway. When users checkout, their exact configuration requests and items are compiled into an optimized direct email to the studio admin, facilitating high-touch personal consultation.

---

## 🛠️ Key Customization Points

Before building and deploying the application, you will want to update the default placeholders with your own studio information. Below are the key files and lines to modify:

### 1. Studio Admin Email (Checkout Target)
When a user completes their order or design curation in the shopping bag, the application prepares a detailed order sheet and prompts them to send it to the admin.
* **File to edit**: `/src/components/CartDrawer.tsx`
* **Line to modify**: Line 17
```typescript
const ADMIN_EMAIL = "your-actual-email@domain.com";
```

### 2. General Contact Information
The touchpoints listed in the "Connect with Us" section of the page (phone, email, working hours) are configured here.
* **File to edit**: `/src/components/Contact.tsx`
* **Lines to modify**: Lines 44–48
```typescript
const studioInfo = [
  { label: "Direct Phone", detail: "+1 (503) 555-0142", icon: Phone },
  { label: "Studio Email", detail: "hello@theresingrove.com", icon: Mail },
  { label: "Working Hours", detail: "Monday – Saturday, 9:00 AM – 6:00 PM PST", icon: Clock }
];
```

### 3. Product Catalog & Categories
You can manage the complete showcase catalog, categories, pricing, descriptions, dimensions, and best-seller tags inside this single static data file.
* **File to edit**: `/src/data.ts`
* **Sections**:
  - `CATEGORIES` array: Defines the category navigation slide cards.
  - `PRODUCTS` array: Defines all standard products. Add `isBestSeller: true` to feature a product in the premium horizontal slider.

### 4. Customizer Options (Wood, Resin, Inclusions)
To update the options listed in the interactive customizer wizard (e.g. add new wood slabs, change resin colors, or add raw material choices):
* **File to edit**: `/src/components/CustomOrders.tsx`
* **Data to modify**:
  - `woodSlabs`: Available live-edge timbers (e.g., Walnut, Olive Wood, Burl).
  - `resinColors`: Resin shade options with custom CSS colors and descriptions.
  - `decorativeOptions`: Natural inclusions (e.g., Gold Foil, Pressed Leaves, Quartz crystals).

---

## 💻 Local Development

Ensure you have [Node.js](https://nodejs.org/) installed, then execute the following commands in the project root:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Validate Code (Linter)**:
   ```bash
   npm run lint
   ```

4. **Compile Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🚀 Deployment Instructions

Since this is a client-side **Single Page Application (SPA)** built with **Vite, React, and Tailwind CSS**, the output of `npm run build` is a lightweight bundle of static assets inside the `dist/` folder.

You can host these static files for free on any of the following platforms:

### A. Static Hosting (Vercel, Netlify, Cloudflare Pages)
1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Connect your repository to your host of choice.
3. Configure the build settings as follows:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Deploy!

### B. Firebase Hosting
1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Initialize your project: `firebase init hosting`
3. When prompted, set your public directory to `dist` and configure as a single-page app.
4. Deploy: `firebase deploy --only hosting`

### C. Docker / Cloud Run Container Hosting
A production ready Dockerfile can serve these assets using Nginx:
```dockerfile
# Build step
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve step
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
