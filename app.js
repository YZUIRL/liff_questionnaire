const params = new URLSearchParams(window.location.search);

const config = {
  apiBaseUrl: params.get("apiBaseUrl") || "https://irl-svr.ee.yzu.edu.tw:5017/api",
  oaId: params.get("oaId"),
  surveyId: params.get("surveyId"),
  liffId: params.get("liffId"),
  defaultTags: splitList(params.get("defaultTags")),
  botAppName: params.get("botAppName") || "",
  appName: params.get("appName") || "",
};

const state = {
  survey: null,
  profile: null,
  idToken: "",
};

const el = {
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  errorText: document.getElementById("errorText"),
  form: document.getElementById("surveyForm"),
  done: document.getElementById("done"),
  title: document.getElementById("surveyTitle"),
  description: document.getElementById("surveyDescription"),
  botName: document.getElementById("botName"),
  tagList: document.getElementById("tagList"),
  questions: document.getElementById("questions"),
  submitButton: document.getElementById("submitButton"),
  finishMessage: document.getElementById("finishMessage"),
  closeButton: document.getElementById("closeButton"),
};

function splitList(value) {
  if (!value) return [];
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

function showOnly(target) {
  [el.loading, el.error, el.form, el.done].forEach(node => node.classList.add("hidden"));
  target.classList.remove("hidden");
}

function showError(message) {
  el.errorText.textContent = message || "請稍後再試。";
  showOnly(el.error);
}

async function initLiff() {
  if (!config.liffId) return;
  await liff.init({ liffId: config.liffId });
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    return;
  }
  state.idToken = liff.getIDToken() || "";
  try {
    state.profile = await liff.getProfile();
  } catch {
    state.profile = null;
  }
}

async function fetchSurvey() {
  if (!config.oaId) throw new Error("缺少 oaId 網址參數");
  if (!config.surveyId) throw new Error("缺少 surveyId 網址參數");

  const url = new URL(`${config.apiBaseUrl}/liff-questionnaires/public/${encodeURIComponent(config.surveyId)}`);
  url.searchParams.set("oaId", config.oaId);
  if (config.appName) url.searchParams.set("appName", config.appName);

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "讀取問卷失敗");
  state.survey = data.survey;
}

function renderSurvey() {
  const survey = state.survey;
  el.title.textContent = survey.title;
  el.description.textContent = survey.description || "";
  el.botName.textContent = config.botAppName || survey.bot_app_name || "";
  el.botName.classList.toggle("hidden", !el.botName.textContent);

  const tags = [...new Set([...(survey.default_tags || []), ...config.defaultTags])];
  el.tagList.innerHTML = tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

  el.questions.innerHTML = "";
  survey.questions.forEach(question => {
    el.questions.appendChild(renderQuestion(question));
  });
  showOnly(el.form);
}

function renderQuestion(question) {
  const wrapper = document.createElement("section");
  wrapper.className = "question";
  wrapper.dataset.questionId = question.id;

  const title = document.createElement("div");
  title.className = "question-title";
  title.innerHTML = `<span>Q${question.question_no}.</span><span>${escapeHtml(question.content)} ${question.required ? '<b class="required">*</b>' : ""}</span>`;
  wrapper.appendChild(title);

  let input;
  if (question.answer_type === "single_choice" || question.answer_type === "multiple_choice") {
    input = document.createElement("div");
    const type = question.answer_type === "single_choice" ? "radio" : "checkbox";
    (question.options || []).forEach(option => {
      const id = `q-${question.id}-${option}`;
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `<input id="${escapeAttr(id)}" type="${type}" name="q-${question.id}" value="${escapeAttr(option)}" /> <span>${escapeHtml(option)}</span>`;
      input.appendChild(label);
    });
  } else if (question.answer_type === "text") {
    input = document.createElement("textarea");
    input.name = `q-${question.id}`;
  } else {
    input = document.createElement("input");
    input.name = `q-${question.id}`;
    input.type = question.answer_type === "number" ? "number" : question.answer_type === "date" ? "date" : "text";
    if (question.answer_type === "email") input.type = "email";
    if (question.answer_type === "phone") input.inputMode = "tel";
  }
  wrapper.appendChild(input);

  const error = document.createElement("div");
  error.className = "error hidden";
  wrapper.appendChild(error);
  return wrapper;
}

function collectAnswers() {
  const answers = {};
  const errors = {};
  state.survey.questions.forEach(question => {
    let value = "";
    if (question.answer_type === "multiple_choice") {
      value = [...document.querySelectorAll(`input[name="q-${question.id}"]:checked`)].map(input => input.value);
    } else if (question.answer_type === "single_choice") {
      value = document.querySelector(`input[name="q-${question.id}"]:checked`)?.value || "";
    } else {
      value = document.querySelector(`[name="q-${question.id}"]`)?.value?.trim() || "";
    }
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors[question.id] = "此題為必填";
    }
    answers[question.id] = value;
  });
  return { answers, errors };
}

function renderErrors(errors) {
  document.querySelectorAll(".question").forEach(node => {
    const text = errors[node.dataset.questionId] || "";
    const error = node.querySelector(".error");
    error.textContent = text;
    error.classList.toggle("hidden", !text);
  });
}

async function submitSurvey(event) {
  event.preventDefault();
  const { answers, errors } = collectAnswers();
  renderErrors(errors);
  if (Object.keys(errors).length) return;

  el.submitButton.disabled = true;
  el.submitButton.textContent = "送出中...";
  try {
    const url = new URL(`${config.apiBaseUrl}/liff-questionnaires/public/${encodeURIComponent(config.surveyId)}/responses`);
    url.searchParams.set("oaId", config.oaId);
    if (config.defaultTags.length) url.searchParams.set("defaultTags", config.defaultTags.join(","));
    if (config.botAppName) url.searchParams.set("botAppName", config.botAppName);
    if (config.appName) url.searchParams.set("appName", config.appName);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_token: state.idToken,
        profile: state.profile,
        answers,
        default_tags: config.defaultTags,
        bot_app_name: config.botAppName,
        app_name: config.appName,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.fields) renderErrors(data.fields);
      throw new Error(data.error || "送出失敗");
    }
    el.finishMessage.textContent = data.finish_message || state.survey.finish_message || "感謝你的填寫";
    showOnly(el.done);
  } catch (error) {
    showError(error.message);
  } finally {
    el.submitButton.disabled = false;
    el.submitButton.textContent = "送出問卷";
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

el.form.addEventListener("submit", submitSurvey);
el.closeButton.addEventListener("click", () => {
  if (window.liff && liff.isInClient()) {
    liff.closeWindow();
  }
});

(async function main() {
  try {
    showOnly(el.loading);
    await initLiff();
    await fetchSurvey();
    renderSurvey();
  } catch (error) {
    showError(error.message);
  }
})();
