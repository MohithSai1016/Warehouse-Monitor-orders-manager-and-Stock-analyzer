# 🏭 Sai's Warehouse — 3D Smart AGV/AMR Warehouse Simulation & WMS

A modern, full-featured **3D Autonomous Smart Warehouse Simulation & Warehouse Management System (WMS)** built with **React**, **Three.js / WebGL**, **Vite**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. 🤖 Zero-Traffic 3D Dedicated Elevation Track System
- **10 Autonomous Mobile Robots (AGVs / AMRs)** traveling on permanently isolated, dedicated multi-level tracks (Ground Guideway $Y=1.2\text{px}$ & Upper Elevated Deck $Y=46\text{px}$).
- Eliminates traffic, collisions, and intersections completely while maintaining continuous non-stop robot movement.
- **Dedicated Putaway AMRs (`AGV-01` & `AGV-02`)**: Specifically assigned to pick inbound freight and arrange restock items into high-density storage racks.

### 2. 🧭 4-Sided Perimeter Layout Architecture
- **West Side Wing**: Automated Packaging & Carton Taping Facility with 5 workbenches, KUKA robotic taping arms, digital scale monitors, carton hoppers, and an optical barcode laser scanner arch.
- **East Side Wing**: High-Voltage Fast-Charging Terminal Bay with 10 dedicated charging ports (`CHG-01` to `CHG-10`), emerald recharge pads, and power capacitor cabinets.
- **South Front Edge**: Outbound Picking, Takeaway & Regional Courier Platform with 2 Large Logistics Freight Trucks (`INBOUND SUPPLY 01` & `EXPRESS DISPATCH 02`), animated motorized conveyor belt carrying parcels, asphalt roadway, and parked delivery motorbikes.
- **North Back Wing**: High-Density Inventory Storage Racks (Racks A1..F1 & A2..F2) organized across Groceries, Snacks, Beverages, Cleaning, and Personal Care categories.

### 3. 🏃‍♂️ Real-Time Animated 3D Humanoid Workers & Couriers
- **Walking Delivery Couriers**: Traversing between the packaging facility and delivery motorbikes with dynamic leg swing gait kinematics and cadence head bobbing.
- **Packaging Operators**: Actively taping, labeling, and feeding boxes into the motorized conveyor belt.
- **Riders Loading Motorbikes**: Loading delivery parcels into rear insulated cargo trunks.
- **Truck Unloaders & Loaders**: Offloading incoming freight and loading outgoing regional transit shipments.
- **Platform Supervisors**: Inspecting pick waves and monitoring dock manifests.

### 4. 🏙️ Multi-Warehouse Localized Partitioning (Andhra Pradesh)
- Supports **Kakinada Hub** (East Godavari) and **Vijayawada Hub** (Krishna / NTR) with independent inventory partitions, real native customer addresses, localized suppliers, and autonomous VIP order preemption.

### 5. 👤 Owner Profile & Interactive Modal
- Master Owner & Architect profile for **Mohith Sai** (`Webdesigner & Owner`, Mobile: `7675996669`, Email: `mohithsairangarao@gmail.com`, Address: `2-43-34, venkatnagar, kakinada`) with 1-click clipboard copy and full administrative facility permissions.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.0.0 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1. Extract the downloaded zip file into your desired directory:
```bash
cd Sais-Warehouse-3D-Simulation
```

2. Install dependencies:
```bash
npm install
```

3. Launch the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173/
```

### Production Build
To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 📤 Pushing to GitHub

Follow these steps to initialize a git repository and push to GitHub:

1. Initialize git:
```bash
git init
```

2. Stage all files:
```bash
git add .
```

3. Create the initial commit:
```bash
git commit -m "Initial commit: Sai's Warehouse 3D AGV Simulation & WMS"
```

4. Set your default branch to `main`:
```bash
git branch -M main
```

5. Link your GitHub remote repository (replace with your repository URL):
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
```

6. Push to GitHub:
```bash
git push -u origin main
```

---

## 🛠️ Built With
- **React 18 / 19**
- **Three.js** (3D WebGL Rendering Engine)
- **Vite** (Next-generation Frontend Tooling)
- **Lucide React** (Modern Iconography)
- **Vanilla CSS** (Custom Dark Industrial Design System)

---

## 👨‍💻 Author & Owner
- **Mohith Sai** (Webdesigner & Owner)
- **Contact**: +91 7675996669
- **Email**: mohithsairangarao@gmail.com
- **Address**: 2-43-34, Venkatnagar, Kakinada, Andhra Pradesh, India
