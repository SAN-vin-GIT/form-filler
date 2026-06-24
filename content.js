(function () {
  let lastRightClickedElement = null;

  document.addEventListener("contextmenu", (e) => {
    lastRightClickedElement = e.target;
  }, true);

  const KEYWORDS = {
    first_name: ["firstname", "fname", "first"],
    last_name: ["lastname", "lname", "last"],
    middle_name: ["middlename", "mname", "middle", "middle_name"],
    middle_initial: ["middleinitial", "middle_initial", "mi", "m_initial", "middleinitials"],
    full_name: ["fullname", "name", "yourname", "displayname"],
    email: ["email", "e-mail", "mail"],
    username: ["username", "user_name", "user", "login", "handle"],
    password: ["password", "passwd", "pass", "pwd"],
    phone: ["phone", "telephone", "tel", "mobile", "cell", "contact"],
    job_title: ["jobtitle", "job_title", "job", "title", "position", "role", "occupation"],
    company: ["company", "organization", "organisation", "employer", "business", "firm", "corp", "org"],
    domain: ["domain"],
    website: ["website", "web_site", "url"],
    ein: [
      "ein", "employeridentificationnumber", "employer_identification", "taxid", "tax_id", "fein",
      "employeeno", "employeenumber", "employeeid", "employee_id", "employerid", "employer_id",
      "taxnumber", "tax_number", "taxregistration", "tax_registration", "businessnumber", "business_number",
      "businessregistration", "business_registration"
    ],
    address: ["address", "addr", "street"],
    city: ["city", "town", "locality"],
    state: ["state", "province", "region"],
    zip: ["zipcode", "zip_code", "zip", "postal", "postcode"],
    country: ["country", "nation"],
    routing_number: ["routing", "routingnumber", "aba", "transitnumber", "bankcode"],
    account_number: ["accountnumber", "acctnumber", "acctnum", "accountno", "acctno"],
    card_number: ["cardnumber", "card_number", "ccnum", "cc_num", "creditcard", "credit_card", "ccno", "cardno", "pan"],
    card_expiry: ["exp", "expiry", "expiration", "cc-exp", "exp-date", "expdate", "expiry_date"],
    card_cvv: ["cvv", "cvc", "csc", "securitycode", "security_code", "verificationcode", "verification_code", "cvn", "cid"],
    sex: ["sex", "gender", "gender_identity"],
    social_security_number: ["ssn", "socialsecurity", "social_security", "socialsecuritynumber", "social_security_number"],
    driver_license_number: ["driverlicense", "driverslicense", "driver_license", "drivers_license", "licenseno", "license_number", "licensenumber"],
    birth_place: ["birthplace", "birth_place", "placeofbirth", "place_of_birth"],
    income: ["income", "salary", "annualincome", "annual_income", "revenue"],
    words: ["words", "tags", "keywords"],
    sentence: ["sentence", "summary", "headline", "tagline"],
    paragraph: ["paragraph", "description", "bio", "about", "notes", "comment", "message", "feedback", "review"],
    text: ["text", "content", "body", "details", "info"],
    datetime: ["datetime", "date", "time", "dob", "birthdate"],
    number: ["number", "num", "quantity", "qty", "amount", "count", "age"]
  };

  const TYPE_CHECK_ORDER = [
    "first_name",
    "last_name",
    "middle_initial",
    "middle_name",
    "domain",
    "website",
    "ein",
    "email",
    "password",
    "phone",
    "city",
    "state",
    "zip",
    "country",
    "address",
    "company",
    "job_title",
    "username",
    "full_name",
    "routing_number",
    "account_number",
    "card_number",
    "card_expiry",
    "card_cvv",
    "sex",
    "social_security_number",
    "driver_license_number",
    "birth_place",
    "income",
    "words",
    "sentence",
    "paragraph",
    "text",
    "datetime",
    "number"
  ];

  function matchSignal(signal) {
    if (!signal) return null;
    
    // 1. Split camelCase first, e.g. "myFirstName" -> "my First Name"
    const cleanSignal = signal.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    
    const normalized = cleanSignal.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalized) return null;

    // Split by non-alphanumeric characters
    const words = cleanSignal.toLowerCase().split(/[^a-z0-9]+/);

    // Phase 1: Exact match on normalized strings (e.g. "zipcode" === "zipcode")
    for (const type of TYPE_CHECK_ORDER) {
      const list = KEYWORDS[type];
      for (const kw of list) {
        const normKw = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normalized === normKw) {
          return type;
        }
      }
    }

    // Phase 2: Exact match of any word in the signal with the keyword
    // e.g. "zip" in ["billing", "zip", "code"]
    for (const type of TYPE_CHECK_ORDER) {
      const list = KEYWORDS[type];
      for (const kw of list) {
        const normKw = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (words.includes(normKw)) {
          return type;
        }
      }
    }

    // Phase 3: Prefix/Suffix match on normalized string for longer keywords (>= 4 chars)
    // e.g. "firstname" in "billingfirstname" (ends with) or "firstnamebilling" (starts with)
    for (const type of TYPE_CHECK_ORDER) {
      const list = KEYWORDS[type];
      for (const kw of list) {
        const normKw = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normKw.length >= 4 && (normalized.startsWith(normKw) || normalized.endsWith(normKw))) {
          return type;
        }
      }
    }

    // Phase 4: For short keywords (< 4 chars), check if any word starts with it or ends with it
    // e.g. "zip" in "zipcode", or "tel" in "telephone"
    for (const type of TYPE_CHECK_ORDER) {
      const list = KEYWORDS[type];
      for (const kw of list) {
        const normKw = kw.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normKw.length < 4) {
          const match = words.some(word => word.startsWith(normKw) || word.endsWith(normKw));
          if (match) return type;
        }
      }
    }

    return null;
  }

  function getLabelText(el) {
    let labelText = "";
    if (el.id) {
      try {
        const escapedId = window.CSS && CSS.escape ? CSS.escape(el.id) : el.id;
        const labelEl = document.querySelector(`label[for="${escapedId}"]`);
        if (labelEl) {
          labelText = labelEl.textContent || "";
        }
      } catch (e) {
        console.warn("Form Filler: Error selecting label by ID", e);
      }
    }
    if (!labelText) {
      const parentLabel = el.closest("label");
      if (parentLabel) {
        labelText = parentLabel.textContent || "";
      }
    }
    
    // Fallback 1: Preceding sibling text or labels
    if (!labelText) {
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === "LABEL" || sibling.classList.contains("label") || sibling.classList.contains("title")) {
          labelText = sibling.textContent || "";
          break;
        }
        sibling = sibling.previousElementSibling;
      }
    }
    
    // Fallback 2: Visual proximity search (find visually closest label on the left or above the input)
    if (!labelText) {
      const container = getFormContainer(el) || document.body;
      const textElements = Array.from(container.querySelectorAll("td, th, label, .label, p, span, div"))
        .filter(x => x !== el && !x.contains(el) && isVisible(x));
      
      let bestLabel = null;
      let minDistance = Infinity;
      const elRect = el.getBoundingClientRect();
      const elCenterX = elRect.left + elRect.width / 2;
      const elCenterY = elRect.top + elRect.height / 2;
      
      for (const textEl of textElements) {
        const text = (textEl.textContent || "").trim();
        if (!text || !/[a-zA-Z]/.test(text) || text.length < 2 || text.length > 50) continue;
        
        const rect = textEl.getBoundingClientRect();
        const textCenterX = rect.left + rect.width / 2;
        const textCenterY = rect.top + rect.height / 2;
        
        // Element must be positioned visually to the left or above the input
        const isLeft = rect.right <= elRect.left + 15 && Math.abs(textCenterY - elCenterY) < 40;
        const isAbove = rect.bottom <= elRect.top + 15 && Math.abs(textCenterX - elCenterX) < 250;
        
        if (isLeft || isAbove) {
          const dx = elRect.left - rect.right;
          const dy = elRect.top - rect.top;
          // Penalize vertical distance to prefer same-row horizontal labels
          const distance = isLeft ? dx : dy * 2.5;
          
          if (distance < minDistance) {
            minDistance = distance;
            bestLabel = text;
          }
        }
      }
      if (bestLabel) {
        labelText = bestLabel;
      }
    }
    
    return labelText.trim();
  }

  function detectFieldType(el) {
    if (!el) return null;
    const tagName = el.tagName;
    const typeAttr = (el.getAttribute("type") || "").toLowerCase();

    // Special priority check for credit card fields with generic names
    if (tagName === "INPUT") {
      const nameAttr = (el.getAttribute("name") || "").toLowerCase();
      const idAttr = (el.getAttribute("id") || "").toLowerCase();
      const placeholderAttr = (el.getAttribute("placeholder") || "").toLowerCase();
      const autocompleteAttr = (el.getAttribute("autocomplete") || "").toLowerCase();
      
      if (nameAttr === "number" || idAttr === "number" || nameAttr === "card" || idAttr === "card") {
        if (
          autocompleteAttr.includes("cc-number") ||
          placeholderAttr.includes("card") ||
          placeholderAttr.includes("4111") ||
          placeholderAttr.includes("4242") ||
          document.title.toLowerCase().includes("payment") ||
          document.title.toLowerCase().includes("checkout") ||
          window.location.href.toLowerCase().includes("stripe") ||
          window.location.href.toLowerCase().includes("braintree") ||
          el.closest("[class*='card'], [class*='payment'], [class*='cc-']")
        ) {
          return "card_number";
        }
      }
      
      if (nameAttr === "expiry" || idAttr === "expiry" || nameAttr === "exp" || idAttr === "exp") {
        if (
          autocompleteAttr.includes("cc-exp") ||
          placeholderAttr.includes("mm") ||
          placeholderAttr.includes("yy") ||
          el.closest("[class*='card'], [class*='payment'], [class*='cc-']")
        ) {
          return "card_expiry";
        }
      }
      
      if (nameAttr === "cvc" || idAttr === "cvc" || nameAttr === "cvv" || idAttr === "cvv") {
        if (
          autocompleteAttr.includes("cc-csc") ||
          placeholderAttr.includes("cvc") ||
          placeholderAttr.includes("cvv") ||
          el.closest("[class*='card'], [class*='payment'], [class*='cc-']")
        ) {
          return "card_cvv";
        }
      }
    }

    // 1. Specific input[type] attributes (email, password, date, datetime-local)
    // These are highly specific and unambiguous, so we check them first.
    if (tagName === "INPUT") {
      if (typeAttr === "email") return "email";
      if (typeAttr === "password") return "password";
      if (typeAttr === "date" || typeAttr === "datetime-local") return "datetime";
    }

    // 2. Associated <label> text (via for attribute, parent label, or proximity search)
    // Checking label text first avoids generic/incorrect developer-assigned name/id properties.
    let type = matchSignal(getLabelText(el));
    if (type) return type;

    // 3. placeholder text
    type = matchSignal(el.getAttribute("placeholder"));
    if (type) return type;

    // 4. autocomplete attribute
    type = matchSignal(el.getAttribute("autocomplete"));
    if (type) return type;

    // 5. name attribute
    type = matchSignal(el.getAttribute("name"));
    if (type) return type;

    // 6. id attribute
    type = matchSignal(el.getAttribute("id"));
    if (type) return type;

    // 7. aria-label attribute
    type = matchSignal(el.getAttribute("aria-label"));
    if (type) return type;

    // 8. Generic input[type] attributes (tel, number) as fallbacks.
    // We check these last because fields like Zip Code, Credit Card, PIN, or EIN
    // are frequently set to type="number" or type="tel" for mobile keyboard optimization.
    if (tagName === "INPUT") {
      if (typeAttr === "tel") return "phone";
      if (typeAttr === "number") return "number";
    }

    return null;
  }

  function generateProfile() {
    const fk = window.faker || faker;
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const locList = window.US_LOCATIONS || [
      { city: "New York", state: "NY", state_full: "New York", zip: "10001" },
      { city: "Los Angeles", state: "CA", state_full: "California", zip: "90001" },
      { city: "Chicago", state: "IL", state_full: "Illinois", zip: "60601" }
    ];
    const loc = rand(locList);

    const areaCodeList = window.US_AREA_CODES || [201, 212, 302, 415, 646];
    const areaCode = rand(areaCodeList);

    const firstName = fk.name.firstName();
    const lastName = fk.name.lastName();
    const middleName = fk.name.firstName();
    const middleInitial = middleName[0];
    const streetNum = randInt(100, 9999);
    const streetName = fk.address.streetName();

    const baseDomain = fk.internet.domainName().toLowerCase();
    const taggedDomain = `fakedatafiller-${baseDomain}`;
    const baseEmail = fk.internet.email(firstName, lastName).toLowerCase();
    const [localPart, domainPart] = baseEmail.split("@");
    const taggedEmail = `${localPart}+fakedatafiller@${domainPart}`;

    return {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      middle_initial: middleInitial,
      full_name: `${firstName} ${lastName}`,
      email: taggedEmail,
      username: fk.internet.userName(firstName, lastName).toLowerCase().replace(/[^a-z0-9_.]/g, ""),
      password: `${fk.internet.password(12)}@${randInt(10, 99)}!`,
      phone: `(${areaCode}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
      job_title: fk.name.jobTitle(),
      company: fk.company.companyName(),
      ein: `${randInt(10, 99)}${randInt(1000000, 9999999)}`,
      domain: taggedDomain,
      website: `https://${taggedDomain}`,
      address: `${streetNum} ${streetName}`,
      city: loc.city,
      state: loc.state,
      state_full: loc.state_full,
      zip: loc.zip,
      country: "United States",
      routing_number: `12${randInt(1000000, 9999999)}`,
      account_number: String(randInt(100000000000, 999999999999)),
      card_number: rand(["4111111111111111", "4242424242424242"]),
      card_expiry: "", // set dynamically
      card_cvv: String(randInt(100, 999)),
      words: fk.lorem.words(3),
      sentence: fk.lorem.sentence(),
      paragraph: fk.lorem.paragraph(),
      text: fk.lorem.paragraph(),
      datetime: "", // set dynamically
      number: String(randInt(1, 100))
    };
  }

  function getDatetimeValue(el) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const dateObj = new Date(Date.now() - randInt(0, 1e10));
    if (el && el.getAttribute("type") === "date") {
      return dateObj.toISOString().slice(0, 10);
    }
    return dateObj.toISOString().slice(0, 16);
  }

  function getStateValue(el, profile) {
    if (el && el.maxLength > 0 && el.maxLength <= 2) {
      return profile.state;
    }
    return profile.state_full;
  }

  function getPhoneValue(el, profile) {
    const rawPhone = profile.phone; // e.g. "(936) 923-7581"
    if (!el) return rawPhone;
    
    // Check if the input is an international phone input
    const placeholder = el.getAttribute("placeholder") || "";
    const name = el.getAttribute("name") || "";
    const id = el.getAttribute("id") || "";
    
    let isIntl = placeholder.includes("+") || name.includes("intl") || id.includes("intl");
    
    if (!isIntl) {
      // Check if any ancestor contains flag or intl indicators
      const parent = el.closest(".intl-tel, .phone-input, .react-phone-input, .phone-container, .tel-input");
      if (parent) isIntl = true;
    }
    
    if (!isIntl) {
      // Check if there is a sibling with class containing "flag" or "country" or "intl"
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const hasFlag = siblings.some(sib => {
        if (!sib.className) return false;
        const cls = String(sib.className).toLowerCase();
        return cls.includes("flag") || cls.includes("country") || cls.includes("dial");
      });
      if (hasFlag) isIntl = true;
    }
    
    if (isIntl) {
      const digits = rawPhone.replace(/\D/g, ""); // "9369237581"
      return `+1 ${digits}`;
    }
    
    return rawPhone;
  }

  function fillSelect(el, type, profile) {
    const options = Array.from(el.options).filter(opt => !opt.disabled && opt.value !== "");
    if (options.length === 0) return;

    let targetOpt = null;

    if (type === "state") {
      const stateAbbr = (profile.state || "").toLowerCase();
      const stateFull = (profile.state_full || "").toLowerCase();
      targetOpt = options.find(opt => {
        const val = opt.value.toLowerCase();
        const text = opt.textContent.toLowerCase();
        return val === stateAbbr || val === stateFull || text === stateAbbr || text === stateFull;
      });
    } else if (type === "country") {
      const usVariants = ["us", "usa", "united states", "united states of america"];
      targetOpt = options.find(opt => {
        const val = opt.value.toLowerCase();
        const text = opt.textContent.toLowerCase();
        return usVariants.includes(val) || usVariants.includes(text);
      });
    }

    if (!targetOpt) {
      targetOpt = options[Math.floor(Math.random() * options.length)];
    }

    if (isVisible(el)) {
      try { el.focus(); } catch (e) {}
    }

    const value = targetOpt.value;
    const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof el.blur === "function") {
      try { el.blur(); } catch (e) {}
    }
  }

  function getCardNumberValue(el, profile) {
    const rawCard = profile.card_number;
    if (!el) return rawCard;
    const maxLength = el.maxLength;
    const placeholder = el.getAttribute("placeholder") || "";
    if (maxLength === 16) {
      return rawCard;
    }
    if (placeholder.includes(" ") || maxLength >= 19 || !maxLength) {
      return rawCard.replace(/(\d{4})/g, "$1 ").trim();
    }
    return rawCard;
  }

  function getCardExpiryValue(el) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const month = String(randInt(1, 12)).padStart(2, "0");
    const currentYear = new Date().getFullYear() % 100;
    const year = String(currentYear + randInt(2, 6)); // 2 to 6 years in future
    
    if (el) {
      const maxLength = el.maxLength;
      const placeholder = el.getAttribute("placeholder") || "";
      if (maxLength === 4 || placeholder.replace(/[^a-z]/g, "").length === 4) {
        return `${month}${year}`;
      }
      if (placeholder.includes(" ")) {
        return `${month} / ${year}`;
      }
    }
    return `${month}/${year}`;
  }

  function getSexValue(el, profile) {
    const val = Math.random() > 0.5 ? "Male" : "Female";
    if (el) {
      const maxLength = el.maxLength;
      if (maxLength === 1) {
        return val[0]; // "M" or "F"
      }
    }
    return val;
  }

  function getSSNValue(el, profile) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const p1 = String(randInt(100, 899));
    const p2 = String(randInt(10, 99));
    const p3 = String(randInt(1000, 9999));
    const rawSSN = `${p1}${p2}${p3}`;
    if (el) {
      const maxLength = el.maxLength;
      if (maxLength === 9) {
        return rawSSN;
      }
    }
    return `${p1}-${p2}-${p3}`;
  }

  function getDriverLicenseValue(el, profile) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = chars[Math.floor(Math.random() * chars.length)];
    const num = String(randInt(10000000, 99999999));
    return `${letter}${num}`;
  }

  function getBirthPlaceValue(el, profile) {
    return profile.city;
  }

  function getIncomeValue(el, profile) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const val = randInt(45, 125) * 1000;
    if (el) {
      const placeholder = el.getAttribute("placeholder") || "";
      if (placeholder.includes("$")) {
        return `$${val.toLocaleString()}`;
      }
    }
    return String(val);
  }

  function isDropdownElementVisible(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      
      let parent = el.parentElement;
      while (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden' || parentStyle.opacity === '0') return false;
        parent = parent.parentElement;
      }
    } catch (e) {
      // Fallback
    }
    return true;
  }

  function isValidDropdownTrigger(trigger) {
    if (!trigger || !isVisible(trigger)) return false;
    
    const tagName = trigger.tagName;
    const role = trigger.getAttribute("role");
    
    // If it's a generic button, check that it's not a form action/submit/save/cancel button
    if (tagName === "BUTTON") {
      const type = (trigger.getAttribute("type") || "").toLowerCase();
      if (type === "submit" || type === "reset") return false;
      
      const text = (trigger.textContent || "").toLowerCase().trim();
      const forbiddenTexts = ["save", "update", "submit", "delete", "remove", "cancel", "edit", "add", "create", "search", "filter", "reset", "agree", "confirm"];
      if (forbiddenTexts.some(term => text === term || text.includes(term))) {
        return false;
      }
    }
    
    // Avoid tab buttons, menus, dialog controls, etc.
    if (role === "tab" || role === "menuitem" || role === "checkbox" || role === "radio") return false;
    
    return true;
  }

  function simulateClick(el) {
    if (!el) return;
    try {
      el.focus();
    } catch (e) {}
    
    try {
      // Simulate clean sequence: mousedown -> mouseup -> click
      const mousedown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window });
      const mouseup = new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window });
      el.dispatchEvent(mousedown);
      el.dispatchEvent(mouseup);
      el.click();
    } catch (e) {
      try {
        el.click();
      } catch (err) {}
    }
  }

  function findDropdownTrigger(el) {
    if (isValidDropdownTrigger(el)) {
      return el;
    }
    
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      for (const sib of siblings) {
        if (sib === el) continue;
        if (isValidDropdownTrigger(sib)) {
          return sib;
        }
        const childTrigger = sib.querySelector('[role="combobox"], button, [aria-haspopup="listbox"], [class*="select"], [class*="dropdown"]');
        if (isValidDropdownTrigger(childTrigger)) {
          return childTrigger;
        }
      }
    }
    
    let current = el.parentElement;
    for (let i = 0; i < 2 && current; i++) {
      const specificTrigger = current.querySelector('[role="combobox"], [aria-haspopup="listbox"], [class*="select"], [class*="dropdown"]');
      if (isValidDropdownTrigger(specificTrigger)) {
        return specificTrigger;
      }
      
      const genericButton = current.querySelector('button');
      if (isValidDropdownTrigger(genericButton)) {
        return genericButton;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  function findDropdownOption(targetText, targetAbbr) {
    const normText = (targetText || "").toLowerCase().trim();
    const normAbbr = (targetAbbr || "").toLowerCase().trim();

    const containerSelectors = [
      '[role="listbox"]', '[role="menu"]', '[role="combobox"]',
      '[class*="listbox"]', '[class*="dropdown"]', '[class*="popover"]',
      '[class*="portal"]', '[class*="menu"]', '[class*="select-options"]'
    ];
    
    const activeContainers = Array.from(document.querySelectorAll(containerSelectors.join(",")))
      .filter(el => isDropdownElementVisible(el));
      
    for (const container of activeContainers) {
      const items = Array.from(container.querySelectorAll('*'));
      for (const el of items) {
        if (!isDropdownElementVisible(el)) continue;
        const text = (el.textContent || "").toLowerCase().trim();
        if (text === normText || (normAbbr && text === normAbbr)) {
          return el;
        }
      }
    }
    
    const candidates = Array.from(document.querySelectorAll('[role="option"], [class*="option"], [class*="item"], .react-select__option, .ant-select-item'))
      .filter(el => isDropdownElementVisible(el));
      
    for (const el of candidates) {
      const text = (el.textContent || "").toLowerCase().trim();
      if (text === normText || (normAbbr && text === normAbbr)) {
        return el;
      }
    }
    
    const allVisible = Array.from(document.querySelectorAll('div, li, span, button, a'))
      .filter(el => isDropdownElementVisible(el));
      
    for (const el of allVisible) {
      const text = (el.textContent || "").toLowerCase().trim();
      if (text === normText || (normAbbr && text === normAbbr)) {
        return el;
      }
    }
    
    return null;
  }

  async function fillCustomDropdown(el, type, profile) {
    let targetText = "";
    let targetAbbr = "";
    
    if (type === "state") {
      targetText = profile.state_full;
      targetAbbr = profile.state;
    } else if (type === "country") {
      targetText = "United States";
      targetAbbr = "US";
    } else {
      return false;
    }
    
    const trigger = findDropdownTrigger(el);
    if (!trigger) {
      return false;
    }
    
    simulateClick(trigger);
    
    await new Promise(r => setTimeout(r, 100));
    
    const option = findDropdownOption(targetText, targetAbbr);
    if (option) {
      try {
        option.scrollIntoView({ block: "nearest" });
        simulateClick(option);
        return true;
      } catch (e) {
        // Fallback
      }
    }
    
    return false;
  }

  function isDisabledOrReadOnly(el) {
    if (!el) return false;
    if (el.disabled || el.readOnly) return true;
    if (el.getAttribute("readonly") === "true" || el.getAttribute("disabled") === "true") return true;
    if (el.getAttribute("aria-disabled") === "true" || el.getAttribute("aria-readonly") === "true") return true;

    // Check ancestors for disabled class or attribute
    let parent = el.parentElement;
    while (parent) {
      if (parent.getAttribute("disabled") === "true" || parent.getAttribute("aria-disabled") === "true") return true;
      if (parent.classList && (parent.classList.contains("disabled") || parent.classList.contains("is-disabled"))) return true;
      parent = parent.parentElement;
    }
    return false;
  }

  async function fillElement(el, type, profile) {
    if (!el) return;
    if (isDisabledOrReadOnly(el)) return;

    const isContentEditable = el.contentEditable === "true" || el.getAttribute("contenteditable") === "true";
    if (!["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && !isContentEditable) return;

    if ((type === "state" || type === "country") && !isContentEditable) {
      const success = await fillCustomDropdown(el, type, profile);
      if (success) {
        // Also update native value for background form fallback
        if (el.tagName === "SELECT") {
          fillSelect(el, type, profile);
        } else {
          const value = type === "state" ? getStateValue(el, profile) : (profile[type] ?? "");
          const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
          if (descriptor && descriptor.set) {
            descriptor.set.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          if (typeof el.blur === "function") {
            try { el.blur(); } catch (e) {}
          }
        }
        return;
      }

      // If custom dropdown failed, only fallback to programmatic filling if the element is VISIBLE.
      // If it is hidden, return without filling to avoid corrupting internal framework/auth state fields.
      const isHidden = el.getAttribute("type") === "hidden" || !isVisible(el);
      if (isHidden) {
        return;
      }
    }

    if (el.tagName === "SELECT") {
      fillSelect(el, type, profile);
      return;
    }

    let value = "";
    if (type === "state") {
      value = getStateValue(el, profile);
    } else if (type === "datetime") {
      value = getDatetimeValue(el);
    } else if (type === "phone") {
      value = getPhoneValue(el, profile);
    } else if (type === "card_number") {
      value = getCardNumberValue(el, profile);
    } else if (type === "card_expiry") {
      value = getCardExpiryValue(el);
    } else if (type === "sex") {
      value = getSexValue(el, profile);
    } else if (type === "social_security_number") {
      value = getSSNValue(el, profile);
    } else if (type === "driver_license_number") {
      value = getDriverLicenseValue(el, profile);
    } else if (type === "birth_place") {
      value = getBirthPlaceValue(el, profile);
    } else if (type === "income") {
      value = getIncomeValue(el, profile);
    } else if (type === "middle_initial") {
      value = profile.middle_initial;
    } else if (type === "middle_name") {
      value = (el && el.maxLength === 1) ? profile.middle_initial : profile.middle_name;
    } else {
      value = profile[type] ?? profile.text ?? "";
    }

    if (isVisible(el)) {
      try { el.focus(); } catch (e) {}
    }

    if (isContentEditable) {
      try {
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, value);
      } catch (e) {
        el.innerHTML = `<p>${value}</p>`;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof el.blur === "function") {
        try { el.blur(); } catch (e) {}
      }
      return;
    }

    const prototype = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    if (descriptor && descriptor.set) {
      descriptor.set.call(el, value);
    } else {
      el.value = value;
    }

    // Fire input, change events and natively blur the element
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (typeof el.blur === "function") {
      try { el.blur(); } catch (e) {}
    }
  }

  async function fillFocused(type) {
    const el = lastRightClickedElement || document.activeElement;
    if (!el) return;
    if (isDisabledOrReadOnly(el)) return;
    const isContentEditable = el.contentEditable === "true" || el.getAttribute("contenteditable") === "true";
    if (!["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) && !isContentEditable) return;
    const profile = generateProfile();
    const finalType = type || detectFieldType(el) || "text";
    await fillElement(el, finalType, profile);
  }

  function isVisible(el) {
    if (!el) return false;

    // 1. Blacklist check for captcha/JSON state fields
    const name = (el.getAttribute("name") || "").toLowerCase();
    const id = (el.getAttribute("id") || "").toLowerCase();
    const blacklist = ["json", "schema", "payload", "config", "draft", "hcaptcha", "recaptcha", "g-recaptcha"];
    if (blacklist.some(term => name.includes(term) || id.includes(term))) return false;

    // 2. Bounding Client Rect check (checks layout size and off-screen coordinates)
    let rect = null;
    if (typeof el.getBoundingClientRect === "function") {
      rect = el.getBoundingClientRect();
    }
    if (rect) {
      if (rect.width < 5 || rect.height < 5) return false;
      if (rect.right < 0 || rect.bottom < 0) return false;
    }
    
    try {
      // 3. Computed style check (checks direct display, visibility, opacity)
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      
      // 4. Ancestor style check
      let parent = el.parentElement;
      while (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden' || parentStyle.opacity === '0') return false;
        parent = parent.parentElement;
      }
    } catch (e) {
      // Fallback
    }
    return true;
  }

  function getFormContainer(target) {
    if (!target) return null;
    const container = target.closest("form, [role='dialog'], [role='form'], fieldset, .modal, .dialog, .popup");
    if (container) return container;
    
    let parent = target.parentElement;
    while (parent && parent.tagName !== "BODY") {
      const inputs = parent.querySelectorAll("input, textarea, select, [contenteditable='true']");
      if (inputs.length > 1) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  async function fillAll() {
    const target = lastRightClickedElement || document.activeElement;
    const container = getFormContainer(target) || document;
    const profile = generateProfile();

    const fields = Array.from(container.querySelectorAll("input, textarea, select, [contenteditable='true']")).filter(el => {
      if (isDisabledOrReadOnly(el)) return false;

      if (el.tagName === "INPUT") {
        const type = (el.getAttribute("type") || "").toLowerCase();
        if ([
          "submit", "button", "reset",
          "checkbox", "radio", "file", "image"
        ].includes(type)) {
          return false;
        }
        
        // Allow hidden inputs if they represent custom dropdowns for state or country
        const isHiddenInput = type === "hidden" || !isVisible(el);
        if (isHiddenInput) {
          const detected = detectFieldType(el);
          return detected === "state" || detected === "country";
        }
        
        return isVisible(el);
      }

      if (el.tagName === "TEXTAREA" || el.contentEditable === "true" || el.getAttribute("contenteditable") === "true") {
        return isVisible(el);
      }

      // SELECT elements are allowed even if visually hidden (size 0, display:none)
      // to support custom dropdown components like React Select, AntD, etc.
      return true;
    });

    for (const el of fields) {
      const type = detectFieldType(el) || "text";
      await fillElement(el, type, profile);
    }
  }

  window.__ff = {
    fillAll,
    fillFocused
  };
})();