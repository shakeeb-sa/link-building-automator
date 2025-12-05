// ⚡ LIGHTNING LINKBUILDER — GOD-TIER FINAL v20
// HYBRID MODE: Real Data (Priority) + Fake Data (Fallback) + Smart Selects

let suggestionBox = null;

const style = document.createElement("style");
style.textContent = `
  .llb-suggestion {
    position: absolute;
    z-index: 2147483647;
    background: white;
    border-radius: 14px;
    box-shadow: 0 14px 45px rgba(0, 0, 0, 0.35);
    font-family: -apple-system, system-ui, sans-serif;
    min-width: 350px;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid #ccc;
    scrollbar-width: thin;
    scrollbar-color: #0066cc #f0f0f0;
  }
  .llb-suggestion::-webkit-scrollbar { width: 8px; }
  .llb-suggestion::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 10px; }
  .llb-suggestion::-webkit-scrollbar-thumb { background: #0066cc; border-radius: 10px; border: 2px solid #f0f0f0; }
  .llb-suggestion::-webkit-scrollbar-thumb:hover { background: #0052aa; }

  .llb-header {
    background: linear-gradient(90deg, #0066ff, #00ccff);
    color: white;
    padding: 16px 24px;
    font-weight: bold;
    font-size: 17px;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .llb-item {
    padding: 17px 24px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all .15s;
    font-size: 15px;
  }
  .llb-item:hover {background: #ebf5ff;}
  .llb-item strong {color: #0066cc;}
  .llb-item small {
    color: #555;
    font-size: 13px;
    max-width: 210px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .llb-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00b894;
    color: white;
    padding: 18px 48px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 18px;
    z-index: 2147483647;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    animation: toast 3.3s forwards;
  }
  @keyframes toast {
    0%,100% {opacity: 0; transform: translateX(-50%) translateY(-30px)}
    12%,88% {opacity: 1; transform: translateX(-50%) translateY(0)}
  }
@keyframes llb-watchtower-fade {
  0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
  15%, 85% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.llb-watchtower-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  padding: 18px 40px;
  border-radius: 50px;
  font-family: -apple-system, system-ui, sans-serif;
  font-weight: bold;
  font-size: 18px;
  color: white;
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
  animation: llb-watchtower-fade 4s forwards;
  pointer-events: none;
  min-width: 320px;
  text-align: center;
  backdrop-filter: blur(10px);
}
`;

// ============================================================
// 🎛️ GLOBAL TOGGLE: SUGGESTION MENU (Ctrl + X Long Press)
// ============================================================
let isSmartMenuEnabled = true; // Default ON

// 1. Load Saved Preference on Startup
chrome.storage.local.get(["smart_menu_active"], (res) => {
  if (res.smart_menu_active !== undefined) {
    isSmartMenuEnabled = res.smart_menu_active;
  }
});

// 2. The Long Press Logic
let menuToggleTimer = null;

document.addEventListener("keydown", (e) => {
  // Check for Ctrl + X (Case insensitive)
  if (e.ctrlKey && e.key.toLowerCase() === "x") {
    if (!menuToggleTimer) {
      menuToggleTimer = setTimeout(() => {
        toggleSmartMenuState();
      }, 1000); // 1 Second Hold
    }
  }
});

document.addEventListener("keyup", (e) => {
  // If user lets go of 'x' before 1 second, cancel the timer
  if (e.key.toLowerCase() === "x") {
    if (menuToggleTimer) {
      clearTimeout(menuToggleTimer);
      menuToggleTimer = null;
    }
  }
});

function toggleSmartMenuState() {
  isSmartMenuEnabled = !isSmartMenuEnabled;

  // Save to storage so it remembers across tabs/reloads
  chrome.storage.local.set({ smart_menu_active: isSmartMenuEnabled });

  // Visual Feedback
  const msg = isSmartMenuEnabled
    ? "✅ Suggestion Menu: ENABLED"
    : "❌ Suggestion Menu: DISABLED";
  toast(msg);

  // If we just disabled it, remove any open menu immediately
  if (!isSmartMenuEnabled && suggestionBox) {
    if (typeof suggestionBox._cleanup === "function") suggestionBox._cleanup();
    else suggestionBox.remove();
    suggestionBox = null;
  }

  menuToggleTimer = null; // Reset
}

document.head.appendChild(style);

function toast(msg) {
  const t = document.createElement("div");
  t.className = "llb-toast Marcello";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3300);
}

function getProfileData() {
  return new Promise((resolve) => {
    // We now read from LOCAL storage
    // The popup automatically flattens the active profile into "current_flat_data"
    // This makes retrieval instant and simple for the content script.
    chrome.storage.local.get(["current_flat_data"], (items) => {
      resolve({ data: items.current_flat_data || {} });
    });
  });
}

function smartFill(el, value) {
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.blur();
}

// --- FAKE DATA ENGINE ---
function generateFake(type) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // --- EXISTING FAKE DATA LISTS ---
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
  const streets = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Park Blvd"];
  const companies = [
    "TechCorp",
    "Global Solutions",
    "Alpha Agency",
    "NextGen Media",
  ];
  const titles = [
    "Marketing Director",
    "Content Manager",
    "SEO Specialist",
    "Owner",
  ];
  const subjects = [
    "Inquiry regarding your website",
    "Collaboration Proposal",
    "Partnership Opportunity",
  ];

  // --- YOUR SPECIFIC HARDCODED VALUES ---
  if (type === "dob") return "11/11/2000";
  if (type === "gender") return "male";
  if (type === "language") return "English";
  if (type === "timezone") return "Eastern Time (US & Canada)";
  if (type === "fax") return "222-211-2911";
  if (type === "secondaryEmail") return "info@gmail.com";
  if (type === "price") return "10";
  if (type === "social")
    return pick([
      "https://twitter.com/user",
      "https://linkedin.com/in/user",
      "https://facebook.com/user",
    ]);
  if (type === "companySize") return pick(["1-10", "11-50", "50-200"]);

  // Standard Fields
  if (type === "city") return pick(cities);
  if (type === "address")
    return `${Math.floor(Math.random() * 9000) + 100} ${pick(streets)}`;
  if (type === "billing" || type === "shipping") return "United States";
  if (type === "zip") return Math.floor(Math.random() * 90000) + 10000;
  if (type === "region") return pick(["CA", "NY", "TX", "FL", "IL"]);
  if (type === "country") return "United States";
  if (type === "phone")
    return `+1 ${Math.floor(Math.random() * 800) + 200}-${
      Math.floor(Math.random() * 800) + 200
    }-${Math.floor(Math.random() * 8999) + 1000}`;
  if (type === "company") return pick(companies);
  if (type === "title") return pick(titles);
  if (type === "subject") return pick(subjects);

  return null;
}

function getFieldType(el) {
  const str = [
    el.id,
    el.name,
    el.placeholder,
    el.autocomplete,
    el.getAttribute("aria-label"),
    el.labels?.[0]?.textContent,
    el.closest("label")?.textContent,
    el.previousElementSibling?.textContent, // Look at previous text (common in WP)
    el.closest("div")?.textContent || "",
  ]
    .join(" ")
    .toLowerCase();

  // 1. PASSWORD (Always First)
  if (el.type === "password") return "password";

  // 2. USERNAME (MOVED UP! Critical for WordPress)
  // WordPress uses "log", "user_login", "signup_username"
  if (
    /user.?name|login|user_login|log\b|signup_username|handle|alias/i.test(
      str
    ) &&
    !/email|e-mail/i.test(el.name) // Safety: If name is explicitly "user_email", it's not a username
  ) {
    return "username";
  }

  // 3. EMAIL
  if (el.type === "email" || /email|e-mail|mail/i.test(str)) {
    if (/secondary|alt|backup|other/i.test(str)) return "secondaryEmail";
    return "email";
  }

  // 4. WEBSITE / SOCIAL
  if (/website|site|url|domain|link|web.?address/i.test(str)) {
    if (/social|twitter|facebook|linkedin|instagram/i.test(str))
      return "social";
    return "website";
  }

  // --- SPECIFIC DETECTORS ---
  if (/fax/i.test(str)) return "fax";
  if (/birth|dob|date.?of.?birth/i.test(str)) return "dob";
  if (/gender|sex\b|male|female/i.test(str)) return "gender";
  if (/language/i.test(str)) return "language";
  if (/time.?zone/i.test(str)) return "timezone";
  if (/size|employees|count/i.test(str)) return "companySize";
  if (/price|budget|cost|amount/i.test(str)) return "price";
  if (/billing/i.test(str)) return "billing";
  if (/shipping/i.test(str)) return "shipping";

  if (
    /category|cat.?id|type.?of.?post|section|classified/i.test(str) ||
    el.id === "catId" ||
    el.name === "catId"
  ) {
    return "category";
  }

  if (/company|business|organization/i.test(str)) return "company";
  if (/phone|mobile|tel|cell/i.test(str)) return "phone";

  if (
    /address|street|location|city|state|province|zip|post.?code|country/i.test(
      str
    )
  ) {
    if (/city|town/i.test(str)) return "city";
    if (/state|province|region/i.test(str)) return "region";
    if (/zip|post.?code/i.test(str)) return "zip";
    if (/country/i.test(str)) return "country";
    return "address";
  }

  if (/name|person|contact/i.test(str)) {
    if (/first|given|fname/i.test(str)) return "firstName";
    if (/last|surname|lname/i.test(str)) return "lastName";
    return "firstName";
  }

  if (/subject|topic|re:/i.test(str)) return "subject";
  if (/title|headline|job/i.test(str)) return "title";

  return "unknown";
}

