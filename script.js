/* Learning activity is session-only. Refreshing starts the module from the beginning. */
const completed = new Set();
const links = [...document.querySelectorAll(".lesson-link")];
const sections = [...document.querySelectorAll("[data-section]")];
const progressBar = document.querySelector("#progress-bar");
const progressText = document.querySelector("#progress-text");
const progressDetail = document.querySelector("#progress-detail");
let mfaComplete = false;
let insiderComplete = false;

function updateProgress() {
  const count = completed.size;
  const percentage = Math.round((count / 6) * 100);
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}%`;
  progressDetail.textContent = `${count} of 6 steps complete`;
  links.forEach((link) =>
    link.classList.toggle("complete", completed.has(Number(link.dataset.step))),
  );
  document
    .querySelector("#course-complete-link")
    .classList.toggle("is-complete", completed.has(5));
  document.querySelectorAll(".complete-step").forEach((button) => {
    const step = Number(button.dataset.complete);
    const locked =
      (button.classList.contains("requires-discovery") &&
        foundClues.size < 6) ||
      (button.classList.contains("requires-mfa") && !mfaComplete) ||
      (button.classList.contains("requires-insider") && !insiderComplete);
    button.disabled = completed.has(step) || locked;
    if (completed.has(step)) button.textContent = "Lesson complete ✓";
  });
  if (completed.has(5))
    document.querySelector("#completion-card").hidden = false;
}

document.querySelectorAll(".complete-step").forEach((button) => {
  button.addEventListener("click", () => {
    completed.add(Number(button.dataset.complete));
    updateProgress();
  });
});

const clues = {
  sender:
    "The sender uses a lookalike domain. “blossom-payments.co” is not a trusted Blossom address.",
  urgency:
    "Urgency is used to rush your judgement. Legitimate requests can withstand a quick verification.",
  payment:
    "Unexpected changes to bank details are a classic business email compromise tactic. Verify them independently.",
  attachment:
    "Unexpected ZIP files can hide malicious files. Do not open attachments you were not expecting.",
  grammar:
    "Awkward or unusual language can signal that a message was not written by the person it claims to be from.",
  button:
    "Do not use an unexpected link to approve a payment or sign in. Go through the approved system directly.",
};
const foundClues = new Set();
const clueCount = document.querySelector("#finding-count");
const clueExplanation = document.querySelector("#clue-explanation");
document.querySelectorAll(".email-clue").forEach((clue) => {
  clue.addEventListener("click", () => {
    const key = clue.dataset.clue;
    foundClues.add(key);
    clue.classList.add("found");
    clueExplanation.textContent = clues[key];
    clueCount.textContent = `Found ${foundClues.size} of 6 warning signs`;
    document
      .querySelectorAll(".finding-dots i")
      .forEach((dot, index) =>
        dot.classList.toggle("found", index < foundClues.size),
      );
    if (foundClues.size === 6)
      document.querySelector("#simulation-success").hidden = false;
    updateProgress();
  });
});

const passwordInput = document.querySelector("#password-input");
const passwordFeedback = document.querySelector("#password-feedback");
const strengthMeter = document.querySelector(".strength-meter");
passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  const checks = [
    value.length >= 12,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Medium", "Strong", "Excellent"];
  strengthMeter.dataset.strength = String(score);
  passwordFeedback.textContent = value
    ? `${labels[score]} — ${score < 4 ? "add more variety or length." : "this uses all the recommended ingredients."}`
    : "Use 12+ characters with a mix of letters, numbers and symbols.";
});
document
  .querySelector("#toggle-password")
  .addEventListener("click", (event) => {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    event.currentTarget.textContent = visible ? "Show" : "Hide";
  });

document.querySelectorAll(".mfa-choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    const correct = choice.dataset.correct === "true";
    document
      .querySelectorAll(".mfa-choice")
      .forEach((button) => (button.disabled = true));
    choice.classList.add(correct ? "correct" : "incorrect");
    document.querySelector("#mfa-feedback").textContent = correct
      ? "Correct. Deny an unexpected prompt and let Security know — it may mean someone has your password."
      : "Not quite. Never approve or share an MFA prompt you did not initiate. Deny it and report it.";
    mfaComplete = correct;
    updateProgress();
  });
});

const scenarios = [
  [
    "Customer spreadsheet request",
    "You receive a spreadsheet containing customer financial information. A colleague from another team asks you to email it to them.",
    [
      "Email it because they work at Blossom",
      "Confirm they need access and share only through an approved tool",
      "Upload it to a personal drive for easier sharing",
    ],
    1,
    "Use least privilege and approved sharing tools. Do not email sensitive information just because a request seems internal.",
  ],
  [
    "Unattended laptop",
    "You notice an unlocked Blossom laptop at an empty desk in a shared workspace.",
    [
      "Leave it alone — it is not your device",
      "Lock it and let the owner know",
      "Open it to find the owner’s contact details",
    ],
    1,
    "Locking the screen immediately protects the account and information on the device.",
  ],
  [
    "New USB drive",
    "An unlabelled USB drive is left in a meeting room with a note saying “Q4 planning”.",
    [
      "Plug it in to identify the owner",
      "Hand it to IT or Security without connecting it",
      "Take it home and check it later",
    ],
    1,
    "Unknown devices can contain malware. Never connect them to a Blossom device.",
  ],
];
let scenarioIndex = 0;
const scenarioTitle = document.querySelector("#scenario-title");
const scenarioText = document.querySelector("#scenario-text");
const scenarioChoices = document.querySelector("#scenario-choices");
const scenarioFeedback = document.querySelector("#scenario-feedback");
const scenarioCount = document.querySelector("#scenario-count");
const nextScenario = document.querySelector("#next-scenario");
function renderScenario() {
  const [title, text, choices, correct] = scenarios[scenarioIndex];
  scenarioTitle.textContent = title;
  scenarioText.textContent = text;
  scenarioCount.textContent = `Scenario ${scenarioIndex + 1} of ${scenarios.length}`;
  scenarioFeedback.textContent = "";
  nextScenario.hidden = true;
  scenarioChoices.innerHTML = choices
    .map(
      (choice, index) =>
        `<button class="scenario-choice" type="button" data-index="${index}">${choice}</button>`,
    )
    .join("");
  scenarioChoices.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", () => {
      const selected = Number(button.dataset.index);
      scenarioChoices
        .querySelectorAll("button")
        .forEach((item) => (item.disabled = true));
      button.classList.add(selected === correct ? "correct" : "incorrect");
      scenarioFeedback.textContent = scenarios[scenarioIndex][4];
      nextScenario.hidden = false;
    }),
  );
}
nextScenario.addEventListener("click", () => {
  scenarioIndex += 1;
  if (scenarioIndex === scenarios.length) {
    insiderScenariosDone = true;
    nextScenario.hidden = true;
    scenarioFeedback.textContent =
      "You have completed all three workplace scenarios.";
    checkInsiderCompletion();
    return;
  }
  renderScenario();
});
let insiderScenariosDone = false;
let reportsFound = 0;
function checkInsiderCompletion() {
  insiderComplete = insiderScenariosDone && reportsFound === 5;
  updateProgress();
}
renderScenario();

const reports = [
  "An unlocked laptop in a shared space",
  "A suspicious USB device left in the office",
  "Customer data sent to the wrong recipient",
  "A confidential conversation in public",
  "Concerning or unusual coworker behaviour",
];
const reportItems = document.querySelector("#report-items");
reportItems.innerHTML = reports
  .map(
    (item, index) =>
      `<div class="report-item"><p>${item}</p><div class="report-buttons"><button type="button" data-report="${index}" data-choice="ignore">Ignore</button><button type="button" data-report="${index}" data-choice="report">Report</button></div></div>`,
  )
  .join("");
reportItems.querySelectorAll("button").forEach((button) =>
  button.addEventListener("click", () => {
    const index = button.dataset.report;
    const row = button.closest(".report-item");
    if (row.dataset.done) return;
    row.dataset.done = "true";
    row.querySelectorAll("button").forEach((item) => (item.disabled = true));
    const correct = button.dataset.choice === "report";
    button.classList.add(correct ? "correct" : "incorrect");
    reportsFound += 1;
    document.querySelector("#report-feedback").textContent = correct
      ? "Yes — reporting early helps Security contain issues quickly."
      : "This should be reported. Small signals can prevent a larger incident.";
    checkInsiderCompletion();
  }),
);

const quizQuestions = [
  [
    "Phishing",
    "A message asks you to approve an urgent payment. What should you do first?",
    [
      "Approve it to avoid delay",
      "Verify the request through a known channel",
      "Reply asking for more detail",
    ],
    1,
  ],
  [
    "Phishing",
    "Which sender detail is most useful to inspect?",
    ["The display name", "The full sender domain", "The email timestamp"],
    1,
  ],
  [
    "Credentials",
    "What makes a password strongest?",
    [
      "A unique, long password stored in a manager",
      "The same password used everywhere",
      "A short memorable word",
    ],
    0,
  ],
  [
    "Credentials",
    "You get an MFA prompt you did not start. What now?",
    [
      "Approve it to clear it",
      "Deny it and report it",
      "Share the code with IT",
    ],
    1,
  ],
  [
    "Insider threat",
    "You find an unknown USB drive. What should you do?",
    [
      "Plug it in to find the owner",
      "Hand it to IT or Security without connecting it",
      "Take it home and check it later",
    ],
    1,
  ],
  [
    "Insider threat",
    "You send customer data to the wrong recipient. What should you do?",
    [
      "Report it straight away",
      "Wait to see if they reply",
      "Delete your sent email only",
    ],
    0,
  ],
];
document.querySelector("#quiz-questions").innerHTML = quizQuestions
  .map(
    ([topic, question, options], index) =>
      `<fieldset><small class="quiz-topic">${topic}</small><legend>${index + 1}. ${question}</legend>${options.map((option, optionIndex) => `<label><input type="radio" name="q${index}" value="${optionIndex}" /> ${option}</label>`).join("")}</fieldset>`,
  )
  .join("");
document.querySelector("#quiz-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const answered = quizQuestions.filter((_, i) => form.has(`q${i}`)).length;
  const result = document.querySelector("#quiz-result");
  if (answered < quizQuestions.length) {
    result.textContent = `Please answer all 6 questions (${answered} completed).`;
    return;
  }
  const score = quizQuestions.reduce(
    (total, question, index) =>
      total + Number(Number(form.get(`q${index}`)) === question[3]),
    0,
  );
  const percentage = Math.round((score / quizQuestions.length) * 100);
  const feedback =
    percentage >= 90
      ? "Excellent — you are ready to put these habits into practice."
      : percentage >= 70
        ? "Strong work. Review any questions you missed and keep asking when unsure."
        : "A good start. Revisit the three modules, then try the check again.";
  result.textContent = `Score: ${score}/6 (${percentage}%). ${feedback}`;
  completed.add(5);
  updateProgress();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        links.forEach((link) =>
          link.classList.toggle(
            "active",
            Number(link.dataset.step) === Number(entry.target.dataset.section),
          ),
        );
    });
  },
  { rootMargin: "-20% 0px -70% 0px" },
);
sections.forEach((section) => observer.observe(section));
const aboutSection = document.querySelector(".about-reveal");
if (aboutSection)
  new IntersectionObserver(
    (entries, instance) => {
      if (entries[0].isIntersecting) {
        aboutSection.classList.add("is-visible");
        instance.unobserve(aboutSection);
      }
    },
    { threshold: 0.16 },
  ).observe(aboutSection);
updateProgress();

/* Progressive UX refinements: lightweight, local, and intentionally framework-free. */
const objectives = {
  phishing: [
    "Recognise common phishing and BEC signals",
    "Verify suspicious payment and access requests",
    "Report a suspected phishing email safely",
  ],
  credentials: [
    "Create and manage strong, unique passwords",
    "Respond safely to unexpected MFA prompts",
    "Understand how credential reuse enables takeover",
  ],
  "insider-threat": [
    "Recognise accidental and malicious insider risks",
    "Handle member information using least privilege",
    "Know when and how to report a concern",
  ],
};
Object.entries(objectives).forEach(([id, items]) => {
  const target = document.querySelector(`#${id} .content-width`);
  target?.insertAdjacentHTML(
    "beforeend",
    `<aside class="module-objectives"><h3>By the end of this module you’ll be able to...</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></aside>`,
  );
});

