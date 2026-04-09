(() => {
  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-btn");
  const promptGrid = document.getElementById("prompt-grid");

  if (!chatForm || !chatMessages || !messageInput || !sendButton || !promptGrid) {
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
    "Halo, saya AI Nusantara.\n\nKita bisa ngobrol santai tentang integrasi sosial, Pancasila, toleransi, NU, Muhammadiyah, atau persatuan Indonesia.",
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
        "Saya siap menemani diskusi tentang integrasi sosial, Pancasila, toleransi, NU, Muhammadiyah, atau persatuan bangsa.",
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
            "Contohnya terlihat saat warga dengan latar belakang berbeda tetap bergotong royong, bermusyawarah, dan menjaga lingkungan bersama.",
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
            "Pancasila bisa dipahami sebagai dasar nilai untuk hidup bersama di tengah keberagaman Indonesia.",
            "Nilainya terasa nyata ketika kita menghormati perbedaan, berlaku adil, menjaga persatuan, dan menyelesaikan masalah lewat musyawarah.",
            "Karena itu, Pancasila bukan hanya hafalan sila, tetapi pedoman bersikap dalam kehidupan sehari-hari.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "toleransi",
        keywords: ["toleransi", "menghargai perbedaan"],
        build() {
          return [
            pick(openings.supportive),
            "Toleransi berarti menghormati orang lain yang berbeda agama, budaya, pendapat, atau kebiasaan, tanpa harus kehilangan identitas kita sendiri.",
            "Sikap ini penting karena masyarakat yang beragam hanya bisa damai jika ada rasa hormat dan pengendalian diri.",
            "Dalam praktiknya, toleransi bisa terlihat dari cara kita berbicara sopan, tidak memaksakan pendapat, dan tetap bekerja sama meskipun berbeda.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "gotong royong",
        keywords: ["gotong royong"],
        build() {
          return [
            "Gotong royong adalah contoh paling nyata dari persatuan dalam tindakan.",
            "Lewat gotong royong, orang belajar bahwa masalah bersama lebih mudah diselesaikan jika dikerjakan bersama, bukan sendiri-sendiri.",
            "Karena itu, gotong royong sering dianggap sebagai kekuatan sosial yang mempererat hubungan antarwarga.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "konflik sosial",
        keywords: ["konflik", "perpecahan"],
        build() {
          return [
            pick(openings.reflective),
            "Konflik sosial biasanya muncul karena perbedaan kepentingan, salah paham, prasangka, atau komunikasi yang buruk.",
            "Cara menguranginya adalah dengan dialog yang tenang, sikap adil, empati, dan kemauan mencari titik temu.",
            "Tujuannya bukan mencari siapa yang paling menang, tetapi bagaimana semua pihak bisa kembali hidup damai.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "keberagaman",
        keywords: ["budaya", "keberagaman", "beragam", "bhinneka"],
        build() {
          return [
            "Keberagaman di Indonesia seharusnya dilihat sebagai kekuatan, bukan ancaman.",
            "Saat kita mengenal perbedaan dengan rasa hormat, kita justru belajar bahwa persatuan tidak menghapus warna-warna yang ada.",
            "Semangat ini sejalan dengan Bhinneka Tunggal Ika, yaitu berbeda-beda tetapi tetap satu tujuan sebagai bangsa.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "NU",
        keywords: ["nu", "nahdlatul ulama"],
        build() {
          return [
            "Nahdlatul Ulama dikenal sebagai organisasi Islam besar yang dekat dengan tradisi, moderasi, dan kehidupan sosial masyarakat.",
            "Peran NU terasa kuat dalam menjaga nilai keagamaan yang ramah, toleran, dan selaras dengan konteks Indonesia.",
            "Karena itu, NU sering dipandang sebagai salah satu kekuatan penting dalam menjaga keseimbangan dan persatuan masyarakat.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "Muhammadiyah",
        keywords: ["muhammadiyah"],
        build() {
          return [
            "Muhammadiyah dikenal melalui perannya dalam pembaruan pemikiran Islam, pendidikan, kesehatan, dan pelayanan sosial.",
            "Kontribusinya sangat terasa karena organisasi ini tidak hanya berbicara soal nilai, tetapi juga membangun sekolah, kampus, rumah sakit, dan layanan masyarakat.",
            "Dari sini kita bisa melihat bahwa integritas juga berarti konsisten memberi manfaat nyata bagi umat dan bangsa.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "perbedaan NU dan Muhammadiyah",
        keywords: ["perbedaan nu dan muhammadiyah", "nu dan muhammadiyah", "beda nu", "beda muhammadiyah"],
        build() {
          return [
            pick(openings.supportive),
            "Secara sederhana, NU dan Muhammadiyah sama-sama organisasi Islam besar yang ingin memajukan umat, tetapi pendekatan mereka berbeda.",
            "NU lebih dikenal kuat dalam menjaga tradisi keislaman yang tumbuh di masyarakat, sedangkan Muhammadiyah lebih dikenal lewat semangat pembaruan, pendidikan, dan pelayanan sosial yang modern.",
            "Perbedaan ini sebaiknya dipahami sebagai variasi cara berkontribusi, bukan alasan untuk dipertentangkan.",
            pick(followUps),
          ].join("\n\n");
        },
      },
      {
        topic: "persatuan",
        keywords: ["persatuan", "kesatuan", "bangsa"],
        build() {
          return [
            "Persatuan bangsa tumbuh ketika masyarakat merasa memiliki tujuan bersama meskipun berasal dari latar belakang yang berbeda.",
            "Itu sebabnya sikap saling menghargai, adil, dan mau bekerja sama menjadi fondasi yang sangat penting.",
            "Kalau fondasi ini kuat, perbedaan tidak akan mudah berubah menjadi perpecahan.",
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

    const contextualIntro =
      conversationState.lastTopic && conversationState.turnCount > 1
        ? `Masih nyambung dengan pembahasan tentang ${conversationState.lastTopic}, `
        : "";

    return [
      contextualIntro +
        `saya menangkap bahwa kamu sedang membahas "${text}".`,
      "Kalau dijelaskan secara umum, kita bisa melihatnya dari tiga sisi: maknanya, dampaknya bagi kehidupan bersama, dan contoh sikap nyatanya.",
      "Kalau kamu mau, kirim pertanyaan yang lebih spesifik, misalnya minta definisi, contoh, perbedaan, atau versi singkat untuk tugas sekolah.",
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
    return message;
  }

  function appendTypingMessage() {
    const typingMessage = document.createElement("div");
    typingMessage.classList.add("message", "received", "typing");

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = assistantName;

    const dots = document.createElement("span");
    dots.className = "typing-dots";
    dots.setAttribute("aria-label", "AI sedang mengetik");
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
    const delay = Math.min(2200, 650 + reply.length * 7);

    window.setTimeout(() => {
      typingBubble.remove();
      appendMessage(assistantName, reply, "received");
      setLoading(false);
      messageInput.focus();
    }, delay);
  }

  function containsAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
})();
