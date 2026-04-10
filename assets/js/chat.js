(() => {
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-btn");
  const promptGrid = document.getElementById("prompt-grid");

  if (
    !chatForm ||
    !chatMessages ||
    !messageInput ||
    !sendButton ||
    !promptGrid
  ) {
    return;
  }

  const assistantName = "AI Nusantara";
  const conversationState = {
    turnCount: 0,
    lastTopic: "",
  };

  const openings = {
    greeting: [
      "Halo, senang ngobrol denganmu di sini.",
      "Hai, saya siap bantu jelaskan dengan santai dan jelas.",
      "Halo, mari kita bahas pelan-pelan supaya mudah dipahami.",
    ],
    supportive: [
      "Pertanyaanmu bagus, karena ini memang inti dari hidup bersama di masyarakat.",
      "Ini topik yang menarik, dan sebenarnya dekat sekali dengan kehidupan sehari-hari.",
      "Saya suka arah pertanyaanmu, karena ini menyentuh nilai penting dalam persatuan.",
    ],
    reflective: [
      "Kalau kita lihat lebih dekat, intinya bukan cuma teori, tapi cara kita bersikap.",
      "Kalau dibahas sederhana, poin utamanya ada pada hubungan antarmanusia.",
      "Kalau dipikirkan dalam konteks Indonesia, jawabannya sangat terkait dengan keberagaman.",
    ],
  };

  const followUps = [
    "Kalau kamu mau, saya bisa jelaskan versi yang lebih singkat juga.",
    "Kalau mau, saya bisa kasih contoh nyata dalam kehidupan sehari-hari.",
    "Kalau kamu ingin, saya juga bisa bantu ubah ini jadi jawaban tugas atau presentasi.",
    "Kalau mau dilanjut, saya bisa bandingkan dengan contoh di sekolah atau masyarakat.",
  ];

  const starters = [
    "Halo, saya AI Nusantara.\n\nKita bisa ngobrol santai tentang integrasi sosial, Pancasila, toleransi, atau persatuan Indonesia.",
    "Tulis pertanyaan seperti saat berbicara ke ChatGPT atau Gemini. Saya akan menjawab dengan gaya yang lebih natural, rapi, dan enak dibaca.",
  ];

  appendMessage(assistantName, starters.join("\n\n"), "received");

  promptGrid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("prompt-chip")) return;

    const prompt = target.dataset.prompt || "";
    if (!prompt) return;

    messageInput.value = prompt;
    autoResizeTextarea();
    messageInput.focus();
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitCurrentMessage();
  });

  messageInput.addEventListener("input", () => {
    autoResizeTextarea();
  });

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitCurrentMessage();
    }
  });

  autoResizeTextarea();

  function buildLocalReply(message) {
    const text = message.trim();
    const lowered = text.toLowerCase();
    conversationState.turnCount += 1;

    if (!text) {
      return "Tulis saja pertanyaanmu, lalu saya bantu jawab dengan bahasa yang sederhana dan enak dibaca.";
    }

    if (containsAny(lowered, ["halo", "hai", "assalamualaikum", "permisi"])) {
      conversationState.lastTopic = "sapaan";
      return [
        pick(openings.greeting),
        "Saya siap menemani diskusi tentang integrasi sosial, Pancasila, toleransi, atau persatuan bangsa.",
        "Kamu bisa tanya singkat, atau langsung kirim pertanyaan panjang juga boleh.",
      ].join(" ");
    }

    if (containsAny(lowered, ["terima kasih", "makasih", "thanks"])) {
      conversationState.lastTopic = "apresiasi";
      return [
        "Sama-sama, senang bisa bantu.",
        "Kalau masih ada bagian yang terasa rumit, kirim saja lagi dan nanti saya jelaskan dengan versi yang lebih mudah.",
      ].join("\n\n");
    }

    if (containsAny(lowered, ["siapa kamu", "kamu siapa"])) {
      conversationState.lastTopic = "identitas";
      return [
        "Saya AI Nusantara, asisten diskusi belajar di halaman ini.",
        "Peran saya adalah membantu menjelaskan topik dengan gaya yang santai, rapi, dan mudah dipahami.",
        pick(followUps),
      ].join("\n\n");
    }

    const topicBuilders = [
      {
        topic: "integrasi sosial",
        keywords: ["integrasi", "integrasi sosial"],
        build() {
          return [
            pick(openings.supportive),
            "Integrasi sosial adalah proses menyatukan berbagai perbedaan agar masyarakat tetap hidup rukun, saling percaya, dan bisa bekerja sama.",
            "Jadi, intinya bukan membuat semua orang menjadi sama, tetapi membuat perbedaan bisa hidup berdampingan secara harmonis.",
            "Contohnya terlihat saat warga dengan latar belakang berbeda tetap bergotong royong dan menjaga lingkungan bersama.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "pancasila",
        keywords: ["pancasila"],
        build() {
          return [
            pick(openings.reflective),
            "Pancasila adalah dasar nilai untuk hidup bersama di tengah keberagaman Indonesia.",
            "Nilainya terlihat saat kita menghormati perbedaan, berlaku adil, menjaga persatuan, dan menyelesaikan masalah lewat musyawarah.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "toleransi",
        keywords: ["toleransi"],
        build() {
          return [
            pick(openings.supportive),
            "Toleransi berarti menghormati orang lain yang berbeda tanpa harus kehilangan identitas diri.",
            "Sikap ini penting agar masyarakat yang beragam bisa hidup damai.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "persatuan",
        keywords: ["persatuan", "bangsa"],
        build() {
          return [
            "Persatuan bangsa tumbuh dari rasa saling menghargai dan tujuan bersama.",
            "Dengan persatuan, perbedaan tidak menjadi konflik tetapi menjadi kekuatan.",
            pick(followUps),
          ].join("\n\n");
        },
      },
    ];

    for (const item of topicBuilders) {
      if (containsAny(lowered, item.keywords)) {
        conversationState.lastTopic = item.topic;
        return item.build();
      }
    }

    return [
      `Saya menangkap bahwa kamu sedang membahas "${text}".`,
      "Kalau mau, kirim pertanyaan yang lebih spesifik supaya saya bisa bantu lebih tepat.",
    ].join("\n\n");
  }

  function appendMessage(user, text, type) {
    const message = document.createElement("div");
    message.classList.add("message", type);

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = user;

    const messageText = document.createElement("span");
    messageText.className = "message-text";
    messageText.textContent = text;

    message.appendChild(meta);
    message.appendChild(messageText);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendTypingMessage() {
    const typingMessage = document.createElement("div");
    typingMessage.classList.add("message", "received", "typing");

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = assistantName;

    const dots = document.createElement("span");
    dots.className = "typing-dots";
    dots.innerHTML = "<span></span><span></span><span></span>";

    typingMessage.appendChild(meta);
    typingMessage.appendChild(dots);
    chatMessages.appendChild(typingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingMessage;
  }

  function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    sendButton.textContent = isLoading ? "Menjawab..." : "Kirim";
    messageInput.disabled = isLoading;
  }

  function autoResizeTextarea() {
    messageInput.style.height = "auto";
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
  }

  function submitCurrentMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    appendMessage("Kamu", messageText, "sent");
    messageInput.value = "";
    autoResizeTextarea();
    setLoading(true);

    const typingBubble = appendTypingMessage();
    const reply = buildLocalReply(messageText);

    setTimeout(() => {
      typingBubble.remove();
      appendMessage(assistantName, reply, "received");
      setLoading(false);
      messageInput.focus();
    }, 1000);
  }

  function containsAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
})();