// --- INTELLIGENT QUAD-CLICK LOGIC ---
let clicks = 0;
document.addEventListener(
  "click",
  async (e) => {
    const isInteractive = e.target.closest(
      'a, button, input, textarea, select, label, [role="button"]'
    );
    if (isInteractive) return;

    clicks++;
    if (clicks === 1) setTimeout(() => (clicks = 0), 600);

    if (clicks === 4) {
      clicks = 0;

      // MODIFIER COMBINATIONS
      const isSelectMode = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey; // Ctrl + 4 clicks
      const isSubmitMode = (e.ctrlKey || e.metaKey) && e.altKey; // Ctrl + Alt + 4 clicks
      const isHardSelectMode = (e.ctrlKey || e.metaKey) && e.shiftKey; // Ctrl + Shift + 4 clicks

      // NEW: Shift + 4 Clicks (Hard Input Mode)
      const isHardInputMode =
        e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;

      // Modified: Plain 4 clicks (Regular Fill) - Ensure Shift is NOT held
      const isRegularFill =
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;

      const { data } = await getProfileData();
      if (!data || Object.keys(data).length === 0) {
        toast("⚠️ No data saved! Open popup → fill → save");
        return;
      }

      // ────────────────────────────────
      //  ★★★ CTRL + ALT + 4 CLICKS = AUTO SUBMIT (ULTRA SAFE VERSION) ★★★
      // ────────────────────────────────
      if (isSubmitMode) {
        const submitKeywords = [
          "submit",
          "post",
          "publish",
          "register",
          "sign up",
          "signup",
          "login",
          "sign in",
          "signin",
          "create",
          "save",
          "continue",
          "post ad",
          "post listing",
          "place order",
          "complete",
          "finish",
          "proceed",
          "next",
          "add listing",
          "list now",
        ];

        const buttons = Array.from(
          document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], a[role="button"]'
          )
        ).filter((btn) => {
          // 1. Must be visible
          if (
            !btn.offsetParent ||
            btn.offsetWidth < 30 ||
            btn.offsetHeight < 20
          )
            return false;
          if (btn.disabled) return false;

          // 2. Text must contain a submit keyword
          const text = (
            btn.textContent ||
            btn.value ||
            btn.title ||
            btn.getAttribute("aria-label") ||
            ""
          )
            .toLowerCase()
            .trim();
          if (!submitKeywords.some((kw) => text.includes(kw))) return false;

          // 3. CRITICAL: EXCLUDE ANY BUTTON INSIDE EDITORS OR TOOLBARS
          const parent = btn.closest("div, span, td, li");
          if (!parent) return true;

          const parentText = parent.textContent.toLowerCase();
          const parentClass = (parent.className || "").toLowerCase();
          const parentId = (parent.id || "").toLowerCase();

          // Blacklist known editor toolbar patterns
          const blacklist = [
            "mce",
            "cke",
            "tox",
            "ql-",
            "editor",
            "toolbar",
            "format",
            "bold",
            "italic",
            "bullet",
            "list",
            "wp-",
            "admin",
            "dashboard",
            "menu",
            "nav",
            "sidebar",
            "header",
            "footer",
            "modal",
            "popup",
          ];

          if (
            blacklist.some(
              (term) => parentClass.includes(term) || parentId.includes(term)
            )
          ) {
            return false;
          }

          // Extra safety: if button is tiny or inside a <b>, <strong>, <i>, etc. → skip
          if (
            btn.closest(
              'b, strong, i, em, u, span[style*="bold"], div[style*="font-weight"]'
            )
          )
            return false;

          return true;
        });

        if (buttons.length > 0) {
          const target = buttons[0];
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            target.click();
            toast(`Submitted: "${target.textContent.trim() || target.value}"`);
          }, 500);
        } else {
          toast("No real submit button found");
        }

        return; // Stops everything else — 100% isolated
      }

      // ────────────────────────────────
      //  ★★★ CTRL + SHIFT + 4 CLICKS = HARD SELECT (CLEANUP MODE) ★★★
      // ────────────────────────────────
      if (isHardSelectMode) {
        let fixedCount = 0;
        const allSelects = Array.from(document.querySelectorAll("select"));

        // Helper to fire events
        const fireEvents = (el) => {
          try {
            el.dispatchEvent(new Event("focus", { bubbles: true }));
            el.dispatchEvent(new Event("click", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } catch (e) {}
        };

        allSelects.forEach((el) => {
          // 1. Safety Checks: Must be visible and enabled
          if (el.disabled || el.offsetParent === null) return;

          // 2. Check if it's already filled
          // We consider it "Empty" if value is blank OR text says "Select/Choose"
          const currentTxt = (
            el.options[el.selectedIndex]?.text || ""
          ).toLowerCase();
          const currentVal = el.value;
          const isFilled =
            currentVal !== "" &&
            !currentTxt.includes("select") &&
            !currentTxt.includes("choose") &&
            !currentTxt.includes("none");

          if (isFilled) return; // Don't touch what the Core Logic already did!

          // 3. Find a valid option to pick
          const validIndices = [];
          for (let i = 0; i < el.options.length; i++) {
            const txt = (el.options[i].text || "").toLowerCase();
            const val = el.options[i].value;

            // Must not be disabled, empty, or a placeholder label
            if (
              !el.options[i].disabled &&
              val !== "" &&
              !txt.includes("select") &&
              !txt.includes("choose")
            ) {
              validIndices.push(i);
            }
          }

          // 4. Select Random Valid Option
          if (validIndices.length > 0) {
            const randomIdx =
              validIndices[Math.floor(Math.random() * validIndices.length)];
            el.selectedIndex = randomIdx;
            fireEvents(el);
            fixedCount++;
          } else if (el.options.length > 1) {
            // Desperation move: just pick index 1 if logic fails
            el.selectedIndex = 1;
            fireEvents(el);
            fixedCount++;
          }
        });

        if (fixedCount > 0)
          toast(`🧹 Hard Select: Filled ${fixedCount} missed dropdowns!`);
        else toast("✅ All dropdowns appear to be filled.");

        return; // Stop here
      }

      // ────────────────────────────────
      //  ★★★ SHIFT + 4 CLICKS = HARD INPUT (CLEANUP TEXT) ★★★
      // ────────────────────────────────
      if (isHardInputMode) {
        let filledCount = 0;

        const inputs = document.querySelectorAll("input, textarea");

        inputs.forEach((el) => {
          // 1. Safety Checks
          if (
            el.readOnly ||
            el.disabled ||
            el.type === "hidden" ||
            el.offsetParent === null
          )
            return;
          const forbiddenTypes = [
            "submit",
            "button",
            "image",
            "reset",
            "file",
            "checkbox",
          ];
          if (forbiddenTypes.includes(el.type)) return;

          // 2. Only target EMPTY fields
          if (el.value && el.value.trim() !== "") return; // Don't overwrite existing work!

          // 3. Determine Value
          const type = getFieldType(el);
          let fakeVal = generateFake(type);

          // Fallback if generateFake returns null (e.g., unknown text fields)
          if (!fakeVal) {
            if (type === "email") fakeVal = "info@example.com";
            else if (type === "phone") fakeVal = "555-0123";
            else if (type === "number") fakeVal = "1";
            else fakeVal = "N/A"; // Safe fallback for unknown text areas
          }

          // 4. Force Fill
          smartFill(el, fakeVal);
          filledCount++;
        });

        if (filledCount > 0)
          toast(`✍️ Hard Fill: Force filled ${filledCount} empty inputs!`);
        else toast("✅ All text fields appear to be filled.");

        return; // Stop here
      }

      // ============================================================
      // MODE 1: SMART DROPDOWN SEQUENCE (CTRL + 4 CLICKS)
      // ============================================================
      if (isSelectMode) {
        const allSelects = Array.from(document.querySelectorAll("select"));
        if (allSelects.length === 0) {
          toast("⚠️ No dropdowns found.");
          return;
        }

        // --- HELPER: FIRE EVENTS (Trigger UI Updates) ---
        const fireEvents = (el) => {
          try {
            el.dispatchEvent(new Event("focus", { bubbles: true }));
            el.dispatchEvent(new Event("click", { bubbles: true })); // Added click
            el.dispatchEvent(new Event("change", { bubbles: true }));
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("blur", { bubbles: true }));
          } catch (e) {
            console.log(e);
          }
        };

        // --- HELPER: ROBUST MATCHER ---
        const processSingleSelect = (element, forcedType = null) => {
          // Unhide element if it's hidden (Fixes opacity: 0 issue)
          if (element.style.opacity === "0") element.style.opacity = "1";
          if (element.style.visibility === "hidden")
            element.style.visibility = "visible";

          // 1. PRIORITY: USA
          if (forcedType === "country") {
            for (let i = 0; i < element.options.length; i++) {
              const t = (element.options[i].text || "").toLowerCase().trim();
              if (["united states", "usa", "us"].includes(t)) {
                element.selectedIndex = i;
                fireEvents(element);
                return true;
              }
            }
          }

          // 2. GET DATA
          const type = forcedType || getFieldType(element);
          let userVal = null;
          if (type === "region")
            userVal = data["region"] || data["state"] || data["province"] || "";
          else userVal = data[type] || "";

          userVal = userVal.toLowerCase().trim();
          if (!userVal) return false;

          // 3. FIND BEST MATCH
          // We look for the option that matches the user's input best
          let bestMatchIndex = -1;

          for (let i = 0; i < element.options.length; i++) {
            const optText = (element.options[i].text || "")
              .toLowerCase()
              .trim();
            const optVal = (element.options[i].value || "")
              .toLowerCase()
              .trim();
            if (optVal === "" || optText.includes("select")) continue; // Skip placeholders

            // A. Exact Match (Highest Priority)
            if (optText === userVal || optVal === userVal) {
              bestMatchIndex = i;
              break; // Stop looking, we found perfection
            }

            // B. "New York City" vs "New York" Match
            // If User says "New York City", but Option is "New York" -> Match
            // If User says "New York", but Option is "New York City" -> Match
            const userSimple = userVal.replace(/\bcity\b/g, "").trim();
            const optSimple = optText.replace(/\bcity\b/g, "").trim();

            if (userSimple === optSimple && userSimple.length > 2) {
              bestMatchIndex = i;
            }
          }

          if (bestMatchIndex > -1) {
            element.selectedIndex = bestMatchIndex;
            element.options[bestMatchIndex].selected = true; // Force selection state
            fireEvents(element);
            toast(`✅ Found: ${element.options[bestMatchIndex].text}`);
            return true;
          }

          return false;
        };

        // --- HELPER: WAIT FOR LIST TO POPULATE ---
        const waitForOptions = async (element) => {
          let attempts = 0;
          // Wait while options are less than 2 (usually just "Select...")
          while (element.options.length < 2 && attempts < 30) {
            await wait(200); // Check every 200ms
            attempts++;
            // Pulse opacity to show it's "thinking"
            element.style.opacity = attempts % 2 === 0 ? "0.5" : "1";
          }
          element.style.opacity = "1"; // Ensure visible
        };

        // --- IDENTIFY DROPDOWNS ---
        let countryEl = null,
          regionEl = null,
          cityEl = null,
          otherSelects = [];
        allSelects.forEach((s) => {
          if (s.disabled) return; // Don't select disabled initially
          let type = getFieldType(s);
          const nameStr = (s.id + " " + s.name).toLowerCase();

          // Strict ID checks because getFieldType can be fuzzy
          if (nameStr.includes("country")) type = "country";
          else if (nameStr.includes("state") || nameStr.includes("region"))
            type = "region";
          else if (nameStr.includes("city")) type = "city";

          if (type === "country") countryEl = s;
          else if (type === "region") regionEl = s;
          else if (type === "city") cityEl = s;
          else otherSelects.push({ el: s, type: type });
        });

        // --- EXECUTE SEQUENCE ---
        // --- EXECUTE SEQUENCE ---
        (async () => {
          // === NEW: MULTI-TARGET CATEGORY LOGIC v2 ===
          if (data.category) {
            const categorySelect = allSelects.find(
              (s) =>
                getFieldType(s) === "category" ||
                /cat.?id|category|section|type/i.test(s.id + s.name)
            );

            if (categorySelect) {
              // 1. Prepare the UI
              if (categorySelect.disabled) categorySelect.disabled = false;
              if (categorySelect.style.opacity === "0")
                categorySelect.style.opacity = "1";

              // 2. Build the Priority Search List
              // Split user input by slash (/) or comma (,), trim whitespace, remove empty
              const userTargets = data.category
                .split(/[\/,]/)
                .map((s) => s.trim().toLowerCase())
                .filter((s) => s.length > 0);

              // Your Hardcoded Safety Net
              const fallbackTargets = [
                "other",
                "general",
                "server",
                "other services",
                "miscellaneous",
                "announcements",
                "business",
              ];

              // Combine: User Wishes First -> Safety Net Second
              const searchList = [...userTargets, ...fallbackTargets];

              let found = false;
              let matchedTerm = "";

              // 3. The Hunter Loop
              // We look for the FIRST term in the list that exists in the dropdown
              outerLoop: for (const term of searchList) {
                for (let i = 0; i < categorySelect.options.length; i++) {
                  // Clean the option text (remove dashes, spaces, non-breaking spaces)
                  const optText = categorySelect.options[i].textContent
                    .toLowerCase()
                    .replace(/^[-\s>&nbsp;]+/, "")
                    .trim();

                  // CHECK: Does "Health and Beauty" include "beauty"? YES.
                  if (optText.includes(term)) {
                    categorySelect.selectedIndex = i;
                    fireEvents(categorySelect);

                    // Visual Feedback
                    categorySelect.style.border = "2px solid #00b894"; // Green border
                    toast(
                      `📂 Category Matched: "${term}" → ${categorySelect.options[i].text}`
                    );

                    found = true;
                    matchedTerm = term;
                    break outerLoop; // Stop searching, we found a match
                  }
                }
              }

              // 4. Final Fail-Safe (Random)
              // If even the fallbacks ("Other", "General") failed, pick index 1 or 2 just to fill it.
              if (!found && categorySelect.options.length > 1) {
                // Avoid index 0 if it says "Select Category"
                const safeIndex = categorySelect.options.length > 2 ? 2 : 1;
                categorySelect.selectedIndex = safeIndex;
                fireEvents(categorySelect);
                toast(
                  `⚠️ No match found. Auto-picked: ${categorySelect.options[safeIndex].text}`
                );
              }

              // Wait a moment for the site to load sub-fields (if any)
              await wait(800);
            }
          }
          // === END OF CATEGORY LOGIC ===

          // 1. Country
          if (countryEl) {
            toast("Setting Country...");
            processSingleSelect(countryEl, "country");

            toast("Waiting 1s for State/Region...");
            await wait(1000);
          }
          // ... rest of your original code continues perfectly ...

          // 1. Country
          if (countryEl) {
            toast("🇺🇸 Setting Country...");
            processSingleSelect(countryEl, "country");

            // HARD WAIT: 3 Seconds for Region list to load
            toast("⏳ Waiting 1s for State/Region...");
            await wait(1000);
          }

          // 2. Region
          if (regionEl) {
            // Ensure it's enabled
            if (regionEl.disabled) regionEl.disabled = false;

            // Double check: ensure options are actually there
            await waitForOptions(regionEl);

            toast("🗺️ Setting Region...");
            processSingleSelect(regionEl, "region");

            // HARD WAIT: 3 Seconds for City list to load
            toast("⏳ Waiting 1s for Cities...");
            await wait(1000);
          }

          // 3. City
          if (cityEl) {
            // Ensure it's enabled
            if (cityEl.disabled) cityEl.disabled = false;

            // Double check: ensure options are actually there
            await waitForOptions(cityEl);

            toast("🏙️ Setting City...");
            const found = processSingleSelect(cityEl, "city");

            if (!found) {
              // Fallback if specific city not found
              toast("🎲 City not found, picking random...");
              if (cityEl.options.length > 1) {
                cityEl.selectedIndex =
                  Math.floor(Math.random() * (cityEl.options.length - 1)) + 1;
                fireEvents(cityEl);
              }
            }
          }

          // 4. Others
          otherSelects.forEach((o) => processSingleSelect(o.el, o.type));

          // CHECK FOR LEFTOVERS
          const remainingMissed = Array.from(
            document.querySelectorAll("select")
          ).filter((s) => {
            if (s.disabled || s.offsetParent === null) return false;
            const txt = (s.options[s.selectedIndex]?.text || "").toLowerCase();
            return (
              s.value === "" || txt.includes("select") || txt.includes("choose")
            );
          });

          if (remainingMissed.length > 0) {
            toast(
              `⚡ Done! (⚠️ ${remainingMissed.length} missed → Use Ctrl+Shift+Click)`
            );
          } else {
            toast(`⚡ Sequence Complete!`);
          }
        })();

        return;
      }

      // ============================================================
      // MODE 2: TEXT FIELDS & INPUTS (STANDARD 4 CLICKS)
      // ============================================================
      let filled = 0;
      let checked = 0;

      document.querySelectorAll("input, textarea").forEach((el) => {
        if (el.readOnly || el.disabled) return;
        const forbiddenTypes = [
          "submit",
          "button",
          "image",
          "reset",
          "hidden",
          "file",
          "checkbox",
          "radio",
        ];
        if (forbiddenTypes.includes(el.type)) return;

        let type = getFieldType(el);
        let valueToFill = null;

        if (data[type] && data[type].trim() !== "") {
          valueToFill = data[type];
        } else {
          if (type === "subject" && data["title"]) {
            valueToFill = data["title"];
          } else {
            valueToFill = generateFake(type);
          }
        }

        if (valueToFill) {
          smartFill(el, valueToFill);
          filled++;
        } else {
          smartFill(el, "Business");
          filled++;
        }
      });

      // Checkbox Handling
      document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        if (cb.disabled || cb.checked) return;
        const label = (
          cb.closest("label")?.textContent ||
          cb.parentElement?.textContent ||
          cb.getAttribute("aria-label") ||
          ""
        ).toLowerCase();
        if (
          /agree|accept|consent|terms|privacy|policy|newsletter|confirmation|subscribe|yes|opt.?in/i.test(
            label
          )
        ) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
          checked++;
        }
      });

      // ────────────────────────────────────────────────────────────
      //  ★★★ PENNY-PINCHER MODE v2 (Deep Scan) ★★★
      // ────────────────────────────────────────────────────────────
      const radioGroups = {};

      // 1. Group all visible radio buttons by Name
      document.querySelectorAll('input[type="radio"]').forEach((rb) => {
        if (rb.disabled || rb.offsetParent === null) return;
        const name = rb.name || "orphan_" + Math.random();
        if (!radioGroups[name]) radioGroups[name] = [];
        radioGroups[name].push(rb);
      });

      // 2. Analyze each group
      Object.values(radioGroups).forEach((group) => {
        let bestCandidate = null;
        let highestScore = -Infinity;

        group.forEach((rb) => {
          // --- STEP A: DEEP TEXT EXTRACTION ---
          let text = "";

          // 1. Check explicit <label> tag
          if (rb.id) {
            const labelNode = document.querySelector(`label[for="${rb.id}"]`);
            if (labelNode) text += " " + labelNode.textContent;
          }

          // 2. Check Immediate Parent Text (e.g. <label><input> Text</label>)
          if (rb.parentElement) text += " " + rb.parentElement.textContent;

          // 3. CRITICAL FIX: Check Grandparent/Container Text
          // This solves the "div.upay_itemform" issue where text is a sibling of the parent span
          const container = rb.closest("div, li, td, tr");
          if (container) {
            // We only take the container text if it's not HUGE (avoid reading whole page)
            if (container.innerText.length < 400) {
              text += " " + container.innerText;
            }
          }

          // Normalize
          text = text.toLowerCase().replace(/\s+/g, " ").trim();

          // --- STEP B: SCORING LOGIC ---
          let score = 0;

          // ☠️ DANGER: MONEY PATTERNS
          // Matches: 20USD, $5, 5 USD, 5 + 5, Premium, Highlight, Pack
          if (
            /\$|usd|eur|gbp|aud|cad/.test(text) || // Currency symbols
            /\b\d+\s?usd/i.test(text) || // "20USD"
            /premium|highlight|featured|pack/i.test(text) || // Upsell keywords
            /best deal|upay/i.test(text) // Aggressive marketing
          ) {
            score -= 100;
          }

          // 🛡️ SAFETY: FREE / DECLINE PATTERNS
          // Matches: "No,thanks", "Free ad", "Standard", "0.00"
          if (
            /no,?\s?thanks/i.test(text) || // "No,thanks"
            /i do not want/i.test(text) || // "I do not want extra exposure"
            /free ad/i.test(text) || // "submit a free ad"
            /basic|standard/i.test(text) || // Standard tiers
            /\b0(\.00)?\s?(usd|\$)/i.test(text) // 0 USD
          ) {
            score += 100;
          }

          // If this specific option is checked by default AND costs money, we must nuke it.
          // (Score calculation handles the selection, but we note it for debugging)

          if (score > highestScore) {
            highestScore = score;
            bestCandidate = rb;
          }
        });

        // 3. Execute
        // Only click if we found a candidate and it's not already checked
        // OR if the currently checked item is "Dangerous" (negative score)
        if (bestCandidate) {
          // If the best candidate is already checked, we are good.
          // If not, we switch to it.
          if (!bestCandidate.checked) {
            bestCandidate.click();
            bestCandidate.checked = true;
            bestCandidate.dispatchEvent(new Event("change", { bubbles: true }));
            // Visual confirmation for the user
            bestCandidate.style.boxShadow = "0 0 0 4px #00b894"; // Green Ring
            toast("🛡️ Switched to Free Option");
            checked++;
          }
        }
      });

      // ... (smartFill logic above remains the same) ...

      // ────────────────────────────────────────────────────────────
      //  ★★★ UNIVERSAL FILE UPLOADER TRIGGER (NEW) ★★★
      // ────────────────────────────────────────────────────────────
      const fileInputs = Array.from(
        document.querySelectorAll('input[type="file"]')
      );
      const validUploaders = fileInputs.filter((el) => !el.disabled);

      if (validUploaders.length > 0) {
        const uploader = validUploaders[0];

        // Scroll so you see it
        if (uploader.offsetParent !== null) {
          uploader.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTimeout(() => {
          toast("📂 Opening File Picker...");

          // Handle hidden inputs (common in modern designs)
          const isHidden =
            uploader.style.display === "none" ||
            uploader.style.visibility === "hidden" ||
            uploader.style.opacity === "0" ||
            uploader.offsetParent === null;

          if (isHidden && uploader.id) {
            const label = document.querySelector(`label[for="${uploader.id}"]`);
            if (label) {
              label.click();
              return;
            }
          }
          // Standard Click
          uploader.click();
        }, 500);
      }

      // CHECK FOR EMPTY INPUTS
      const missedInputs = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'
        )
      ).filter(
        (el) =>
          !el.disabled &&
          !el.readOnly &&
          el.offsetParent !== null &&
          el.value === ""
      );

      if (missedInputs.length > 0) {
        toast(
          `⚡ Filled ${filled} | ${checked} Boxes (⚠️ ${missedInputs.length} empty → Use Shift+Click)`
        );
      } else {
        toast(`⚡ Filled ${filled} Text Fields + ${checked} Boxes!`);
      }
    } // End of isRegularFill block
  },
  true
);

