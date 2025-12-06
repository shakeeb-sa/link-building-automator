document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTS ---
  const profileSelect = document.getElementById("profileSelect");
  const newBtn = document.getElementById("newBtn");
  const renameBtn = document.getElementById("renameBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const saveBtn = document.getElementById("saveButton");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const resetBtn = document.getElementById("resetBtn");
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
  const xlsxInput1 = document.getElementById("xlsxInput1");
  const xlsxInput2 = document.getElementById("xlsxInput2");
  const pastedUrls = document.getElementById("pastedUrls");
  const savePastedUrls = document.getElementById("savePastedUrls");
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
    updateWatchtowerDisplay(); // ← NEW LINE
  });

  // ============================================================
  // 🧼 SHARED DOMAIN NORMALIZER (for Excel + Pasted URLs)
  // ============================================================
  function cleanDomain(input) {
    if (!input) return null;
    let s = String(input).toLowerCase().trim();
    // 1. Regex to find a URL-like pattern inside the text
    const match = s.match(
      /([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/
    );
    if (!match) return null;
    let domainCandidate = match[0];
    try {
      if (!domainCandidate.startsWith("http")) {
        domainCandidate = "http://" + domainCandidate;
      }
      const urlObj = new URL(domainCandidate);
      return urlObj.hostname.replace(/^www\./, "");
    } catch (err) {
      return null;
    }
  }

  // ============================================================
  // 💾 SAVE PASTED URL LIST (Standalone Watchtower Source)
  // ============================================================
  function savePastedList() {
    const rawText = pastedUrls.value;
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const domains = new Set();
    lines.forEach((line) => {
      const domain = cleanDomain(line);
      if (domain) domains.add(domain);
    });
    const domainList = Array.from(domains);
    chrome.storage.local.set({ watchtower_pasted: domainList }, () => {
      status.textContent = `✅ Pasted List: ${domainList.length} domains`;
      status.style.color = "#6c5ce7";
      setTimeout(() => {
        status.textContent = "";
        status.style.opacity = "0.7";
      }, 3000);
      updateWatchtowerDisplay(); // Refresh UI count
      broadcastDomainStatus(); // Notify open tabs immediately
      // Clear stale acknowledgments
      chrome.storage.local.remove("watchtower_acknowledged");
    });
  }

  savePastedUrls.addEventListener("click", savePastedList);

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

    // 🛠️ FIX: Persist the Lock State!
    // Previously, this property was being wiped out because it's not in formFields.
    formData.isCatLocked = isCatLocked;

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

      // === SMART COUNTRY CLEANUP ===
      // Only remove lines that are *purely* country names.
      // Keep lines that contain an address + country.
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // If line is just "United States", "USA", etc. → remove it
        if (/^(\s*(united states|usa|u\.s\.a)\s*)$/i.test(line)) {
          lines.splice(i, 1);
          i--;
          continue;
        }

        // If line contains an address pattern AND ends with country → clean country suffix
        const addressWithCountry = line.match(
          /^(.+?),\s*(united states|usa|u\.s\.a)$/i
        );
        if (addressWithCountry) {
          // Replace the line with just the address part (without ", United States")
          lines[i] = addressWithCountry[1].trim();
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

  resetBtn.addEventListener("click", () => {
    if (
      confirm(
        "This will reset ALL extension data (profiles, watchtower databases, etc.) to default. Are you sure?"
      )
    ) {
      chrome.storage.local.clear(() => {
        // Reinitialize to default state
        const newId = generateUUID();
        store = {
          activeId: newId,
          profiles: { [newId]: { name: "Default Profile", data: {} } },
        };
        saveStore("Reset Complete!");
        renderUI();
        updateWatchtowerDisplay();
      });
    }
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

  // ============================================================
  // 💾 EXPORT / IMPORT REMEMBERED FORMATS ONLY
  // ============================================================
  const exportFormatsBtn = document.getElementById("exportFormatsBtn");
  const importFormatsBtn = document.getElementById("importFormatsBtn");
  const formatsFileInput = document.getElementById("formatsFileInput");

  // Export ONLY pref_* keys
  exportFormatsBtn.addEventListener("click", () => {
    chrome.storage.sync.get(null, (allSync) => {
      if (chrome.runtime.lastError) {
        // Fallback to local
        chrome.storage.local.get(null, (allLocal) => {
          const formatPrefs = {};
          Object.keys(allLocal)
            .filter((key) => key.startsWith("pref_"))
            .forEach((key) => {
              formatPrefs[key] = allLocal[key];
            });
          if (Object.keys(formatPrefs).length === 0) {
            alert("No remembered formats to export.");
            return;
          }
          downloadFormatsJson(formatPrefs);
        });
      } else {
        const formatPrefs = {};
        Object.keys(allSync)
          .filter((key) => key.startsWith("pref_"))
          .forEach((key) => {
            formatPrefs[key] = allSync[key];
          });
        if (Object.keys(formatPrefs).length === 0) {
          alert("No remembered formats to export.");
          return;
        }
        downloadFormatsJson(formatPrefs);
      }
    });
  });

  function downloadFormatsJson(data) {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ rememberedFormats: data }, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      "linkbuilder_formats_" + new Date().toISOString().slice(0, 10) + ".json"
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // Import ONLY into pref_* keys
  importFormatsBtn.addEventListener("click", () => formatsFileInput.click());

  formatsFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (
          !imported.rememberedFormats ||
          typeof imported.rememberedFormats !== "object"
        ) {
          alert("Invalid format backup file.");
          return;
        }
        // Save to sync (with fallback to local)
        chrome.storage.sync.set(imported.rememberedFormats, () => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.set(imported.rememberedFormats, () => {
              status.textContent = "✅ Formats imported (local)";
              setTimeout(() => (status.textContent = ""), 3000);
            });
          } else {
            status.textContent = "✅ Formats imported (sync)";
            setTimeout(() => (status.textContent = ""), 3000);
          }
          // Refresh format list UI
          if (typeof loadAndRenderFormats === "function") {
            loadAndRenderFormats();
          }
        });
      } catch (err) {
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
  });

  // ============================================================
  // 🛡️ WATCHTOWER ENGINE v2 (The "Vacuum" Parser)
  // ============================================================
  function processWatchtowerFile(file, isSecondary = false) {
    const reader = new FileReader();

    status.textContent = "⏳ Scanning file...";
    status.style.opacity = "1";

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      let extractedDomains = new Set(); // Use Set for instant de-duplication

      // HELPER: robust domain extractor
      const cleanDomain = (input) => {
        if (!input) return null;
        let s = String(input).toLowerCase().trim();

        // 1. Regex to find a URL-like pattern inside the text
        // Matches: example.com, https://example.com, www.example.com/page
        const match = s.match(
          /([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/
        );

        if (!match) return null;

        let domainCandidate = match[0];

        try {
          // Add protocol if missing so URL() object accepts it
          if (!domainCandidate.startsWith("http")) {
            domainCandidate = "http://" + domainCandidate;
          }
          const urlObj = new URL(domainCandidate);
          // Return hostname without 'www.'
          return urlObj.hostname.replace(/^www\./, "");
        } catch (err) {
          return null;
        }
      };

      // LOOP: Go through every Sheet, every Row, every Cell
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        // json_to_sheet gets us an array of objects
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          header: 1, // Treat as array of arrays (skips header logic issues)
          blankrows: false,
        });

        rows.forEach((row) => {
          // Row is an array of cells [ColA, ColB, ColC...]
          row.forEach((cellValue) => {
            const domain = cleanDomain(cellValue);
            if (domain) {
              // Filter out common false positives (like "no.", "mr.", file extensions)
              if (
                domain.length > 3 &&
                !domain.endsWith(".png") &&
                !domain.endsWith(".jpg") &&
                !domain.endsWith(".pdf")
              ) {
                extractedDomains.add(domain);
              }
            }
          });
        });
      });

      const finalDomainList = Array.from(extractedDomains);

      if (finalDomainList.length === 0) {
        status.textContent = "⚠️ No valid domains found in file.";
        status.style.color = "#e17055";
        return;
      }

      const key = isSecondary ? "watchtower_secondary" : "watchtower_primary";
      const countKey = isSecondary ? "secondaryCount" : "primaryCount";

      // Save to storage
      chrome.storage.local.set(
        {
          [key]: finalDomainList,
          [countKey]: finalDomainList.length,
          watchtower_filename: file.name,
        },
        () => {
          updateWatchtowerDisplay(); // Update UI
          broadcastDomainStatus(); // Tell open tabs immediately

          // Clear stale acknowledgments
          chrome.storage.local.remove("watchtower_acknowledged");

          // Visual Success Feedback
          const typeLabel = isSecondary ? "Secondary DB" : "Primary DB";
          const color = isSecondary ? "#00b894" : "#d63031"; // Green or Red

          status.textContent = `✅ Loaded ${typeLabel}: ${finalDomainList.length} domains`;
          status.style.color = color;
          status.style.fontWeight = "bold";

          // Clear toast after 4s
          clearTimeout(window.statusToastTimeout);
          window.statusToastTimeout = setTimeout(() => {
            status.textContent = "";
            status.style.opacity = "0.7";
          }, 4000);
        }
      );
    };
    reader.readAsArrayBuffer(file);
  }

  // ============================================================
  // 📘 GUIDE MODAL LOGIC
  // ============================================================
  const guideBtn = document.getElementById("guideBtn");
  const guideModal = document.getElementById("guideModal");
  const closeGuide = document.getElementById("closeGuide");

  if (guideBtn && guideModal) {
    guideBtn.addEventListener("click", () => {
      guideModal.style.display = "block";
    });

    closeGuide.addEventListener("click", () => {
      guideModal.style.display = "none";
    });

    // Close if clicking outside the white box
    guideModal.addEventListener("click", (e) => {
      if (e.target === guideModal) {
        guideModal.style.display = "none";
      }
    });
  }

  // Attach file upload listeners
  xlsxInput1.addEventListener("change", (e) => {
    if (e.target.files[0]) processWatchtowerFile(e.target.files[0], false);
  });
  xlsxInput2.addEventListener("change", (e) => {
    if (e.target.files[0]) processWatchtowerFile(e.target.files[0], true);
  });
  // Also listen to the "Add Secondary DB" button in active view
  const xlsxInput2_active = document.getElementById("xlsxInput2_active");
  if (xlsxInput2_active) {
    xlsxInput2_active.addEventListener("change", (e) => {
      if (e.target.files[0]) processWatchtowerFile(e.target.files[0], true);
    });
  }

  if (clearDbBtn) {
    clearDbBtn.addEventListener("click", () => {
      chrome.storage.local.get(
        ["primaryCount", "secondaryCount", "watchtower_pasted"],
        (data) => {
          const p = data.primaryCount || 0;
          const s = data.secondaryCount || 0;
          const pasted = (data.watchtower_pasted || []).length;

          // Case 1: Only Pasted List is active
          if (p === 0 && s === 0 && pasted > 0) {
            if (confirm("Clear Pasted URLs list?")) {
              chrome.storage.local.remove(["watchtower_pasted"], () => {
                updateWatchtowerDisplay();
                broadcastDomainStatus();
                // Clear stale acknowledgments
                chrome.storage.local.remove("watchtower_acknowledged");
              });
            }
            return;
          }

          // Case 2: Excel lists are active (original logic)
          if (p > 0 && s > 0) {
            if (
              confirm(
                "Clear PRIMARY DB only? (Click Cancel to clear Secondary)"
              )
            ) {
              chrome.storage.local.remove(
                ["watchtower_primary", "primaryCount"],
                updateWatchtowerDisplay
              );
            } else {
              chrome.storage.local.remove(
                ["watchtower_secondary", "secondaryCount"],
                updateWatchtowerDisplay
              );
            }
          } else if (p > 0) {
            if (confirm("Clear Primary DB?")) {
              chrome.storage.local.remove(
                ["watchtower_primary", "primaryCount", "watchtower_filename"],
                () => {
                  showUploadState();
                  if (xlsxInput1) xlsxInput1.value = "";
                }
              );
            }
          } else if (s > 0) {
            if (confirm("Clear Secondary DB?")) {
              chrome.storage.local.remove(
                [
                  "watchtower_secondary",
                  "secondaryCount",
                  "watchtower_filename",
                ],
                updateWatchtowerDisplay
              );
            }
          }

          // Case 3: Pasted list coexists with Excel → add a third option
          if ((p > 0 || s > 0) && pasted > 0) {
            if (
              confirm(
                "Also clear Pasted URLs list? (OK = Yes, Cancel = Keep it)"
              )
            ) {
              chrome.storage.local.remove(["watchtower_pasted"], () => {
                pastedUrls.value = ""; // 👈 Clear UI
                updateWatchtowerDisplay();
                broadcastDomainStatus();
              });
            }
          }
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

  function showActiveState() {
    updateWatchtowerDisplay();
  }

  function updateWatchtowerDisplay() {
    chrome.storage.local.get(
      [
        "watchtower_primary",
        "primaryCount",
        "watchtower_secondary",
        "secondaryCount",
        "watchtower_pasted", // ← NEW
        "watchtower_filename",
      ],
      (data) => {
        const p = data.primaryCount || 0;
        const s = data.secondaryCount || 0;
        const pasted = (data.watchtower_pasted || []).length; // ← NEW
        const total = p + s + pasted;
        if (total === 0) {
          uploadView.style.display = "block";
          activeView.style.display = "none";
          return;
        }
        uploadView.style.display = "none";
        activeView.style.display = "block";
        domainCount.textContent = total;
        let label = "";
        const parts = [];
        if (p > 0) parts.push(`Primary: ${p}`);
        if (s > 0) parts.push(`Secondary: ${s}`);
        if (pasted > 0) parts.push(`Pasted: ${pasted}`); // ← NEW
        label = parts.join(" | ") + (parts.length > 1 ? " (All Active)" : "");
        dbStatus.textContent = label;
        dbStatus.style.color = "#00b894";
      }
    );
  }

  // Send current domain status to content script
  function broadcastDomainStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.url) return;

      const url = tabs[0].url;
      const domain = extractDomain(url);

      if (!domain) return;

      chrome.storage.local.get(
        ["watchtower_primary", "watchtower_secondary"],
        (data) => {
          const primary = data.watchtower_primary || [];
          const secondary = data.watchtower_secondary || [];
          const all = [...primary, ...secondary];

          const inPrimary = primary.includes(domain);
          const inSecondary = secondary.includes(domain);
          const exists = all.includes(domain);

          chrome.tabs.sendMessage(tabs[0].id, {
            type: "WATCHTOWER_STATUS",
            domain,
            exists,
            inPrimary,
            inSecondary,
            total: all.length,
          });
        }
      );
    });
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
      "real estate",
      "real-estate",
      "property",
      "residential",
      "commercial property",
      "house",
      "homes",
      "home sale",
      "buy house",
      "sell house",
      "apartment",
      "condo",
      "condominium",
      "rent",
      "rental",
      "lease",
      "mortgage",
      "realtor",
      "realty",
      "broker",
      "estate agent",
      "property management",
      "housing",
      "listing",
      "open house",
      "bedroom",
      "bathroom",
    ],
    "automotive/cars/vehicles": [
      "car",
      "cars",
      "vehicle",
      "vehicles",
      "auto",
      "automotive",
      "car dealer",
      "car dealership",
      "used cars",
      "new cars",
      "car sale",
      "sell my car",
      "auto repair",
      "mechanic",
      "service center",
      "oil change",
      "tire shop",
      "tire",
      "engine",
      "transmission",
      "car parts",
      "detailer",
      "tow",
      "truck",
      "suv",
      "sedan",
      "dealer",
    ],
    "technology/computer/internet": [
      "technology",
      "tech",
      "software",
      "software development",
      "developer",
      "web developer",
      "web development",
      "app",
      "mobile app",
      "app developer",
      "website",
      "web design",
      "hosting",
      "server",
      "cloud",
      "saas",
      "data",
      "analytics",
      "seo",
      "search engine optimization",
      "digital marketing",
      "it support",
      "computer",
      "hardware",
      "network",
      "internet",
      "email",
      "cybersecurity",
    ],
    "health/beauty/fitness": [
      "health",
      "medical",
      "clinic",
      "doctor",
      "dentist",
      "dental",
      "hospital",
      "wellness",
      "fitness",
      "gym",
      "personal trainer",
      "workout",
      "nutrition",
      "diet",
      "spa",
      "salon",
      "beauty",
      "cosmetics",
      "makeup",
      "skincare",
      "skin care",
      "hair",
      "hair salon",
      "massage",
      "esthetician",
      "clinic",
    ],
    "business/finance/services": [
      "business",
      "company",
      "corporate",
      "consulting",
      "consultant",
      "finance",
      "financial",
      "bank",
      "accounting",
      "accountant",
      "tax",
      "tax service",
      "investment",
      "investment advisor",
      "insurance",
      "insurer",
      "loan",
      "mortgage broker",
      "legal",
      "lawyer",
      "attorney",
      "services",
      "agency",
      "marketing agency",
      "office",
      "b2b",
      "small business",
    ],
    "shopping/fashion/retail": [
      "shopping",
      "shop",
      "store",
      "retail",
      "ecommerce",
      "e-commerce",
      "online store",
      "fashion",
      "clothing",
      "apparel",
      "shoes",
      "jewelry",
      "accessories",
      "sale",
      "discount",
      "coupon",
      "order",
      "catalog",
      "boutique",
      "gift shop",
      "furniture",
      "home goods",
    ],
    "travel/vacation/tourism": [
      "travel",
      "travel agent",
      "vacation",
      "holiday",
      "tour",
      "tourism",
      "tour operator",
      "hotel",
      "resort",
      "flight",
      "airline",
      "booking",
      "car rental",
      "rental",
      "destination",
      "cruise",
      "travel guide",
      "tourist",
      "vacation rental",
    ],
    "education/learning/training": [
      "education",
      "school",
      "college",
      "university",
      "course",
      "online course",
      "e-learning",
      "training",
      "tutor",
      "tutoring",
      "class",
      "program",
      "degree",
      "student",
      "learning",
      "certification",
      "workshop",
      "seminar",
      "academy",
      "teacher",
      "coaching",
    ],
  };

  // 2. The Analyzer (Fixed: Word Boundaries)
  function autoSuggestCategory(text) {
    if (isCatLocked) return;

    // Helpers
    const stopwords = new Set([
      "the",
      "and",
      "a",
      "an",
      "of",
      "in",
      "on",
      "for",
      "to",
      "with",
      "by",
      "at",
      "from",
      "is",
      "are",
      "or",
      "that",
      "this",
      "it",
      "as",
      "be",
      "was",
      "were",
      "has",
      "have",
    ]);

    const normalize = (s) =>
      (s || "")
        .toLowerCase()
        .replace(/[’'`]/g, "") // remove curly quotes
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const tokens = normalize(text)
      .split(" ")
      .filter(Boolean)
      .filter((t) => !stopwords.has(t));
    if (tokens.length === 0) return;

    // Build unigrams + bigrams
    const unigrams = new Set(tokens);
    const bigrams = new Set();
    for (let i = 0; i < tokens.length - 1; i++)
      bigrams.add(tokens[i] + " " + tokens[i + 1]);

    // Simple fuzzy test (small Levenshtein, fast)
    const smallEditMatch = (a, b) => {
      if (!a || !b) return false;
      if (Math.abs(a.length - b.length) > 1) return false;
      // quick equal or includes
      if (a === b || a.includes(b) || b.includes(a)) return true;
      // tiny Levenshtein <=1
      let i = 0,
        j = 0,
        edits = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
          i++;
          j++;
        } else {
          edits++;
          if (edits > 1) return false;
          if (a.length > b.length) i++;
          else if (b.length > a.length) j++;
          else {
            i++;
            j++;
          }
        }
      }
      edits += a.length - i + (b.length - j);
      return edits <= 1;
    };

    // Score categories
    const scores = {};
    for (const [catName, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const kw of keywords) {
        const k = normalize(kw);
        if (!k) continue;

        // Phrase match (bigram or longer)
        if (k.includes(" ")) {
          if (bigrams.has(k)) score += 4; // strong boost for phrase
          else if (tokens.join(" ").includes(` ${k} `)) score += 2;
        } else {
          // unigram matches
          if (unigrams.has(k)) score += 2;
          else {
            // approximate/fuzzy match for short spelling differences
            for (const t of unigrams) {
              if (smallEditMatch(t, k)) {
                score += 1;
                break;
              }
            }
          }
        }
      }
      if (score > 0) scores[catName] = score;
    }

    // Pick best candidate if clear winner
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return;

    const [bestCat, bestScore] = entries[0];
    const secondScore = entries[1] ? entries[1][1] : 0;

    // Require minimum score and clear margin to avoid false positives
    const MIN_SCORE = 3;
    const MARGIN = 1.5; // best must be 1.5x second best
    if (bestScore >= MIN_SCORE && bestScore >= secondScore * MARGIN) {
      const catInput = document.getElementById("category");
      if (catInput && catInput.value !== bestCat) {
        catInput.value = bestCat;
        catInput.style.transition = "background 0.2s";
        catInput.style.background = "#fff7d1";
        setTimeout(() => {
          if (isCatLocked) catInput.style.background = "#f5f5f5";
          else catInput.style.background = "white";
        }, 500);
      }
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

  // ...existing code...
  // 1. LISTEN FOR PASTE IN DESCRIPTION
  masterInput.addEventListener("paste", (e) => {
    // Let the native paste occur; we only inspect clipboard and final content.
    let pastedHTML = "";
    let pastedText = "";

    if (e.clipboardData) {
      pastedHTML = e.clipboardData.getData("text/html");
      pastedText = e.clipboardData.getData("text/plain");
    } else if (window.clipboardData) {
      pastedText = window.clipboardData.getData("Text");
    }

    let analyzeText = (pastedText || "").trim();
    let htmlAnchorText = "";

    if (pastedHTML) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(pastedHTML, "text/html");
        const anchor = doc.querySelector("a");
        if (anchor)
          htmlAnchorText = (
            anchor.innerText ||
            anchor.textContent ||
            ""
          ).trim();

        if (!analyzeText)
          analyzeText =
            doc.body && doc.body.textContent ? doc.body.textContent.trim() : "";

        if (htmlAnchorText) {
          pendingAnchorText = htmlAnchorText;
          analyzeText = analyzeText || htmlAnchorText;
          pendingFullText = pastedText || analyzeText || "";
        }
      } catch (err) {
        // ignore parse errors
      }
    }

    // Immediate attempt using clipboard payload
    if (analyzeText) {
      autoSuggestCategory(analyzeText);
    } else {
      // Fallback: read the editor content after the native paste completes
      setTimeout(() => {
        const finalText = (
          masterInput.innerText ||
          masterInput.textContent ||
          masterInput.value ||
          ""
        ).trim();
        if (finalText) autoSuggestCategory(finalText);
      }, 50);
    }

    // Preserve strategy modal behavior for anchors / semicolon hints
    if (pastedHTML && pastedHTML.includes("<a ")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pastedHTML, "text/html");
      const anchor = doc.querySelector("a");

      if (anchor) {
        pendingFullText =
          pastedText ||
          pendingFullText ||
          (doc.body && doc.body.textContent) ||
          "";
        setTimeout(() => {
          strategyModal.style.display = "block";
        }, 100);
      }
    } else if ((pastedText || "").includes(";")) {
      pendingAnchorText = pendingAnchorText || "";
      pendingFullText = pastedText;
      setTimeout(() => {
        strategyModal.style.display = "block";
      }, 100);
    }

    // FINAL FALLBACK: if category still empty after autoSuggest runs, fill a safe default.
    // Delay allows autoSuggestCategory (sync or async) to update the UI first.
    setTimeout(() => {
      try {
        // Flexible selector to find the category field in the popup
        const categoryInput = document.querySelector(
          '#category, input[name="category"], input[id*="category"], input[placeholder*="Category"], textarea[name="category"], textarea[id*="category"]'
        );

        const getVal = (el) =>
          el
            ? (el.value !== undefined
                ? el.value
                : el.innerText || el.textContent || ""
              )
                .toString()
                .trim()
            : "";

        if (!isCatLocked && categoryInput && getVal(categoryInput) === "") {
          // Set fallback category
          if (categoryInput.value !== undefined)
            categoryInput.value = "Business/Other";
          else categoryInput.innerText = "Business/Other";

          // Trigger events so bound handlers react
          categoryInput.dispatchEvent(new Event("input", { bubbles: true }));
          categoryInput.dispatchEvent(new Event("change", { bubbles: true }));
          // Optional visual hint (if toast exists in popup)
          try {
            if (typeof showStatus === "function")
              showStatus("Category set: Business/Other");
          } catch (e) {}
        }
      } catch (err) {
        // swallow errors to avoid breaking paste flow
        console.warn("Category fallback error:", err);
      }
    }, 300); // 300ms gives autoSuggestCategory time to act
  });
  // ...existing code...
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

  // ============================================================
  // ⚡ AUTO-SAVE ENGINE (Debounced)
  // ============================================================
  let autoSaveTimer;

  const triggerAutoSave = () => {
    // Clear the previous timer (reset the clock if they keep typing)
    clearTimeout(autoSaveTimer);

    // Wait 500ms after the last keystroke, then save
    autoSaveTimer = setTimeout(() => {
      saveCurrentFormToMemory();
      saveStore("✅ Auto-Saved"); // Updates the status text
    }, 500);
  };

  // 1. Attach to all Standard Inputs
  formFields.forEach((field) => {
    const el = document.getElementById(field);
    if (el) {
      // 'input' event catches typing, deleting, AND pasting
      el.addEventListener("input", triggerAutoSave);
    }
  });

  // 2. Attach to the Description Box (ContentEditable)
  if (masterInput) {
    masterInput.addEventListener("input", triggerAutoSave);
  }

  // ============================================================
  // 📝 EDITOR ENGINE: HYPERLINKS & HTML TOGGLE
  // ============================================================

  const btnSource = document.getElementById("btnSource");
  const btnLink = document.getElementById("btnLink");
  const btnBold = document.getElementById("btnBold");
  const btnItalic = document.getElementById("btnItalic");

  const masterDiv = document.getElementById("masterInput");
  const sourceArea = document.getElementById("sourceInput");

  const linkModal = document.getElementById("linkModal");
  const urlInput = document.getElementById("urlInput");
  const applyLinkBtn = document.getElementById("applyLinkBtn");
  const cancelLinkBtn = document.getElementById("cancelLinkBtn");

  let isHtmlMode = false;
  let savedSelectionRange = null; // To remember where to put the link

  // --- 1. HTML SOURCE TOGGLE ---
  btnSource.addEventListener("click", () => {
    isHtmlMode = !isHtmlMode;

    if (isHtmlMode) {
      // Switch to Code View
      sourceArea.value = masterDiv.innerHTML; // Dump HTML into Textarea
      masterDiv.style.display = "none";
      sourceArea.style.display = "block";
      btnSource.style.background = "#2d3436";
      btnSource.style.color = "#fff";
      // Disable other buttons
      [btnBold, btnItalic, btnLink].forEach((b) => (b.disabled = true));
    } else {
      // Switch to Visual View
      masterDiv.innerHTML = sourceArea.value; // Render HTML back to Div
      sourceArea.style.display = "none";
      masterDiv.style.display = "block";
      btnSource.style.background = "";
      btnSource.style.color = "#d63031";
      [btnBold, btnItalic, btnLink].forEach((b) => (b.disabled = false));

      // Trigger Auto-Save immediately so data isn't lost
      masterDiv.dispatchEvent(new Event("input"));
    }
  });

  // Sync changes from Textarea to Auto-Save logic
  sourceArea.addEventListener("input", () => {
    // We temporarily update the hidden div so the auto-save function grabs the right data
    masterDiv.innerHTML = sourceArea.value;
    triggerAutoSave();
  });

  // --- 2. LINK TOOLBAR BUTTONS ---
  btnBold.addEventListener("click", () => document.execCommand("bold"));
  btnItalic.addEventListener("click", () => document.execCommand("italic"));
  btnLink.addEventListener("click", () => showLinkUI());

  // --- 3. THE "1-SECOND HOLD" LOGIC ---
  let selectionTimer = null;

  document.addEventListener("selectionchange", () => {
    // Only run if we are in Visual Mode and the modal isn't already open
    if (isHtmlMode || linkModal.style.display === "block") return;

    // Clear existing timer
    clearTimeout(selectionTimer);

    const selection = window.getSelection();

    // Check if selection is within our editor
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!masterDiv.contains(range.commonAncestorContainer)) return;

    // Check if user actually selected text (length > 0)
    if (selection.toString().trim().length > 0) {
      // ⏳ Start the 1-second countdown
      selectionTimer = setTimeout(() => {
        showLinkUI();
      }, 1000); // 1000ms = 1 second
    }
  });

  // --- 4. LINK MODAL LOGIC ---
  function showLinkUI() {
    // Save the selection (because clicking the input will lose it)
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRange = selection.getRangeAt(0);
    }

    const currentText = selection.toString();
    if (!currentText && !savedSelectionRange) return; // Don't show if nothing selected

    linkModal.style.display = "block";
    urlInput.value = "";
    urlInput.focus();
  }

  function closeLinkUI() {
    linkModal.style.display = "none";
    savedSelectionRange = null;
  }

  applyLinkBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (url && savedSelectionRange) {
      // Restore selection
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRange);

      // Execute Command
      document.execCommand("createLink", false, url);

      // Trigger Save
      masterDiv.dispatchEvent(new Event("input"));
    }
    closeLinkUI();
  });

  cancelLinkBtn.addEventListener("click", closeLinkUI);

  // Allow "Enter" key in the URL box
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyLinkBtn.click();
    if (e.key === "Escape") closeLinkUI();
  });

  // Load saved pasted list (if any)
  chrome.storage.local.get(["watchtower_pasted"], (data) => {
    if (data.watchtower_pasted) {
      pastedUrls.value = data.watchtower_pasted.join("\n");
    }
  });

  // ============================================================
  // 💾 SAVED FORMATS MANAGER
  // ============================================================
  function loadAndRenderFormats() {
    const formatList = document.getElementById("savedFormatsList");
    const formatStats = document.getElementById("formatStats");

    if (!formatList || !formatStats) return; // Guard if HTML isn't loaded

    // Check sync first, fallback to local
    chrome.storage.sync.get(null, (syncData) => {
      if (chrome.runtime.lastError || Object.keys(syncData).length === 0) {
        // Fallback to local
        chrome.storage.local.get(null, (localData) => {
          renderFormatList(localData, formatList, formatStats);
        });
      } else {
        renderFormatList(syncData, formatList, formatStats);
      }
    });
  }

  function renderFormatList(data, listEl, statsEl) {
    const formatEntries = Object.entries(data)
      .filter(([key]) => key.startsWith("pref_"))
      .map(([key, value]) => ({
        domain: key.replace("pref_", ""),
        format: value,
      }));

    statsEl.textContent = `${formatEntries.length} saved`;

    if (formatEntries.length === 0) {
      listEl.innerHTML =
        '<div style="text-align: center; padding: 10px; color: #666">No saved formats</div>';
      return;
    }

    listEl.innerHTML = "";
    formatEntries.forEach(({ domain, format }) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.padding = "6px 0";
      item.style.borderBottom = "1px solid #eee";
      item.innerHTML = `
      <div>
        <div style="font-weight: bold; font-size: 12px">${domain}</div>
        <div style="font-size: 11px; color: #6c5ce7">${format}</div>
      </div>
      <button class="delete-format" data-domain="${domain}" style="
        background: #ff7675; color: white; border: none; border-radius: 4px;
        padding: 2px 8px; font-size: 10px; cursor: pointer;
      ">🗑️</button>
    `;
      listEl.appendChild(item);
    });

    // Add delete listeners
    listEl.querySelectorAll(".delete-format").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const domain = e.target.dataset.domain;
        if (confirm(`Remove saved format for ${domain}?`)) {
          chrome.storage.sync.remove(`pref_${domain}`, () => {
            if (chrome.runtime.lastError) {
              chrome.storage.local.remove(`pref_${domain}`);
            }
            loadAndRenderFormats(); // Refresh
          });
        }
      });
    });
  }

  // Load on init
  loadAndRenderFormats();
  // Refresh list when preference is saved/removed from content script
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "REFRESH_SAVED_FORMATS") {
      loadAndRenderFormats();
    }
  });

  // Clear All button
  const clearFormatsBtn = document.getElementById("clearFormatsBtn");
  if (clearFormatsBtn) {
    clearFormatsBtn.addEventListener("click", () => {
      if (
        confirm("Clear ALL saved format preferences? This cannot be undone.")
      ) {
        chrome.storage.sync.clear(() => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.clear(() => {
              loadAndRenderFormats();
              status.textContent = "✅ All formats cleared (local)";
              setTimeout(() => (status.textContent = ""), 3000);
            });
          } else {
            loadAndRenderFormats();
            status.textContent = "✅ All formats cleared (sync)";
            setTimeout(() => (status.textContent = ""), 3000);
          }
        });
      }
    });
  }
});
