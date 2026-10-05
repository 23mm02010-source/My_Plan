# Planly DSA - Personal SDE Preparation Roadmap

A personal takeUforward Planly-inspired DSA preparation web application built for **Shaik**.

Faithfully extracted from the full screen recording and 25 reference screenshots of the takeUforward Planly SDE roadmap, this application contains all **16 Sprints**, **108 Days**, and **877 authentic problems** covering Data Structures, Algorithms, Object-Oriented Programming (OOPS), Operating Systems, Computer Networks, Low-Level Design (LLD), and Database Management Systems (DBMS).

---

## 🌟 Key Highlights & Features

1. **Exact 16 Sprints & 108 Days Roadmap**
   - **Sprints 1–4:** DSA + OOPS (Days 1–7 each)
   - **Sprints 5–7:** DSA + Operating System (Days 1–7 each)
   - **Sprints 8–10:** DSA + Computer Networks (Days 1–7 each)
   - **Sprint 11:** Computer Networks + LLD (Days 1–7)
   - **Sprints 12–14:** LLD + DBMS (Days 1–7 each)
   - **Sprint 15:** DBMS (Days 1–7)
   - **Sprint 16:** DBMS (Days 1–3, Capstone & Comprehensive Review)
   - **Total:** 877 distinct problems extracted with OCR and frame-by-frame analysis.

2. **Dashboard & Daily Focus**
   - "Today's Task" hero banner with quick "Continue Today's Problems" CTA.
   - Circular progress ring displaying overall completion percentage.
   - Quick stats for Problems Solved, Topics Completed, Active Sprint Days, and Sprints Mastered.
   - Subject-wise domain mastery breakdown (DSA, OOPS, OS, Networks, LLD, DBMS).
   - 16 Sprints matrix for direct navigation.

3. **Interactive Daily Task Checklist**
   - Categorized by sub-topics with progress counts (e.g., `2 / 5`).
   - Custom animated checkboxes with celebratory confetti on day/sprint completion.
   - Direct Google & LeetCode search button for each problem title.
   - Search filter within the day (filter by All, Pending, or Done).
   - Quick bulk actions: "Mark All Done" and "Reset Day".
   - Previous Day and Next Day navigation controls.

4. **Global Search (`Ctrl+K` / `Cmd+K`)**
   - Instant search across all 877 problems, topics, days, and sprints.
   - Keyboard navigable with `↑`, `↓`, and `Enter`.
   - Direct jump to the target problem's day with smooth scrolling into view.

5. **100% Client-Side State Persistence**
   - Checkbox states, current active day, and streak persist across page reloads via `localStorage`.
   - Option to reset progress anytime with confirmation modal.

6. **Strictly No Time Tracking**
   - As requested, no timers, stopwatches, time limits, or time-spent metrics are implemented anywhere in the application.

---

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS with custom dark mode theme (`#0b0f19` background, `#111827` surface cards, `#3b82f6` primary accent, `#10b981` success emerald)
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

### 3. Preview Production Build
```bash
npm run preview
```