// ────────────────────────────────────────────────────────────
//  ★★★ SMART CONTEXT MENU (GLITCH-FREE VERSION) ★★★
// ────────────────────────────────────────────────────────────
let activeMenuInput = null;

// 1. TRIGGER: Open Menu on Focus
document.addEventListener("focusin", async (e) => {
  // 🛑 GATEKEEPER: If disabled via Ctrl+X, stop here.
  if (!isSmartMenuEnabled) return;

  const input = e.target;

  // Filter unwanted elements
  if (!["INPUT", "TEXTAREA", "SELECT"].includes(input.tagName)) return;
  if (
    [
      "submit",
      "button",
      "image",
      "reset",
      "hidden",
      "file",
      "checkbox",
      "radio",
    ].includes(input.type)
  )
    return;

  // Prevent loop if already active
  if (activeMenuInput === input && suggestionBox) return;
  activeMenuInput = input;

  // Fetch Data
  const { data } = await getProfileData();
  if (!data || Object.keys(data).length === 0) return;

  // Remove existing menu if any
  if (suggestionBox) suggestionBox.remove();

  // Render the new menu
  createSmartMenu(input, data);
});

// 2. CLOSER: Close Menu on Click Outside
document.addEventListener("mousedown", (e) => {
  if (!suggestionBox) return;

  // CRITICAL FIX: Do not close if clicking the Input itself or the Menu itself
  if (suggestionBox.contains(e.target) || e.target === activeMenuInput) {
    return;
  }

  // Close
  suggestionBox.remove();
  suggestionBox = null;
  activeMenuInput = null;
});

