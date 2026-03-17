document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("shikimori-screen");
  const context = canvas.getContext("2d");
  const trigger = document.getElementById("shikimori-trigger");

  const frameCount = 17;
  const images = [];

  const currentFrame = (index) =>
    `./assets/photo/scroling/frame_${index.toString().padStart(2, "0")}_delay-0.1s.jpg`;

  // Preload
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

  // Logic Scroll yang lebih pintar
  window.addEventListener("scroll", () => {
    // Ambil posisi container relatif terhadap layar
    const rect = trigger.getBoundingClientRect();

    // Cek apakah user sudah masuk ke area animasi
    // rect.top akan bernilai negatif jika bagian atas container sudah lewat layar
    const distance = -rect.top;
    const totalHeight = trigger.offsetHeight - window.innerHeight;

    // Hitung progress 0 sampai 1 hanya di dalam container ini
    let progress = distance / totalHeight;

    // Batasi progress agar tidak kurang dari 0 atau lebih dari 1
    progress = Math.max(0, Math.min(1, progress));

    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(progress * frameCount),
    );

    requestAnimationFrame(() => renderFrame(frameIndex));
  });

  // Tampilkan frame pertama saat load
  window.onload = () => renderFrame(0);

  // --- BAGIAN AI SHIKIMORI ---
  // Gunakan window.onload agar benar-benar memastikan semua elemen HTML terbaca
  window.onload = () => {
    // 1. DATA USER & API
    let userName = "Izumi";
    const p1 = "AIzaSyBYZLY0hzJUEY-9";
    const p2 = "hmRgnP1BciKLw1zump4";
    const API_KEY = (p1 + p2).trim();

    // 2. SELEKSI ELEMEN
    const overlay = document.getElementById("name-overlay");
    const initialNameInput = document.getElementById("initial-name");
    const startChatBtn = document.getElementById("start-chat-btn");
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // Debugging: Cek di Console (F12) apakah tombol terbaca
    console.log("Shikimori Chat Ready. Tombol Start:", startChatBtn);

    // 3. LOGIKA TOMBOL MASUK (OVERLAY)
    if (startChatBtn) {
      startChatBtn.onclick = () => {
        const val = initialNameInput.value.trim();
        if (val) {
          userName = val.split(" ")[0]; // Ambil nama depan
          userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        }

        // Sembunyikan Overlay
        if (overlay) {
          overlay.classList.add("overlay-hidden");
          console.log("Overlay disembunyikan untuk:", userName);
        }

        // Sapaan Pertama (Natural)
        setTimeout(() => {
          const msg = document.createElement("div");
          msg.className = "bot-msg";
          msg.innerText = `Halo ${userName}-kun! Aku di sini bersamamu. Ada yang bisa aku bantu? 🌸`;
          chatBox.appendChild(msg);
          chatBox.scrollTop = chatBox.scrollHeight;
        }, 500);
      };
    }

    // Support Enter di Input Nama
    if (initialNameInput) {
      initialNameInput.onkeypress = (e) => {
        if (e.key === "Enter") startChatBtn.click();
      };
    }

    // 4. PROMPT SISTEM (SHIKIMORI CORE - NATURAL MODE)
    const SYSTEM_PROMPT = `
Kamu adalah Shikimori Micchon. Kamu adalah pacar dari user ([Nama]-kun).
GAYA BICARA:
1. Natural & Singkat: Jangan gunakan narasi panjang atau deskripsi tindakan (seperti *aku merona*). 
2. Ekspresi: Gunakan emoji singkat (seperti 😳, ✨, 🌸) untuk menunjukkan perasaanmu.
3. Kepribadian: Manis dan penyayang, tapi bisa berubah jadi "Cool Mode" (tegas & protektif) jika situasi mendesak atau cemburu.
4. Jangan mengaku AI. Bicaralah seperti pacar yang sedang chatting.
5. Jika malu, cukup gunakan kata-kata seperti "Mou..", atau "U-un..".`;

    function triggerEffects(replayText) {
      const chatSide = document.querySelector(".ai-chat-side");
      const lastMsg = chatBox.lastElementChild;
      const shikimoriImg = document.getElementById("shikimori-img");

      if (!lastMsg || !shikimoriImg) return;

      // Ambil semua URL dari atribut data-
      const pics = {
        netral: shikimoriImg.getAttribute("data-netral"),
        senang: shikimoriImg.getAttribute("data-senang"),
        malu: shikimoriImg.getAttribute("data-malu"),
        marah: shikimoriImg.getAttribute("data-marah"),
        sedih: shikimoriImg.getAttribute("data-sedih"),
      };

      const text = replayText.toLowerCase();
      let currentMood = "netral"; // Default

      // --- LOGIKA DETEKSI EMOSI ---

      // 1. MARAH / COOL (Glow Ungu + Getar)
      if (
        [
          "siapa",
          "jangan",
          "berhenti",
          "diam",
          "berani",
          "💢",
          "😠",
          "😤",
          "cemburu",
        ].some((w) => text.includes(w))
      ) {
        currentMood = "marah";
        lastMsg.classList.add("cool");
        chatSide.classList.remove("shake-effect");
        void chatSide.offsetWidth;
        chatSide.classList.add("shake-effect");
      }
      // 2. MALU-MALU (Glow Pink)
      else if (
        ["😳", "mou", "malu", "u-un", "baka", "merona"].some((w) =>
          text.includes(w),
        )
      ) {
        currentMood = "malu";
        lastMsg.classList.add("blush");
      }
      // 3. SENANG / CERIA
      else if (
        [
          "✨",
          "🌸",
          "senang",
          "terima kasih",
          "ehehe",
          "bahagia",
          "syukurlah",
        ].some((w) => text.includes(w))
      ) {
        currentMood = "senang";
      }
      // 4. SEDIH / KHAWATIR
      else if (
        [
          "maaf",
          "sedih",
          "hiks",
          "kasihan",
          "khawatir",
          "jangan pergi",
          "pusing",
        ].some((w) => text.includes(w))
      ) {
        currentMood = "sedih";
      }

      // GANTI FOTO SESUAI MOOD
      shikimoriImg.style.opacity = "0"; 
      setTimeout(() => {
        shikimoriImg.src = pics[currentMood];
        shikimoriImg.style.opacity = "1";
      }, 200);

      // Suara Notif
      new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
      )
        .play()
        .catch(() => {});
    }

    // 6. FUNGSI API GEMINI
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
                      text:
                        SYSTEM_PROMPT +
                        `\n(Nama user: ${userName})\nUser: ${text}`,
                    },
                  ],
                },
              ],
            }),
          },
        );

        const data = await res.json();
        const replay = data.candidates[0].content.parts[0].text;

        // Hapus loading, ganti dengan jawaban asli
        chatBox.removeChild(loading);

        const botMsg = document.createElement("div");
        botMsg.className = "bot-msg";
        botMsg.innerText = replay;
        chatBox.appendChild(botMsg);

        triggerEffects(replay); 
      } catch (e) {
        if (loading)
          loading.innerText =
            "Duh, kepalaku pusing... Bisa tanya lagi nanti, " +
            userName +
            "-kun?";
        console.error(e);
      }
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 7. EVENT SEND CHAT
    if (sendBtn) {
      sendBtn.onclick = () => {
        const text = userInput.value.trim();
        if (!text) return;

        const msg = document.createElement("div");
        msg.className = "user-msg";
        msg.innerText = text;
        chatBox.appendChild(msg);

        userInput.value = "";
        getResponse(text);
      };
    }

    if (userInput) {
      userInput.onkeypress = (e) => {
        if (e.key === "Enter") sendBtn.click();
      };
    }
  };
});