document
  .querySelector("#welcome .info-note")
  ?.insertAdjacentHTML(
    "afterend",
    `<aside class="overview-card" aria-label="Course overview"><div><b>Approx. 15 minutes</b><small>Estimated duration</small></div><div><b>Required annually</b><small>For all employees</small></div><div><b>Progress saved</b><small>Automatically in this browser</small></div></aside>`,
  );

const phishingSimulation = document.querySelector(".phishing-simulation");
if (phishingSimulation) {
  const simulationParts = [...phishingSimulation.children];
  simulationParts.forEach((part) => part.classList.add("simulation-stage"));
  simulationParts.forEach((part) => (part.hidden = true));
  const inbox = document.createElement("div");
  inbox.className = "inbox";
  inbox.innerHTML = `<div class="exercise-heading"><span class="exercise-tag">INBOX</span><div><h3>Which email needs a closer look?</h3><p>Review the inbox before opening a message.</p></div></div><div class="inbox-list"><button class="inbox-item" type="button"><span>CE</span><span><strong>CEO Update</strong><small>Quarterly all-hands details</small></span><time>9:32</time></button><button class="inbox-item" type="button"><span>IT</span><span><strong>IT Maintenance</strong><small>Planned service window</small></span><time>9:36</time></button><button class="inbox-item" type="button"><span>CW</span><span><strong>Customer Question</strong><small>Member support follow-up</small></span><time>9:38</time></button><button class="inbox-item suspicious-inbox" type="button"><span>BF</span><span><strong>Urgent Payment Request</strong><small>Finance approval required</small></span><time>9:41</time></button></div><p class="feedback inbox-feedback" role="status"></p>`;
  phishingSimulation.prepend(inbox);
  inbox.querySelectorAll(".inbox-item").forEach((item) =>
    item.addEventListener("click", () => {
      if (!item.classList.contains("suspicious-inbox")) {
        item.classList.add("wrong");
        inbox.querySelector(".inbox-feedback").textContent =
          "This one looks routine. Keep scanning the inbox for a message that combines urgency with a sensitive request.";
        return;
      }
      inbox.hidden = true;
      simulationParts.forEach(
        (part) => (part.hidden = part.id === "simulation-success"),
      );
      phishingSimulation.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }),
  );
}

