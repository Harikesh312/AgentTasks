const questions = [
  {
    "id": 1,
    "title": "Recreate this Hero Section Pixel-Perfect",
    "difficulty": "Easy",
    "category": "Component",
    "isOptimizationTrap": false,
    "avgAttempts": 1.2,
    "description": "Guide the AI agent to recreate a modern hero section with a headline, subtext, call-to-action button, and a background gradient. The layout should match the reference design exactly.",
    "referenceImage": "/images/references/q1_hero.svg",
    "requirements": [
      "Full-width hero section with vertical centering",
      "Large heading with gradient text effect",
      "Subtext paragraph below the heading",
      "Primary CTA button with hover animation",
      "Subtle background gradient (dark to slightly lighter)"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Use semantic HTML elements",
      "No external CSS frameworks"
    ],
    "requiredContent": {
      "headline": "Build the Future Faster",
      "subtext": "Ship your product in days, not months. The most powerful SaaS boilerplate.",
      "cta": "Get Started"
    },
    "maxPromptTurns": 5
  },
  {
    "id": 2,
    "title": "Build a SaaS Pricing Page from Screenshot",
    "difficulty": "Medium",
    "category": "Landing Page",
    "isOptimizationTrap": false,
    "avgAttempts": 2.1,
    "description": "Prompt the AI agent to build a complete SaaS pricing page with three plan cards, feature comparison lists, toggle for monthly/annual billing, and a FAQ section. Match the reference layout closely.",
    "referenceImage": "/images/references/q2_pricing.svg",
    "requirements": [
      "Three pricing cards (Free, Pro, Enterprise) side by side",
      "Monthly/Annual toggle switch that changes prices",
      "Feature checkmark list per plan",
      "Highlighted/recommended plan card (Pro)",
      "FAQ accordion section below pricing cards"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Responsive: cards stack on mobile",
      "Use CSS Grid or Flexbox for layout"
    ],
    "requiredContent": {
      "headline": "Simple, transparent pricing",
      "monthly": "Monthly",
      "annually": "Annually",
      "freePlan": "Free",
      "proPlan": "Professional",
      "enterprisePlan": "Enterprise"
    },
    "maxPromptTurns": 5
  },
  {
    "id": 3,
    "title": "Clone this Analytics Dashboard Layout",
    "difficulty": "Hard",
    "category": "Dashboard",
    "isOptimizationTrap": true,
    "avgAttempts": 3.8,
    "description": "Direct the AI agent to clone a complex analytics dashboard with a sidebar, stat cards, charts area, and data table. WARNING: The agent's first attempt will use a broken grid layout with fixed pixel widths that don't respond to different screen sizes. You must use follow-up prompts to guide the agent toward a correct, responsive implementation.",
    "referenceImage": "/images/references/q3_dashboard.svg",
    "requirements": [
      "Sidebar navigation with icons and labels",
      "Top stat cards row (4 cards: Users, Revenue, Growth, Conversions)",
      "Main chart area (placeholder chart block)",
      "Data table below charts with sortable column headers",
      "Responsive: sidebar collapses on mobile"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Evaluate both visual match AND code quality",
      "Agent's first pass intentionally uses fixed pixel widths"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 4,
    "title": "Fix the Agent's Inefficient Data Table Rendering",
    "difficulty": "Hard",
    "category": "Optimization Challenge",
    "isOptimizationTrap": true,
    "avgAttempts": 4.2,
    "description": "The AI agent will generate a data table component that renders 10,000 rows without any optimization — no virtualization, no pagination, no lazy loading. Your job is to prompt the agent to refactor the output with proper performance patterns. This tests your ability to identify and communicate optimization strategies.",
    "referenceImage": "/images/references/q4_datatable.svg",
    "requirements": [
      "Data table displaying user records (name, email, role, status, date)",
      "Pagination controls (items per page selector, page navigation)",
      "Search/filter input for table rows",
      "Sortable column headers with visual indicators",
      "Loading skeleton state"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Code efficiency is weighted 2x for scoring",
      "Agent's first pass renders all 10k rows at once (intentionally slow)"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 5,
    "title": "Build a Responsive Navbar Matching Design",
    "difficulty": "Easy",
    "category": "Component",
    "isOptimizationTrap": false,
    "avgAttempts": 1.4,
    "description": "Build a clean, responsive navigation bar. It should show a logo and links on desktop, but collapse into a hamburger menu on mobile screens.",
    "referenceImage": "/images/references/q5_navbar.svg",
    "requirements": [
      "Logo on the left, nav links centered or right-aligned",
      "Hamburger icon on mobile that opens a slide-down menu",
      "Active link indicator (underline or highlight)",
      "Smooth transition for mobile menu open/close",
      "Sticky position on scroll"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Pure CSS for mobile menu animation (no JS toggle library)",
      "Must work on screens 320px and up"
    ],
    "requiredContent": {
      "brand": "Brand",
      "home": "Home",
      "features": "Features",
      "pricing": "Pricing",
      "contact": "Contact",
      "cta": "Sign Up"
    },
    "maxPromptTurns": 5
  },
  {
    "id": 6,
    "title": "Recreate this E-commerce Product Card",
    "difficulty": "Medium",
    "category": "Component",
    "isOptimizationTrap": false,
    "avgAttempts": 1.9,
    "description": "Prompt the agent to build a product card component with an image, title, price, rating stars, and an 'Add to Cart' button. Include hover effects and a 'Sale' badge overlay.",
    "referenceImage": "/images/references/q6_product.svg",
    "requirements": [
      "Product image with hover zoom effect",
      "Sale badge positioned on top-left corner",
      "Star rating display (4.5/5 style with half-star support)",
      "Original price with strikethrough + sale price",
      "'Add to Cart' button with icon and hover state",
      "Wishlist heart icon on top-right"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Card should be reusable as a component",
      "Use CSS transitions for all hover effects"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 7,
    "title": "Guide the Agent to Fix Broken Responsive Breakpoints",
    "difficulty": "Hard",
    "category": "UI Cloning",
    "isOptimizationTrap": true,
    "avgAttempts": 3.5,
    "description": "The agent will attempt to clone a portfolio website layout but will generate CSS with hardcoded widths and missing media queries. Content will overflow on tablet and stack incorrectly on mobile. Guide the agent with follow-up prompts to implement proper responsive breakpoints and fluid layouts.",
    "referenceImage": "/images/references/q7_responsive.svg",
    "requirements": [
      "Portfolio grid (3 columns desktop, 2 tablet, 1 mobile)",
      "Hero section with overlapping text on image",
      "About section with image + text side by side",
      "Contact form with proper field alignment at all sizes",
      "Footer with multi-column link layout"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Must handle 3 breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)",
      "Agent's first pass has no media queries at all"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 8,
    "title": "Build a Multi-Step Form with Validation",
    "difficulty": "Medium",
    "category": "Component",
    "isOptimizationTrap": false,
    "avgAttempts": 2.3,
    "description": "Build a 3-step checkout form (Account, Shipping, Payment) that validates input before allowing the user to proceed to the next step.",
    "referenceImage": "/images/references/q8_form.svg",
    "requirements": [
      "Step progress bar showing current step (1 of 3)",
      "Step 1: Name, email, phone fields with validation",
      "Step 2: Username, password, confirm password with strength meter",
      "Step 3: Review/confirmation summary of all entered data",
      "Next/Back navigation buttons with disabled state",
      "Success animation on final submit"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Client-side validation only",
      "Smooth slide transition between steps"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 9,
    "title": "Accessible Login Form with Validation States",
    "difficulty": "Easy",
    "category": "Forms & Accessibility",
    "isOptimizationTrap": false,
    "avgAttempts": 5,
    "description": "Build an email/password login form with inline validation, error states, a submitting state, and full keyboard/screen-reader support.",
    "referenceImage": "/images/references/q9_login.svg",
    "requirements": [
      "Validate email format on blur and enforce a minimum password length.",
      "Show text errors beside invalid fields and announce them accessibly.",
      "Set aria-invalid and connect errors using aria-describedby.",
      "Disable the submit button and show a spinner during a simulated request.",
      "On failed authentication, show “Invalid email or password.”",
      "Support visible focus states and Enter-to-submit."
    ],
    "constraints": [
      "Labels are correctly associated with inputs.",
      "Errors do not cause noticeable layout shift.",
      "No keyboard traps."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 19,
    "title": "Kanban Board with Draggable Task Columns",
    "difficulty": "Medium",
    "category": "Drag & Drop / State Management",
    "isOptimizationTrap": true,
    "avgAttempts": 12,
    "description": "Build a Trello-style board with To Do, In Progress, and Done columns.",
    "referenceImage": "/images/references/q19_kanban.svg",
    "requirements": [
      "Cards show title, optional tag, and assignee avatar.",
      "Support moving cards between columns and reordering within a column.",
      "Display a clear drop-target/placeholder while dragging.",
      "Update the underlying state model, not only the DOM.",
      "Display live task counts in each column header.",
      "Show “Drop here” affordance for empty columns.",
      "Provide keyboard alternative such as a “Move to column” action."
    ],
    "constraints": [
      "Cards cannot be duplicated or lost.",
      "Order and column survive forced re-render.",
      "Dragging must persist after any re-render; cards must not snap back."
    ],
    "maxPromptTurns": 20
  },
  {
    "id": 10,
    "title": "Responsive Profile Settings Card",
    "difficulty": "Easy",
    "category": "Component Design & Responsive Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 5,
    "description": "Recreate a profile settings card with avatar, editable name/email fields, unsaved-change state, and Save action.",
    "referenceImage": "/images/references/q10_profile.svg",
    "requirements": [
      "Avatar and “Change photo” control are beside fields on desktop and stack on mobile.",
      "Show an unsaved-changes indicator only when values differ from the original data.",
      "Keep Save disabled until a field changes.",
      "Reset the unsaved state after a successful save.",
      "Prevent horizontal scrolling from 320px to 1440px."
    ],
    "constraints": [
      "Use responsive flex/grid layout, not fixed-width hacks.",
      "Avatar uses object-fit: cover and never stretches."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 24,
    "title": "Virtualized Data Table for a Large Dataset",
    "difficulty": "Hard",
    "category": "Performance & Tables",
    "isOptimizationTrap": true,
    "avgAttempts": 22,
    "description": "Build a table that smoothly displays 10,000+ rows with virtualization, sticky header, sorting, and dynamic row heights.",
    "referenceImage": "/images/references/q24_virtualized.svg",
    "requirements": [
      "Mount only rows near the viewport.",
      "Keep scrolling smooth with mouse wheel and scrollbar dragging.",
      "Maintain sticky-header alignment with table columns.",
      "Sort full dataset, not only visible rows.",
      "Reset scroll sensibly after sorting.",
      "Support expanding rows without breaking offsets."
    ],
    "constraints": [
      "DOM node count stays roughly constant.",
      "No blank flashes during fast scrolling.",
      "Dynamic row height changes do not misalign later rows.",
      "Do not filter/sort on scroll or synchronously recalculate all row positions every scroll event."
    ],
    "maxPromptTurns": 30
  },
  {
    "id": 11,
    "title": "Notification Dropdown with Unread/Read States",
    "difficulty": "Easy",
    "category": "Component Design & State Management",
    "isOptimizationTrap": false,
    "avgAttempts": 6,
    "description": "Build a bell notification dropdown with unread/read state, unread count badge, and “Mark all as read.”",
    "referenceImage": "/images/references/q11_notification.svg",
    "requirements": [
      "Badge count derives automatically from unread notification data.",
      "Unread notifications have a dot and bold text.",
      "Clicking an unread item marks it as read.",
      "“Mark all as read” clears all unread states.",
      "Close the dropdown on outside click and Escape.",
      "Add an empty state: “You’re all caught up.”"
    ],
    "constraints": [
      "Badge never becomes out of sync with item state.",
      "Fully usable with mouse and keyboard."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 20,
    "title": "Admin Data Table with Filters, Sorting, and Pagination",
    "difficulty": "Medium",
    "category": "Tables & Data Management",
    "isOptimizationTrap": true,
    "avgAttempts": 14,
    "description": "Build an admin user table with text search, status filter, sort controls, pagination, and accurate empty states.",
    "referenceImage": "/images/references/q20_admin.svg",
    "requirements": [
      "Sort columns ascending → descending → unsorted.",
      "Show sort direction clearly.",
      "Search by user name/email.",
      "Filter by status: Active, Invited, Suspended.",
      "Combine search, filter, and sort correctly.",
      "Reset to page one when filters change.",
      "Show “Showing X–Y of Z” based on filtered results."
    ],
    "constraints": [
      "Pagination count matches the filtered dataset.",
      "Distinguish loading, no matches, and truly empty dataset states.",
      "Apply filtering/sorting to complete data before pagination."
    ],
    "maxPromptTurns": 20
  },
  {
    "id": 12,
    "title": "Responsive Navigation Bar with Mobile Menu",
    "difficulty": "Easy",
    "category": "Navigation & Responsive Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 6,
    "description": "Build a top navigation with logo, links, CTA, and a mobile hamburger menu.",
    "referenceImage": "/images/references/q12_navbar.svg",
    "requirements": [
      "Show horizontal links and CTA on desktop.",
      "Collapse navigation into a hamburger-triggered drawer/overlay on mobile.",
      "Trap focus while the mobile menu is open.",
      "Close menu on Escape and outside click.",
      "Lock page scroll while menu is open.",
      "Highlight the active route in desktop and mobile navigation.",
      "Animate hamburger icon into an X when open."
    ],
    "constraints": [
      "No content jump when the drawer opens.",
      "Full keyboard navigation including CTA works."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 25,
    "title": "Real-Time Collaboration Dashboard with Activity Feed",
    "difficulty": "Hard",
    "category": "Real-Time UI & State Management",
    "isOptimizationTrap": true,
    "avgAttempts": 20,
    "description": "Build a shared task dashboard with presence indicators, live activity feed, optimistic updates, and simulated request failures.",
    "referenceImage": "/images/references/q25_collaboration.svg",
    "requirements": [
      "Optimistically complete tasks/add comments before simulated request resolves.",
      "Roll back only failed changes with a clear message.",
      "Append simulated activity events from other users.",
      "Show user presence avatars and “X is typing…” state.",
      "Never interrupt an actively focused comment input."
    ],
    "constraints": [
      "Only failed change reverts.",
      "No duplicate/out-of-order activity entries.",
      "Incoming events never steal focus.",
      "Avoid full-page refetch/reset when one optimistic action fails."
    ],
    "maxPromptTurns": 30
  },
  {
    "id": 13,
    "title": "E-commerce Quantity Selector & Add-to-Cart Module",
    "difficulty": "Easy",
    "category": "E-commerce UI & State Management",
    "isOptimizationTrap": false,
    "avgAttempts": 5,
    "description": "Build a quantity stepper with manual input and an Add to Cart button with loading, success, and stock-limit states.",
    "referenceImage": "/images/references/q13_cart.svg",
    "requirements": [
      "Quantity range is 1 to 8.",
      "Clamp and validate manually typed values.",
      "Prevent non-numeric values and NaN.",
      "Disable + button at stock limit and explain why.",
      "Add to Cart shows spinner, then “Added” success state, then resets.",
      "Prevent duplicate actions on rapid clicks."
    ],
    "constraints": [
      "Disabled controls use semantic disabled, not only CSS.",
      "Quantity logic remains stable for invalid input."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 21,
    "title": "Multi-Step Checkout Form with Validation",
    "difficulty": "Medium",
    "category": "Forms & Multi-Step Flows",
    "isOptimizationTrap": false,
    "avgAttempts": 13,
    "description": "Build a Shipping → Payment → Review checkout flow with validation and progress tracking.",
    "referenceImage": "/images/references/q21_checkout.svg",
    "requirements": [
      "Show current/completed steps in progress indicator.",
      "Permit going back to completed steps but not skipping ahead over invalid steps.",
      "Validate fields before moving forward.",
      "Preserve values while moving back and forth.",
      "Review all information before Place Order.",
      "Show loading and success confirmation on submit."
    ],
    "constraints": [
      "Review cannot be reached with invalid shipping/payment data.",
      "Browser/in-app back action does not wipe form state."
    ],
    "maxPromptTurns": 20
  },
  {
    "id": 14,
    "title": "Pricing Comparison Card Set",
    "difficulty": "Easy",
    "category": "Design Reproduction & Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 4,
    "description": "Recreate a Basic, Pro, and Enterprise pricing section with a highlighted “Most Popular” Pro plan.",
    "referenceImage": "/images/references/q14_pricing.svg",
    "requirements": [
      "Display three cards in a row on desktop and stacked on mobile.",
      "Highlight Pro using a badge, border, elevation, or shadow.",
      "Add monthly/annual billing toggle that updates all prices together.",
      "Include feature checklist and consistent included/excluded icons.",
      "Add CTA actions with toast or stubbed handler."
    ],
    "constraints": [
      "All card heights align on desktop despite different feature counts.",
      "Price updates are synchronous and correctly formatted."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 26,
    "title": "Fix Severe Rendering and Performance Issues in an Analytics Dashboard",
    "difficulty": "Hard",
    "category": "Debugging & Performance",
    "isOptimizationTrap": false,
    "avgAttempts": 20,
    "description": "Fix excessive re-renders, memory leaks, and filter input jank in an existing analytics dashboard without changing visual output.",
    "referenceImage": "/images/references/q26_fix.svg",
    "requirements": [
      "Identify unstable props/callbacks causing expensive chart re-renders.",
      "Clean up leaking interval/subscription on unmount.",
      "Defer/debounce expensive filtering work.",
      "Preserve all current visual behavior and functionality."
    ],
    "constraints": [
      "Chart render count measurably drops on unrelated state updates.",
      "No console warnings/errors after repeated mount/unmount.",
      "Filtering remains responsive with full mock data.",
      "Explain root cause and fix for all three issues."
    ],
    "maxPromptTurns": 30
  },
  {
    "id": 15,
    "title": "Search Input with Empty, Loading, and Result States",
    "difficulty": "Easy",
    "category": "State Management & UX Patterns",
    "isOptimizationTrap": true,
    "avgAttempts": 6,
    "description": "Build a debounced search input against a mock dataset with idle, loading, result, and no-results states.",
    "referenceImage": "/images/references/q15_search.svg",
    "requirements": [
      "Debounce input by approximately 300ms.",
      "Show loading only while simulated search is pending.",
      "Distinguish no query from no matching results.",
      "Add clear-input button.",
      "Cancel/ignore stale requests when users type quickly."
    ],
    "constraints": [
      "Only latest query results appear.",
      "No unnecessary loading flicker.",
      "Old slow responses must never overwrite results for the latest query."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 22,
    "title": "SaaS Dashboard with Sidebar and Chart Area",
    "difficulty": "Medium",
    "category": "Dashboards & Responsive Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 15,
    "description": "Reproduce an analytics dashboard with collapsible sidebar, header date-range control, stat cards, and chart area.",
    "referenceImage": "/images/references/q22_dashboard.svg",
    "requirements": [
      "Collapse sidebar to icon-only mode.",
      "Persist collapsed state through simulated navigation.",
      "Convert sidebar to focus-trapped overlay drawer below tablet width.",
      "Resize chart correctly on sidebar collapse/expand.",
      "Date-range control updates chart data and stat values together."
    ],
    "constraints": [
      "No layout jumps or clipped chart canvas.",
      "Chart never mounts at zero width/height.",
      "Drawer closes on Escape and outside click."
    ],
    "maxPromptTurns": 20
  },
  {
    "id": 16,
    "title": "Keyboard-Accessible FAQ Accordion",
    "difficulty": "Easy",
    "category": "Accessibility & Component Design",
    "isOptimizationTrap": false,
    "avgAttempts": 5,
    "description": "Build an FAQ accordion with smooth expansion and keyboard accessibility.",
    "referenceImage": "/images/references/q16_faq.svg",
    "requirements": [
      "Use real buttons with aria-expanded and aria-controls.",
      "Support Enter/Space to toggle.",
      "Support Up/Down arrow navigation between headers.",
      "Use either single-open or multi-open behavior consistently.",
      "Animate expansion without abrupt display: none behavior."
    ],
    "constraints": [
      "ARIA state always matches visible state.",
      "Focus is never lost while opening or closing panels."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 27,
    "title": "Configurable Form-Builder Interface",
    "difficulty": "Hard",
    "category": "Dynamic Forms & Component Architecture",
    "isOptimizationTrap": false,
    "avgAttempts": 24,
    "description": "Build a form builder where users create, configure, reorder, delete, export, and preview form fields.",
    "referenceImage": "/images/references/q27_formbuilder.svg",
    "requirements": [
      "Support text, select, checkbox, and date fields.",
      "Add fields from palette to canvas.",
      "Configure label, required, placeholder, and field-specific options.",
      "Reorder via drag-and-drop or up/down actions.",
      "Confirm before deletion.",
      "Generate a live working Preview form entirely from configuration.",
      "Support serializable JSON export/import."
    ],
    "constraints": [
      "Validation is derived entirely from the field configuration.",
      "Preview order matches builder order.",
      "Exported config can recreate identical builder state."
    ],
    "maxPromptTurns": 30
  },
  {
    "id": 17,
    "title": "User Avatar Dropdown Menu",
    "difficulty": "Easy",
    "category": "Component Design & Accessibility",
    "isOptimizationTrap": false,
    "avgAttempts": 4,
    "description": "Build a top-right avatar dropdown containing Profile, Settings, divider, and Log out.",
    "referenceImage": "/images/references/q17_avatar.svg",
    "requirements": [
      "Use a button trigger with avatar and optional caret.",
      "Keep dropdown visible inside viewport near screen edges.",
      "Support Arrow-key navigation, Escape close, and focus return to trigger.",
      "Style Log out as a distinct destructive action.",
      "Close menu after selecting an item."
    ],
    "constraints": [
      "Use proper accessible menu pattern.",
      "Never render partially off screen."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 23,
    "title": "Debug and Fix a Broken Responsive Product Listing Page",
    "difficulty": "Medium",
    "category": "Debugging & Responsive Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 11,
    "description": "Diagnose and fix an intentionally broken product-grid page without a full rewrite.",
    "referenceImage": "/images/references/q23_debug.svg",
    "requirements": [
      "Fix distorted images.",
      "Fix overflowing cards at a tablet breakpoint.",
      "Fix uneven card heights.",
      "Fix truncated price/label text.",
      "Preserve existing card content, spacing, and hover behavior.",
      "Make targeted CSS/markup fixes only."
    ],
    "constraints": [
      "Grid works from 320px to 1920px.",
      "Explain root cause of every issue, not only the visual patch."
    ],
    "maxPromptTurns": 20
  },
  {
    "id": 18,
    "title": "Responsive Analytics Stat-Card Grid",
    "difficulty": "Easy",
    "category": "Dashboards & Responsive Layout",
    "isOptimizationTrap": false,
    "avgAttempts": 5,
    "description": "Recreate four analytics stat cards for Revenue, Users, Orders, and Conversion Rate.",
    "referenceImage": "/images/references/q18_stats.svg",
    "requirements": [
      "Four columns desktop, two columns tablet, one column mobile.",
      "Include value, label, and positive/negative trend.",
      "Use icon/sign plus color for trend direction.",
      "Format currency, commas, and percentages correctly."
    ],
    "constraints": [
      "No clipped text or overlapping cards.",
      "Long labels and large values do not break layout."
    ],
    "maxPromptTurns": 10
  },
  {
    "id": 28,
    "title": "Accessible Command Palette / Global Search",
    "difficulty": "Hard",
    "category": "Accessibility & Keyboard Navigation",
    "isOptimizationTrap": true,
    "avgAttempts": 18,
    "description": "Build a Cmd/Ctrl+K command palette with fuzzy search across pages, actions, and recent items.",
    "referenceImage": "/images/references/q28_command.svg",
    "requirements": [
      "Open globally with Cmd/Ctrl+K.",
      "Close with Escape and restore original focus.",
      "Group results into Pages, Actions, and Recent.",
      "Support fuzzy/substring filtering and ranking.",
      "Navigate results with Arrow keys and activate with Enter.",
      "Keep selected item scrolled into view.",
      "Trap focus while open.",
      "Announce result count and selected item to screen readers."
    ],
    "constraints": [
      "Entire flow works with keyboard only.",
      "Search stays responsive with a large mock item dataset.",
      "Avoid rerendering expensive grouped fuzzy results on every keystroke in a way that causes typing lag."
    ],
    "maxPromptTurns": 30
  },
  {
    "id": 29,
    "title": "Intersection of Two Arrays",
    "difficulty": "Easy",
    "category": "Sets",
    "isOptimizationTrap": false,
    "avgAttempts": 1.8,
    "description": "Given two integer arrays, return an array of their intersection. Each element in the result must be unique.",
    "referenceImage": "/images/references/q34_intersection.svg",
    "requirements": [
      "Return unique intersecting elements",
      "Order does not matter"
    ],
    "constraints": [
      "1 <= arr.length <= 1000",
      "0 <= arr[i] <= 1000"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 30,
    "title": "Merge Intervals",
    "difficulty": "Medium",
    "category": "Intervals",
    "isOptimizationTrap": false,
    "avgAttempts": 2.7,
    "description": "Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals.",
    "referenceImage": "/images/references/q39_intervals.svg",
    "requirements": [
      "Return the merged intervals",
      "Time complexity O(N log N)"
    ],
    "constraints": [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 31,
    "title": "Alien Dictionary",
    "difficulty": "Hard",
    "category": "Graphs",
    "isOptimizationTrap": true,
    "avgAttempts": 5.5,
    "description": "Given a list of words from an alien language dictionary, deduce the alphabetical order of its characters.",
    "referenceImage": "/images/references/q48_alien_dict.svg",
    "requirements": [
      "Return a string of the unique characters in order",
      "Topological sort"
    ],
    "constraints": [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 32,
    "title": "Binary Search Implementation",
    "difficulty": "Easy",
    "category": "Binary Search",
    "isOptimizationTrap": false,
    "avgAttempts": 1.4,
    "description": "Implement binary search to find the index of a target element in a sorted array.",
    "referenceImage": "/images/references/q35_binary_search.svg",
    "requirements": [
      "Return the index if target exists, else -1",
      "Time complexity O(log N)",
      "Space complexity O(1)"
    ],
    "constraints": [
      "1 <= arr.length <= 10^4",
      "Array is sorted in ascending order"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 33,
    "title": "Top K Frequent Elements",
    "difficulty": "Medium",
    "category": "Heaps",
    "isOptimizationTrap": true,
    "avgAttempts": 2.8,
    "description": "Given an integer array nums and an integer k, return the k most frequent elements.",
    "referenceImage": "/images/references/q42_top_k.svg",
    "requirements": [
      "Return an array of integers",
      "Time complexity better than O(N log N)"
    ],
    "constraints": [
      "1 <= nums.length <= 10^5",
      "1 <= k <= number of unique elements"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 34,
    "title": "Word Ladder",
    "difficulty": "Hard",
    "category": "Graphs",
    "isOptimizationTrap": true,
    "avgAttempts": 5.1,
    "description": "Find the length of the shortest transformation sequence from beginWord to endWord, such that only one letter can be changed at a time.",
    "referenceImage": "/images/references/q45_word_ladder.svg",
    "requirements": [
      "Return the length of the sequence",
      "Time complexity O(M^2 * N)",
      "Use BFS"
    ],
    "constraints": [
      "1 <= beginWord.length <= 10",
      "1 <= wordList.length <= 5000"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 35,
    "title": "Reverse a String",
    "difficulty": "Easy",
    "category": "Two Pointers",
    "isOptimizationTrap": false,
    "avgAttempts": 1.1,
    "description": "Write a function that reverses a string. The input string is given as an array of characters.",
    "referenceImage": "/images/references/q33_reverse_string.svg",
    "requirements": [
      "Modify the array in-place",
      "Time complexity O(N)",
      "Space complexity O(1)"
    ],
    "constraints": [
      "1 <= s.length <= 10^5"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 36,
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "category": "Hash Maps",
    "isOptimizationTrap": false,
    "avgAttempts": 2.2,
    "description": "Given an array of strings, group the anagrams together. You can return the answer in any order.",
    "referenceImage": "/images/references/q38_anagrams.svg",
    "requirements": [
      "Return a list of lists of strings",
      "Time complexity O(N * K log K) or O(N * K)"
    ],
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 37,
    "title": "Trapping Rain Water",
    "difficulty": "Hard",
    "category": "Two Pointers",
    "isOptimizationTrap": true,
    "avgAttempts": 4.5,
    "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap.",
    "referenceImage": "/images/references/q44_rain_water.svg",
    "requirements": [
      "Return the integer amount of trapped water",
      "Time complexity O(N)",
      "Space complexity O(1)"
    ],
    "constraints": [
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 38,
    "title": "First Unique Character",
    "difficulty": "Easy",
    "category": "Hash Maps",
    "isOptimizationTrap": false,
    "avgAttempts": 1.2,
    "description": "Find the first non-repeating character in a string and return its index. If it does not exist, return -1.",
    "referenceImage": "/images/references/q32_unique_char.svg",
    "requirements": [
      "Return the index of the character",
      "Time complexity O(N)",
      "Space complexity O(1) (26 alphabet chars)"
    ],
    "constraints": [
      "1 <= s.length <= 10^5",
      "String contains only lowercase English letters"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 39,
    "title": "Level Order Traversal",
    "difficulty": "Medium",
    "category": "Trees",
    "isOptimizationTrap": false,
    "avgAttempts": 2.1,
    "description": "Given the root of a binary tree, return the level order traversal of its nodes values.",
    "referenceImage": "/images/references/q40_tree_level.svg",
    "requirements": [
      "Return a list of lists representing levels",
      "Time complexity O(N)"
    ],
    "constraints": [
      "0 <= Number of nodes <= 2000"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 40,
    "title": "Largest Rectangle in Histogram",
    "difficulty": "Hard",
    "category": "Stacks",
    "isOptimizationTrap": true,
    "avgAttempts": 5.9,
    "description": "Given an array of integers heights representing the histograms bar height where the width of each bar is 1, return the area of the largest rectangle.",
    "referenceImage": "/images/references/q50_histogram.svg",
    "requirements": [
      "Return the integer area",
      "Time complexity O(N)",
      "Use a monotonic stack"
    ],
    "constraints": [
      "1 <= heights.length <= 10^5",
      "0 <= heights[i] <= 10^4"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 41,
    "title": "Valid Parenthesis Pairs",
    "difficulty": "Easy",
    "category": "Stacks",
    "isOptimizationTrap": false,
    "avgAttempts": 1.3,
    "description": "Determine if a string containing only parentheses is valid. Every open parenthesis must have a corresponding closing parenthesis.",
    "referenceImage": "/images/references/q30_parentheses.svg",
    "requirements": [
      "Return true if valid, false otherwise",
      "Time complexity O(N)",
      "Space complexity O(N)"
    ],
    "constraints": [
      "1 <= s.length <= 10^4",
      "String contains only ( and )"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 42,
    "title": "Subarray Sum Equals K",
    "difficulty": "Medium",
    "category": "Prefix Sums",
    "isOptimizationTrap": true,
    "avgAttempts": 3.1,
    "description": "Given an array of integers and an integer k, return the total number of subarrays whose sum equals to k.",
    "referenceImage": "/images/references/q37_prefix_sum.svg",
    "requirements": [
      "Return the integer count",
      "Time complexity O(N)",
      "Use a hash map to store prefix sums"
    ],
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-1000 <= nums[i] <= 1000"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 43,
    "title": "N-Queens",
    "difficulty": "Hard",
    "category": "Backtracking",
    "isOptimizationTrap": false,
    "avgAttempts": 4.8,
    "description": "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return all distinct solutions.",
    "referenceImage": "/images/references/q47_n_queens.svg",
    "requirements": [
      "Return a list of board configurations",
      "Time complexity O(N!)"
    ],
    "constraints": [
      "1 <= n <= 9"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 44,
    "title": "Merge Two Sorted Arrays",
    "difficulty": "Easy",
    "category": "Two Pointers",
    "isOptimizationTrap": false,
    "avgAttempts": 1.6,
    "description": "Merge two sorted integer arrays into a single sorted array. Do this in-place if possible, or return a new array.",
    "referenceImage": "/images/references/q31_merge_arrays.svg",
    "requirements": [
      "Return the merged sorted array",
      "Time complexity O(N+M)",
      "Space complexity O(1) extra space"
    ],
    "constraints": [
      "0 <= N, M <= 1000"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 45,
    "title": "Word Search",
    "difficulty": "Medium",
    "category": "Backtracking",
    "isOptimizationTrap": false,
    "avgAttempts": 3.4,
    "description": "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
    "referenceImage": "/images/references/q43_word_search.svg",
    "requirements": [
      "Return true or false",
      "Time complexity O(N * 3^L) where L is word length"
    ],
    "constraints": [
      "1 <= m, n <= 6",
      "1 <= word.length <= 15"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 46,
    "title": "Edit Distance",
    "difficulty": "Hard",
    "category": "Dynamic Programming",
    "isOptimizationTrap": false,
    "avgAttempts": 4.2,
    "description": "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
    "referenceImage": "/images/references/q49_edit_distance.svg",
    "requirements": [
      "Return the integer min operations",
      "Time complexity O(M * N)",
      "Space complexity O(M * N)"
    ],
    "constraints": [
      "0 <= word1.length, word2.length <= 500"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 47,
    "title": "Find the Missing Digit",
    "difficulty": "Easy",
    "category": "Arrays & Strings",
    "isOptimizationTrap": false,
    "avgAttempts": 1.5,
    "description": "Given a string representing a sequence of numbers from 1 to N, one digit is missing. Find the missing digit.",
    "referenceImage": "/images/references/q29_missing_digit.svg",
    "requirements": [
      "Return the missing digit as an integer",
      "Handle cases where the missing digit is 0",
      "Time complexity should be O(N)"
    ],
    "constraints": [
      "1 <= N <= 100",
      "String contains only digits"
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 48,
    "title": "Number of Islands",
    "difficulty": "Medium",
    "category": "Graphs",
    "isOptimizationTrap": false,
    "avgAttempts": 2.9,
    "description": "Given a 2D grid map of 1s (land) and 0s (water), count the number of islands. An island is surrounded by water.",
    "referenceImage": "/images/references/q41_islands.svg",
    "requirements": [
      "Return the integer count",
      "Time complexity O(M * N)"
    ],
    "constraints": [
      "1 <= m, n <= 300",
      "grid[i][j] is 0 or 1"
    ],
    "maxPromptTurns": 8
  },
  {
    "id": 49,
    "title": "Merge K Sorted Lists",
    "difficulty": "Hard",
    "category": "Heaps",
    "isOptimizationTrap": false,
    "avgAttempts": 3.9,
    "description": "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    "referenceImage": "/images/references/q46_merge_k.svg",
    "requirements": [
      "Return the head of the merged linked list",
      "Time complexity O(N log K)"
    ],
    "constraints": [
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500"
    ],
    "maxPromptTurns": 12
  },
  {
    "id": 50,
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "category": "Sliding Window",
    "isOptimizationTrap": true,
    "avgAttempts": 2.5,
    "description": "Given a string, find the length of the longest substring without repeating characters.",
    "referenceImage": "/images/references/q36_sliding_window.svg",
    "requirements": [
      "Return the integer length",
      "Time complexity O(N)",
      "Space complexity O(K) where K is alphabet size"
    ],
    "constraints": [
      "0 <= s.length <= 5 * 10^4"
    ],
    "maxPromptTurns": 8
  }
];

export default questions;
