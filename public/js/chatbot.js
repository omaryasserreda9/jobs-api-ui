const toggle = document.getElementById("chatbotToggle");
const chatWindow = document.getElementById("chatbotWindow");
const closeBtn = document.getElementById("chatbotClose");
const input = document.getElementById("chatbotInput");
const sendBtn = document.getElementById("chatbotSend");
const messages = document.getElementById("chatbotMessages");

const appendMsg = (text, type) => {
  const div = document.createElement("div");
  div.className = `chatbot-msg ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
};

const sendMessage = async () => {
  const text = input.value.trim();
  if (!text) return;

  appendMsg(text, "user");
  input.value = "";
  sendBtn.disabled = true;

  const typing = appendMsg("Typing...", "typing");

  try {
    const res = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    typing.remove();
    appendMsg(data.reply, "bot");
  } catch {
    typing.remove();
    appendMsg("Sorry, something went wrong. Please try again.", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
};

toggle.addEventListener("click", () => chatWindow.classList.toggle("is-open"));
closeBtn.addEventListener("click", () => chatWindow.classList.remove("is-open"));
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});