const requirements = [
  ["12+ characters", (v) => v.length >= 12],
  ["Uppercase", (v) => /[A-Z]/.test(v)],
  ["Lowercase", (v) => /[a-z]/.test(v)],
  ["Number", (v) => /\d/.test(v)],
  ["Symbol", (v) => /[^A-Za-z0-9]/.test(v)],
];
document
  .querySelector(".password-challenge")
  ?.insertAdjacentHTML(
    "beforeend",
    `<ul class="password-requirements">${requirements.map(([label]) => `<li>${label}</li>`).join("")}</ul>`,
  );
passwordInput?.addEventListener("input", () => {
  const score = requirements.filter(([, test]) =>
    test(passwordInput.value),
  ).length;
  document
    .querySelectorAll(".password-requirements li")
    .forEach((item, index) =>
      item.classList.toggle("met", requirements[index][1](passwordInput.value)),
    );
  const label = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][score];
  if (passwordInput.value)
    passwordFeedback.textContent = `${label} — ${score} of 5 requirements met. Nothing you type is stored.`;
});

const mfaBox = document.querySelector(".mfa-scenario");
if (mfaBox) {
  mfaBox.querySelector(".choice-row").innerHTML =
    `<button type="button" class="mfa-choice" data-correct="false">Approve</button><button type="button" class="mfa-choice" data-correct="true">Deny</button><button type="button" class="mfa-choice" data-correct="false">Report</button>`;
  mfaBox.insertAdjacentHTML(
    "afterbegin",
    `<div class="phone-mfa" aria-label="Example phone notification"><div class="phone-notification"><b>Blossom sign-in request</b>Are you trying to sign in from a new device?</div></div>`,
  );
  mfaBox.querySelectorAll(".mfa-choice").forEach((choice) =>
    choice.addEventListener("click", () => {
      const correct = choice.dataset.correct === "true";
      mfaBox
        .querySelectorAll(".mfa-choice")
        .forEach((button) => (button.disabled = true));
      choice.classList.add(correct ? "correct" : "incorrect");
      document.querySelector("#mfa-feedback").textContent = correct
        ? "Correct. Deny an unexpected prompt and report it — it may mean someone has your password."
        : "Not quite. Do not approve an unexpected sign-in. Deny it, then report the prompt to Security.";
      mfaComplete = correct;
      updateProgress();
    }),
  );
}

