// Track the tab you came from
let returnTabId = null;

// --- EXISTING COMMAND LOGIC ---
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "COMMAND", command });
    }
  });
});

// --- SWITCHER HUB ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. FAKEMAIL (Alt + 2xClick) -> Always Refreshes
  if (request.type === "ACTIVATE_FAKEMAIL") {
    const targetUrl = "https://www.fakemail.net/";
    chrome.tabs.query({ url: "*://*.fakemail.net/*" }, (tabs) => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        chrome.windows.update(tab.windowId, { focused: true });
        chrome.tabs.update(tab.id, { active: true, url: targetUrl });
      } else {
        chrome.tabs.create({ url: targetUrl });
      }
    });
  }

  // 2. CONVERTER (Shift + Alt + 2xClick) -> TOGGLE (Ping-Pong)
  if (request.type === "ACTIVATE_CONVERTER") {
    const converterUrlPart = "shakeeb-sa.github.io/multi-format-link-converter";
    const converterFullUrl =
      "https://shakeeb-sa.github.io/multi-format-link-converter/";

    // CHECK: Are we currently ON the Converter page?
    // sender.tab.url is the URL of the tab where you pressed the keys
    if (sender.tab.url.includes(converterUrlPart)) {
      // --- LOGIC: GO BACK ---
      if (returnTabId) {
        // Check if the old tab still exists
        chrome.tabs.get(returnTabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            // Tab was closed? Do nothing.
          } else {
            // Switch back to original tab
            chrome.windows.update(tab.windowId, { focused: true });
            chrome.tabs.update(returnTabId, { active: true });
          }
        });
      }
    } else {
      // --- LOGIC: GO TO CONVERTER ---

      // 1. Save the current Tab ID so we can return later
      returnTabId = sender.tab.id;

      // 2. Find and Switch to Converter
      chrome.tabs.query(
        { url: "*://shakeeb-sa.github.io/multi-format-link-converter/*" },
        (tabs) => {
          if (tabs.length > 0) {
            const tab = tabs[0];
            chrome.windows.update(tab.windowId, { focused: true });
            chrome.tabs.update(tab.id, { active: true });
          } else {
            chrome.tabs.create({ url: converterFullUrl });
          }
        }
      );
    }
  }
});
