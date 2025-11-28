document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTS ---
  const profileSelect = document.getElementById("profileSelect");
  const newBtn = document.getElementById("newBtn");
  const renameBtn = document.getElementById("renameBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const saveBtn = document.getElementById("saveButton");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("status");
  const masterInput = document.getElementById("masterInput");

  // Bulk Import Elements
  const bulkBtn = document.getElementById("bulkBtn");
  const bulkModal = document.getElementById("bulkModal");
  const closeBulk = document.getElementById("closeBulk");
  const processBulkBtn = document.getElementById("processBulkBtn");
  const bulkText = document.getElementById("bulkText");

  // Watchtower Elements
  const xlsxInput = document.getElementById("xlsxInput");
  const uploadView = document.getElementById("uploadView");
  const activeView = document.getElementById("activeView");
  const dbStatus = document.getElementById("dbStatus");
  const domainCount = document.getElementById("domainCount");
  const clearDbBtn = document.getElementById("clearDbBtn");

  const formFields = [
    "username",
    "email",
    "password",
    "firstName",
    "lastName",
    "website",
    "company",
    "title",
    "phone",
    "address",
    "city",
    "zip",
    "region",
    "country",
    "category",
  ];

  let store = {
    activeId: null,
    profiles: {},
  };

  // --- 1. INITIALIZATION ---
  chrome.storage.local.get(null, (data) => {
    if (!data.profiles || Object.keys(data.profiles).length === 0) {
      const newId = generateUUID();
      store = {
        activeId: newId,
        profiles: { [newId]: { name: "Default Profile", data: {} } },
      };
      saveStore();
    } else {
      store = data;
    }
    renderUI();

    // Initialize Watchtower UI
    if (data.watchtower_domains && data.watchtower_domains.length > 0) {
      showActiveState(
        data.watchtower_domains.length,
        data.watchtower_filename || "DB"
      );
    } else {
      showUploadState();
    }
  });

  // --- 2. CORE LOGIC ---
  function renderUI() {
    // Populate Dropdown
    profileSelect.innerHTML = "";
    Object.entries(store.profiles).forEach(([id, profile]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = profile.name;
      if (id === store.activeId) opt.selected = true;
      profileSelect.appendChild(opt);
    });

    // Fill Form
    const activeData = store.profiles[store.activeId]?.data || {};
    formFields.forEach((field) => {
      const el = document.getElementById(field);
      if (el) el.value = activeData[field] || "";
    });

    // NEW: Restore Lock
    isCatLocked = !!activeData.isCatLocked;
    updateLockUI();
    masterInput.innerHTML = activeData.masterHTML || "";
  }

  function saveCurrentFormToMemory() {
    if (!store.activeId) return;
    const formData = {};
    formFields.forEach((field) => {
      const el = document.getElementById(field);
      if (el) formData[field] = el.value;
    });
    formData.masterHTML = masterInput.innerHTML;

    store.profiles[store.activeId].data = formData;
  }

  function saveStore(msg = "Saved!") {
    chrome.storage.local.set(store, () => {
      // Flatten active profile for content script speed
      const flatData = store.profiles[store.activeId].data;
      chrome.storage.local.set({ current_flat_data: flatData }, () => {
        status.textContent = msg;
        setTimeout(() => (status.textContent = ""), 2000);
      });
    });
  }

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // --- 3. EVENT LISTENERS ---

  profileSelect.addEventListener("change", (e) => {
    saveCurrentFormToMemory();
    store.activeId = e.target.value;
    saveStore("Switched");
    renderUI();
  });

  newBtn.addEventListener("click", () => {
    const name = prompt("Enter Profile Name (e.g., Client X):");
    if (name) {
      saveCurrentFormToMemory();
      const newId = generateUUID();
      store.profiles[newId] = { name: name, data: {} };
      store.activeId = newId;
      saveStore("Created!");
      renderUI();
    }
  });

  renameBtn.addEventListener("click", () => {
    const newName = prompt("New Name:", store.profiles[store.activeId].name);
    if (newName) {
      store.profiles[store.activeId].name = newName;
      saveStore("Renamed");
      renderUI();
    }
  });

  deleteBtn.addEventListener("click", () => {
    if (Object.keys(store.profiles).length <= 1) {
      alert("You must keep at least one profile.");
      return;
    }
    if (confirm(`Delete "${store.profiles[store.activeId].name}"?`)) {
      delete store.profiles[store.activeId];
      store.activeId = Object.keys(store.profiles)[0];
      saveStore("Deleted");
      renderUI();
    }
  });

  saveBtn.addEventListener("click", () => {
    saveCurrentFormToMemory();
    saveStore("Saved Successfully!");
  });

  // --- 4. BULK IMPORT LOGIC (NEW) ---
  if (bulkBtn) {
    bulkBtn.addEventListener("click", () => {
      bulkModal.style.display = "block";
      bulkText.focus();
    });

    closeBulk.addEventListener("click", () => {
      bulkModal.style.display = "none";
    });

    // --- THE "SHERLOCK" PARSER (v5 - Hardcoded Stealth Mode) ---
    // --- THE "SHERLOCK" PARSER (v6 - Region Normalizer) ---
    processBulkBtn.addEventListener("click", () => {
      let text = bulkText.value;
      if (!text.trim()) return;

      let filledCount = 0;

      // 0. THE STATE DICTIONARY (Abbr -> Full)
      const stateMap = {
        AL: "Alabama",
        AK: "Alaska",
        AZ: "Arizona",
        AR: "Arkansas",
        CA: "California",
        CO: "Colorado",
        CT: "Connecticut",
        DE: "Delaware",
        DC: "District of Columbia",
        FL: "Florida",
        GA: "Georgia",
        HI: "Hawaii",
        ID: "Idaho",
        IL: "Illinois",
        IN: "Indiana",
        IA: "Iowa",
        KS: "Kansas",
        KY: "Kentucky",
        LA: "Louisiana",
        ME: "Maine",
        MD: "Maryland",
        MA: "Massachusetts",
        MI: "Michigan",
        MN: "Minnesota",
        MS: "Mississippi",
        MO: "Missouri",
        MT: "Montana",
        NE: "Nebraska",
        NV: "Nevada",
        NH: "New Hampshire",
        NJ: "New Jersey",
        NM: "New Mexico",
        NY: "New York",
        NC: "North Carolina",
        ND: "North Dakota",
        OH: "Ohio",
        OK: "Oklahoma",
        OR: "Oregon",
        PA: "Pennsylvania",
        RI: "Rhode Island",
        SC: "South Carolina",
        SD: "South Dakota",
        TN: "Tennessee",
        TX: "Texas",
        UT: "Utah",
        VT: "Vermont",
        VA: "Virginia",
        WA: "Washington",
        WV: "West Virginia",
        WI: "Wisconsin",
        WY: "Wyoming",
        // Canada (Optional Bonus)
        AB: "Alberta",
        BC: "British Columbia",
        ON: "Ontario",
        QC: "Quebec",
      };

      // 1. SET HARDCODED VALUES
      const setHardValue = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = val;
          filledCount++;
        }
      };

      setHardValue("country", "United States");
      const invisibleChar = "ㅤ ㅤ ㅤ ";
      setHardValue("firstName", invisibleChar);
      setHardValue("lastName", invisibleChar);

      // 2. Clean and Split lines
      let lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const extractAndRemove = (regex, targetId) => {
        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            const match = lines[i].match(regex);
            const val = match[0];
            const el = document.getElementById(targetId);
            if (el && !el.value) {
              el.value = val;
              filledCount++;
            }
            lines[i] = lines[i].replace(val, "").trim();
            if (lines[i].length < 2) {
              lines.splice(i, 1);
              i--;
            }
            return true;
          }
        }
        return false;
      };

      // Cleanup Country text
      for (let i = 0; i < lines.length; i++) {
        if (/united states|usa|u\.s\.a/i.test(lines[i])) {
          lines.splice(i, 1);
          i--;
        }
      }

      // === PHASE 1: HARD PATTERNS ===
      extractAndRemove(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/,
        "email"
      );
      extractAndRemove(
        /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "website"
      );
      extractAndRemove(
        /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/,
        "phone"
      );

      // === ADDRESS LOGIC (With Region Expansion) ===
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match "GA 30022"
        const addressMatch = line.match(
          /\b([A-Z]{2})\b\s*,?\s*(\d{5}(?:-\d{4})?)/
        );

        if (addressMatch) {
          let stateAbbr = addressMatch[1].toUpperCase();
          const zip = addressMatch[2];

          // ➤ LOGIC UPDATE: CONVERT ABBR TO FULL NAME
          let finalState = stateAbbr;
          if (stateMap[stateAbbr]) {
            finalState = stateMap[stateAbbr]; // "GA" -> "Georgia"
          }

          document.getElementById("region").value = finalState;
          document.getElementById("zip").value = zip;
          filledCount += 2;

          if (/^\d+/.test(line)) {
            document.getElementById("address").value = line;
            filledCount++;
            let prefix = line
              .substring(0, addressMatch.index)
              .trim()
              .replace(/,$/, "");
            const words = prefix.split(" ");
            if (words.length > 1)
              document.getElementById("city").value = words[words.length - 1];
          } else {
            let prefix = line.substring(0, addressMatch.index).trim();
            document.getElementById("city").value = prefix.replace(/,$/, "");
          }
          lines.splice(i, 1);
          break;
        }
      }

      if (!document.getElementById("address").value) {
        extractAndRemove(/^\d+\s+[a-zA-Z0-9\s,.]+/, "address");
      }

      // === PHASE 2: GUESSING ===

      // Password
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (
          !l.includes(" ") &&
          l.length > 5 &&
          (/\d/.test(l) || /[@!#$]/.test(l))
        ) {
          const passEl = document.getElementById("password");
          if (passEl && !passEl.value) {
            passEl.value = l;
            filledCount++;
            lines.splice(i, 1);
            break;
          }
        }
      }

      // Company
      let companyIndex = -1;
      let maxLength = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(" ") && lines[i].length > maxLength) {
          maxLength = lines[i].length;
          companyIndex = i;
        }
      }
      if (companyIndex > -1) {
        document.getElementById("company").value = lines[companyIndex];
        filledCount++;
        lines.splice(companyIndex, 1);
      }

      // Username
      let userIndex = -1;
      let maxUserLength = 0;
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes(" ")) {
          if (lines[i].length > maxUserLength) {
            maxUserLength = lines[i].length;
            userIndex = i;
          }
        }
      }
      if (userIndex > -1) {
        document.getElementById("username").value = lines[userIndex];
        filledCount++;
        lines.splice(userIndex, 1);
      }

      const compName = document.getElementById("company").value;
      if (compName) autoSuggestCategory(compName);

      saveCurrentFormToMemory();
      saveStore(`⚡ Parsed & Normalized ${filledCount} items!`);
      bulkModal.style.display = "none";
      bulkText.value = "";
    });
  }

  // --- 5. IMPORT / EXPORT ---
  exportBtn.addEventListener("click", () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(store));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      "linkbuilder_backup_" + new Date().toISOString().slice(0, 10) + ".json"
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  importBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.profiles && imported.activeId) {
          store = imported;
          saveStore("Restored!");
          renderUI();
        } else {
          alert("Invalid backup file.");
        }
      } catch (err) {
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
  });

  // --- 6. WATCHTOWER LOGIC ---
  if (xlsxInput) {
    xlsxInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        if (typeof XLSX === "undefined") {
          alert("XLSX library not loaded. Check manifest/html.");
          return;
        }
        const workbook = XLSX.read(data, { type: "array" });

        let allDomains = new Set();
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          json.forEach((row) => {
            row.forEach((cell) => {
              if (typeof cell === "string" && cell.includes(".")) {
                const domain = extractDomain(cell);
                if (domain) allDomains.add(domain);
              }
            });
          });
        });

        const domainArray = Array.from(allDomains);
        chrome.storage.local.set(
          {
            watchtower_domains: domainArray,
            watchtower_filename: file.name,
          },
          () => {
            showActiveState(domainArray.length, file.name);
            status.textContent = "Database Updated!";
          }
        );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  if (clearDbBtn) {
    clearDbBtn.addEventListener("click", () => {
      chrome.storage.local.remove(
        ["watchtower_domains", "watchtower_filename"],
        () => {
          showUploadState();
          status.textContent = "Database Cleared";
        }
      );
    });
  }

  function extractDomain(url) {
    try {
      if (!url.startsWith("http")) url = "http://" + url;
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, "").toLowerCase();
    } catch (e) {
      return null;
    }
  }

  function showActiveState(count, filename) {
    uploadView.style.display = "none";
    activeView.style.display = "block";
    domainCount.textContent = count;
    dbStatus.textContent =
      "Active: " +
      (filename.length > 15 ? filename.substring(0, 12) + "..." : filename);
    dbStatus.style.color = "#00b894";
  }

  function showUploadState() {
    uploadView.style.display = "block";
    activeView.style.display = "none";
    dbStatus.textContent = "Inactive";
    dbStatus.style.color = "#aaa";
    xlsxInput.value = "";
  }

  // ============================================================
  // 🧠 SMART STRATEGY PASTE (Forum vs Classified)
  // ============================================================

  const strategyModal = document.getElementById("strategyModal");
  const btnForumMode = document.getElementById("btnForumMode");
  const btnClassifiedMode = document.getElementById("btnClassifiedMode");
  const closeStrategy = document.getElementById("closeStrategy");

  // Variables to hold data pending user decision
  let pendingAnchorText = "";
  let pendingFullText = "";

  // ============================================================
  // 🧠 CATEGORY AI & LOCK LOGIC
  // ============================================================

  const catLockBtn = document.getElementById("catLockBtn");
  let isCatLocked = false;

  // 1. The Keyword Dictionary (Optimized for Slash-Separated Matching)
  const categoryKeywords = {
    "real estate/housing/property": [
      "apartment",
      "house",
      "rent",
      "lease",
      "property",
      "condo",
      "estate",
      "realtor",
      "broker",
      "housing",
      "bedroom",
      "bathroom",
    ],
    "automotive/cars/vehicles": [
      "car",
      "vehicle",
      "truck",
      "repair",
      "auto",
      "tire",
      "engine",
      "honda",
      "toyota",
      "bmw",
      "sedan",
      "suv",
      "dealer",
    ],
    "technology/computer/internet": [
      "software",
      "app",
      "digital",
      "computer",
      "web",
      "seo",
      "marketing",
      "tech",
      "data",
      "server",
      "hosting",
      "internet",
      "phone",
    ],
    "health/beauty/fitness": [
      "beauty",
      "salon",
      "makeup",
      "skin",
      "hair",
      "care",
      "health",
      "medical",
      "clinic",
      "fitness",
      "gym",
      "workout",
      "doctor",
      "dental",
      "spa",
    ],
    "business/finance/services": [
      "finance",
      "consulting",
      "business",
      "money",
      "invest",
      "loan",
      "insurance",
      "accounting",
      "tax",
      "lawyer",
      "legal",
      "services",
      "agency",
      "office",
    ],
    "shopping/fashion/retail": [
      "sale",
      "buy",
      "store",
      "shop",
      "discount",
      "furniture",
      "fashion",
      "clothing",
      "jewelry",
      "gift",
      "retail",
      "order",
    ],
    "travel/vacation/tourism": [
      "hotel",
      "flight",
      "vacation",
      "travel",
      "tour",
      "trip",
      "resort",
      "booking",
      "rental",
      "destination",
    ],
    "education/learning/training": [
      "school",
      "course",
      "tutor",
      "learn",
      "class",
      "training",
      "college",
      "university",
      "student",
      "degree",
    ],
  };

  // 2. The Analyzer
  function autoSuggestCategory(text) {
    // STOP if Locked
    if (isCatLocked) return;

    const lowerText = text.toLowerCase();
    let bestCategory = "";
    let maxHits = 0;

    // Scan matches
    for (const [catName, keywords] of Object.entries(categoryKeywords)) {
      let hits = 0;
      keywords.forEach((kw) => {
        if (lowerText.includes(kw)) hits++;
      });

      if (hits > maxHits) {
        maxHits = hits;
        bestCategory = catName;
      }
    }

    // Threshold: Must match at least 1 keyword to change it
    if (maxHits > 0) {
      const catInput = document.getElementById("category");
      // We create a "Priority String" combining the Broad Category + Specific Keywords found
      // e.g., "Real Estate/Property/Rent"
      catInput.value = bestCategory;

      // Visual feedback (Flash yellow)
      catInput.style.transition = "background 0.2s";
      catInput.style.background = "#fff7d1"; // Light yellow
      setTimeout(() => (catInput.style.background = "white"), 500);
    }
  }

  // 3. Lock Button Logic
  catLockBtn.addEventListener("click", () => {
    isCatLocked = !isCatLocked;
    updateLockUI();

    // Save state to profile
    saveCurrentFormToMemory();
    store.profiles[store.activeId].data.isCatLocked = isCatLocked;
    saveStore(isCatLocked ? "Category Locked" : "Category Unlocked");
  });

  function updateLockUI() {
    if (isCatLocked) {
      catLockBtn.textContent = "🔒";
      catLockBtn.style.background = "#ffeaa7";
      document.getElementById("category").readOnly = true; // Optional: Make input readonly too
      document.getElementById("category").style.background = "#f5f5f5";
    } else {
      catLockBtn.textContent = "🔓";
      catLockBtn.style.background = "white";
      document.getElementById("category").readOnly = false;
      document.getElementById("category").style.background = "white";
    }
  }

  // 1. LISTEN FOR PASTE IN DESCRIPTION
  masterInput.addEventListener("paste", (e) => {
    // We allow the paste to happen naturally so the description fills up.
    // We just want to snoop on the data.

    // Get HTML data if available (for links), fallback to text
    const pastedHTML = e.clipboardData.getData("text/html");
    const pastedText = e.clipboardData.getData("text/plain");

    // ⚡ TRIGGER AUTO-CATEGORIZATION
    autoSuggestCategory(pastedText);

    // Check if there is a Hyperlink
    if (pastedHTML && pastedHTML.includes("<a ")) {
      // Parse the HTML to find the anchor text
      const parser = new DOMParser();
      const doc = parser.parseFromString(pastedHTML, "text/html");
      const anchor = doc.querySelector("a");

      if (anchor) {
        pendingAnchorText = anchor.innerText || anchor.textContent;
        pendingFullText = pastedText; // We use plain text for the semicolon check

        // Show the Decision Modal
        setTimeout(() => {
          strategyModal.style.display = "block";
        }, 100); // Small delay to let the paste finish visually
      }
    } else if (pastedText.includes(";")) {
      // Even if no link, if there is a semicolon, maybe they want Classified mode?
      // Let's trigger it if we see a semicolon structure just in case.
      pendingAnchorText = ""; // No anchor
      pendingFullText = pastedText;
      setTimeout(() => {
        strategyModal.style.display = "block";
      }, 100);
    }
  });

  // 2. FORUM MODE: Keyword (Anchor) -> Title Case -> Title Input
  btnForumMode.addEventListener("click", () => {
    if (pendingAnchorText) {
      // Title Case Logic
      const titleCased = pendingAnchorText
        .toLowerCase()
        .split(" ")
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");

      document.getElementById("title").value = titleCased;

      // Trigger visual update for counter
      document.getElementById("title").dispatchEvent(new Event("input"));
      saveCurrentFormToMemory();
    } else {
      alert("No hyperlink found in that paste for Forum Mode.");
    }
    strategyModal.style.display = "none";
  });

  // 3. CLASSIFIED MODE: Split at ';' -> Title Input
  btnClassifiedMode.addEventListener("click", () => {
    if (pendingFullText) {
      // Split by semicolon and take the first part
      const parts = pendingFullText.split(";");
      if (parts.length > 0) {
        let extractedTitle = parts[0].trim();

        // Safety: If title is too long (over 100 chars), it's probably not a title.
        if (extractedTitle.length > 100) {
          alert("Warning: The text before ';' is very long. Is this correct?");
        }

        document.getElementById("title").value = extractedTitle;

        // Trigger visual update for counter
        document.getElementById("title").dispatchEvent(new Event("input"));
        saveCurrentFormToMemory();
      }
    }
    strategyModal.style.display = "none";
  });

  // Close logic
  closeStrategy.addEventListener("click", () => {
    strategyModal.style.display = "none";
  });
});