const originalScenarioText = document.querySelector("#scenario-text");
if (originalScenarioText) {
  const story = document.createElement("p");
  story.className = "story-kicker";
  story.textContent = "You’re starting your morning shift...";
  originalScenarioText.before(story);
  const scenarioStories = [
    "You’re starting your morning shift...",
    "You’re heading to grab a coffee...",
    "You’re tidying up after a workshop...",
  ];
  const scenarioObserver = new MutationObserver(() => {
    story.textContent =
      scenarioStories[Math.min(scenarioIndex, scenarioStories.length - 1)];
  });
  scenarioObserver.observe(document.querySelector("#scenario-title"), {
    childList: true,
  });
}

document.querySelectorAll(".complete-step").forEach((button) =>
  button.addEventListener("click", () => {
    const titles = [
      "Welcome",
      "About Blossom",
      "Recognise Phishing",
      "Protect Your Credentials",
      "Prevent Insider Threats",
    ];
    const step = Number(button.dataset.complete);
    if (step > 1 && step < 5)
      button
        .closest(".lesson-section")
        .querySelector(".section-next")
        ?.insertAdjacentHTML(
          "beforeend",
          `<aside class="module-success"><span>✓</span><div><h3>Module Complete</h3><p>Great work! You successfully completed: ${titles[step]}.</p></div></aside>`,
        );
  }),
);

