let isSubmitting = false; // deklarasi di luar boleh

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sheetdb-form");
  const invoiceField = document.getElementById("invoiceCode");
  const submitBtn = document.querySelector('button[type="submit"]'); // pastikan ini ada

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add("was-validated");
      isSubmitting = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Memproses...";

    const invoiceCode = generateInvoiceCode();
    invoiceField.value = invoiceCode;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });

      if (response.ok) {
        const formData = {
          nama: document.getElementById("nama").value,
          whatsapp: document.getElementById("whatsapp").value,
          layanan: document.getElementById("layanan").value,
          subLayanan: document.getElementById("subLayanan").value,
          berat: document.getElementById("berat")?.value || "",
          totalHarga: document.getElementById("totalHarga").value,
          invoice: document.getElementById("invoiceCode").value,
        };

        localStorage.setItem("invoiceData", JSON.stringify(formData));
        window.location.href = "invoice.html";
      } else {
        alert("❌ Gagal mengirim data. Coba lagi.");
        resetSubmit();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat mengirim data.");
      resetSubmit();
    }

    function resetSubmit() {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim";
    }
  });
});

// <!-- Sub Layanan -->
function tampilkanSubLayanan() {
  const layanan = document.getElementById("layanan").value;
  const subLayanan = document.getElementById("subLayanan");
  const wrapper = document.getElementById("subLayananWrapper");
  const inputBerat = document.getElementById("inputBerat");
  const berat = document.getElementById("berat");
  const hargaWrapper = document.getElementById("hargaWrapper");

  subLayanan.innerHTML = '<option selected disabled value="">-- Jenis --</option>';

  const opsi = {
    "Cuci Komplit": ["Reguler", "Express", "Kilat"],
    "Cuci Lipat": ["Reguler", "Express", "Kilat"],
    Satuan: ["Jas", "Gaun", "Selimut", "Karpet"],
    Setrika: ["Reguler", "Express", "Kilat"],
  };

  const values = {
    "Cuci Komplit": [6000, 8000, 10000],
    "Cuci Lipat": [4000, 6000, 8000],
    Setrika: [4000, 6000, 8000],
    Satuan: [15000, 25000, 20000, 30000],
  };

  // Show/hide berat
  if (layanan === "Satuan") {
    inputBerat.style.display = "none";
    berat.removeAttribute("required");
    hargaWrapper.style.display = "none";
  } else {
    inputBerat.style.display = "block";
    berat.setAttribute("required", "required"); // ← penting!
  }

  if (layanan && opsi[layanan]) {
    wrapper.style.display = "block";
    opsi[layanan].forEach((item, index) => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.setAttribute("data-harga", values[layanan][index]);
      opt.textContent = item;
      subLayanan.appendChild(opt);
    });
    subLayanan.addEventListener("change", hitungHarga);
  } else {
    wrapper.style.display = "none";
  }
}

// <!-- Harga -->
function hitungHarga() {
  const layanan = document.getElementById("layanan").value;
  const beratInput = document.getElementById("berat");
  const berat = parseFloat(beratInput.value);
  const subLayananSelect = document.getElementById("subLayanan");
  const selectedOption = subLayananSelect.options[subLayananSelect.selectedIndex];
  const harga = parseFloat(selectedOption?.getAttribute("data-harga")) || 0;

  const wrapper = document.getElementById("hargaWrapper");
  const totalInput = document.getElementById("totalHarga");

  if (layanan === "Satuan") {
    if (!harga) {
      wrapper.style.display = "none";
      totalInput.value = "";
      return;
    }

    totalInput.value = harga.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
    wrapper.style.display = "block";
    return;
  }

  // layanan kiloan (komplit, lipat, setrika)
  if (!harga || isNaN(berat) || berat <= 0) {
    wrapper.style.display = "none";
    totalInput.value = "";
    return;
  }

  const total = berat * harga;

  totalInput.value = total.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  wrapper.style.display = "block";
}

// <!-- Cek nomor WA -->

const whatsappInput = document.getElementById("whatsapp");
const valid = document.getElementById("valid");
const invalid = document.getElementById("invalid");
const habis = document.getElementById("token");
const submitBtn = document.querySelector('button[type="submit"]');
const checkbox = document.getElementById("checkDefault");
const checkboxWrapper = document.getElementById("checkboxWrapper");

// Sembunyikan valid/invalid saat input diubah
whatsappInput.addEventListener("input", () => {
  const value = whatsappInput.value.trim();
  if (value === "") {
    valid.style.display = "none";
    invalid.style.display = "none";
    habis.style.display = "none";
    submitBtn.disabled = false;
    checkboxWrapper.style.display = "none";
  }
});

async function cekNomorWAApi() {
  const input = whatsappInput.value.trim();

  // Format nomor
  let nomor = input.replace(/\D/g, "");
  if (nomor.startsWith("08")) {
    nomor = "62" + nomor.slice(1);
  }

  // Jika kosong, sembunyikan semuanya dan keluar
  if (!nomor) {
    valid.style.display = "none";
    invalid.style.display = "none";
    habis.style.display = "none";
    return;
  }

  const instanceId = "instance115041";
  const token = "geqnjohk2jljnmgr";
  const url = `https://api.ultramsg.com/${instanceId}/contacts/check?token=${token}&chatId=${nomor}@c.us`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const status = data.status;

    if (status === "valid") {
      whatsappInput.value = nomor;
      valid.style.display = "block";
      invalid.style.display = "none";
      habis.style.display = "none";
      checkboxWrapper.style.display = "none";
      submitBtn.disabled = false;
    } else if (status === "invalid") {
      invalid.style.display = "block";
      valid.style.display = "none";
      habis.style.display = "none";
      checkboxWrapper.style.display = "none";
      submitBtn.disabled = true;
    } else {
      habis.style.display = "block";
      invalid.style.display = "none";
      valid.style.display = "none";
      submitBtn.disabled = true;
      checkboxWrapper.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    habis.innerText = "❌ Gagal menghubungi server";
    habis.style.display = "block";
    invalid.style.display = "none";
    valid.style.display = "none";
    submitBtn.disabled = true;
    checkboxWrapper.style.display = "block";
  }
}

// // <!-- kondisi api eror -->
checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
});

// Fungsi buat generate kode invoice
function generateInvoiceCode() {
  const now = new Date();

  const pad = (num, size) => num.toString().padStart(size, "0");
  const year = now.getFullYear().toString().slice(2);
  const month = pad(now.getMonth() + 1, 2);
  const day = pad(now.getDate(), 2);
  const hours = pad(now.getHours(), 2);
  const minutes = pad(now.getMinutes(), 2);
  const seconds = pad(now.getSeconds(), 2);
  const random = Math.floor(100 + Math.random() * 900); // 3 digit random

  return `HRTS${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}
