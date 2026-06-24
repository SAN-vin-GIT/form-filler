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
    console.error("Form Filler popup: Script execution failed", err);
  }
}

document.getElementById("fillAll").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    await executeScriptWithFallback(tab.id, {
      func: () => {
        if (typeof window.__ff !== "undefined" && typeof window.__ff.fillAll === "function") {
          window.__ff.fillAll();
        }
      }
    });
  }
  window.close();
});

document.querySelectorAll(".grid-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const type = btn.getAttribute("data-type");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await executeScriptWithFallback(tab.id, {
        func: (t) => {
          if (typeof window.__ff !== "undefined" && typeof window.__ff.fillFocused === "function") {
            window.__ff.fillFocused(t);
          }
        },
        args: [type]
      });
    }
    window.close();
  });
});