document.querySelector("#quiz-form")?.addEventListener("submit", () => {
  setTimeout(() => {
    const form = new FormData(document.querySelector("#quiz-form"));
    const result = document.querySelector("#quiz-result");

    // Ensure every question has been answered
    const unanswered = quizQuestions.some(
      (_, index) => form.get(`q${index}`) === null,
    );

    if (unanswered) {
      result.textContent = `Please answer all ${quizQuestions.length} questions before checking your answers.`;
      document.querySelector(".assessment-results")?.remove();
      document.querySelector("#completion-card").hidden = true;
      return;
    }

    // Calculate score
    const score = quizQuestions.reduce(
      (total, question, index) =>
        total + Number(Number(form.get(`q${index}`)) === question[3]),
      0,
    );

    const percent = Math.round((score / quizQuestions.length) * 100);

    const rating =
      percent >= 90
        ? "Outstanding"
        : percent >= 70
          ? "Great Job"
          : "Needs Review";

    // Topics answered correctly
    const strengths = [
      ...new Set(
        quizQuestions
          .filter((q, i) => Number(form.get(`q${i}`)) === q[3])
          .map((q) => q[0]),
      ),
    ];

    // Topics answered incorrectly
    const missedTopics = [
      ...new Set(
        quizQuestions
          .filter((q, i) => Number(form.get(`q${i}`)) !== q[3])
          .map((q) => q[0]),
      ),
    ];

    document.querySelector(".assessment-results")?.remove();

    result.insertAdjacentHTML(
      "afterend",
      `
      <aside class="assessment-results">
        <h3>Assessment Results</h3>

        <div class="score-grid">
          <div>
            <b>${score}/${quizQuestions.length}</b>
            <small>Overall Score</small>
          </div>

          <div>
            <b>${percent}%</b>
            <small>Percentage</small>
          </div>

          <div>
            <b>${rating}</b>
            <small>Performance Rating</small>
          </div>
        </div>

        <div class="result-lists">

          <div>
            <h4>Strengths</h4>

            ${
              strengths.length
                ? `<ul>${strengths.map((topic) => `<li>${topic}</li>`).join("")}</ul>`
                : `<p>Continue practising all modules.</p>`
            }

          </div>

          ${
            missedTopics.length
              ? `
            <div>
              <h4>Suggested Review</h4>
              <ul>
                ${missedTopics.map((topic) => `<li>${topic}</li>`).join("")}
              </ul>
            </div>
            `
              : ""
          }

        </div>
      </aside>
      `,
    );

    const completion = document.querySelector("#completion-card");

    completion.hidden = false;

    completion.innerHTML = `
      <div class="certificate">

        <div class="confetti">
          ${Array.from(
            { length: 22 },
            (_, i) =>
              `<i style="left:${(i * 17) % 100}%;animation-delay:${i * 0.06}s"></i>`,
          ).join("")}
        </div>

        <div class="certificate-badge">✓</div>

        <p class="overline">CERTIFICATE OF COMPLETION</p>

        <h3>Blossom Security Foundations</h3>

        <p>
          This confirms that
          <strong>Tushar Kashyap</strong>
          successfully completed the required employee cybersecurity training.
        </p>

        <p>
          Completion date:
          <strong>
            ${new Date().toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </p>

        <button class="button" type="button" onclick="window.print()">
          Download Certificate
        </button>

      </div>
    `;
  }, 0);
});

// Concise course pacing: one short welcome, three focused modules, and a brief assessment.
const timings = [
  ["welcome", "1 min", "1 MINUTE"],
  ["about-blossom", "1 min", "1 MINUTE"],
  ["phishing", "4 min", "4 MINUTES"],
  ["credentials", "4 min", "4 MINUTES"],
  ["insider-threat", "3 min", "3 MINUTES"],
  ["knowledge-check", "2 min", "2 MINUTES"],
];
timings.forEach(([id, navTime, sectionTime], index) => {
  const link = links[index];
  link
    ?.querySelector("span:last-child small:last-child")
    ?.replaceChildren(navTime);
  document
    .querySelector(`#${id} .lesson-header span:last-child`)
    ?.replaceChildren(sectionTime);
});
document.querySelector(".lesson-summary")?.remove();
const behaviours = document.querySelectorAll(".behaviour-grid article");
if (behaviours.length) {
  behaviours[0].querySelector("p").textContent =
    "Lock your screen and keep company devices physically secure.";
  behaviours[behaviours.length - 1].remove();
}
