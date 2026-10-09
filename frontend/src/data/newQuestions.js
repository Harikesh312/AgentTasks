// New questions for the 5 new question types
// These get appended to the existing questions array

const newQuestions = [
  // ═══════════════════════════════════════════
  // DEBUGGING QUESTIONS (10 total: 4 Easy, 4 Medium, 2 Hard)
  // ═══════════════════════════════════════════
  {
    "id": 51,
    "title": "Fix the Broken Counter",
    "difficulty": "Easy",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 1.5,
    "description": "This counter component has 4 bugs. The increment button doesn't work, the reset doesn't clear to 0, and the decrement goes below the minimum of 0. Use the AI agent to identify and fix all bugs.",
    "expectedBehavior": "Counter should start at 0, increment by 1, decrement by 1 (minimum 0), and reset to 0.",
    "buggyCode": {
      "counter.js": "function Counter() {\n  let count = 0;  // Bug 1: should use state management\n\n  const increment = () => {\n    count + 1;  // Bug 2: doesn't assign the result\n  };\n\n  const decrement = () => {\n    count--;  // Bug 3: no minimum check, can go negative\n  };\n\n  const reset = () => {\n    count = 1;  // Bug 4: resets to 1 instead of 0\n  };\n\n  function render() {\n    return `\n      <div class=\"counter\">\n        <h2>Count: ${count}</h2>\n        <button onclick=\"increment()\">+</button>\n        <button onclick=\"decrement()\">-</button>\n        <button onclick=\"reset()\">Reset</button>\n      </div>\n    `;\n  }\n\n  return { increment, decrement, reset, render };\n}"
    },
    "bugCount": 4,
    "bugDescriptions": [
      "Using plain variable instead of reactive state — changes won't trigger re-render",
      "increment uses 'count + 1' expression without assignment (should be 'count = count + 1' or 'count++')",
      "decrement has no minimum boundary check — count can go below 0",
      "reset sets count to 1 instead of 0"
    ],
    "requirements": [
      "Find and fix all 4 bugs in the counter",
      "Counter must start at 0",
      "Increment must increase count by 1",
      "Decrement must decrease count by 1 but never below 0",
      "Reset must set count back to 0"
    ],
    "constraints": [
      "You have up to 5 prompt turns",
      "Use the AI to identify and fix bugs"
    ],
    "testCases": [
      { "input": "increment()", "expectedOutput": "count === 1", "description": "Increment from 0 should give 1" },
      { "input": "decrement() from 0", "expectedOutput": "count === 0", "description": "Decrement from 0 should stay at 0" },
      { "input": "reset()", "expectedOutput": "count === 0", "description": "Reset should return count to 0" },
      { "input": "increment() x3 then decrement()", "expectedOutput": "count === 2", "description": "3 increments then 1 decrement = 2" }
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 52,
    "title": "Fix the Todo List",
    "difficulty": "Easy",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 1.8,
    "description": "This todo list has bugs: items can't be added when pressing Enter, completed items aren't visually marked, and delete removes the wrong item.",
    "expectedBehavior": "Todo items should be added on Enter key or button click, completed items should have strikethrough styling, and delete should remove the correct item.",
    "buggyCode": {
      "todo.js": "class TodoList {\n  constructor() {\n    this.todos = [];\n    this.nextId = 1;\n  }\n\n  addTodo(text) {\n    if (text === '') return;  // Bug 1: should trim and check\n    this.todos.push({ id: this.nextId, text: text, completed: false });\n    // Bug 2: forgot to increment nextId\n  }\n\n  toggleTodo(id) {\n    const todo = this.todos.find(t => t.id == id);\n    if (todo) {\n      todo.completed = !todo.completed;\n    }\n  }\n\n  deleteTodo(id) {\n    this.todos = this.todos.filter(t => t.id !== id);  // Bug 3: type mismatch, == vs ===\n  }\n\n  render() {\n    return this.todos.map(todo => {\n      const style = todo.completed ? 'text-decoration: line-through' : '';\n      return `<li style=\"${style}\">\n        <input type=\"checkbox\" ${todo.completed ? 'checked' : ''}\n               onchange=\"app.toggleTodo('${todo.id}')\">\n        <span>${todo.text}</span>\n        <button onclick=\"app.deleteTodo('${todo.id}')\">Delete</button>\n      </li>`;\n    }).join('');\n  }\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "addTodo doesn't trim whitespace before checking empty — '   ' is accepted as valid",
      "addTodo doesn't increment nextId — all items get id=1, causing toggle/delete issues",
      "deleteTodo uses strict equality (===) but id is passed as string from onclick — type mismatch"
    ],
    "requirements": [
      "Fix all 3 bugs",
      "Adding todos with only whitespace should be rejected",
      "Each todo must have a unique ID",
      "Delete must remove the correct todo item"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 53,
    "title": "Fix the Form Validator",
    "difficulty": "Easy",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 1.6,
    "description": "This form validator has bugs: email validation accepts invalid formats, password strength check is wrong, and the confirm password comparison doesn't work.",
    "expectedBehavior": "Email must contain @ and a domain with a dot. Password must be at least 8 characters. Confirm password must match password exactly.",
    "buggyCode": {
      "validator.js": "function validateForm(email, password, confirmPassword) {\n  const errors = [];\n\n  // Email validation\n  if (email.includes('@')) {  // Bug 1: too permissive — 'foo@' passes\n    // valid\n  } else {\n    errors.push('Invalid email address');\n  }\n\n  // Password validation\n  if (password.length > 8) {  // Bug 2: > instead of >= (8 char password rejected)\n    // valid\n  } else {\n    errors.push('Password must be at least 8 characters');\n  }\n\n  // Confirm password\n  if (password == confirmPassword) {  // Bug 3: loose equality, type coercion issues\n    // valid\n  } else {\n    errors.push('Passwords do not match');\n  }\n\n  return { isValid: errors.length === 0, errors };\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "Email validation only checks for '@' — should also require a domain with a dot after @",
      "Password length uses > instead of >= — a password of exactly 8 characters is incorrectly rejected",
      "Confirm password uses == (loose equality) instead of === — can cause subtle type coercion bugs"
    ],
    "requirements": [
      "Fix all 3 validation bugs",
      "Email must contain @ and a dot in the domain part",
      "Password must accept exactly 8 characters",
      "Use strict equality for password comparison"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 54,
    "title": "Fix the Image Carousel",
    "difficulty": "Easy",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 2.0,
    "description": "This image carousel has bugs: the next button skips past the last image, auto-play timer isn't cleared on manual navigation, and the dots indicator doesn't update.",
    "expectedBehavior": "Carousel should wrap around at the ends, auto-play should reset on manual navigation, and dot indicators should highlight the current slide.",
    "buggyCode": {
      "carousel.js": "class Carousel {\n  constructor(images) {\n    this.images = images;\n    this.currentIndex = 0;\n    this.timer = null;\n  }\n\n  next() {\n    this.currentIndex++;  // Bug 1: no wrap-around check\n    this.render();\n  }\n\n  prev() {\n    this.currentIndex--;\n    if (this.currentIndex < 0) {\n      this.currentIndex = this.images.length - 1;\n    }\n    this.render();\n  }\n\n  goTo(index) {\n    this.currentIndex = index;\n    // Bug 2: doesn't clear/reset auto-play timer\n    this.render();\n  }\n\n  startAutoPlay(interval = 3000) {\n    this.timer = setInterval(() => this.next(), interval);\n  }\n\n  stopAutoPlay() {\n    clearInterval(this.timer);\n  }\n\n  render() {\n    const dots = this.images.map((_, i) => {\n      const active = i === this.currentIndex ? 'active' : '';\n      return `<span class=\"dot ${active}\" onclick=\"carousel.goTo(${i})\"></span>`;\n    });\n    // Bug 3: dots are generated but never inserted into DOM\n    document.getElementById('carousel-image').src = this.images[this.currentIndex];\n  }\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "next() doesn't wrap around — currentIndex exceeds array bounds",
      "goTo() doesn't clear and restart the auto-play timer, causing timing desync",
      "render() generates dot HTML but never updates the DOM element with it"
    ],
    "requirements": [
      "Fix all 3 bugs",
      "Next should wrap to first image after last",
      "Manual navigation should reset auto-play timer",
      "Dot indicators must update in the DOM"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 55,
    "title": "Debug the API Data Fetcher",
    "difficulty": "Medium",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 2.8,
    "description": "A data fetcher has race conditions when rapid requests are made, missing error handling for network failures, and a memory leak from uncleared intervals.",
    "expectedBehavior": "Only the latest request's data should be displayed. Network errors should show a user-friendly message. Polling should be properly cleaned up.",
    "buggyCode": {
      "fetcher.js": "class DataFetcher {\n  constructor(url) {\n    this.url = url;\n    this.data = null;\n    this.loading = false;\n    this.error = null;\n    this.pollInterval = null;\n  }\n\n  async fetchData() {\n    this.loading = true;\n    this.error = null;\n    // Bug 1: No race condition handling — stale responses can overwrite fresh ones\n    const response = await fetch(this.url);\n    const data = await response.json();  // Bug 2: no error check on response.ok\n    this.data = data;\n    this.loading = false;\n    this.render();\n  }\n\n  startPolling(interval = 5000) {\n    this.fetchData();\n    this.pollInterval = setInterval(() => this.fetchData(), interval);\n  }\n\n  stopPolling() {\n    // Bug 3: doesn't actually clear the interval reference\n    clearInterval(this.pollInterval);\n  }\n\n  destroy() {\n    // Bug 4: doesn't call stopPolling — memory leak\n    this.data = null;\n  }\n\n  render() {\n    const container = document.getElementById('data-container');\n    if (this.loading) {\n      container.innerHTML = '<p>Loading...</p>';\n    } else if (this.error) {\n      container.innerHTML = `<p class=\"error\">${this.error}</p>`;\n    } else {\n      container.innerHTML = `<pre>${JSON.stringify(this.data, null, 2)}</pre>`;\n    }\n  }\n}"
    },
    "bugCount": 4,
    "bugDescriptions": [
      "Race condition: rapid fetchData() calls can result in stale responses overwriting newer data",
      "No error handling: doesn't check response.ok or catch network errors",
      "stopPolling doesn't null out the interval reference, allowing potential double-clears",
      "destroy() doesn't call stopPolling(), causing a memory leak from the running interval"
    ],
    "requirements": [
      "Fix all 4 bugs",
      "Implement request cancellation or sequencing to handle race conditions",
      "Add proper error handling for network failures",
      "Ensure polling is fully cleaned up on destroy"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 56,
    "title": "Debug the Shopping Cart",
    "difficulty": "Medium",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 3.0,
    "description": "The shopping cart has floating-point precision errors in price calculations, quantity update doesn't validate input, and the discount code logic applies discounts cumulatively instead of once.",
    "expectedBehavior": "Prices should be calculated accurately to 2 decimal places. Quantity must be a positive integer. Discount codes should apply only once per order.",
    "buggyCode": {
      "cart.js": "class ShoppingCart {\n  constructor() {\n    this.items = [];\n    this.discountApplied = false;\n    this.discountPercent = 0;\n  }\n\n  addItem(product, quantity = 1) {\n    const existing = this.items.find(i => i.product.id === product.id);\n    if (existing) {\n      existing.quantity += quantity;\n    } else {\n      this.items.push({ product, quantity });\n    }\n  }\n\n  updateQuantity(productId, quantity) {\n    // Bug 1: no validation — accepts 0, negative, or non-integer values\n    const item = this.items.find(i => i.product.id === productId);\n    if (item) {\n      item.quantity = quantity;\n    }\n  }\n\n  getSubtotal() {\n    // Bug 2: floating point — 0.1 + 0.2 !== 0.3\n    return this.items.reduce((sum, item) => {\n      return sum + (item.product.price * item.quantity);\n    }, 0);\n  }\n\n  applyDiscount(code) {\n    const discounts = { 'SAVE10': 10, 'SAVE20': 20, 'HALF': 50 };\n    if (discounts[code]) {\n      // Bug 3: doesn't check if discount already applied — stacks discounts\n      this.discountPercent += discounts[code];\n      this.discountApplied = true;\n    }\n  }\n\n  getTotal() {\n    const subtotal = this.getSubtotal();\n    const discount = subtotal * (this.discountPercent / 100);\n    const tax = (subtotal - discount) * 0.08;  // 8% tax\n    return subtotal - discount + tax;\n  }\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "updateQuantity accepts invalid values (0, negative, non-integer) — should validate and reject",
      "getSubtotal uses raw floating-point arithmetic — should round to 2 decimal places",
      "applyDiscount adds to discountPercent instead of replacing — allows stacking multiple discount codes"
    ],
    "requirements": [
      "Fix all 3 bugs",
      "Quantity must be a positive integer (>= 1)",
      "All monetary calculations rounded to 2 decimal places",
      "Only one discount code can be active at a time"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 57,
    "title": "Debug the Pagination Component",
    "difficulty": "Medium",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 2.5,
    "description": "The pagination component shows wrong page numbers, has an off-by-one error in data slicing, and the 'Go to page' input doesn't validate boundaries.",
    "expectedBehavior": "Page numbers should be correct, data should be sliced accurately for each page, and page input should be clamped to valid range.",
    "buggyCode": {
      "pagination.js": "class Pagination {\n  constructor(data, pageSize = 10) {\n    this.data = data;\n    this.pageSize = pageSize;\n    this.currentPage = 1;\n  }\n\n  get totalPages() {\n    return Math.floor(this.data.length / this.pageSize);  // Bug 1: should be ceil\n  }\n\n  getPageData() {\n    const start = this.currentPage * this.pageSize;  // Bug 2: off by one, should be (currentPage - 1)\n    const end = start + this.pageSize;\n    return this.data.slice(start, end);\n  }\n\n  goToPage(page) {\n    // Bug 3: no boundary validation\n    this.currentPage = page;\n    this.render();\n  }\n\n  nextPage() {\n    if (this.currentPage < this.totalPages) {\n      this.currentPage++;\n      this.render();\n    }\n  }\n\n  prevPage() {\n    if (this.currentPage > 1) {\n      this.currentPage--;\n      this.render();\n    }\n  }\n\n  render() {\n    // render implementation\n  }\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "totalPages uses Math.floor — should be Math.ceil to account for partial last page",
      "getPageData calculates start as currentPage * pageSize — should be (currentPage - 1) * pageSize",
      "goToPage doesn't clamp the page number to [1, totalPages] range"
    ],
    "requirements": [
      "Fix all 3 bugs",
      "Total pages should correctly account for partial last pages",
      "First page should show the first pageSize items",
      "goToPage should clamp to valid range [1, totalPages]"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 58,
    "title": "Debug the Event Emitter",
    "difficulty": "Medium",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 3.2,
    "description": "This custom event emitter has bugs: 'once' listeners fire multiple times, 'off' removes all listeners instead of just the specified one, and emitting with arguments doesn't pass them correctly.",
    "expectedBehavior": "once() should fire exactly once then auto-remove. off() should only remove the specified listener. emit() should pass all arguments to listeners.",
    "buggyCode": {
      "emitter.js": "class EventEmitter {\n  constructor() {\n    this.listeners = {};\n  }\n\n  on(event, callback) {\n    if (!this.listeners[event]) {\n      this.listeners[event] = [];\n    }\n    this.listeners[event].push(callback);\n    return this;\n  }\n\n  once(event, callback) {\n    // Bug 1: wrapper doesn't remove itself after firing\n    const wrapper = (...args) => {\n      callback(...args);\n    };\n    this.on(event, wrapper);\n    return this;\n  }\n\n  off(event, callback) {\n    if (this.listeners[event]) {\n      // Bug 2: removes ALL listeners for the event, not just the specified one\n      this.listeners[event] = [];\n    }\n    return this;\n  }\n\n  emit(event, ...args) {\n    if (this.listeners[event]) {\n      this.listeners[event].forEach(cb => {\n        cb(event);  // Bug 3: passes event name instead of args\n      });\n    }\n    return this;\n  }\n}"
    },
    "bugCount": 3,
    "bugDescriptions": [
      "once() wrapper doesn't call off() after firing — listener fires on every emit",
      "off() clears all listeners for the event instead of filtering out just the specified callback",
      "emit() passes the event name to callbacks instead of spreading the arguments"
    ],
    "requirements": [
      "Fix all 3 bugs",
      "once() must auto-remove after first invocation",
      "off() must only remove the specific callback passed",
      "emit() must forward all arguments to listener callbacks"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 59,
    "title": "Fix the Real-Time Chat System",
    "difficulty": "Hard",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 4.5,
    "description": "A WebSocket-based chat system has message ordering bugs, reconnection failures, XSS vulnerabilities, and a memory leak in the message history. Fix all issues systematically.",
    "expectedBehavior": "Messages should appear in order, reconnection should work with exponential backoff, user input should be sanitized, and old messages should be pruned.",
    "buggyCode": {
      "chat.js": "class ChatClient {\n  constructor(wsUrl) {\n    this.wsUrl = wsUrl;\n    this.ws = null;\n    this.messages = [];\n    this.messageQueue = [];\n    this.reconnectAttempts = 0;\n  }\n\n  connect() {\n    this.ws = new WebSocket(this.wsUrl);\n\n    this.ws.onopen = () => {\n      this.reconnectAttempts = 0;\n      // Bug 1: doesn't flush queued messages on reconnect\n    };\n\n    this.ws.onmessage = (event) => {\n      const msg = JSON.parse(event.data);\n      this.messages.push(msg);  // Bug 2: no ordering — late messages appear at end\n      this.renderMessage(msg);\n    };\n\n    this.ws.onclose = () => {\n      // Bug 3: fixed retry delay, no exponential backoff, no max retries\n      setTimeout(() => this.connect(), 1000);\n    };\n  }\n\n  send(text) {\n    const msg = {\n      id: Date.now(),\n      text: text,  // Bug 4: XSS — user input not sanitized\n      timestamp: new Date().toISOString()\n    };\n\n    if (this.ws.readyState === WebSocket.OPEN) {\n      this.ws.send(JSON.stringify(msg));\n    } else {\n      this.messageQueue.push(msg);\n    }\n  }\n\n  renderMessage(msg) {\n    const container = document.getElementById('chat-messages');\n    // Bug 5: innerHTML += is slow and loses event listeners\n    container.innerHTML += `<div class=\"message\">\n      <span class=\"time\">${msg.timestamp}</span>\n      <p>${msg.text}</p>\n    </div>`;\n    // Bug 6: no message history limit — memory leak\n  }\n}"
    },
    "bugCount": 6,
    "bugDescriptions": [
      "onopen doesn't flush the messageQueue — queued messages are lost on reconnect",
      "Messages are appended without checking timestamp order — late-arriving messages appear out of order",
      "Reconnection uses fixed 1s delay with no backoff or maximum retry limit",
      "User text is inserted into HTML without sanitization — XSS vulnerability",
      "innerHTML += rebuilds entire DOM and loses event listeners on existing messages",
      "No limit on messages array — unbounded memory growth over time"
    ],
    "requirements": [
      "Fix all 6 bugs",
      "Queued messages must be sent on reconnect",
      "Messages must be displayed in timestamp order",
      "Reconnection must use exponential backoff with max retries",
      "User input must be sanitized against XSS",
      "Message history must be bounded (e.g., max 500 messages)"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },
  {
    "id": 60,
    "title": "Fix the State Management Store",
    "difficulty": "Hard",
    "category": "Debugging",
    "type": "debugging",
    "isOptimizationTrap": false,
    "avgAttempts": 4.0,
    "description": "A Redux-like state management store has critical bugs: middleware runs in wrong order, subscribers are notified before state updates, time-travel debugging is broken, and nested state mutations aren't detected.",
    "expectedBehavior": "Middleware should run in order, subscribers see the new state, time-travel should restore exact snapshots, and deep changes should trigger updates.",
    "buggyCode": {
      "store.js": "class Store {\n  constructor(reducer, initialState = {}) {\n    this.reducer = reducer;\n    this.state = initialState;\n    this.subscribers = [];\n    this.middleware = [];\n    this.history = [];\n    this.historyIndex = -1;\n  }\n\n  getState() {\n    return this.state;  // Bug 1: returns mutable reference\n  }\n\n  dispatch(action) {\n    // Bug 2: middleware runs after state update instead of before\n    this.state = this.reducer(this.state, action);\n    this.middleware.forEach(mw => mw(action, this.state));\n\n    // Bug 3: notifies subscribers before pushing to history\n    this.subscribers.forEach(fn => fn(this.state));\n    this.history.push(this.state);  // Bug 4: pushes reference, not a copy\n    this.historyIndex = this.history.length - 1;\n  }\n\n  subscribe(fn) {\n    this.subscribers.push(fn);\n    // Bug 5: returns wrong unsubscribe — removes last subscriber, not this one\n    return () => this.subscribers.pop();\n  }\n\n  use(middlewareFn) {\n    this.middleware.push(middlewareFn);\n  }\n\n  undo() {\n    if (this.historyIndex > 0) {\n      this.historyIndex--;\n      this.state = this.history[this.historyIndex];\n      this.subscribers.forEach(fn => fn(this.state));\n    }\n  }\n\n  redo() {\n    if (this.historyIndex < this.history.length - 1) {\n      this.historyIndex++;\n      this.state = this.history[this.historyIndex];\n      this.subscribers.forEach(fn => fn(this.state));\n    }\n  }\n}"
    },
    "bugCount": 5,
    "bugDescriptions": [
      "getState() returns a direct mutable reference to state — external code can mutate store state",
      "Middleware runs after the reducer instead of before, preventing middleware from intercepting/transforming actions",
      "Subscribers are notified before the state snapshot is pushed to history, causing inconsistency",
      "history.push(this.state) pushes a reference, not a deep copy — undo/redo all point to same object",
      "subscribe() returns a function that pops the last subscriber instead of removing the specific one"
    ],
    "requirements": [
      "Fix all 5 bugs",
      "getState must return an immutable copy",
      "Middleware must run before the reducer processes the action",
      "History must store deep copies for proper time-travel",
      "Unsubscribe must remove only the specific subscriber"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },

  // ═══════════════════════════════════════════
  // TESTING QUESTIONS (8 total: 3 Easy, 3 Medium, 2 Hard)
  // ═══════════════════════════════════════════
  {
    "id": 61,
    "title": "Test the Email Validator",
    "difficulty": "Easy",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 1.8,
    "description": "Write comprehensive tests for an email validation function. Your tests must pass on the correct implementation and catch all 5 intentionally broken 'mutant' implementations.",
    "functionCode": "function validateEmail(email) {\n  if (typeof email !== 'string') return false;\n  const trimmed = email.trim();\n  if (trimmed.length === 0) return false;\n  const parts = trimmed.split('@');\n  if (parts.length !== 2) return false;\n  const [local, domain] = parts;\n  if (local.length === 0 || local.length > 64) return false;\n  if (domain.length === 0 || domain.length > 255) return false;\n  if (!domain.includes('.')) return false;\n  if (trimmed.includes(' ')) return false;\n  return true;\n}",
    "functionSpec": "validateEmail(email) → boolean\n\nRules:\n- Must have exactly one @\n- Domain must contain at least one dot\n- No spaces allowed\n- Local part: 1-64 characters\n- Domain: 1-255 characters\n- Non-string inputs return false",
    "correctImplementation": "function validateEmail(email) {\n  if (typeof email !== 'string') return false;\n  const trimmed = email.trim();\n  if (trimmed.length === 0) return false;\n  const parts = trimmed.split('@');\n  if (parts.length !== 2) return false;\n  const [local, domain] = parts;\n  if (local.length === 0 || local.length > 64) return false;\n  if (domain.length === 0 || domain.length > 255) return false;\n  if (!domain.includes('.')) return false;\n  if (trimmed.includes(' ')) return false;\n  return true;\n}",
    "mutantImplementations": [
      "function validateEmail(email) { if (typeof email !== 'string') return false; return email.includes('@'); }",
      "function validateEmail(email) { if (typeof email !== 'string') return false; const parts = email.split('@'); if (parts.length !== 2) return false; return true; }",
      "function validateEmail(email) { if (typeof email !== 'string') return false; const parts = email.trim().split('@'); if (parts.length !== 2) return false; const [local, domain] = parts; if (!domain.includes('.')) return false; return true; }",
      "function validateEmail(email) { if (typeof email !== 'string') return false; const parts = email.trim().split('@'); if (parts.length !== 2) return false; const [local, domain] = parts; if (local.length === 0 || local.length > 64) return false; if (!domain.includes('.')) return false; return true; }",
      "function validateEmail(email) { return typeof email === 'string' && /^[^@]+@[^@]+$/.test(email); }"
    ],
    "requirements": [
      "Write tests covering valid emails, invalid emails, and edge cases",
      "Tests must pass on the correct implementation",
      "Tests must catch all 5 mutant implementations",
      "Include boundary value tests (empty strings, max lengths)"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 62,
    "title": "Test the Stack Implementation",
    "difficulty": "Easy",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 1.5,
    "description": "Write comprehensive tests for a Stack data structure. Cover push, pop, peek, isEmpty, size, and error cases.",
    "functionCode": "class Stack {\n  constructor(maxSize = Infinity) {\n    this.items = [];\n    this.maxSize = maxSize;\n  }\n  push(item) {\n    if (this.items.length >= this.maxSize) throw new Error('Stack overflow');\n    this.items.push(item);\n    return this.size();\n  }\n  pop() {\n    if (this.isEmpty()) throw new Error('Stack underflow');\n    return this.items.pop();\n  }\n  peek() {\n    if (this.isEmpty()) return undefined;\n    return this.items[this.items.length - 1];\n  }\n  isEmpty() { return this.items.length === 0; }\n  size() { return this.items.length; }\n  clear() { this.items = []; }\n}",
    "functionSpec": "Stack class with methods:\n- push(item): adds item, returns new size, throws 'Stack overflow' if full\n- pop(): removes and returns top item, throws 'Stack underflow' if empty\n- peek(): returns top item without removing (undefined if empty)\n- isEmpty(): returns boolean\n- size(): returns number of items\n- clear(): removes all items\n- constructor(maxSize): optional max capacity",
    "correctImplementation": "class Stack {\n  constructor(maxSize = Infinity) {\n    this.items = [];\n    this.maxSize = maxSize;\n  }\n  push(item) {\n    if (this.items.length >= this.maxSize) throw new Error('Stack overflow');\n    this.items.push(item);\n    return this.size();\n  }\n  pop() {\n    if (this.isEmpty()) throw new Error('Stack underflow');\n    return this.items.pop();\n  }\n  peek() {\n    if (this.isEmpty()) return undefined;\n    return this.items[this.items.length - 1];\n  }\n  isEmpty() { return this.items.length === 0; }\n  size() { return this.items.length; }\n  clear() { this.items = []; }\n}",
    "mutantImplementations": [
      "class Stack { constructor() { this.items = []; } push(item) { this.items.push(item); return this.items.length; } pop() { return this.items.pop(); } peek() { return this.items[this.items.length - 1]; } isEmpty() { return this.items.length === 0; } size() { return this.items.length; } clear() { this.items = []; } }",
      "class Stack { constructor(maxSize = Infinity) { this.items = []; this.maxSize = maxSize; } push(item) { if (this.items.length >= this.maxSize) throw new Error('Stack overflow'); this.items.unshift(item); return this.size(); } pop() { if (this.isEmpty()) throw new Error('Stack underflow'); return this.items.shift(); } peek() { if (this.isEmpty()) return undefined; return this.items[0]; } isEmpty() { return this.items.length === 0; } size() { return this.items.length; } clear() { this.items = []; } }",
      "class Stack { constructor(maxSize = Infinity) { this.items = []; this.maxSize = maxSize; } push(item) { if (this.items.length > this.maxSize) throw new Error('Stack overflow'); this.items.push(item); return this.size(); } pop() { if (this.isEmpty()) throw new Error('Stack underflow'); return this.items.pop(); } peek() { if (this.isEmpty()) return undefined; return this.items[this.items.length - 1]; } isEmpty() { return this.items.length === 0; } size() { return this.items.length; } clear() { this.items = []; } }"
    ],
    "requirements": [
      "Test all methods: push, pop, peek, isEmpty, size, clear",
      "Test error cases: overflow and underflow",
      "Test LIFO ordering",
      "Catch all 3 mutant implementations"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 63,
    "title": "Test the String Utilities",
    "difficulty": "Easy",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 1.6,
    "description": "Write comprehensive tests for a set of string utility functions: capitalize, truncate, slugify, and countWords.",
    "functionCode": "const StringUtils = {\n  capitalize(str) {\n    if (typeof str !== 'string' || str.length === 0) return '';\n    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();\n  },\n  truncate(str, maxLength, suffix = '...') {\n    if (typeof str !== 'string') return '';\n    if (str.length <= maxLength) return str;\n    return str.slice(0, maxLength - suffix.length) + suffix;\n  },\n  slugify(str) {\n    if (typeof str !== 'string') return '';\n    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');\n  },\n  countWords(str) {\n    if (typeof str !== 'string' || str.trim().length === 0) return 0;\n    return str.trim().split(/\\s+/).length;\n  }\n};",
    "functionSpec": "StringUtils object with:\n- capitalize(str): first letter uppercase, rest lowercase. Empty/non-string → ''\n- truncate(str, maxLength, suffix='...'): cuts string at maxLength including suffix length\n- slugify(str): lowercase, replace non-alphanumeric with hyphens, trim hyphens\n- countWords(str): count words separated by whitespace. Empty/non-string → 0",
    "correctImplementation": "const StringUtils = {\n  capitalize(str) {\n    if (typeof str !== 'string' || str.length === 0) return '';\n    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();\n  },\n  truncate(str, maxLength, suffix = '...') {\n    if (typeof str !== 'string') return '';\n    if (str.length <= maxLength) return str;\n    return str.slice(0, maxLength - suffix.length) + suffix;\n  },\n  slugify(str) {\n    if (typeof str !== 'string') return '';\n    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');\n  },\n  countWords(str) {\n    if (typeof str !== 'string' || str.trim().length === 0) return 0;\n    return str.trim().split(/\\s+/).length;\n  }\n};",
    "mutantImplementations": [
      "const StringUtils = { capitalize(str) { if (typeof str !== 'string' || str.length === 0) return ''; return str.charAt(0).toUpperCase() + str.slice(1); }, truncate(str, maxLength, suffix = '...') { if (typeof str !== 'string') return ''; if (str.length <= maxLength) return str; return str.slice(0, maxLength) + suffix; }, slugify(str) { if (typeof str !== 'string') return ''; return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'); }, countWords(str) { if (typeof str !== 'string' || str.trim().length === 0) return 0; return str.split(' ').length; } };",
      "const StringUtils = { capitalize(str) { if (typeof str !== 'string' || str.length === 0) return ''; return str.toUpperCase(); }, truncate(str, maxLength, suffix = '...') { if (typeof str !== 'string') return ''; if (str.length <= maxLength) return str; return str.slice(0, maxLength - suffix.length) + suffix; }, slugify(str) { if (typeof str !== 'string') return ''; return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }, countWords(str) { if (typeof str !== 'string' || str.trim().length === 0) return 0; return str.trim().split(/\\s+/).length; } };"
    ],
    "requirements": [
      "Test all 4 functions with valid inputs",
      "Test edge cases: empty strings, non-string inputs, special characters",
      "Catch all mutant implementations"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 64,
    "title": "Test the Shopping Cart",
    "difficulty": "Medium",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 2.8,
    "description": "Write comprehensive tests for a shopping cart system with addToCart, removeFromCart, calculateTotal, discount codes, and tax calculations. Your tests must catch subtle mutant bugs.",
    "functionCode": "class Cart {\n  constructor(taxRate = 0.08) {\n    this.items = new Map();\n    this.taxRate = taxRate;\n    this.discount = 0;\n  }\n  addItem(id, name, price, qty = 1) {\n    if (qty <= 0 || price < 0) throw new Error('Invalid input');\n    if (this.items.has(id)) {\n      const item = this.items.get(id);\n      item.qty += qty;\n    } else {\n      this.items.set(id, { id, name, price, qty });\n    }\n  }\n  removeItem(id) {\n    if (!this.items.has(id)) throw new Error('Item not found');\n    this.items.delete(id);\n  }\n  updateQty(id, qty) {\n    if (!this.items.has(id)) throw new Error('Item not found');\n    if (qty <= 0) { this.removeItem(id); return; }\n    this.items.get(id).qty = qty;\n  }\n  applyDiscount(percent) {\n    if (percent < 0 || percent > 100) throw new Error('Invalid discount');\n    this.discount = percent;\n  }\n  getSubtotal() {\n    let total = 0;\n    for (const item of this.items.values()) {\n      total += Math.round(item.price * item.qty * 100) / 100;\n    }\n    return Math.round(total * 100) / 100;\n  }\n  getTotal() {\n    const subtotal = this.getSubtotal();\n    const discounted = subtotal * (1 - this.discount / 100);\n    const withTax = discounted * (1 + this.taxRate);\n    return Math.round(withTax * 100) / 100;\n  }\n  getItemCount() {\n    let count = 0;\n    for (const item of this.items.values()) count += item.qty;\n    return count;\n  }\n}",
    "functionSpec": "Cart class:\n- addItem(id, name, price, qty=1): adds or increments. Throws if qty<=0 or price<0\n- removeItem(id): removes item. Throws if not found\n- updateQty(id, qty): updates quantity. If qty<=0, removes item. Throws if not found\n- applyDiscount(percent): sets discount 0-100. Throws if out of range\n- getSubtotal(): sum of price*qty, rounded to 2 decimal places\n- getTotal(): subtotal after discount, plus tax, rounded to 2 decimal places\n- getItemCount(): total quantity of all items",
    "correctImplementation": "class Cart {\n  constructor(taxRate = 0.08) {\n    this.items = new Map();\n    this.taxRate = taxRate;\n    this.discount = 0;\n  }\n  addItem(id, name, price, qty = 1) {\n    if (qty <= 0 || price < 0) throw new Error('Invalid input');\n    if (this.items.has(id)) {\n      const item = this.items.get(id);\n      item.qty += qty;\n    } else {\n      this.items.set(id, { id, name, price, qty });\n    }\n  }\n  removeItem(id) {\n    if (!this.items.has(id)) throw new Error('Item not found');\n    this.items.delete(id);\n  }\n  updateQty(id, qty) {\n    if (!this.items.has(id)) throw new Error('Item not found');\n    if (qty <= 0) { this.removeItem(id); return; }\n    this.items.get(id).qty = qty;\n  }\n  applyDiscount(percent) {\n    if (percent < 0 || percent > 100) throw new Error('Invalid discount');\n    this.discount = percent;\n  }\n  getSubtotal() {\n    let total = 0;\n    for (const item of this.items.values()) {\n      total += Math.round(item.price * item.qty * 100) / 100;\n    }\n    return Math.round(total * 100) / 100;\n  }\n  getTotal() {\n    const subtotal = this.getSubtotal();\n    const discounted = subtotal * (1 - this.discount / 100);\n    const withTax = discounted * (1 + this.taxRate);\n    return Math.round(withTax * 100) / 100;\n  }\n  getItemCount() {\n    let count = 0;\n    for (const item of this.items.values()) count += item.qty;\n    return count;\n  }\n}",
    "mutantImplementations": [
      "class Cart { constructor(taxRate = 0.08) { this.items = new Map(); this.taxRate = taxRate; this.discount = 0; } addItem(id, name, price, qty = 1) { this.items.set(id, { id, name, price, qty }); } removeItem(id) { this.items.delete(id); } updateQty(id, qty) { if (this.items.has(id)) this.items.get(id).qty = qty; } applyDiscount(percent) { this.discount = percent; } getSubtotal() { let total = 0; for (const item of this.items.values()) total += item.price * item.qty; return total; } getTotal() { const subtotal = this.getSubtotal(); return subtotal * (1 - this.discount / 100) * (1 + this.taxRate); } getItemCount() { return this.items.size; } }",
      "class Cart { constructor(taxRate = 0.08) { this.items = new Map(); this.taxRate = taxRate; this.discount = 0; } addItem(id, name, price, qty = 1) { if (qty <= 0 || price < 0) throw new Error('Invalid input'); if (this.items.has(id)) { const item = this.items.get(id); item.qty += qty; } else { this.items.set(id, { id, name, price, qty }); } } removeItem(id) { if (!this.items.has(id)) throw new Error('Item not found'); this.items.delete(id); } updateQty(id, qty) { if (!this.items.has(id)) throw new Error('Item not found'); this.items.get(id).qty = qty; } applyDiscount(percent) { if (percent < 0 || percent > 100) throw new Error('Invalid discount'); this.discount = percent; } getSubtotal() { let total = 0; for (const item of this.items.values()) { total += item.price * item.qty; } return Math.round(total * 100) / 100; } getTotal() { const subtotal = this.getSubtotal(); const discounted = subtotal * (1 - this.discount / 100); const withTax = discounted * (1 + this.taxRate); return Math.round(withTax * 100) / 100; } getItemCount() { let count = 0; for (const item of this.items.values()) count += item.qty; return count; } }"
    ],
    "requirements": [
      "Test all methods including error cases",
      "Test adding same item multiple times increments quantity",
      "Test discount and tax calculations with floating point precision",
      "Test boundary values (0 quantity, 100% discount, negative price)"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 65,
    "title": "Test the Promise Queue",
    "difficulty": "Medium",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 3.0,
    "description": "Write tests for a concurrent promise queue that limits the number of simultaneously running async tasks. Test concurrency limits, error handling, and ordering.",
    "functionCode": "class PromiseQueue {\n  constructor(concurrency = 1) {\n    this.concurrency = concurrency;\n    this.running = 0;\n    this.queue = [];\n    this.results = [];\n  }\n  add(taskFn) {\n    return new Promise((resolve, reject) => {\n      this.queue.push({ taskFn, resolve, reject });\n      this._process();\n    });\n  }\n  _process() {\n    while (this.running < this.concurrency && this.queue.length > 0) {\n      const { taskFn, resolve, reject } = this.queue.shift();\n      this.running++;\n      taskFn()\n        .then(result => {\n          this.results.push(result);\n          resolve(result);\n        })\n        .catch(err => reject(err))\n        .finally(() => {\n          this.running--;\n          this._process();\n        });\n    }\n  }\n  async waitAll() {\n    while (this.running > 0 || this.queue.length > 0) {\n      await new Promise(r => setTimeout(r, 10));\n    }\n    return this.results;\n  }\n}",
    "functionSpec": "PromiseQueue class:\n- constructor(concurrency): max simultaneous tasks\n- add(taskFn): enqueue an async task, returns promise that resolves with task result\n- waitAll(): waits for all tasks to complete, returns array of results\n- Never runs more than `concurrency` tasks at the same time\n- Tasks run in FIFO order\n- Individual task errors should reject the add() promise but not stop the queue",
    "correctImplementation": "class PromiseQueue {\n  constructor(concurrency = 1) {\n    this.concurrency = concurrency;\n    this.running = 0;\n    this.queue = [];\n    this.results = [];\n  }\n  add(taskFn) {\n    return new Promise((resolve, reject) => {\n      this.queue.push({ taskFn, resolve, reject });\n      this._process();\n    });\n  }\n  _process() {\n    while (this.running < this.concurrency && this.queue.length > 0) {\n      const { taskFn, resolve, reject } = this.queue.shift();\n      this.running++;\n      taskFn()\n        .then(result => {\n          this.results.push(result);\n          resolve(result);\n        })\n        .catch(err => reject(err))\n        .finally(() => {\n          this.running--;\n          this._process();\n        });\n    }\n  }\n  async waitAll() {\n    while (this.running > 0 || this.queue.length > 0) {\n      await new Promise(r => setTimeout(r, 10));\n    }\n    return this.results;\n  }\n}",
    "mutantImplementations": [
      "class PromiseQueue { constructor(concurrency = 1) { this.concurrency = concurrency; this.running = 0; this.queue = []; this.results = []; } add(taskFn) { return new Promise((resolve, reject) => { this.queue.push({ taskFn, resolve, reject }); this._process(); }); } _process() { if (this.running < this.concurrency && this.queue.length > 0) { const { taskFn, resolve, reject } = this.queue.shift(); this.running++; taskFn().then(result => { this.results.push(result); resolve(result); }).catch(err => reject(err)).finally(() => { this.running--; this._process(); }); } } async waitAll() { while (this.running > 0 || this.queue.length > 0) { await new Promise(r => setTimeout(r, 10)); } return this.results; } }",
      "class PromiseQueue { constructor(concurrency = 1) { this.concurrency = concurrency; this.running = 0; this.queue = []; this.results = []; } add(taskFn) { return new Promise((resolve, reject) => { this.queue.push({ taskFn, resolve, reject }); this._process(); }); } _process() { while (this.running < this.concurrency && this.queue.length > 0) { const { taskFn, resolve, reject } = this.queue.shift(); this.running++; taskFn().then(result => { this.results.push(result); resolve(result); }).catch(err => { this.running = 0; this.queue = []; reject(err); }).finally(() => { this.running--; this._process(); }); } } async waitAll() { while (this.running > 0 || this.queue.length > 0) { await new Promise(r => setTimeout(r, 10)); } return this.results; } }"
    ],
    "requirements": [
      "Test that concurrency limit is respected",
      "Test that tasks run in FIFO order",
      "Test that individual task failures don't stop the queue",
      "Test waitAll() returns all results"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 66,
    "title": "Test the LRU Cache",
    "difficulty": "Medium",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 2.5,
    "description": "Write tests for an LRU (Least Recently Used) cache implementation. Test capacity limits, eviction policy, and get/put operations.",
    "functionCode": "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n  size() { return this.cache.size; }\n}",
    "functionSpec": "LRUCache class:\n- constructor(capacity): max number of entries\n- get(key): returns value or -1. Marks as recently used\n- put(key, value): inserts/updates. If over capacity, evicts least recently used\n- size(): returns current number of entries\n- Most recently accessed items survive eviction",
    "correctImplementation": "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n  size() { return this.cache.size; }\n}",
    "mutantImplementations": [
      "class LRUCache { constructor(capacity) { this.capacity = capacity; this.cache = new Map(); } get(key) { if (!this.cache.has(key)) return -1; return this.cache.get(key); } put(key, value) { this.cache.set(key, value); if (this.cache.size > this.capacity) { const firstKey = this.cache.keys().next().value; this.cache.delete(firstKey); } } size() { return this.cache.size; } }",
      "class LRUCache { constructor(capacity) { this.capacity = capacity; this.cache = new Map(); } get(key) { if (!this.cache.has(key)) return -1; const value = this.cache.get(key); this.cache.delete(key); this.cache.set(key, value); return value; } put(key, value) { if (this.cache.has(key)) this.cache.delete(key); this.cache.set(key, value); if (this.cache.size >= this.capacity) { const firstKey = this.cache.keys().next().value; this.cache.delete(firstKey); } } size() { return this.cache.size; } }"
    ],
    "requirements": [
      "Test basic get/put operations",
      "Test eviction happens when capacity is exceeded",
      "Test that get() refreshes item's position",
      "Test that the LEAST recently used item is evicted"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 67,
    "title": "Test the Rate Limiter",
    "difficulty": "Hard",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 4.0,
    "description": "Write tests for a token-bucket rate limiter covering burst handling, refill timing, concurrent requests, and edge cases. This requires testing time-dependent behavior.",
    "functionCode": "class RateLimiter {\n  constructor(maxTokens, refillRate, refillInterval = 1000) {\n    this.maxTokens = maxTokens;\n    this.tokens = maxTokens;\n    this.refillRate = refillRate;\n    this.refillInterval = refillInterval;\n    this.lastRefill = Date.now();\n  }\n  _refill() {\n    const now = Date.now();\n    const elapsed = now - this.lastRefill;\n    const intervals = Math.floor(elapsed / this.refillInterval);\n    if (intervals > 0) {\n      this.tokens = Math.min(this.maxTokens, this.tokens + intervals * this.refillRate);\n      this.lastRefill = now;\n    }\n  }\n  tryAcquire(tokens = 1) {\n    this._refill();\n    if (this.tokens >= tokens) {\n      this.tokens -= tokens;\n      return true;\n    }\n    return false;\n  }\n  getTokens() {\n    this._refill();\n    return this.tokens;\n  }\n  reset() {\n    this.tokens = this.maxTokens;\n    this.lastRefill = Date.now();\n  }\n}",
    "functionSpec": "RateLimiter (Token Bucket):\n- constructor(maxTokens, refillRate, refillInterval=1000ms)\n- tryAcquire(tokens=1): consume tokens, return true if available, false if not\n- getTokens(): return current token count (after refill)\n- reset(): restore to full capacity\n- Tokens refill at refillRate per refillInterval\n- Never exceeds maxTokens",
    "correctImplementation": "class RateLimiter {\n  constructor(maxTokens, refillRate, refillInterval = 1000) {\n    this.maxTokens = maxTokens;\n    this.tokens = maxTokens;\n    this.refillRate = refillRate;\n    this.refillInterval = refillInterval;\n    this.lastRefill = Date.now();\n  }\n  _refill() {\n    const now = Date.now();\n    const elapsed = now - this.lastRefill;\n    const intervals = Math.floor(elapsed / this.refillInterval);\n    if (intervals > 0) {\n      this.tokens = Math.min(this.maxTokens, this.tokens + intervals * this.refillRate);\n      this.lastRefill = now;\n    }\n  }\n  tryAcquire(tokens = 1) {\n    this._refill();\n    if (this.tokens >= tokens) {\n      this.tokens -= tokens;\n      return true;\n    }\n    return false;\n  }\n  getTokens() {\n    this._refill();\n    return this.tokens;\n  }\n  reset() {\n    this.tokens = this.maxTokens;\n    this.lastRefill = Date.now();\n  }\n}",
    "mutantImplementations": [
      "class RateLimiter { constructor(maxTokens, refillRate, refillInterval = 1000) { this.maxTokens = maxTokens; this.tokens = maxTokens; this.refillRate = refillRate; this.refillInterval = refillInterval; this.lastRefill = Date.now(); } _refill() { const now = Date.now(); const elapsed = now - this.lastRefill; const intervals = Math.floor(elapsed / this.refillInterval); if (intervals > 0) { this.tokens = this.tokens + intervals * this.refillRate; this.lastRefill = now; } } tryAcquire(tokens = 1) { this._refill(); if (this.tokens >= tokens) { this.tokens -= tokens; return true; } return false; } getTokens() { this._refill(); return this.tokens; } reset() { this.tokens = this.maxTokens; this.lastRefill = Date.now(); } }",
      "class RateLimiter { constructor(maxTokens, refillRate, refillInterval = 1000) { this.maxTokens = maxTokens; this.tokens = maxTokens; this.refillRate = refillRate; this.refillInterval = refillInterval; this.lastRefill = Date.now(); } _refill() { const now = Date.now(); const elapsed = now - this.lastRefill; const intervals = Math.floor(elapsed / this.refillInterval); if (intervals > 0) { this.tokens = Math.min(this.maxTokens, this.tokens + intervals * this.refillRate); this.lastRefill = now; } } tryAcquire(tokens = 1) { this._refill(); if (this.tokens > tokens) { this.tokens -= tokens; return true; } return false; } getTokens() { this._refill(); return this.tokens; } reset() { this.tokens = this.maxTokens; this.lastRefill = Date.now(); } }"
    ],
    "requirements": [
      "Test burst capacity (consume all tokens rapidly)",
      "Test token refill after waiting",
      "Test that tokens never exceed maxTokens",
      "Test acquiring more tokens than available",
      "Test reset functionality"
    ],
    "constraints": ["You have up to 8 prompt turns"],
    "maxPromptTurns": 8
  },
  {
    "id": 68,
    "title": "Test the Virtual DOM Differ",
    "difficulty": "Hard",
    "category": "Testing",
    "type": "testing",
    "isOptimizationTrap": false,
    "avgAttempts": 4.5,
    "description": "Write tests for a simplified virtual DOM diff algorithm. Test node creation, attribute changes, child reordering, and deletion.",
    "functionCode": "function diff(oldTree, newTree) {\n  const patches = [];\n  function walk(oldNode, newNode, path = '') {\n    if (!oldNode && newNode) {\n      patches.push({ type: 'CREATE', path, node: newNode });\n    } else if (oldNode && !newNode) {\n      patches.push({ type: 'REMOVE', path });\n    } else if (oldNode.tag !== newNode.tag) {\n      patches.push({ type: 'REPLACE', path, node: newNode });\n    } else {\n      const attrPatches = diffAttrs(oldNode.attrs || {}, newNode.attrs || {});\n      if (attrPatches.length > 0) {\n        patches.push({ type: 'ATTRS', path, attrs: attrPatches });\n      }\n      const maxLen = Math.max(\n        (oldNode.children || []).length,\n        (newNode.children || []).length\n      );\n      for (let i = 0; i < maxLen; i++) {\n        walk(\n          (oldNode.children || [])[i],\n          (newNode.children || [])[i],\n          `${path}/${i}`\n        );\n      }\n    }\n  }\n  function diffAttrs(oldAttrs, newAttrs) {\n    const changes = [];\n    for (const key in newAttrs) {\n      if (oldAttrs[key] !== newAttrs[key]) {\n        changes.push({ key, value: newAttrs[key] });\n      }\n    }\n    for (const key in oldAttrs) {\n      if (!(key in newAttrs)) {\n        changes.push({ key, value: undefined });\n      }\n    }\n    return changes;\n  }\n  walk(oldTree, newTree);\n  return patches;\n}",
    "functionSpec": "diff(oldTree, newTree) → patches[]\n\nVNode format: { tag: 'div', attrs: { class: 'foo' }, children: [...] }\nPatch types:\n- CREATE: new node added\n- REMOVE: old node removed\n- REPLACE: tag changed\n- ATTRS: attributes changed\n\nPatches include path (e.g., '/0/1') identifying the node position.",
    "correctImplementation": "function diff(oldTree, newTree) {\n  const patches = [];\n  function walk(oldNode, newNode, path = '') {\n    if (!oldNode && newNode) {\n      patches.push({ type: 'CREATE', path, node: newNode });\n    } else if (oldNode && !newNode) {\n      patches.push({ type: 'REMOVE', path });\n    } else if (oldNode.tag !== newNode.tag) {\n      patches.push({ type: 'REPLACE', path, node: newNode });\n    } else {\n      const attrPatches = diffAttrs(oldNode.attrs || {}, newNode.attrs || {});\n      if (attrPatches.length > 0) {\n        patches.push({ type: 'ATTRS', path, attrs: attrPatches });\n      }\n      const maxLen = Math.max(\n        (oldNode.children || []).length,\n        (newNode.children || []).length\n      );\n      for (let i = 0; i < maxLen; i++) {\n        walk(\n          (oldNode.children || [])[i],\n          (newNode.children || [])[i],\n          `${path}/${i}`\n        );\n      }\n    }\n  }\n  function diffAttrs(oldAttrs, newAttrs) {\n    const changes = [];\n    for (const key in newAttrs) {\n      if (oldAttrs[key] !== newAttrs[key]) {\n        changes.push({ key, value: newAttrs[key] });\n      }\n    }\n    for (const key in oldAttrs) {\n      if (!(key in newAttrs)) {\n        changes.push({ key, value: undefined });\n      }\n    }\n    return changes;\n  }\n  walk(oldTree, newTree);\n  return patches;\n}",
    "mutantImplementations": [
      "function diff(oldTree, newTree) { const patches = []; function walk(oldNode, newNode, path = '') { if (!oldNode && newNode) { patches.push({ type: 'CREATE', path, node: newNode }); } else if (oldNode && !newNode) { patches.push({ type: 'REMOVE', path }); } else if (oldNode.tag !== newNode.tag) { patches.push({ type: 'REPLACE', path, node: newNode }); } else { const maxLen = Math.max((oldNode.children || []).length, (newNode.children || []).length); for (let i = 0; i < maxLen; i++) { walk((oldNode.children || [])[i], (newNode.children || [])[i], path + '/' + i); } } } walk(oldTree, newTree); return patches; }"
    ],
    "requirements": [
      "Test creating new nodes",
      "Test removing nodes",
      "Test replacing nodes with different tags",
      "Test attribute changes (add, modify, remove)",
      "Test deeply nested children"
    ],
    "constraints": ["You have up to 8 prompt turns"],
    "maxPromptTurns": 8
  },

  // ═══════════════════════════════════════════
  // OPTIMIZATION QUESTIONS (8 total: 3 Easy, 3 Medium, 2 Hard)
  // ═══════════════════════════════════════════
  {
    "id": 69,
    "title": "Optimize the Array Search",
    "difficulty": "Easy",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 1.5,
    "description": "The current implementation uses O(n²) nested loops to find two numbers that sum to a target. Optimize it to O(n) using a hash map approach.",
    "slowCode": {
      "search.js": "function findPair(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] + arr[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n  return null;\n}"
    },
    "originalComplexity": "O(n²) time, O(1) space",
    "performanceTarget": "O(n) time, O(n) space",
    "benchmarkInputSize": 100000,
    "requirements": [
      "Optimize from O(n²) to O(n) time complexity",
      "Must return the same output as the original",
      "Handle arrays up to 100,000 elements in under 50ms",
      "Use a hash map for O(1) lookups"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "testCases": [
      { "input": { "arr": [2, 7, 11, 15], "target": 9 }, "expectedOutput": [0, 1], "description": "Basic case" },
      { "input": { "arr": [3, 2, 4], "target": 6 }, "expectedOutput": [1, 2], "description": "Not first elements" },
      { "input": { "arr": [1, 2, 3], "target": 10 }, "expectedOutput": null, "description": "No solution" }
    ],
    "maxPromptTurns": 5
  },
  {
    "id": 70,
    "title": "Optimize the Duplicate Finder",
    "difficulty": "Easy",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 1.8,
    "description": "The current implementation sorts the array to find duplicates, which is O(n log n). Optimize it to O(n) using a Set.",
    "slowCode": {
      "duplicates.js": "function findDuplicates(arr) {\n  const sorted = [...arr].sort();\n  const duplicates = [];\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i] === sorted[i - 1] && !duplicates.includes(sorted[i])) {\n      duplicates.push(sorted[i]);\n    }\n  }\n  return duplicates;\n}"
    },
    "originalComplexity": "O(n log n + n²) time (sort + includes check), O(n) space",
    "performanceTarget": "O(n) time, O(n) space",
    "benchmarkInputSize": 50000,
    "requirements": [
      "Optimize to O(n) time",
      "Return the same set of duplicates (order doesn't matter)",
      "Use Set for O(1) lookups"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 71,
    "title": "Optimize the String Anagram Check",
    "difficulty": "Easy",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 1.6,
    "description": "The current implementation sorts both strings to check for anagrams, which is O(n log n). Optimize to O(n) using character frequency counting.",
    "slowCode": {
      "anagram.js": "function isAnagram(str1, str2) {\n  if (str1.length !== str2.length) return false;\n  const sorted1 = str1.toLowerCase().split('').sort().join('');\n  const sorted2 = str2.toLowerCase().split('').sort().join('');\n  return sorted1 === sorted2;\n}"
    },
    "originalComplexity": "O(n log n) time, O(n) space",
    "performanceTarget": "O(n) time, O(1) space (fixed alphabet size)",
    "benchmarkInputSize": 100000,
    "requirements": [
      "Optimize to O(n) time using character frequency counting",
      "Case-insensitive comparison",
      "Must return same results as original"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 72,
    "title": "Optimize the DOM Renderer",
    "difficulty": "Medium",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 3.0,
    "description": "A list renderer re-renders 10,000 items on every keystroke in a search filter. Add debouncing, virtual scrolling concepts, and DOM recycling.",
    "slowCode": {
      "renderer.js": "class ListRenderer {\n  constructor(container, items) {\n    this.container = container;\n    this.items = items;  // Array of 10,000+ items\n    this.filterText = '';\n  }\n\n  onFilterChange(text) {\n    this.filterText = text;\n    this.render();  // Re-renders EVERYTHING on every keystroke\n  }\n\n  render() {\n    // Clears and rebuilds entire DOM\n    this.container.innerHTML = '';\n    const filtered = this.items.filter(item =>\n      item.name.toLowerCase().includes(this.filterText.toLowerCase())\n    );\n    filtered.forEach(item => {\n      const div = document.createElement('div');\n      div.className = 'list-item';\n      div.innerHTML = `\n        <h3>${item.name}</h3>\n        <p>${item.description}</p>\n        <span class=\"badge\">${item.category}</span>\n      `;\n      this.container.appendChild(div);  // Causes reflow on each append\n    });\n  }\n}"
    },
    "originalComplexity": "O(n) DOM operations per keystroke, no debouncing, full reflow on each append",
    "performanceTarget": "Debounced input (300ms), DOM fragment batching, render only visible items",
    "benchmarkInputSize": 10000,
    "requirements": [
      "Add input debouncing (300ms delay)",
      "Use DocumentFragment for batch DOM updates",
      "Only render visible items (virtual scrolling / windowing)",
      "Must still produce correct filtered results"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 73,
    "title": "Optimize the Fibonacci Calculator",
    "difficulty": "Medium",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 2.0,
    "description": "The naive recursive Fibonacci implementation has exponential time complexity. Optimize it using memoization or dynamic programming.",
    "slowCode": {
      "fibonacci.js": "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfunction fibSequence(count) {\n  const result = [];\n  for (let i = 0; i < count; i++) {\n    result.push(fibonacci(i));\n  }\n  return result;\n}"
    },
    "originalComplexity": "O(2^n) time per call, O(n) stack space",
    "performanceTarget": "O(n) time, O(n) space with memoization or O(1) space with iterative",
    "benchmarkInputSize": 40,
    "requirements": [
      "Optimize fibonacci(n) from O(2^n) to O(n)",
      "fibonacci(40) must complete in under 1ms",
      "Results must be identical to the original"
    ],
    "constraints": ["You have up to 5 prompt turns"],
    "maxPromptTurns": 5
  },
  {
    "id": 74,
    "title": "Optimize the Matrix Operations",
    "difficulty": "Medium",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 3.5,
    "description": "Matrix multiplication uses naive O(n³) algorithm with poor cache locality. Optimize using transposition for cache-friendly access patterns and loop unrolling.",
    "slowCode": {
      "matrix.js": "function multiply(A, B) {\n  const n = A.length;\n  const result = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      for (let k = 0; k < n; k++) {\n        result[i][j] += A[i][k] * B[k][j];  // B[k][j] has poor cache locality\n      }\n    }\n  }\n  return result;\n}\n\nfunction transpose(matrix) {\n  const n = matrix.length;\n  const result = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      result[j][i] = matrix[i][j];\n    }\n  }\n  return result;\n}"
    },
    "originalComplexity": "O(n³) with poor cache locality on B matrix access",
    "performanceTarget": "O(n³) but with transposed B for cache-friendly access — ~2-4x speedup",
    "benchmarkInputSize": 500,
    "requirements": [
      "Transpose B before multiplication for cache-friendly row access",
      "Result must be identical to naive multiplication",
      "Handle non-square matrices if possible"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 75,
    "title": "Optimize the Data Pipeline",
    "difficulty": "Hard",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 4.5,
    "description": "A multi-step data processing pipeline has O(n³) complexity with redundant computations, excessive memory allocations, and blocking operations. Optimize it to under O(n log n).",
    "slowCode": {
      "pipeline.js": "function processData(records) {\n  // Step 1: Remove duplicates — O(n²) with nested includes\n  const unique = [];\n  records.forEach(record => {\n    if (!unique.find(u => u.id === record.id)) {\n      unique.push(record);\n    }\n  });\n\n  // Step 2: Sort by multiple fields — creates new arrays repeatedly\n  const sorted = unique\n    .map(r => ({ ...r }))  // unnecessary deep copy\n    .sort((a, b) => {\n      if (a.category !== b.category) return a.category.localeCompare(b.category);\n      return a.timestamp - b.timestamp;\n    });\n\n  // Step 3: Group by category — O(n²) with filter for each category\n  const categories = [...new Set(sorted.map(r => r.category))];\n  const grouped = {};\n  categories.forEach(cat => {\n    grouped[cat] = sorted.filter(r => r.category === cat);\n  });\n\n  // Step 4: Aggregate — recomputes for each group\n  const results = {};\n  Object.entries(grouped).forEach(([cat, items]) => {\n    results[cat] = {\n      count: items.length,\n      total: items.reduce((sum, i) => sum + i.value, 0),\n      avg: items.reduce((sum, i) => sum + i.value, 0) / items.length,\n      min: Math.min(...items.map(i => i.value)),\n      max: Math.max(...items.map(i => i.value)),\n    };\n  });\n\n  return results;\n}"
    },
    "originalComplexity": "O(n²) dedup + O(n log n) sort + O(n²) grouping + O(n) aggregation = O(n²)",
    "performanceTarget": "O(n log n) overall — use Map for O(1) dedup, single-pass grouping + aggregation",
    "benchmarkInputSize": 100000,
    "requirements": [
      "Eliminate O(n²) dedup — use Map or Set",
      "Combine grouping and aggregation into a single pass",
      "Remove unnecessary object copies",
      "Maintain the same output format"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },
  {
    "id": 76,
    "title": "Optimize the Text Search Engine",
    "difficulty": "Hard",
    "category": "Optimization",
    "type": "optimization",
    "isOptimizationTrap": false,
    "avgAttempts": 5.0,
    "description": "A text search engine uses brute-force string matching O(n*m*k) across k documents. Implement an inverted index for O(1) lookups after O(n) preprocessing.",
    "slowCode": {
      "search.js": "class SearchEngine {\n  constructor() {\n    this.documents = [];\n  }\n\n  addDocument(id, text) {\n    this.documents.push({ id, text: text.toLowerCase() });\n  }\n\n  search(query) {\n    const terms = query.toLowerCase().split(/\\s+/);\n    const results = [];\n\n    this.documents.forEach(doc => {\n      let score = 0;\n      terms.forEach(term => {\n        // Count occurrences — O(n*m) per document per term\n        let pos = 0;\n        while ((pos = doc.text.indexOf(term, pos)) !== -1) {\n          score++;\n          pos += term.length;\n        }\n      });\n      if (score > 0) {\n        results.push({ id: doc.id, score });\n      }\n    });\n\n    return results.sort((a, b) => b.score - a.score);\n  }\n}"
    },
    "originalComplexity": "O(k * n * m) per search where k=docs, n=doc length, m=query terms",
    "performanceTarget": "O(m) per search after O(k*n) indexing — using inverted index",
    "benchmarkInputSize": 10000,
    "requirements": [
      "Build an inverted index on addDocument",
      "Search should use the index, not scan all documents",
      "Support multi-word queries (AND logic)",
      "Return results sorted by relevance score"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },

  // ═══════════════════════════════════════════
  // CODE REVIEW QUESTIONS (7 total: 2 Easy, 3 Medium, 2 Hard)
  // ═══════════════════════════════════════════
  {
    "id": 77,
    "title": "Review the Login Form",
    "difficulty": "Easy",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 2.0,
    "description": "Review this login form implementation for security vulnerabilities, accessibility issues, and code quality problems. Identify all issues and suggest fixes.",
    "reviewCode": {
      "login.html": "<!DOCTYPE html>\n<html>\n<body>\n  <div class=\"login-container\">\n    <div class=\"login-form\">\n      <h2>Login</h2>\n      <input type=\"text\" id=\"email\" placeholder=\"Email\">\n      <input type=\"text\" id=\"password\" placeholder=\"Password\">\n      <div id=\"error\" style=\"color:red\"></div>\n      <button onclick=\"login()\">Login</button>\n      <div id=\"greeting\"></div>\n    </div>\n  </div>\n</body>\n</html>",
      "login.js": "async function login() {\n  const email = document.getElementById('email').value;\n  const password = document.getElementById('password').value;\n\n  // Store credentials for auto-login\n  localStorage.setItem('email', email);\n  localStorage.setItem('password', password);\n\n  const response = await fetch('/api/login', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ email, password })\n  });\n\n  const data = await response.json();\n\n  if (data.success) {\n    document.getElementById('greeting').innerHTML = 'Welcome, ' + data.name;\n    window.location.href = '/dashboard?token=' + data.token;\n  } else {\n    document.getElementById('error').innerHTML = 'Invalid: ' + email;\n  }\n}"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "Password stored in localStorage in plain text", "location": "login.js:6-7" },
      { "category": "security", "severity": "critical", "description": "XSS vulnerability: user input (email) injected into innerHTML without sanitization", "location": "login.js:20" },
      { "category": "security", "severity": "major", "description": "Auth token passed in URL query parameter — visible in browser history and server logs", "location": "login.js:18" },
      { "category": "security", "severity": "major", "description": "No CSRF protection on the login form", "location": "login.js:9-13" },
      { "category": "security", "severity": "minor", "description": "Password field uses type='text' instead of type='password'", "location": "login.html:8" },
      { "category": "accessibility", "severity": "major", "description": "No label elements for form inputs — screen readers can't identify fields", "location": "login.html:7-8" },
      { "category": "accessibility", "severity": "minor", "description": "No focus management or keyboard navigation support", "location": "login.html" },
      { "category": "quality", "severity": "minor", "description": "No input validation before submitting (empty email/password allowed)", "location": "login.js:2-3" },
      { "category": "quality", "severity": "minor", "description": "No loading state or disabled button during submission", "location": "login.js" }
    ],
    "requirements": [
      "Identify security vulnerabilities (XSS, credential storage, token exposure)",
      "Identify accessibility issues",
      "Identify code quality problems",
      "Classify each issue by severity (critical, major, minor)",
      "Suggest fixes for each issue"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 78,
    "title": "Review the User Profile API",
    "difficulty": "Easy",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 2.2,
    "description": "Review this user profile API endpoint for security, error handling, and code quality issues.",
    "reviewCode": {
      "profile.js": "import express from 'express';\nconst router = express.Router();\n\nrouter.get('/profile/:id', async (req, res) => {\n  const userId = req.params.id;\n  \n  // No authentication check — anyone can view any profile\n  const query = `SELECT * FROM users WHERE id = ${userId}`;  // SQL injection!\n  \n  try {\n    const result = await db.query(query);\n    const user = result.rows[0];\n    \n    // Returns ALL fields including sensitive data\n    res.json(user);  // password_hash, ssn, etc. exposed\n  } catch (err) {\n    // Leaks internal error details to client\n    res.status(500).json({ error: err.message, stack: err.stack });\n  }\n});\n\nrouter.put('/profile/:id', async (req, res) => {\n  const userId = req.params.id;\n  const updates = req.body;  // No validation — user can update ANY field\n  \n  // Mass assignment vulnerability\n  const query = `UPDATE users SET ${Object.entries(updates).map(([k,v]) => `${k}='${v}'`).join(', ')} WHERE id = ${userId}`;\n  \n  await db.query(query);\n  res.json({ success: true });\n});\n\nexport default router;"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "SQL injection: userId is concatenated directly into query string", "location": "profile.js:7" },
      { "category": "security", "severity": "critical", "description": "SQL injection in UPDATE: both keys and values are unsanitized", "location": "profile.js:25" },
      { "category": "security", "severity": "critical", "description": "Mass assignment: user can update any field including role, password_hash", "location": "profile.js:22-25" },
      { "category": "security", "severity": "major", "description": "No authentication — anyone can view/edit any profile", "location": "profile.js:4,20" },
      { "category": "security", "severity": "major", "description": "Returns all user fields including sensitive data (password_hash, ssn)", "location": "profile.js:12" },
      { "category": "quality", "severity": "major", "description": "Error response leaks stack trace to client", "location": "profile.js:15" },
      { "category": "quality", "severity": "minor", "description": "PUT handler has no try/catch — unhandled errors crash the server", "location": "profile.js:20-28" }
    ],
    "requirements": [
      "Identify SQL injection vulnerabilities",
      "Identify authentication/authorization issues",
      "Identify data exposure problems",
      "Suggest parameterized queries",
      "Suggest input validation and field whitelisting"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 79,
    "title": "Review the E-Commerce Checkout",
    "difficulty": "Medium",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 3.0,
    "description": "Review this e-commerce checkout flow for security vulnerabilities, race conditions, calculation errors, and code quality issues.",
    "reviewCode": {
      "checkout.js": "class CheckoutService {\n  async processOrder(userId, cartItems, paymentInfo) {\n    // Calculate total on the client-provided prices — TRUST ISSUE\n    let total = 0;\n    cartItems.forEach(item => {\n      total += item.price * item.quantity;  // Floating point issues\n    });\n\n    // Check inventory (but don't lock it — race condition)\n    for (const item of cartItems) {\n      const product = await db.findProduct(item.id);\n      if (product.stock < item.quantity) {\n        throw new Error(`${product.name} is out of stock`);\n      }\n    }\n\n    // Charge payment\n    const charge = await paymentGateway.charge({\n      amount: total,\n      card: paymentInfo.cardNumber,  // Full card number in memory\n      cvv: paymentInfo.cvv,\n    });\n\n    // Reduce stock (no transaction — partial failure possible)\n    for (const item of cartItems) {\n      await db.query(`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.id}`);\n    }\n\n    // Log the order with full payment details\n    console.log('Order placed:', { userId, total, card: paymentInfo.cardNumber });\n\n    return { orderId: charge.id, total };\n  }\n}",
      "checkout.html": "<form id=\"checkout-form\">\n  <input name=\"cardNumber\" placeholder=\"Card Number\">\n  <input name=\"cvv\" placeholder=\"CVV\">\n  <input name=\"expiry\" placeholder=\"MM/YY\">\n  <button type=\"submit\">Pay Now</button>\n</form>"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "Client-provided prices used for total — user can modify prices to pay less", "location": "checkout.js:4-6" },
      { "category": "security", "severity": "critical", "description": "Full card number and CVV logged to console — PCI DSS violation", "location": "checkout.js:29" },
      { "category": "security", "severity": "critical", "description": "SQL injection in stock update query", "location": "checkout.js:25" },
      { "category": "security", "severity": "major", "description": "Full card number stored in memory — should use tokenization", "location": "checkout.js:18-19" },
      { "category": "performance", "severity": "major", "description": "Race condition: inventory checked but not locked — overselling possible", "location": "checkout.js:9-14" },
      { "category": "performance", "severity": "major", "description": "No database transaction — if stock update fails mid-way, data is inconsistent", "location": "checkout.js:24-26" },
      { "category": "quality", "severity": "major", "description": "Floating-point arithmetic for currency — use integers (cents)", "location": "checkout.js:5" },
      { "category": "accessibility", "severity": "minor", "description": "Form inputs have no labels", "location": "checkout.html:2-4" }
    ],
    "requirements": [
      "Identify all security vulnerabilities",
      "Identify race conditions and data integrity issues",
      "Identify PCI DSS compliance violations",
      "Suggest fixes for each issue"
    ],
    "constraints": ["You have up to 8 prompt turns"],
    "maxPromptTurns": 8
  },
  {
    "id": 80,
    "title": "Review the File Upload Service",
    "difficulty": "Medium",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 3.2,
    "description": "Review this file upload service for path traversal, file type validation, size limits, and resource management issues.",
    "reviewCode": {
      "upload.js": "import fs from 'fs';\nimport path from 'path';\n\nclass FileUploadService {\n  constructor() {\n    this.uploadDir = './uploads';\n  }\n\n  async handleUpload(req, res) {\n    const file = req.file;\n    const filename = req.body.filename || file.originalname;\n    \n    // Path traversal vulnerability — filename could be '../../../etc/passwd'\n    const filepath = path.join(this.uploadDir, filename);\n    \n    // No file type validation — any file type accepted\n    // No file size check — could upload gigabytes\n    \n    fs.writeFileSync(filepath, file.buffer);  // Sync blocks event loop\n    \n    // Serve files directly — no access control\n    res.json({\n      url: `/uploads/${filename}`,  // Reflects user input in URL\n      size: file.buffer.length\n    });\n  }\n\n  async deleteFile(req, res) {\n    const filename = req.params.filename;\n    const filepath = path.join(this.uploadDir, filename);\n    \n    // No auth check — anyone can delete any file\n    // No check if file exists\n    fs.unlinkSync(filepath);  // Throws if file doesn't exist\n    res.json({ deleted: true });\n  }\n}"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "Path traversal: user-controlled filename can write to arbitrary paths", "location": "upload.js:11-14" },
      { "category": "security", "severity": "critical", "description": "No file type validation — malicious files (scripts, executables) accepted", "location": "upload.js:16" },
      { "category": "security", "severity": "major", "description": "No authentication on deleteFile — anyone can delete files", "location": "upload.js:29" },
      { "category": "security", "severity": "major", "description": "Path traversal in deleteFile as well", "location": "upload.js:30" },
      { "category": "performance", "severity": "major", "description": "writeFileSync and unlinkSync block the event loop", "location": "upload.js:18,33" },
      { "category": "quality", "severity": "major", "description": "No file size limit — DoS risk", "location": "upload.js:17" },
      { "category": "quality", "severity": "minor", "description": "No error handling — unlinkSync throws if file doesn't exist", "location": "upload.js:33" }
    ],
    "requirements": [
      "Identify path traversal vulnerabilities",
      "Identify file validation gaps",
      "Identify blocking I/O issues",
      "Suggest secure filename sanitization"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 81,
    "title": "Review the Session Management",
    "difficulty": "Medium",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 3.5,
    "description": "Review this session management implementation for authentication bypass, session fixation, token security, and timing attack vulnerabilities.",
    "reviewCode": {
      "session.js": "import crypto from 'crypto';\n\nclass SessionManager {\n  constructor() {\n    this.sessions = {};  // In-memory storage — lost on restart\n    this.SECRET = 'my-super-secret-key-123';  // Hardcoded secret\n  }\n\n  createSession(userId) {\n    // Predictable session ID — based on timestamp\n    const sessionId = 'sess_' + Date.now().toString(36);\n    this.sessions[sessionId] = {\n      userId,\n      createdAt: Date.now(),\n      // No expiration set\n    };\n    return sessionId;\n  }\n\n  validateSession(sessionId) {\n    const session = this.sessions[sessionId];\n    if (!session) return null;\n    // No expiration check\n    return session.userId;\n  }\n\n  compareTokens(provided, expected) {\n    // Timing attack vulnerability — string comparison leaks length info\n    return provided === expected;\n  }\n\n  generateApiKey(userId) {\n    // Weak key generation — MD5 of predictable data\n    return crypto.createHash('md5').update(userId + this.SECRET).digest('hex');\n  }\n}"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "Predictable session IDs — timestamp-based, easily guessable", "location": "session.js:10" },
      { "category": "security", "severity": "critical", "description": "Hardcoded secret key in source code", "location": "session.js:5" },
      { "category": "security", "severity": "major", "description": "No session expiration — sessions valid forever", "location": "session.js:11-15, 20-23" },
      { "category": "security", "severity": "major", "description": "Timing attack: string comparison leaks information via timing", "location": "session.js:27-28" },
      { "category": "security", "severity": "major", "description": "Weak API key generation using MD5", "location": "session.js:32" },
      { "category": "performance", "severity": "major", "description": "In-memory session storage — lost on restart, doesn't scale", "location": "session.js:4" },
      { "category": "quality", "severity": "minor", "description": "No session invalidation/logout mechanism", "location": "session.js" }
    ],
    "requirements": [
      "Identify all cryptographic weaknesses",
      "Identify session management flaws",
      "Identify timing attack vulnerability",
      "Suggest using crypto.timingSafeEqual"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 82,
    "title": "Review the Microservice Gateway",
    "difficulty": "Hard",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 4.5,
    "description": "Review this API gateway code for missing rate limiting, improper JWT validation, SSRF vulnerability, no circuit breaker, memory leak in connection pool, and hardcoded secrets.",
    "reviewCode": {
      "gateway.js": "import jwt from 'jsonwebtoken';\nimport fetch from 'node-fetch';\n\nconst JWT_SECRET = 'gateway-secret-2024';\nconst serviceRegistry = {\n  users: 'http://users-service:3001',\n  orders: 'http://orders-service:3002',\n  payments: 'http://payments-service:3003',\n};\n\nconst connectionPool = [];\n\nclass APIGateway {\n  async handleRequest(req, res) {\n    // No rate limiting\n    \n    // JWT validation\n    const token = req.headers.authorization?.split(' ')[1];\n    if (token) {\n      try {\n        // Bug: doesn't verify algorithm — allows 'none' algorithm attack\n        const decoded = jwt.decode(token);\n        req.user = decoded;\n      } catch (e) {\n        // Silently ignores invalid tokens\n      }\n    }\n\n    // Route to service\n    const service = req.params.service;\n    const serviceUrl = serviceRegistry[service];\n    \n    if (!serviceUrl) {\n      return res.status(404).json({ error: 'Service not found' });\n    }\n\n    // SSRF: user controls the path, could access internal endpoints\n    const targetUrl = serviceUrl + req.originalUrl.replace(`/api/${service}`, '');\n    \n    try {\n      const conn = { url: targetUrl, timestamp: Date.now() };\n      connectionPool.push(conn);  // Memory leak — connections never removed\n      \n      const response = await fetch(targetUrl, {\n        method: req.method,\n        headers: { ...req.headers, host: undefined },\n        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,\n        // No timeout — hangs forever if service is down\n      });\n\n      const data = await response.json();\n      res.status(response.status).json(data);\n    } catch (error) {\n      // No circuit breaker — keeps sending requests to failing services\n      res.status(502).json({ error: 'Service unavailable', details: error.message });\n    }\n  }\n}"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "JWT uses decode() instead of verify() — no signature validation, allows forged tokens", "location": "gateway.js:21" },
      { "category": "security", "severity": "critical", "description": "Hardcoded JWT secret in source code", "location": "gateway.js:4" },
      { "category": "security", "severity": "critical", "description": "SSRF vulnerability: user-controlled path forwarded to internal services", "location": "gateway.js:37" },
      { "category": "security", "severity": "major", "description": "No rate limiting — vulnerable to DDoS", "location": "gateway.js:15" },
      { "category": "performance", "severity": "critical", "description": "Memory leak: connectionPool grows unbounded, connections never removed", "location": "gateway.js:41" },
      { "category": "performance", "severity": "major", "description": "No request timeout — hangs forever if downstream service is unresponsive", "location": "gateway.js:44-47" },
      { "category": "performance", "severity": "major", "description": "No circuit breaker — keeps hammering failing services", "location": "gateway.js:52" },
      { "category": "quality", "severity": "major", "description": "Leaks internal error details to clients", "location": "gateway.js:53" }
    ],
    "requirements": [
      "Identify all critical security issues",
      "Identify the memory leak",
      "Identify resilience issues (circuit breaker, timeout)",
      "Suggest JWT verification with algorithm pinning"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },
  {
    "id": 83,
    "title": "Review the Real-Time Collaboration Engine",
    "difficulty": "Hard",
    "category": "Code Review",
    "type": "code-review",
    "isOptimizationTrap": false,
    "avgAttempts": 5.0,
    "description": "Review this real-time collaborative editing engine for synchronization issues, conflict resolution bugs, memory management, and security vulnerabilities.",
    "reviewCode": {
      "collab.js": "class CollabEngine {\n  constructor() {\n    this.documents = {};\n    this.connections = new Map();\n    this.operationLog = [];  // Grows unbounded\n  }\n\n  onConnect(ws, documentId, userId) {\n    // No authentication check\n    if (!this.documents[documentId]) {\n      this.documents[documentId] = { content: '', version: 0, locks: {} };\n    }\n    this.connections.set(ws, { documentId, userId });\n    \n    // Send full document — no delta/diff\n    ws.send(JSON.stringify({ type: 'init', content: this.documents[documentId].content }));\n  }\n\n  onMessage(ws, message) {\n    const data = JSON.parse(message);  // No try/catch — crashes on invalid JSON\n    const { documentId, userId } = this.connections.get(ws);\n    const doc = this.documents[documentId];\n\n    if (data.type === 'edit') {\n      // No version checking — last write wins, overwrites concurrent edits\n      doc.content = data.content;\n      doc.version++;\n      \n      this.operationLog.push({ documentId, userId, content: data.content, timestamp: Date.now() });\n      \n      // Broadcast to all — including sender\n      this.connections.forEach((info, client) => {\n        if (info.documentId === documentId) {\n          client.send(JSON.stringify({ type: 'update', content: doc.content, version: doc.version }));\n        }\n      });\n    }\n  }\n\n  onDisconnect(ws) {\n    // Doesn't clean up document locks\n    this.connections.delete(ws);\n  }\n}"
    },
    "knownIssues": [
      { "category": "security", "severity": "critical", "description": "No authentication — any WebSocket connection can edit any document", "location": "collab.js:8" },
      { "category": "security", "severity": "major", "description": "No input validation — JSON.parse crashes on invalid messages", "location": "collab.js:20" },
      { "category": "security", "severity": "major", "description": "No authorization — users can edit documents they shouldn't access", "location": "collab.js:8-16" },
      { "category": "performance", "severity": "critical", "description": "Operation log grows unbounded — memory leak", "location": "collab.js:5,28" },
      { "category": "performance", "severity": "major", "description": "Full document sent on init and every update — should use diffs", "location": "collab.js:16,33" },
      { "category": "quality", "severity": "critical", "description": "No conflict resolution — last write wins, concurrent edits are lost", "location": "collab.js:25" },
      { "category": "quality", "severity": "major", "description": "Broadcasts update back to sender — causes echo/duplication", "location": "collab.js:31-35" },
      { "category": "quality", "severity": "major", "description": "onDisconnect doesn't release document locks", "location": "collab.js:40-41" }
    ],
    "requirements": [
      "Identify synchronization and conflict resolution issues",
      "Identify memory management problems",
      "Identify security vulnerabilities",
      "Suggest operational transformation or CRDT approach"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  },

  // ═══════════════════════════════════════════
  // SYSTEM SCALING QUESTIONS (5 total: 2 Easy, 2 Medium, 1 Hard)
  // ═══════════════════════════════════════════
  {
    "id": 84,
    "title": "Scale the User List API",
    "difficulty": "Easy",
    "category": "System Scaling",
    "type": "system-scaling",
    "isOptimizationTrap": false,
    "avgAttempts": 2.0,
    "description": "This /users endpoint loads ALL users into memory. Scale it to handle 1 million users with pagination, caching, and database indexing.",
    "scalingScenario": "Currently serves 100 users. Need to scale to 1,000,000 users with sub-100ms response times.",
    "prototypeCode": {
      "users.js": "import express from 'express';\nconst router = express.Router();\n\nrouter.get('/users', async (req, res) => {\n  // Loads ALL users into memory — crashes with 1M rows\n  const users = await db.query('SELECT * FROM users');\n  \n  // Client-side filtering — all data transferred\n  const search = req.query.search;\n  let filtered = users;\n  if (search) {\n    filtered = users.filter(u => \n      u.name.toLowerCase().includes(search.toLowerCase())\n    );\n  }\n\n  res.json(filtered);\n});\n\nexport default router;"
    },
    "scalingRequirements": [
      "Add cursor-based or offset pagination (limit 50 per page)",
      "Add Redis caching with TTL for frequently accessed pages",
      "Move filtering to database with proper indexes",
      "Add response compression"
    ],
    "expectedPatterns": ["pagination", "caching", "database-indexing", "compression"],
    "requirements": [
      "Implement pagination (50 items per page)",
      "Add caching layer",
      "Move search/filter to SQL WHERE clause",
      "Handle 1M records without loading all into memory"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 85,
    "title": "Scale the Session Store",
    "difficulty": "Easy",
    "category": "System Scaling",
    "type": "system-scaling",
    "isOptimizationTrap": false,
    "avgAttempts": 2.2,
    "description": "This in-memory session store loses all sessions on restart and can't scale beyond one server. Convert it to use Redis.",
    "scalingScenario": "Currently handles 100 concurrent users on a single server. Need to support 100,000 concurrent users across multiple servers.",
    "prototypeCode": {
      "sessions.js": "// In-memory session store — all data lost on restart\nconst sessions = {};\n\nfunction createSession(userId) {\n  const id = Math.random().toString(36).slice(2);\n  sessions[id] = {\n    userId,\n    data: {},\n    createdAt: Date.now()\n  };\n  return id;\n}\n\nfunction getSession(id) {\n  return sessions[id] || null;\n}\n\nfunction deleteSession(id) {\n  delete sessions[id];\n}\n\nfunction cleanupExpired() {\n  const now = Date.now();\n  const maxAge = 24 * 60 * 60 * 1000; // 24 hours\n  Object.keys(sessions).forEach(id => {\n    if (now - sessions[id].createdAt > maxAge) {\n      delete sessions[id];\n    }\n  });\n}\n\n// Run cleanup every hour\nsetInterval(cleanupExpired, 60 * 60 * 1000);\n\nexport { createSession, getSession, deleteSession };"
    },
    "scalingRequirements": [
      "Replace in-memory store with Redis",
      "Use Redis TTL for automatic expiration",
      "Generate cryptographically secure session IDs",
      "Handle Redis connection failures gracefully"
    ],
    "expectedPatterns": ["external-store", "ttl", "connection-pooling", "error-handling"],
    "requirements": [
      "Convert to Redis-backed sessions",
      "Use crypto.randomBytes for session IDs",
      "Set TTL on Redis keys instead of manual cleanup",
      "Add connection error handling"
    ],
    "constraints": ["You have up to 7 prompt turns"],
    "maxPromptTurns": 7
  },
  {
    "id": 86,
    "title": "Scale the Notification System",
    "difficulty": "Medium",
    "category": "System Scaling",
    "type": "system-scaling",
    "isOptimizationTrap": false,
    "avgAttempts": 3.5,
    "description": "This in-process notification system sends notifications synchronously. Convert to a queue-based architecture with retry logic, dead letter queue, and rate limiting per user.",
    "scalingScenario": "Currently sends ~100 notifications/day inline with request handling. Need to handle 1,000,000 notifications/day without blocking API responses.",
    "prototypeCode": {
      "notifications.js": "class NotificationService {\n  async sendNotification(userId, type, message) {\n    // Sends inline — blocks the API response\n    try {\n      if (type === 'email') {\n        await this.sendEmail(userId, message);\n      } else if (type === 'push') {\n        await this.sendPush(userId, message);\n      } else if (type === 'sms') {\n        await this.sendSMS(userId, message);\n      }\n      await this.logNotification(userId, type, 'sent');\n    } catch (error) {\n      // No retry — notification is lost on failure\n      console.error('Notification failed:', error);\n      await this.logNotification(userId, type, 'failed');\n    }\n  }\n\n  async sendEmail(userId, message) {\n    // Simulated email sending — takes 1-3 seconds\n    const user = await db.getUser(userId);\n    await emailProvider.send(user.email, message);\n  }\n\n  async sendPush(userId, message) {\n    const devices = await db.getUserDevices(userId);\n    // Sends to ALL devices sequentially\n    for (const device of devices) {\n      await pushProvider.send(device.token, message);\n    }\n  }\n\n  async sendSMS(userId, message) {\n    const user = await db.getUser(userId);\n    await smsProvider.send(user.phone, message);\n  }\n\n  async logNotification(userId, type, status) {\n    await db.query('INSERT INTO notification_log (user_id, type, status, created_at) VALUES (?, ?, ?, NOW())', [userId, type, status]);\n  }\n}"
    },
    "scalingRequirements": [
      "Decouple notification sending from API request cycle using a message queue",
      "Add retry with exponential backoff (max 3 retries)",
      "Implement dead letter queue for permanently failed notifications",
      "Add per-user rate limiting (max 10 notifications per hour)",
      "Send push notifications in parallel, not sequentially"
    ],
    "expectedPatterns": ["message-queue", "retry-backoff", "dead-letter-queue", "rate-limiting", "parallel-execution"],
    "requirements": [
      "Implement queue-based async processing",
      "Add retry logic with exponential backoff",
      "Add dead letter queue for failed notifications",
      "Add per-user rate limiting"
    ],
    "constraints": ["You have up to 8 prompt turns"],
    "maxPromptTurns": 8
  },
  {
    "id": 87,
    "title": "Scale the Search Service",
    "difficulty": "Medium",
    "category": "System Scaling",
    "type": "system-scaling",
    "isOptimizationTrap": false,
    "avgAttempts": 3.8,
    "description": "This search endpoint performs full-table scans on every request. Add indexing, result caching, and query optimization for 10M records.",
    "scalingScenario": "Currently searches 10,000 products with acceptable performance. Need to handle 10,000,000 products with <200ms response time.",
    "prototypeCode": {
      "search.js": "router.get('/search', async (req, res) => {\n  const { q, category, minPrice, maxPrice, sortBy, page } = req.query;\n\n  // Full table scan — no indexes\n  let query = 'SELECT * FROM products WHERE 1=1';\n  const params = [];\n\n  if (q) {\n    // LIKE with leading wildcard — can't use index\n    query += ` AND (name LIKE '%${q}%' OR description LIKE '%${q}%')`;\n    // Also: SQL injection vulnerability\n  }\n  if (category) {\n    query += ` AND category = '${category}'`;\n  }\n  if (minPrice) {\n    query += ` AND price >= ${minPrice}`;\n  }\n  if (maxPrice) {\n    query += ` AND price <= ${maxPrice}`;\n  }\n\n  // No pagination — returns all results\n  query += ` ORDER BY ${sortBy || 'name'}`;  // SQL injection in ORDER BY\n\n  const results = await db.query(query);\n  res.json(results);\n});"
    },
    "scalingRequirements": [
      "Use parameterized queries to prevent SQL injection",
      "Add full-text search index instead of LIKE with leading wildcard",
      "Add composite indexes for common filter combinations",
      "Implement result caching with cache invalidation",
      "Add cursor-based pagination"
    ],
    "expectedPatterns": ["full-text-search", "composite-index", "caching", "pagination", "parameterized-queries"],
    "requirements": [
      "Fix SQL injection vulnerabilities",
      "Replace LIKE with full-text search",
      "Add database indexes",
      "Implement pagination and caching"
    ],
    "constraints": ["You have up to 8 prompt turns"],
    "maxPromptTurns": 8
  },
  {
    "id": 88,
    "title": "Scale the Analytics Dashboard",
    "difficulty": "Hard",
    "category": "System Scaling",
    "type": "system-scaling",
    "isOptimizationTrap": false,
    "avgAttempts": 5.0,
    "description": "This real-time analytics dashboard computes aggregations on every request from raw event data. Implement pre-aggregation, time-windowed caching, read replicas, and materialized views.",
    "scalingScenario": "Currently processes 10,000 events/day. Need to handle 100,000,000 events/day with real-time dashboard updates under 500ms.",
    "prototypeCode": {
      "analytics.js": "class AnalyticsDashboard {\n  async getDashboardData(timeRange) {\n    const { start, end } = timeRange;\n\n    // Computes everything from raw events on every request\n    const totalUsers = await db.query(\n      `SELECT COUNT(DISTINCT user_id) FROM events WHERE timestamp BETWEEN ? AND ?`,\n      [start, end]\n    );\n\n    const pageViews = await db.query(\n      `SELECT page, COUNT(*) as views FROM events WHERE type = 'pageview' AND timestamp BETWEEN ? AND ? GROUP BY page ORDER BY views DESC`,\n      [start, end]\n    );\n\n    const hourlyTraffic = await db.query(\n      `SELECT HOUR(timestamp) as hour, COUNT(*) as count FROM events WHERE timestamp BETWEEN ? AND ? GROUP BY HOUR(timestamp)`,\n      [start, end]\n    );\n\n    const conversionFunnel = await db.query(\n      `SELECT step, COUNT(DISTINCT user_id) as users FROM funnel_events WHERE timestamp BETWEEN ? AND ? GROUP BY step ORDER BY step`,\n      [start, end]\n    );\n\n    const revenue = await db.query(\n      `SELECT SUM(amount) as total, AVG(amount) as average FROM orders WHERE created_at BETWEEN ? AND ?`,\n      [start, end]\n    );\n\n    // 5 sequential heavy queries on every dashboard load\n    return {\n      totalUsers: totalUsers[0].count,\n      pageViews,\n      hourlyTraffic,\n      conversionFunnel,\n      revenue: revenue[0]\n    };\n  }\n}"
    },
    "scalingRequirements": [
      "Pre-aggregate hourly/daily metrics into summary tables",
      "Use time-windowed caching (cache recent data for 1 minute)",
      "Run queries in parallel instead of sequentially",
      "Add read replica for analytics queries to avoid loading primary DB",
      "Implement incremental aggregation for real-time updates"
    ],
    "expectedPatterns": ["pre-aggregation", "time-windowed-cache", "parallel-queries", "read-replica", "incremental-aggregation"],
    "requirements": [
      "Implement pre-aggregated summary tables",
      "Add caching with time-window-based TTL",
      "Parallelize database queries",
      "Separate read traffic to replica",
      "Handle 100M events/day efficiently"
    ],
    "constraints": ["You have up to 10 prompt turns"],
    "maxPromptTurns": 10
  }
];

export default newQuestions;
