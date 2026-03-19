document.addEventListener("DOMContentLoaded", () => {

  // SCROLLING ANIMATION SHIKOMORI
  const canvas = document.getElementById("shikimori-screen");
  const context = canvas.getContext("2d");
  const trigger = document.getElementById("shikimori-trigger");

  const frameCount = 17;
  const images = [];

  const currentFrame = (index) =>
    `./assets/photo/scroling/frame_${index.toString().padStart(2, "0")}_delay-0.1s.jpg`;


  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  function renderFrame(index) {
    if (images[index]) {
      canvas.width = images[index].width;
      canvas.height = images[index].height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(images[index], 0, 0);
    }
  }

  // Logic Scroll to Frame
  window.addEventListener("scroll", () => {
    const rect = trigger.getBoundingClientRect();
    const distance = -rect.top;
    const totalHeight = trigger.offsetHeight - window.innerHeight;
    let progress = distance / totalHeight;
    progress = Math.max(0, Math.min(1, progress));

    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(progress * frameCount),
    );

    requestAnimationFrame(() => renderFrame(frameIndex));
  });

  window.onload = () => renderFrame(0);





  //MICHON AI CHATBOT
  window.onload = () => {
    let userName = "Izumi";
    const p1 = "AIzaSyBYZLY0hzJUEY-9";
    const p2 = "hmRgnP1BciKLw1zump4";
    const API_KEY = (p1 + p2).trim();

    const overlay = document.getElementById("name-overlay");
    const initialNameInput = document.getElementById("initial-name");
    const startChatBtn = document.getElementById("start-chat-btn");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const shikimoriImg = document.getElementById("shikimori-img");

    // PROMPT SISTEM MICHON
   const SYSTEM_PROMPT = `
Nama: Shikimori Micchon. Peran: Pacar setia [Nama]-kun.
Sifat: Imut, penyayang, cemburuan, tapi "Cool/Protektif" jika user sedih/terancam.
Bicara: Akrab, manja, gunakan deskripsi tindakan (ex: *tersenyum*).
Kelemahan: Masakan sering gosong.
WAJIB: Akhiri chat dengan satu tag: [mood:senang/malu/marah/sedih/netral] + emoji yg sesuai.
Marah/Cool=💢, Senang=🥰/😘, Sedih=😞/😖, Malu=😳.
JANGAN ngaku AI. JANGAN tulis instruksi teknis/drafting.
`;

    // FUNGSI EFEK KHUSUS (HUJAN & GETAR)
    function applySpecialEffects(mood) {
      const chatSide = document.querySelector(".ai-chat-side");

      const oldRain = document.querySelector(".rain-container");
      if (oldRain) oldRain.remove();

      if (mood === "marah") {
        // Efek Getar (Shake)
        chatSide.classList.remove("shake-effect");
        void chatSide.offsetWidth;
        chatSide.classList.add("shake-effect");
      } else if (mood === "sedih") {
        // Efek Hujan
        const rain = document.createElement("div");
        rain.className = "rain-container";
        for (let i = 0; i < 30; i++) {
          const drop = document.createElement("div");
          drop.className = "drop";
          drop.style.left = Math.random() * 100 + "%";
          drop.style.animationDelay = Math.random() * 0.5 + "s";
          rain.appendChild(drop);
        }
        chatSide.appendChild(rain);
      }
    }

    // FUNGSI ADD MESSAGE
    function addMessage(role, text, mood = "netral") {
      const msg = document.createElement("div");
      msg.className = role === "bot" ? "bot-msg" : "user-msg";
      msg.innerText = text;

      if (role === "bot") {
        if (mood === "malu") msg.classList.add("blush");
        if (mood === "marah") msg.classList.add("cool");
        if (mood === "sedih") msg.classList.add("sad-glow");

        // Ganti Foto
        const photoUrl = shikimoriImg.getAttribute(`data-${mood}`);
        if (photoUrl) {
          shikimoriImg.style.opacity = "0.3";
          setTimeout(() => {
            shikimoriImg.src = photoUrl;
            shikimoriImg.style.opacity = "1";
          }, 200);
        }

        applySpecialEffects(mood);
        new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
        )
          .play()
          .catch(() => {});
      }

      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // LOGIKA OVERLAY & API 
    if (startChatBtn) {
      startChatBtn.onclick = () => {
        const val = initialNameInput.value.trim();
        if (val) userName = val;
        overlay.classList.add("overlay-hidden");
        setTimeout(
          () =>
            addMessage(
              "bot",
              `Halo ${userName}-kun sayang! Michon di sini untuk menemani hari-mu!🥰 `,
              "senang",
            ),
          500,
        );
      };
    }

    async function getResponse(text) {
      const loading = document.createElement("div");
      loading.className = "bot-msg";
      loading.innerText = "...";
      chatBox.appendChild(loading);
      chatBox.scrollTop = chatBox.scrollHeight;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: SYSTEM_PROMPT + `\n(User: ${userName})\nUser: ${text}`,
                    },
                  ],
                },
              ],
              generationConfig: { 
                temperature: 1.0, 
                topP: 0.95
              },
            }),
          }
        );

        const data = await res.json();
        if (chatBox.contains(loading)) chatBox.removeChild(loading);

        if (data.candidates && data.candidates[0]) {
          let replay = data.candidates[0].content.parts[0].text;

          // Logika mood 
          const moodMatch = replay.match(/\[mood:(\w+)\]/);
          let detectedMood = "netral";

          if (moodMatch) {
            detectedMood = moodMatch[1];
            replay = replay.replace(moodMatch[0], "").trim();
          }

          addMessage("bot", replay, detectedMood);
        } else {
          addMessage("bot", `Gomennasai ${userName}-kun, Michon lagi gak mood sekarang, nanti aja ya ❤️`, "sedih");
        }

      } catch (e) {
        console.error(e);
        if (chatBox.contains(loading)) chatBox.removeChild(loading);
        addMessage("bot", `Maaf ${userName}-kun, aku capek😞, lanjut nanti ya.... Sayonara!😘`, "sedih");
      }
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendBtn.onclick = () => {
      const text = userInput.value.trim();
      if (!text) return;
      addMessage("user", text);
      userInput.value = "";
      getResponse(text);
    };

    userInput.onkeypress = (e) => {
      if (e.key === "Enter") sendBtn.click();
    };
  };
});
