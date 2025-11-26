document.addEventListener("DOMContentLoaded", () => {
  // Elements
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

  const formFields = [
    "username", "email", "password", "firstName", "lastName",
    "website", "company", "title", "phone", "address",
    "city", "zip", "region", "country", "category"
  ];

  let store = {
    activeId: null,
    profiles: {}
  };

  // --- 1. INITIALIZATION ---
  // Use STORAGE.LOCAL for unlimited space
  chrome.storage.local.get(null, (data) => {
    // Setup Defaults if fresh install
    if (!data.profiles || Object.keys(data.profiles).length === 0) {
      const newId = generateUUID();
      store = {
        activeId: newId,
        profiles: { [newId]: { name: "Default Profile", data: {} } }
      };
      saveStore();
    } else {
      store = data;
    }
    renderUI();
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
    formFields.forEach(field => {
      const el = document.getElementById(field);
      if (el) el.value = activeData[field] || "";
    });
    masterInput.innerHTML = activeData.masterHTML || "";
  }

  function saveCurrentFormToMemory() {
    if (!store.activeId) return;
    const formData = {};
    formFields.forEach(field => {
      const el = document.getElementById(field);
      if (el) formData[field] = el.value;
    });
    formData.masterHTML = masterInput.innerHTML;
    
    store.profiles[store.activeId].data = formData;
  }

  function saveStore(msg = "Saved!") {
    chrome.storage.local.set(store, () => {
      // Sync 'activeProfile' to storage so content script can find it easily
      // We flatten the active profile data for easier content script access
      const flatData = store.profiles[store.activeId].data;
      chrome.storage.local.set({ "current_flat_data": flatData }, () => {
          status.textContent = msg;
          setTimeout(() => status.textContent = "", 2000);
      });
    });
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // --- 3. EVENT LISTENERS ---
  
  // Switch Profile
  profileSelect.addEventListener("change", (e) => {
    saveCurrentFormToMemory(); // Auto-save before switching
    store.activeId = e.target.value;
    saveStore("Switched");
    renderUI();
  });

  // New Profile
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

  // Rename
  renameBtn.addEventListener("click", () => {
    const newName = prompt("New Name:", store.profiles[store.activeId].name);
    if (newName) {
      store.profiles[store.activeId].name = newName;
      saveStore("Renamed");
      renderUI();
    }
  });

  // Delete
  deleteBtn.addEventListener("click", () => {
    if (Object.keys(store.profiles).length <= 1) {
      alert("You must keep at least one profile.");
      return;
    }
    if (confirm(`Delete "${store.profiles[store.activeId].name}"?`)) {
      delete store.profiles[store.activeId];
      store.activeId = Object.keys(store.profiles)[0]; // Switch to first available
      saveStore("Deleted");
      renderUI();
    }
  });

  // Explicit Save Button
  saveBtn.addEventListener("click", () => {
    saveCurrentFormToMemory();
    saveStore("Saved Successfully!");
  });

  // --- 4. IMPORT / EXPORT ---
  
  exportBtn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "linkbuilder_backup_" + new Date().toISOString().slice(0,10) + ".json");
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

});