// 3. BUILDER: Generate the UI
// ...existing code...
function createSmartMenu(input, data) {
  // Defensive cleanup of any previous menu
  if (suggestionBox) {
    try {
      if (typeof suggestionBox._cleanup === "function")
        suggestionBox._cleanup();
      else suggestionBox.remove();
    } catch (e) {}
    suggestionBox = null;
  }

  const detectedType = getFieldType(input);

  // Define Fields & Match Logic
  let fields = [
    { key: "username", label: "👤 Username", typeMatch: ["username"] },
    { key: "email", label: "📧 Email", typeMatch: ["email", "secondaryEmail"] },
    { key: "password", label: "🔑 Password", typeMatch: ["password"] },
    { key: "firstName", label: "📝 First Name", typeMatch: ["firstName"] },
    { key: "lastName", label: "📝 Last Name", typeMatch: ["lastName"] },
    { key: "website", label: "🔗 Website URL", typeMatch: ["website"] },
    { key: "company", label: "🏢 Company", typeMatch: ["company"] },
    {
      key: "title",
      label: "🏷️ Title / Subject",
      typeMatch: ["title", "subject"],
    },
    { key: "phone", label: "📞 Phone", typeMatch: ["phone", "fax"] },
    { key: "address", label: "📍 Address", typeMatch: ["address"] },
    { key: "city", label: "🏙️ City", typeMatch: ["city"] },
    { key: "zip", label: "📮 Zip / Postal", typeMatch: ["zip"] },
    { key: "region", label: "🗺️ State / Region", typeMatch: ["region"] },
    { key: "country", label: "🏳️ Country", typeMatch: ["country"] },
    { key: "category", label: "📂 Category", typeMatch: ["category"] },
  ];

  // SORT: Prioritize the detected type
  fields.sort((a, b) => {
    const aMatches = a.typeMatch.includes(detectedType);
    const bMatches = b.typeMatch.includes(detectedType);
    return bMatches - aMatches;
  });

  // Create Container
  suggestionBox = document.createElement("div");
  suggestionBox.className = "llb-suggestion";
  // Start hidden until positioned to avoid flicker
  suggestionBox.style.position = "absolute";
  suggestionBox.style.visibility = "hidden";
  suggestionBox.style.transformOrigin = "top center";

  // Header
  const confidenceLabel =
    detectedType !== "unknown"
      ? `Detected: ${detectedType.toUpperCase()}`
      : "Select Data";
  suggestionBox.innerHTML = `
    <div class="llb-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span>⚡ ${confidenceLabel}</span>
        <span id="llb-close-btn" style="cursor: pointer; font-size: 24px; line-height: 20px; opacity: 0.8;">&times;</span>
    </div>`;

  // Close Button Logic (use cleanup)
  suggestionBox
    .querySelector("#llb-close-btn")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      if (suggestionBox && typeof suggestionBox._cleanup === "function")
        suggestionBox._cleanup();
    });

  // Render Data Items
  fields.forEach((f) => {
    if (!data[f.key]) return; // Skip empty user data

    let display = data[f.key];
    if (f.key === "password") display = "••••••••";

    const isMatch = f.typeMatch.includes(detectedType);
    const item = document.createElement("div");
    item.className = "llb-item";

    // Highlight the Best Match
    if (isMatch) {
      item.style.background = "#e3f2fd";
      item.style.borderLeft = "4px solid #2196f3";
      item.innerHTML = `
          <div style="width:100%">
            <div style="display:flex; justify-content:space-between; align-items:center;">
               <strong>${f.label}</strong>
               <span style="font-size:9px; color:#2196f3; font-weight:bold; background:#fff; padding:2px 5px; border-radius:4px; border:1px solid #2196f3;">BEST MATCH</span>
            </div>
            <small style="color:#333; font-weight:500;">${display}</small>
          </div>`;
    } else {
      item.innerHTML = `<strong>${f.label}</strong><small>${display}</small>`;
    }

    // Click to Fill (use cleanup)
    item.onmousedown = (e) => {
      // Use mousedown to prevent focus loss issues
      e.preventDefault();
      e.stopPropagation();
      smartFill(input, data[f.key]);
      if (suggestionBox && typeof suggestionBox._cleanup === "function")
        suggestionBox._cleanup();
      toast(`${f.label} inserted`);
    };
    suggestionBox.appendChild(item);
  });

  // Render Fake Generator Option
  const fakeLabel =
    detectedType !== "unknown"
      ? `Generate Fake ${detectedType}`
      : "Generate Fake Data";
  const fakeItem = document.createElement("div");
  fakeItem.className = "llb-item";
  fakeItem.style.background = "#fff0f0";
  fakeItem.innerHTML = `<strong>🎲 ${fakeLabel}</strong>`;

  fakeItem.onmousedown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const fake = generateFake(detectedType);
    const val = fake || "N/A";
    smartFill(input, val);
    if (suggestionBox && typeof suggestionBox._cleanup === "function")
      suggestionBox._cleanup();
    toast(`Generated: ${val}`);
  };
  suggestionBox.appendChild(fakeItem);

  // Append to DOM
  document.body.appendChild(suggestionBox);

  // Positioning helpers: ALWAYS below the input
  const margin = 8;

  // ...existing code...
  const applyPosition = () => {
    if (!suggestionBox || !document.body.contains(suggestionBox)) return;
    const rect = input.getBoundingClientRect();
    const sx = window.scrollX || window.pageXOffset || 0;
    const sy = window.scrollY || window.pageYOffset || 0;

    // Measure after append; getBoundingClientRect is reliable
    const sbRect = suggestionBox.getBoundingClientRect();
    const sbWidth = sbRect.width || 350;

    // Ensure the menu fits the available space below the input and becomes scrollable
    //  - availableBelow: pixels from input bottom to viewport bottom (minus margin)
    //  - capHeight: also cap at 70% of viewport for consistency with CSS
    const availableBelow = Math.max(
      40,
      window.innerHeight - rect.bottom - margin - 10
    );
    const capHeight = Math.round(window.innerHeight * 0.7);
    const finalMax = Math.max(120, Math.min(availableBelow, capHeight));

    suggestionBox.style.maxHeight = `${finalMax}px`;
    suggestionBox.style.overflowY = "auto";
    suggestionBox.style.boxSizing = "border-box";

    // Compute left and clamp to viewport (account for scroll)
    const leftRaw = Math.round(rect.left + sx);
    const minLeft = sx + margin;
    const maxLeft = sx + Math.max(margin, window.innerWidth - sbWidth - margin);
    const left = Math.min(Math.max(leftRaw, minLeft), maxLeft);

    const top = Math.round(rect.bottom + sy + 5); // ALWAYS below

    suggestionBox.style.left = `${left}px`;
    suggestionBox.style.top = `${top}px`;
    suggestionBox.style.visibility = "visible";
  };
  // ...existing code...

  // Reposition handler for scroll/resize
  const reposition = () => {
    if (!suggestionBox || !document.body.contains(suggestionBox)) {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onDocMouseDown, true);
      return;
    }
    applyPosition();
  };

  // Click outside handler
  const onDocMouseDown = (ev) => {
    if (!suggestionBox) return;
    if (suggestionBox.contains(ev.target) || ev.target === input) return;
    if (typeof suggestionBox._cleanup === "function") suggestionBox._cleanup();
  };

  // Cleanup to remove listeners and element
  const cleanup = () => {
    try {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onDocMouseDown, true);
    } catch (e) {}
    try {
      if (suggestionBox && suggestionBox.parentElement)
        suggestionBox.parentElement.removeChild(suggestionBox);
    } catch (e) {}
    suggestionBox = null;
    activeMenuInput = null;
  };

  // Attach cleanup method
  suggestionBox._cleanup = cleanup;

  // Initial position + listeners
  applyPosition();
  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition);
  document.addEventListener("mousedown", onDocMouseDown, true);
}
// ...existing code...
// Helper to pause execution
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ────────────────────────────────
//  ★★★ NAVIGATION SHORTCUTS ★★★
// ────────────────────────────────
document.addEventListener("dblclick", (e) => {
  // 1. Shift + Alt + Double Click -> Converter (NO Refresh)
  if (e.altKey && e.shiftKey) {
    chrome.runtime.sendMessage({ type: "ACTIVATE_CONVERTER" });
    return; // Stop here so we don't trigger the other one
  }

  // 2. Alt + Double Click -> Fakemail (Refreshes)
  if (e.altKey) {
    chrome.runtime.sendMessage({ type: "ACTIVATE_FAKEMAIL" });
  }
});

