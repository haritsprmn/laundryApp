document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("invoiceData"));

  if (data) {
    document.getElementById("namaOutput").textContent = data.nama;
    document.getElementById("whatsappOutput").textContent = data.whatsapp;
    document.getElementById("layananOutput").textContent = data.layanan;
    document.getElementById("subLayananOutput").textContent = data.subLayanan;
    document.getElementById("beratOutput").textContent = data.berat;
    document.getElementById("hargaOutput").textContent = data.totalHarga;
    document.getElementById("kodeInvoice").textContent = data.invoice;
    // dll...
  } else {
    alert("❌ Data tidak ditemukan!");
  }
});
