const DATA_TYPES = [
  { id: "full_name", title: "Full Name" },
  { id: "first_name", title: "First Name" },
  { id: "last_name", title: "Last Name" },
  { id: "email", title: "Email" },
  { id: "username", title: "Username" },
  { id: "password", title: "Password" },
  { id: "phone", title: "Phone" },
  { id: "job_title", title: "Job Title" },
  { id: "company", title: "Company" },
  { id: "ein", title: "ID No." },
  { id: "domain", title: "Domain" },
  { id: "website", title: "Website" },
  { id: "address", title: "Address" },
  { id: "city", title: "City" },
  { id: "state", title: "State" },
  { id: "zip", title: "ZIP Code" },
  { id: "country", title: "Country" },
  { id: "routing_number", title: "Routing Number" },
  { id: "account_number", title: "Account Number" },
  { id: "words", title: "Words" },
  { id: "sentence", title: "Sentence" },
  { id: "paragraph", title: "Paragraph" },
  { id: "text", title: "Text" },
  { id: "datetime", title: "Datetime" },
  { id: "number", title: "Number" }
];

chrome.runtime.onInstalled.addListener(() => {
  // Option 1: Fill entire form
  chrome.contextMenus.create({
    id: "fillAll",
    title: "Fill entire form with fake data",
    contexts: ["page", "editable"]
  });

  // Divider separator
  chrome.contextMenus.create({
    id: "sep",
    type: "separator",
    contexts: ["editable"]
  });

  // Individual data type menus grouped with separators
  DATA_TYPES.forEach((dt, index) => {
    // Insert spacing separators between semantic groups
    const groupStarts = ["email", "job_title", "domain", "address", "routing_number", "words", "datetime"];
    if (groupStarts.includes(dt.id) && index > 0) {
      chrome.contextMenus.create({
        id: `sep_${dt.id}`,
        type: "separator",
        contexts: ["editable"]
      });
    }

    chrome.contextMenus.create({
      id: `fillField_${dt.id}`,
      title: dt.title,
      contexts: ["editable"]
    });
  });
});

async function executeScriptWithFallback(tabId, details) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => {
        try {
          return typeof window.__ff !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
        } catch (e) {
          return false;
        }
      }
    });
    
    const isLoaded = results && results[0] && results[0].result;
    
    if (!isLoaded) {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ["faker.min.js", "data/us_locations.js", "content.js"]
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      ...details
    });
  } catch (err) {
    console.error("Form Filler background: Script execution or injection failed", err);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "fillAll") {
    executeScriptWithFallback(tab.id, {
      func: () => {
        if (typeof window.__ff !== "undefined" && typeof window.__ff.fillAll === "function") {
          window.__ff.fillAll();
        }
      }
    });
  } else if (info.menuItemId.startsWith("fillField_")) {
    const type = info.menuItemId.replace("fillField_", "");
    executeScriptWithFallback(tab.id, {
      func: (t) => {
        if (typeof window.__ff !== "undefined" && typeof window.__ff.fillFocused === "function") {
          window.__ff.fillFocused(t);
        }
      },
      args: [type]
    });
  }
});