// ============================================================
// ⚡ SUPER RIGHT-CLICK HANDLER v3 (Agency Hub Compatible)
// ============================================================
(() => {
  let lastRightClickTime = 0;
  let currentRightClickTarget = null;

  document.addEventListener(
    "contextmenu",
    (e) => {
      if (!e.ctrlKey && !e.altKey) return;

      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastRightClickTime;

      if (timeDiff < 600) {
        // --- DOUBLE CLICK DETECTED ---
        e.preventDefault();
        e.stopPropagation();

        currentRightClickTarget = e.target;
        lastRightClickTime = 0;

        // ➤ JOB 1: TEXT MENU (Ctrl + Double Right Click)
        if (e.ctrlKey) {
          const isOverride = e.shiftKey;
          if (isOverride) {
            toast("⚙️ Opening Menu (Override)...");
            createOverlayMenu(e.clientX, e.clientY, true);
          } else {
            checkMemoryAndExecute(e.clientX, e.clientY);
          }
          return;
        }

        // ➤ JOB 2: AUTO SUBMIT (Alt + Double Right Click)
        if (e.altKey) {
          toast("🚀 Auto Submitting...");
          triggerAutoSubmit();
          return;
        }
      } else {
        // First click
        e.preventDefault();
        e.stopPropagation();
        lastRightClickTime = currentTime;
        removeOverlayMenu();
      }
    },
    true
  );

  // --- MEMORY LOGIC ---
  function checkMemoryAndExecute(x, y) {
    const domain = window.location.hostname;

    // UPDATED: Read from LOCAL storage and look for 'current_flat_data'
    chrome.storage.local.get(
      ["current_flat_data", `pref_${domain}`],
      (data) => {
        const savedType = data[`pref_${domain}`];
        // EXTRACT MASTER HTML FROM NEW STRUCTURE
        const master = data.current_flat_data?.masterHTML || "";

        if (savedType && master) {
          toast(`⚡ Auto-Pasting (${savedType})...`);

          let content = "";
          let isRich = false;

          if (savedType === "HTML Code (Clean)") content = cleanHtml(master);
          else if (savedType === "Markdown (Inline)")
            content = toMarkdown(master);
          else if (savedType === "BBCode") content = toBBCode(master);
          else if (savedType === "Markdown (Reference)")
            content = toReferenceMarkdown(master);
          else if (savedType === "Rich Text") {
            content = master;
            isRich = true;
          } else {
            createOverlayMenu(x, y, false);
            return;
          }
          handleSnippetSelection(content, isRich, false);
        } else {
          toast("⚡ Opening Text Menu...");
          createOverlayMenu(x, y, false);
        }
      }
    );
  }

  // --- CONVERSION ENGINES (Sanitized) ---
  function cleanHtml(html) {
    // Remove &nbsp; and standard cleanup
    if (!html) return "";
    let clean = html.replace(/&nbsp;/g, " ");
    return clean.replace(/^\s*<p[^>]*>/i, "").replace(/<\/p>\s*$/i, "");
  }

  function toMarkdown(html) {
    if (!html) return "";
    // 1. Sanitize Non-Breaking Spaces
    html = html.replace(/&nbsp;/g, " ");

    let temp = document.createElement("div");
    temp.innerHTML = html;

    temp.querySelectorAll("a").forEach((a) => {
      // Trim anchor text to avoid "[  Link ]"
      a.replaceWith(`[${a.textContent.trim()}](${a.href})`);
    });
    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`**${b.textContent}**`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`*${i.textContent}*`));

    let text = temp.innerHTML.replace(/<br\s*\/?>/gi, "\n");
    return text.replace(/<[^>]+>/g, "").trim();
  }

  function toReferenceMarkdown(html) {
    if (!html) return "";
    // 1. Sanitize Non-Breaking Spaces
    html = html.replace(/&nbsp;/g, " ");

    let temp = document.createElement("div");
    temp.innerHTML = html;
    let refs = [];
    let counter = 1;

    temp.querySelectorAll("a").forEach((a) => {
      const currentRef = counter++;
      // Trim the text inside the brackets
      a.replaceWith(`[${a.textContent.trim()}][${currentRef}]`);
      refs.push(`[${currentRef}]: ${a.href}`);
    });

    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`**${b.textContent}**`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`*${i.textContent}*`));

    return (
      temp.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .trim() + (refs.length ? "\n\n" + refs.join("\n") : "")
    );
  }

  function toBBCode(html) {
    if (!html) return "";
    // 1. Sanitize Non-Breaking Spaces
    html = html.replace(/&nbsp;/g, " ");

    let temp = document.createElement("div");
    temp.innerHTML = html;
    temp
      .querySelectorAll("a")
      .forEach((a) =>
        a.replaceWith(`[url=${a.href}]${a.textContent.trim()}[/url]`)
      );
    temp
      .querySelectorAll("b, strong")
      .forEach((b) => b.replaceWith(`[b]${b.textContent}[/b]`));
    temp
      .querySelectorAll("i, em")
      .forEach((i) => i.replaceWith(`[i]${i.textContent}[/i]`));

    return temp.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  // --- UPGRADED MENU FUNCTION ---
  function createOverlayMenu(x, y, forceOpen = false) {
    removeOverlayMenu();

    // UPDATED: Read from LOCAL storage
    chrome.storage.local.get(
      ["current_flat_data", `pref_${window.location.hostname}`],
      (result) => {
        // EXTRACT MASTER HTML
        const master = result.current_flat_data?.masterHTML || "";
        const currentPref = result[`pref_${window.location.hostname}`];

        if (!master) {
          toast("⚠️ No Source HTML found. Save in Popup first.");
          return;
        }

        const itemsToRender = [
          {
            text: cleanHtml(master),
            label: "HTML Code (Clean)",
            isRich: false,
          },
          {
            text: toMarkdown(master),
            label: "Markdown (Inline)",
            isRich: false,
          },
          { text: toBBCode(master), label: "BBCode", isRich: false },
          {
            text: toReferenceMarkdown(master),
            label: "Markdown (Reference)",
            isRich: false,
          },
          { text: master, label: "Rich Text", isRich: true },
        ];

        const menu = document.createElement("div");
        menu.id = "qtf-overlay-menu";

        Object.assign(menu.style, {
          position: "fixed",
          top: y + "px",
          left: x + "px",
          zIndex: "2147483648",
          backgroundColor: "#fff",
          border: "1px solid #aaa",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          borderRadius: "8px",
          minWidth: "260px",
          fontFamily: "Segoe UI, sans-serif",
          fontSize: "13px",
          color: "#333",
          textAlign: "left",
          padding: "5px 0",
        });

        const header = document.createElement("div");
        header.style.padding = "8px 15px";
        header.style.background = "#f8f9fa";
        header.style.borderBottom = "1px solid #eee";
        header.style.fontWeight = "bold";
        header.innerText = "Select Format:";
        menu.appendChild(header);

        itemsToRender.forEach((item) => {
          const menuEl = document.createElement("div");
          menuEl.className = "qtf-item";
          const isSaved = currentPref === item.label;
          if (isSaved) menuEl.style.background = "#e8f5e9";

          let previewText = item.isRich ? "(Rich Text Content)" : item.text;

          menuEl.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
            <span style="font-weight:bold; color:${
              item.isRich ? "#e67e22" : "#2ecc71"
            }; font-size:11px;">${item.label}</span>
            ${
              isSaved
                ? '<span style="font-size:10px; color:#27ae60;">(Saved)</span>'
                : ""
            }
        </div>
        <div style="color:#555; font-size:12px; font-family: monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 230px;">
            ${escapeHtml(previewText)}
        </div>`;

          Object.assign(menuEl.style, {
            padding: "8px 15px",
            cursor: "pointer",
            borderBottom: "1px solid #f0f0f0",
            transition: "background 0.1s",
          });

          if (!isSaved) {
            menuEl.onmouseenter = () =>
              (menuEl.style.backgroundColor = "#f0fcf0");
            menuEl.onmouseleave = () => (menuEl.style.backgroundColor = "#fff");
          }

          menuEl.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const shouldRemember = rememberCheckbox.checked;
            handleSnippetSelection(
              item.text,
              item.isRich,
              shouldRemember,
              item.label
            );
          };
          menu.appendChild(menuEl);
        });

        const footer = document.createElement("div");
        Object.assign(footer.style, {
          padding: "10px 15px",
          background: "#f1f2f6",
          borderTop: "1px solid #ccc",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
        });

        const rememberCheckbox = document.createElement("input");
        rememberCheckbox.type = "checkbox";
        rememberCheckbox.id = "llb-remember-pref";
        rememberCheckbox.style.marginRight = "8px";
        if (currentPref) rememberCheckbox.checked = true;

        const label = document.createElement("label");
        label.htmlFor = "llb-remember-pref";
        label.innerText = `Remember for ${window.location.hostname}`;
        label.style.cursor = "pointer";

        footer.appendChild(rememberCheckbox);
        footer.appendChild(label);
        menu.appendChild(footer);

        document.body.appendChild(menu);

        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth)
          menu.style.left = window.innerWidth - rect.width - 20 + "px";
        if (rect.bottom > window.innerHeight)
          menu.style.top = window.innerHeight - rect.height - 20 + "px";
      }
    );
  }

  function removeOverlayMenu() {
    const menu = document.getElementById("qtf-overlay-menu");
    if (menu) menu.remove();
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleSnippetSelection(text, isRich, shouldRemember, typeLabel) {
    removeOverlayMenu();

    if (shouldRemember && typeLabel) {
      const domain = window.location.hostname;
      // UPDATED: Save to LOCAL storage
      chrome.storage.local.set({ [`pref_${domain}`]: typeLabel }, () => {
        toast(`💾 Saved preference: ${typeLabel}`);
      });
    } else if (!shouldRemember && typeLabel) {
      const domain = window.location.hostname;
      chrome.storage.local.remove(`pref_${domain}`);
    }

    if (isRich) {
      try {
        const blobHtml = new Blob([text], { type: "text/html" });
        const blobText = new Blob([text.replace(/<[^>]*>?/gm, "")], {
          type: "text/plain",
        });
        const data = [
          new ClipboardItem({
            ["text/html"]: blobHtml,
            ["text/plain"]: blobText,
          }),
        ];
        navigator.clipboard.write(data);
      } catch (e) {
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
    }

    if (typeof toast === "function") toast("✅ Pasted!");
    if (currentRightClickTarget)
      insertSnippetLogic(currentRightClickTarget, text, isRich);
  }

  function insertSnippetLogic(target, text, isRich) {
    target.focus();
    if (isRich) {
      const success = document.execCommand("insertHTML", false, text);
      if (success) return;
    }
    const success = document.execCommand("insertText", false, text);
    if (success) return;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      const proto =
        target.tagName === "INPUT"
          ? window.HTMLInputElement.prototype
          : window.HTMLTextAreaElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (nativeSetter) nativeSetter.call(target, target.value + text);
      else target.value += text;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // -------------------------------------------------------
  // 🚀 THE ULTIMATE AUTO-SUBMITTER v2
  // -------------------------------------------------------
  function triggerAutoSubmit() {
    // 1. THE EXPANDED DICTIONARY
    const submitKeywords = [
      // Standard
      "submit",
      "save",
      "send",
      "post",
      "publish",
      // Auth
      "login",
      "log in",
      "signin",
      "sign in",
      "signup",
      "sign up",
      "register",
      "create account",
      // Ecommerce / Action
      "checkout",
      "buy",
      "order",
      "pay",
      "add to cart",
      // Flow
      "next",
      "continue",
      "proceed",
      "finish",
      "done",
      "complete",
      "go",
      "let's go",
      "get started",
      "start",
      // Listings / Content
      "post ad",
      "post listing",
      "create listing",
      "add listing",
      "create thread",
      "new thread",
      "post reply",
      "add comment",
      "update profile",
      "save changes",
      "edit profile",
      "activate",
      "confirm",
      "verify",
      "accept",
    ];

    // 2. SCAN THE DOM (Broad Selector)
    const candidates = Array.from(
      document.querySelectorAll(
        'button, input[type="submit"], input[type="button"], a, div[role="button"], span[role="button"]'
      )
    ).filter((el) => {
      // A. VISIBILITY CHECK
      // Must have size and be visible
      if (!el.offsetParent || el.offsetWidth < 10 || el.offsetHeight < 10)
        return false;
      if (getComputedStyle(el).visibility === "hidden") return false;
      if (el.disabled) return false;

      // B. TEXT MATCHING
      const text = (
        el.textContent ||
        el.value ||
        el.getAttribute("aria-label") ||
        el.title ||
        ""
      )
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim(); // Normalizes "  Sign   Up  " to "sign up"

      // Exact match or Contains match?
      // We look for the keyword appearing inside the button text
      const hasKeyword = submitKeywords.some((kw) => text.includes(kw));
      if (!hasKeyword) return false;

      // C. EXCLUSION ZONES (Don't click Toolbar buttons)
      const parent = el.closest("div, span, td, li, nav, header");
      if (parent) {
        const pClass = (parent.className || "").toLowerCase();
        const pId = (parent.id || "").toLowerCase();
        const blacklist = [
          "mce",
          "cke",
          "tox",
          "editor",
          "toolbar",
          "format",
          "nav",
          "menu",
          "sidebar",
        ];

        // If it's inside a text editor toolbar, ignore it
        if (
          blacklist.some((term) => pClass.includes(term) || pId.includes(term))
        )
          return false;
      }

      // D. SMART FILTER FOR LINKS (<a> tags)
      // If it's an <a> tag, it MUST look like a button (have a class) OR have very specific text
      if (el.tagName === "A") {
        // If the link is just "Login" text with no class, it might be a nav link, not a form submit.
        // We prefer buttons. But if it's "Create Thread" it's likely the main action.
        const isStyled =
          (el.className || "").includes("btn") ||
          (el.className || "").includes("button");
        if (
          !isStyled &&
          text.split(" ").length < 2 &&
          !["submit", "save", "post"].includes(text)
        ) {
          // It's a single word link like "Home" or "News" (false positive protection)
          // But we allow "Submit" even if unstyled.
          return false;
        }
      }

      return true;
    });

    // 3. SELECT THE BEST CANDIDATE
    if (candidates.length > 0) {
      // Heuristic: The "Real" submit button is usually the LAST one in the DOM
      // (because forms come after headers/navs), or the one with "submit" type.

      // Prioritize type="submit"
      let target = candidates.find((c) => c.type === "submit");

      // If no explicit submit button, take the last candidate found (usually bottom of form)
      if (!target) target = candidates[candidates.length - 1];

      // 4. VISUAL FEEDBACK & CLICK
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Flash Effect
      const originalBoxShadow = target.style.boxShadow;
      const originalTransition = target.style.transition;

      target.style.transition = "all 0.2s";
      target.style.boxShadow =
        "0 0 0 4px rgba(231, 76, 60, 0.8), 0 0 20px rgba(231, 76, 60, 0.4)";
      target.style.transform = "scale(1.05)";

      setTimeout(() => {
        // CLICK!
        target.click();

        // Cleanup styles
        target.style.transform = "";
        target.style.boxShadow = originalBoxShadow || "";
        target.style.transition = originalTransition || "";

        toast(
          `🚀 Triggered: "${
            target.textContent.trim().substring(0, 20) || "Submit"
          }"`
        );
      }, 250); // Small delay so user sees what is being clicked
    } else {
      toast("⚠️ No obvious 'Submit' action found.");
    }
  }
})();

