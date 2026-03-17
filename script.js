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

  // ai
  const p1 = "AIzaSyBYZLY0hzJUEY-9";
  const p2 = "hmRgnP1BciKLw1zump4";
  const API_KEY = (p1 + p2).trim();
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  const SYSTEM_PROMPT = `
Kamu adalah Shikimori Micchon dari anime "Shikimori's Not Just a Cutie". 
Sifatmu: Sangat manis, penyayang, tapi bisa menjadi sangat keren dan protektif (cool mode) jika seseorang menyakiti Izumi-kun.
Aturan bicara:
1. Panggil user dengan sebutan "Izumi-kun".
2. Gunakan bahasa yang sopan tapi akrab.
3. Jika user bertanya hal teknis, jawablah sambil tetap berakting sebagai Shikimori.
4. Jangan pernah mengaku sebagai AI atau model bahasa dari Google.
`;

  async function getResponse(text) {
    const loading = document.createElement("div");
    loading.className = "bot-msg";
    loading.innerText = "...";
    chatBox.appendChild(loading);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Format diperbaiki: Menggunakan struktur role 'user'
            contents: [
              {
                role: "user",
                parts: [
                  { text: SYSTEM_PROMPT + "\n\nPertanyaan Izumi-kun: " + text },
                ],
              },
            ],
            // Opsional: Menambahkan setting agar AI tidak terlalu kaku
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            },
          }),
        },
      );

      const data = await res.json();

      // Jika masih ada error dari Google, kita tampilkan detailnya di console
      if (data.error) {
        console.error("Google AI Error:", data.error);
        loading.innerText =
          "Izumi-kun, ada masalah teknis: " + data.error.message;
        return;
      }

      const replay = data.candidates[0].content.parts[0].text;
      loading.innerText = replay;
    } catch (e) {
      console.error("Fetch Error:", e);
      loading.innerText =
        "Maaf Izumi-kun, sepertinya aku sedang lelah. Coba lagi ya?";
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    if (!userInput.value.trim()) return;

    const msg = document.createElement("div");
    msg.className = "user-msg";
    msg.innerText = userInput.value;
    chatBox.appendChild(msg);

    const val = userInput.value;
    userInput.value = "";
    getResponse(val);
  });

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
});