// ============================================================
// 🚀 SMART URL SWAPPER (Profile Collision Check)
// ============================================================
(async function initUrlSwapper() {
  // 1. Get User Data
  const { data } = await getProfileData();
  const myUsername = data.username; // Ensure this key matches your storage key

  if (!myUsername) return; // No username saved? Do nothing.

  // 2. Parse Current URL
  const path = window.location.pathname; // e.g., "/user/motobuys"
  const segments = path.split("/").filter((s) => s.length > 0); // ["user", "motobuys"]

  // 3. Logic: Identify the "Suspect" Username in the URL
  let suspectIndex = -1;
  let mode = "none";

  // TIER 1: Common Prefix Paths
  const profilePrefixes = [
    "user",
    "users",
    "u",
    "profile",
    "profiles",
    "p",
    "member",
    "members",
    "author",
    "account",
    "channel",
    "c",
    "id",
  ];

  // Check if the *second to last* segment is a prefix (e.g. /u/name)
  if (segments.length >= 2) {
    const secondLast = segments[segments.length - 2].toLowerCase();
    if (profilePrefixes.includes(secondLast)) {
      suspectIndex = segments.length - 1; // The last part is the username
      mode = "prefix";
    }
  }

  // TIER 2: The "@" Syntax (e.g. /@motobuys)
  if (segments.length > 0 && suspectIndex === -1) {
    const last = segments[segments.length - 1];
    if (last.startsWith("@")) {
      suspectIndex = segments.length - 1;
      mode = "at";
    }
  }

  // TIER 3: Root Level (e.g. /motobuys) - The "Ignore List" Strategy
  if (segments.length === 1 && suspectIndex === -1) {
    const potentialUser = segments[0].toLowerCase();

    // Words that are DEFINITELY NOT usernames
    const ignoreList = [
      "about",
      "contact",
      "terms",
      "privacy",
      "help",
      "support",
      "login",
      "signin",
      "signup",
      "register",
      "search",
      "explore",
      "home",
      "index",
      "category",
      "shop",
      "cart",
      "checkout",
      "blog",
      "news",
      "articles",
      "features",
      "pricing",
      "plans",
      "api",
      "dev",
      "jobs",
      "careers",
      "sitemap",
      "robots",
    ];

    if (!ignoreList.includes(potentialUser)) {
      suspectIndex = 0;
      mode = "root";
    }
  }

  // 4. Evaluate & Act
  if (suspectIndex !== -1) {
    const currentSuspect = segments[suspectIndex];

    // Clean logic: Remove "@" if checking an @-style URL
    const cleanSuspect = currentSuspect.startsWith("@")
      ? currentSuspect.substring(1)
      : currentSuspect;
    const cleanMyUser = myUsername.startsWith("@")
      ? myUsername.substring(1)
      : myUsername;

    // STOP if:
    // 1. We are already on our own page (collision avoided)
    // 2. The suspect is ridiculously long (probably a blog post slug, not a user)
    if (cleanSuspect.toLowerCase() === cleanMyUser.toLowerCase()) return;
    if (cleanSuspect.length > 40) return;

    // 5. Create the New URL
    const newSegments = [...segments];
    // Preserve the "@" if the site uses it
    newSegments[suspectIndex] = (mode === "at" ? "@" : "") + cleanMyUser;
    const newPath = "/" + newSegments.join("/");
    const targetUrl = window.location.origin + newPath + window.location.search;

    // 6. Show the UI (Non-intrusive Button)
    createSwapButton(cleanMyUser, targetUrl);
  }

  function createSwapButton(user, url) {
    const btn = document.createElement("div");
    btn.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:16px;">⚡</span>
        <div style="display:flex; flex-direction:column; line-height:1.2;">
          <span style="font-size:10px; opacity:0.8; color:#ccc;">CHECK PROFILE</span>
          <span style="font-weight:bold; color:white;">Go to /${user}?</span>
        </div>
      </div>
    `;

    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "2147483647",
      background: "#2d3436",
      color: "white",
      padding: "10px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      cursor: "pointer",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      transition: "transform 0.2s, opacity 0.2s",
      border: "1px solid #444",
    });

    // Hover Effect
    btn.onmouseenter = () => (btn.style.transform = "translateY(-2px)");
    btn.onmouseleave = () => (btn.style.transform = "translateY(0)");

    // Click Action
    btn.onclick = () => {
      btn.innerHTML = "🚀 Switching...";
      window.location.href = url;
    };

    // Close Button (X)
    const close = document.createElement("span");
    close.innerHTML = "&times;";
    Object.assign(close.style, {
      position: "absolute",
      top: "-8px",
      left: "-8px",
      background: "#d63031",
      color: "white",
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      textAlign: "center",
      lineHeight: "16px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    });
    close.onclick = (e) => {
      e.stopPropagation();
      btn.remove();
    };

    btn.appendChild(close);
    document.body.appendChild(btn);
  }
})();

// ============================================================
// 🚪 THE GATEWAY HUNTER (Alt + G)
// Brute Force Menu for Login, Register, Admin, and Account pages
// ============================================================
document.addEventListener("keydown", (e) => {
  // Trigger: Alt + G
  if (e.altKey && e.code === "KeyG") {
    e.preventDefault();
    createGatewayMenu();
  }
});

function createGatewayMenu() {
  // 1. Clean up existing menu if open
  const existing = document.getElementById("llb-gateway-menu");
  if (existing) {
    existing.remove();
    return;
  }

  // 2. Define the Paths (The Intelligence)
  const origin = window.location.origin; // e.g., https://example.com

  const gateways = {
    "🚀 Register / Join": [
      "/register",
      "/signup",
      "/sign-up",
      "/join",
      "/create-account",
      "/start",
      "/register.php",
      "/register.html",
    ],
    "🔑 Login / Auth": [
      "/login",
      "/signin",
      "/sign-in",
      "/auth/login",
      "/user/login",
    ],
    "👤 Account / Dash": [
      "/account",
      "/my-account",
      "/account/my-account",
      "/dashboard",
      "/user",
      "/profile",
    ],
    "🛠️ Admin / Backend": [
      "/wp-admin",
      "/admin",
      "/administrator",
      "/backend",
      "/employer-panel",
    ],
    "📝 Submit / Post": ["/submit", "/post-ad", "/add-listing", "/submit-url"],
  };

  // 3. Build the UI
  const menu = document.createElement("div");
  menu.id = "llb-gateway-menu";

  // Styling
  Object.assign(menu.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "450px",
    maxHeight: "80vh",
    backgroundColor: "#1e272e", // Dark theme for contrast
    color: "#fff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    zIndex: "2147483647",
    padding: "25px",
    fontFamily: "-apple-system, system-ui, sans-serif",
    overflowY: "auto",
    border: "1px solid #485460",
  });

  // Header
  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <span style="font-size:20px; font-weight:bold; color:#00d2d3;">🚪 Gateway Hunter</span>
      <span id="llb-gw-close" style="cursor:pointer; font-size:24px; opacity:0.7;">&times;</span>
    </div>
    <div style="font-size:12px; color:#ccc; margin-bottom:15px;">
      Targeting: <span style="color:#fff; font-weight:bold;">${origin}</span>
    </div>
  `;
  menu.appendChild(header);

  // Generate Buttons per Category
  for (const [category, paths] of Object.entries(gateways)) {
    const section = document.createElement("div");
    section.style.marginBottom = "15px";

    const title = document.createElement("div");
    title.textContent = category;
    title.style.cssText =
      "font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#808e9b; margin-bottom:8px; font-weight:bold;";
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.style.cssText =
      "display:grid; grid-template-columns: 1fr 1fr; gap:8px;";

    paths.forEach((path) => {
      const btn = document.createElement("button");
      btn.textContent = path;
      Object.assign(btn.style, {
        background: "#353b48",
        border: "none",
        color: "#dcdde1",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
        textAlign: "left",
        fontSize: "13px",
        transition: "all 0.1s",
      });

      btn.onmouseenter = () => {
        btn.style.background = "#00d2d3";
        btn.style.color = "#000";
      };
      btn.onmouseleave = () => {
        btn.style.background = "#353b48";
        btn.style.color = "#dcdde1";
      };

      btn.onclick = () => {
        menu.remove();
        toast(`🚀 Jumping to ${path}...`);
        window.location.href = origin + path;
      };

      grid.appendChild(btn);
    });

    section.appendChild(grid);
    menu.appendChild(section);
  }

  // 4. Close Logic
  menu.querySelector("#llb-gw-close").onclick = () => menu.remove();

  // Close on click outside
  const backdrop = document.createElement("div");
  Object.assign(backdrop.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: "2147483646",
    backdropFilter: "blur(2px)",
  });
  backdrop.onclick = () => {
    menu.remove();
    backdrop.remove();
  };

  document.body.appendChild(backdrop);
  document.body.appendChild(menu);
}

// ============================================================
// 🛡️ THE WATCHTOWER (Excel + Pasted URLs Collision Detector) - v4
// ============================================================
(function initWatchtower() {
  chrome.storage.local.get(
    ["watchtower_primary", "watchtower_secondary", "watchtower_pasted"],
    (result) => {
      const primary = result.watchtower_primary || [];
      const secondary = result.watchtower_secondary || [];
      const pasted = result.watchtower_pasted || [];

      // If all databases are empty, do nothing
      if (primary.length === 0 && secondary.length === 0 && pasted.length === 0)
        return;

      // 1. NORMALIZE CURRENT HOST (Case-insensitive handling)
      const currentHost = window.location.hostname
        .replace(/^www\./i, "")
        .toLowerCase();

      // 2. MATCHING LOGIC
      const checkMatch = (list) => {
        return list.some((entry) => {
          if (!entry) return false;
          const cleanEntry = entry
            .toString()
            .trim()
            .replace(/^www\./i, "")
            .toLowerCase();
          return (
            currentHost === cleanEntry || currentHost.endsWith("." + cleanEntry)
          );
        });
      };

      // 3. IDENTIFY SOURCES
      const inPrimary = checkMatch(primary);
      const inSecondary = checkMatch(secondary);
      const inPasted = checkMatch(pasted);

      if (inPrimary || inSecondary || inPasted) {
        const sources = [];
        if (inPrimary) sources.push("Primary DB");
        if (inSecondary) sources.push("Secondary DB");
        if (inPasted) sources.push("Pasted List");
        const sourceLabel = sources.join(" + ") || "Unknown List";

        createWarningBanner(currentHost, sourceLabel);
      } else {
        createGreenSignal(currentHost);
      }
    }
  );

  // 🛑 RED BANNER (BLOCKER)
  function createWarningBanner(host, source) {
    if (document.getElementById("llb-warning-banner")) return;

    const div = document.createElement("div");
    div.id = "llb-warning-banner";
    div.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; width: 100%; height: 60px;
        background: #d63031; color: white; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        font-family: -apple-system, system-ui, sans-serif; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.3); line-height: 1.2;
      ">
        <div style="font-weight: bold; font-size: 16px;">
          🛑 STOP! Domain (${host}) Exists!
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
          Found in: <span style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; color: #fff;">${source}</span>
        </div>
        
        <button id="llb-dismiss-warning" style="
          position: absolute; right: 20px; top: 15px;
          background: white; color: #d63031; border: none;
          padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;
        ">Dismiss</button>
      </div>
      <div style="height: 60px;"></div> <!-- Spacer -->
    `;
    document.body.prepend(div);

    document.getElementById("llb-dismiss-warning").onclick = () => {
      div.remove();
    };
  }

  // ✅ GREEN SIGNAL (SAFE TO BUILD)
  // ✅ GREEN SIGNAL (SAFE TO BUILD) — NOW PERSISTENT LIKE RED BANNER
  function createGreenSignal(host) {
    if (document.getElementById("llb-green-signal")) return;

    const div = document.createElement("div");
    div.id = "llb-green-signal";
    div.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; width: 100%; height: 60px;
      background: #00b894; color: white; z-index: 2147483647;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: -apple-system, system-ui, sans-serif; 
      box-shadow: 0 5px 15px rgba(0,0,0,0.3); line-height: 1.2;
    ">
      <div style="font-weight: bold; font-size: 16px;">
        ✅ GOOD TO GO: Domain (${host}) is Clean!
      </div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
        Safe to Post — No collisions detected.
      </div>
      
      <button id="llb-dismiss-safe" style="
        position: absolute; right: 20px; top: 15px;
        background: white; color: #00b894; border: none;
        padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;
      ">Dismiss</button>
    </div>
    <div style="height: 60px;"></div> <!-- Spacer -->
  `;
    document.body.prepend(div);

    document.getElementById("llb-dismiss-safe").onclick = () => {
      div.remove();
    };
  }
})();

// ============================================================
// 📨 THE EMAIL HUNTER v3 (Iframe & Plain Text Support)
// ============================================================
(function initEmailHunter() {
  // 1. DOMAIN CHECK
  // We allow this to run inside IFRAMES (window.self !== window.top)
  // because that is where the email content actually lives.
  const validDomains = [
    "fakemail.net",
    "temp-mail.org",
    "10minutemail.com",
    "emailondeck.com",
    "yopmail.com",
    "tempmail.plus",
    "aicrowd.com",
  ]; // Added aicrowd for testing based on your screenshot

  // We check document.referrer too because inside an iframe, the hostname might be different (e.g. about:blank or a cdn)
  // but the parent is the fake mail site.
  const isTarget = validDomains.some(
    (d) => window.location.hostname.includes(d) || document.referrer.includes(d)
  );

  if (!isTarget) return;

  // 2. THE SCANNER
  const scan = () => {
    if (document.getElementById("llb-verifier-hud")) return;

    // --- STRATEGY A: FIND CLICKABLE LINKS (<a> tags) ---
    // Keywords based on your screenshots: "confirm", "verify", "click here", "password"
    const keywords = [
      "confirm",
      "verify",
      "activate",
      "validate",
      "click here",
      "set your password",
      "login details",
      "recover",
    ];
    const links = Array.from(document.querySelectorAll("a"));

    for (let link of links) {
      const text = (link.innerText || "").toLowerCase().trim();
      const href = (link.href || "").toLowerCase();

      if (
        href.includes("unsubscribe") ||
        href.startsWith("javascript") ||
        href === ""
      )
        continue;

      // 1. Check Text Matching
      const textMatch = keywords.some((kw) => text.includes(kw));

      // 2. Check URL Matching (Token/Key detection for WordPress style links)
      // Looks for: key=..., token=..., confirm=..., /verify/
      const urlMatch = href.match(
        /key=|token=|code=|confirm|\/verify\/|action=rp/
      );

      if (textMatch || urlMatch) {
        // Highlight the button visually (Like in your AICrowd screenshot)
        link.style.border = "4px solid #00b894";
        link.style.boxShadow = "0 0 20px #00b894";

        showVerifierHUD("link", link.href, text || "Link");
        return;
      }
    }

    // --- STRATEGY B: FIND PLAIN TEXT URLs (The WordPress Screenshot Case) ---
    // Sometimes the link is just text: "https://techremarkable.com/..."
    const bodyText = document.body.innerText;
    // Regex to find https links that contain "key", "token", or "login"
    const urlRegex = /https?:\/\/[^\s]+?(?:key=|token=|login=|confirm=)[^\s]+/g;
    const textLinks = bodyText.match(urlRegex);

    if (textLinks && textLinks.length > 0) {
      // We found a verification link written as plain text!
      showVerifierHUD("link", textLinks[0], "Plain Text Link");
      return;
    }

    // --- STRATEGY C: OTP CODES ---
    // 4-8 digits, not years
    const otpRegex = /\b(?!(?:19|20)\d{2})(?<!\d)(\d{4,8})(?!\d)\b/g;
    const matches = bodyText.match(otpRegex);
    if (matches && matches.length > 0) {
      // Filter out port numbers or common false positives
      const bestCode = matches.find((m) => m !== "8080" && m !== "3000");
      if (bestCode) {
        navigator.clipboard.writeText(bestCode);
        showVerifierHUD("otp", bestCode, "Code");
      }
    }
  };

  // Run repeatedly because email content loads slowly
  setInterval(scan, 1500);

  // 3. THE UI
  function showVerifierHUD(type, value, label) {
    // If we are in an iframe, we need to be careful with positioning.
    // We'll put it at the top of the iframe.

    const hud = document.createElement("div");
    hud.id = "llb-verifier-hud";

    let contentHtml = "";
    if (type === "link") {
      contentHtml = `
        <div style="display:flex; flex-direction:column; gap:5px;">
          <span style="font-size:10px; opacity:0.9; text-transform:uppercase;">${label} FOUND</span>
          <a href="${value}" target="_blank" style="
            background: #fff; color: #0984e3; text-decoration: none; padding: 6px 12px; 
            border-radius: 4px; font-weight: bold; text-align: center; display: block; font-size:12px;
          ">🚀 OPEN LINK</a>
        </div>`;
    } else {
      contentHtml = `
        <div style="display:flex; flex-direction:column; gap:5px;">
          <span style="font-size:10px; opacity:0.9; text-transform:uppercase;">OTP COPIED</span>
          <div style="background:#fff; color:#333; padding:4px 8px; font-weight:bold; border-radius:4px; text-align:center;">${value}</div>
        </div>`;
    }

    hud.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:18px;">⚡</span>
        ${contentHtml}
        <span id="llb-close" style="cursor:pointer; padding:5px;">&times;</span>
      </div>
    `;

    Object.assign(hud.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      zIndex: "2147483647",
      background: "linear-gradient(135deg, #2d3436, #000000)",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      fontFamily: "sans-serif",
      fontSize: "12px",
      maxWidth: "250px",
    });

    document.body.appendChild(hud);
    document.getElementById("llb-close").onclick = () => hud.remove();
  }
})();

// ────────────────────────────────────────────────────────────
//  ★★★ THE SHOCKWAVE PROTOCOL (Long Press 2s) ★★★
// ────────────────────────────────────────────────────────────
let shockwaveTimer;
let shockwaveVisual;

document.addEventListener("mousedown", (e) => {
  // Only Left Click (button 0)
  if (e.button !== 0) return;

  // 1. Visual "Charging" Indicator
  shockwaveVisual = document.createElement("div");
  Object.assign(shockwaveVisual.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "0%",
    height: "5px",
    backgroundColor: "#00b894",
    zIndex: "2147483647",
    transition: "width 2s linear",
    boxShadow: "0 0 10px #00b894",
  });
  document.body.appendChild(shockwaveVisual);

  // Force reflow to enable transition
  setTimeout(() => {
    if (shockwaveVisual) shockwaveVisual.style.width = "100%";
  }, 10);

  // 2. Start Timer
  shockwaveTimer = setTimeout(() => {
    triggerShockwave(); // 💥 BOOM
    cleanupShockwave();
  }, 2000);
});

function cleanupShockwave() {
  if (shockwaveTimer) clearTimeout(shockwaveTimer);
  if (shockwaveVisual) shockwaveVisual.remove();
  shockwaveVisual = null;
}

document.addEventListener("mouseup", cleanupShockwave);
document.addEventListener("mouseleave", cleanupShockwave);

async function triggerShockwave() {
  toast("⚡ SHOCKWAVE: BRUTAL INJECTION STARTING...");

  const { data } = await getProfileData();
  const rawData = data || {};
  let count = 0;

  // ============================================================
  // 1. RADIO BUTTONS (THE NUCLEAR OPTION)
  // ============================================================
  const radioGroups = {};
  // Find ALL radios, even hidden ones
  document.querySelectorAll('input[type="radio"]').forEach((rb) => {
    const name = rb.name || "orphan_" + Math.random();
    if (!radioGroups[name]) radioGroups[name] = [];
    radioGroups[name].push(rb);
  });

  Object.values(radioGroups).forEach((group) => {
    let bestCandidate = null;
    let highestScore = -Infinity;

    group.forEach((rb) => {
      // --- DEEP TEXT SCAN (Parent & Container) ---
      let text = "";
      if (rb.id) {
        const label = document.querySelector(`label[for="${rb.id}"]`);
        if (label) text += " " + label.innerText;
      }
      // Grab text from the row/container div (Crucial for your screenshot)
      const container = rb.closest("div, tr, li, label");
      if (container) text += " " + container.innerText;

      text = text.toLowerCase();

      // --- SCORING ---
      let score = 0;
      // Kill Paid Options
      if (
        /\$|usd|eur|gbp|price|cost|bill|pay|premium|highlight|featured|pack|deal/i.test(
          text
        )
      )
        score -= 500;

      // Hunt Free Options
      if (/no,?\s?thanks/i.test(text)) score += 1000; // Priority #1
      if (/free|basic|standard|0\.00/i.test(text)) score += 500;

      if (score > highestScore) {
        highestScore = score;
        bestCandidate = rb;
      }
    });

    // --- EXECUTION: BRUTAL FORCE ---
    if (bestCandidate) {
      // 1. Uncheck all others physically
      group.forEach((peer) => {
        peer.checked = false;
        peer.removeAttribute("checked");
      });

      // 2. Force Property State
      bestCandidate.checked = true;
      bestCandidate.setAttribute("checked", "checked");

      // 3. EVENT STORM (Fire everything to wake up the site's JS)
      ["mousedown", "mouseup", "click", "input", "change"].forEach((evt) => {
        try {
          bestCandidate.dispatchEvent(
            new Event(evt, { bubbles: true, cancelable: true })
          );
        } catch (e) {}
      });

      // 4. CONTAINER CLICK (The "Blind" Fix)
      // If the input is hidden, clicking it does nothing. We must click the wrapper.
      // We try the immediate parent (span) AND the container (div) just to be sure.
      if (bestCandidate.parentElement) bestCandidate.parentElement.click();

      // Visual confirmation
      const visualTarget =
        bestCandidate.closest("div") || bestCandidate.parentElement;
      if (visualTarget) visualTarget.style.boxShadow = "0 0 0 5px #00b894"; // Big Green Border

      count++;
    }
  });

  // ============================================================
  // 2. TEXT INPUTS (SMART FILL)
  // ============================================================
  document.querySelectorAll("input, textarea").forEach((el) => {
    if (el.disabled || el.readOnly || el.type === "hidden") return;
    if (
      ["checkbox", "radio", "file", "submit", "button", "image"].includes(
        el.type
      )
    )
      return;

    // Skip if user already typed something
    if (el.value && el.value.trim().length > 0) return;

    const type = getFieldType(el);
    let valueToFill = null;

    // Priority 1: Saved Data
    if (rawData[type]) valueToFill = rawData[type];
    // Priority 2: Fake Data
    else valueToFill = generateFake(type);
    // Priority 3: Hard Fallback (Inject anything)
    if (!valueToFill) valueToFill = "N/A";

    smartFill(el, valueToFill);
    count++;
  });

  // ============================================================
  // 3. DROPDOWNS (FORCE SELECT)
  // ============================================================
  document.querySelectorAll("select").forEach((el) => {
    if (el.disabled) return;
    if (el.selectedIndex > 0 && el.value !== "") return; // Skip if filled

    // 1. Try Random Valid Option
    const valid = Array.from(el.options).filter(
      (o) => o.value !== "" && !/select|choose|none/i.test(o.text)
    );

    if (valid.length > 0) {
      const rand = valid[Math.floor(Math.random() * valid.length)];
      el.value = rand.value; // Force Value
      el.selectedIndex = rand.index; // Force Index
      el.dispatchEvent(new Event("change", { bubbles: true }));
      count++;
    } else if (el.options.length > 1) {
      el.selectedIndex = 1; // Desperation move
      el.dispatchEvent(new Event("change", { bubbles: true }));
      count++;
    }
  });

  // ============================================================
  // 4. CHECKBOXES (AGREE TO EVERYTHING)
  // ============================================================
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    if (cb.disabled || cb.checked) return;

    // Broad regex to accept terms, age, privacy, etc.
    const text = (
      cb.name +
      " " +
      (cb.getAttribute("aria-label") || "") +
      " " +
      (cb.closest("label")?.innerText || "")
    ).toLowerCase();

    // We avoid "Delete" or "Unsubscribe" checkboxes, but check everything else
    if (!/delete|remove|unsubscribe/i.test(text)) {
      cb.click();
      cb.checked = true; // Double tap
      count++;
    }
  });

  // ============================================================
  // 5. FILE UPLOADS (VISUAL ALERT)
  // ============================================================
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
    fileInput.style.outline = "5px solid red";
    setTimeout(() => fileInput.click(), 500);
  }

  toast(`⚡ SHOCKWAVE: Forced ${count} Elements`);
}

// WATCHTOWER REAL-TIME BANNER — FINAL WORKING VERSION (WITH PASTED LIST SUPPORT)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "WATCHTOWER_STATUS") return;

  const { domain, exists, inPrimary, inSecondary, inPasted, total } = msg;

  // Remove old banner
  document
    .querySelectorAll(".llb-watchtower-banner")
    .forEach((el) => el.remove());

  const banner = document.createElement("div");
  banner.className = "llb-watchtower-banner";

  if (exists) {
    banner.textContent = `BLOCKED: ${domain.toUpperCase()} ALREADY IN WATCHTOWER`;
    const sources = [];
    if (inPrimary) sources.push("Primary DB");
    if (inSecondary) sources.push("Secondary DB");
    if (inPasted) sources.push("Pasted List");
    if (sources.length > 0) {
      banner.textContent += ` (${sources.join(" + ")})`;
    }
    banner.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
  } else {
    banner.textContent = `GOOD TO GO: ${domain.toUpperCase()} — Safe to Post (${total} monitored)`;
    banner.style.background = "linear-gradient(135deg, #27ae60, #1abc9c)";
  }

  document.body.appendChild(banner);

  setTimeout(() => banner.remove(), 3800);
});

// Also trigger on tab change / URL change
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TAB_UPDATED" || msg.type === "WATCHTOWER_CHECK_NOW") {
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: "REQUEST_WATCHTOWER_CHECK" });
    }, 800);
  }
});
