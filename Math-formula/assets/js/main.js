window.onload = function () {
  const rumus = document.getElementById("rumus");
  const inputArea = document.getElementById("input-area");
  const hasilBox = document.getElementById("hasil");

  rumus.addEventListener("change", () => {
    const r = rumus.value;
    let html = "";

    if (r === "miring") {
      html = `<label>Alas:</label><input type="number" id="alas"><br>
              <label>Tinggi:</label><input type="number" id="tinggi"><br>`;
    } else if (r === "alas") {
      html = `<label>Miring:</label><input type="number" id="miring"><br>
              <label>Tinggi:</label><input type="number" id="tinggi"><br>`;
    } else if (r === "tinggi") {
      html = `<label>Miring:</label><input type="number" id="miring"><br>
              <label>Alas:</label><input type="number" id="alas"><br>`;
    } else if (r === "persegi") {
      html = `<label>Sisi:</label><input type="number" id="sisi"><br>`;
    } else if (r === "lp" || r === "kp") {
      html = `<label>Panjang:</label><input type="number" id="panjang"><br>
              <label>Lebar:</label><input type="number" id="lebar"><br>`;
    } else if (r === "segitiga") {
      html = `<label>Alas :</label><input type="number" id="aS><br>
              <label>Tinggi :</label><input type="number" id="tS><br>
              <label>Keliling :</label><input type="number" id="kS><br>`;
    } else if (r === "tekanan") {
      html = `<label>Gaya (N):</label><input type="number" id="gaya"><br>
              <label>Luas (m²):</label><input type="number" id="luas"><br>`;
    } else if (r === "newton1") {
      html = `<label>Gaya Resultan (N):</label><input type="number" id="resultan"><br>`;
    } else if (r === "Gaya") {
      html = `<label>Massa (kg):</label><input type="number" id="massa"><br>
              <label>Percepatan (m/s²):</label><input type="number" id="percepatan"><br>`;
    } else if (r === "Massa") {
      html = `<label>Gaya (N):</label><input type="number" id="gaya"><br>
              <label>Percepatan (m/s²):</label><input type="number" id="percepatan"><br>`;
    } else if (r === "Percepatan") {
      html = `<label>Gaya (N):</label><input type="number" id="gaya"><br>
              <label>Massa (kg):</label><input type="number" id="massa"><br>`;
    } else if (r === "gravitasi") {
      html = `<label>Massa 1 (kg):</label><input type="number" id="massa1"><br>
              <label>Massa 2 (kg):</label><input type="number" id="massa2"><br>
              <label>Jarak (m):</label><input type="number" id="jarak"><br>`;
    } else if (r === "energi") {
      html = `<label>Massa (kg):</label><input type="number" id="massa"><br>
              <label>Kecepatan (m/s):</label><input type="number" id="kecepatan"><br>`;
    } else if (r === "subneting") {
      html = `
        <label>IP Address:</label><input type="text" id="ip" placeholder="Contoh: 192.168.1.1"><br>
        <label>CIDR:</label><input type="text" id="cidr" placeholder="Contoh: 8 atau /24"><br>
        <button onclick="hitungSubnet()">Hitung Subnet</button>`;
    } else if (r === "data") {
      html = `
        <label>Masukkan Data (pisahkan dengan koma):</label><br>
        <textarea id="dataInput" rows="4" cols="50" placeholder="Contoh: 10, 20, 30, 40"></textarea><br>
        <button onclick="hitungData()">Hitung Statistik</button>`;
    } else if (r === "statitiska data kelompok") {
      html = `
        <label>Masukkan Data Kelompok (pisahkan dengan koma):</label><br>
        <textarea id="dataKelompokInput" rows="4" cols="50" placeholder="Contoh: 10-20, 21-30, 31-40"></textarea><br>
        <textarea id="frekuensiInput" rows="4" cols="50" placeholder="Masukkan frekuensi masing-masing kelas, pisahkan dengan koma: Contoh: 5, 10, 15"></textarea><br>
        <button onclick="hitungDataKelompok()">Hitung Statistik Kelompok</button>`;
    } else {
      html = `<p>Pilih rumus untuk menampilkan input.</p>  
      `;
    }

    inputArea.innerHTML = html;
    hasilBox.innerHTML = "Hasil : -";
  });
};

function hitung() {
  const r = document.getElementById("rumus").value;
  const hasilBox = document.getElementById("hasil");
  let hasil;

  if (r === "miring") {
    hasil = Math.sqrt(alas.value ** 2 + tinggi.value ** 2);
  } else if (r === "alas") {
    hasil = Math.sqrt(miring.value ** 2 - tinggi.value ** 2);
  } else if (r === "tinggi") {
    hasil = Math.sqrt(miring.value ** 2 - alas.value ** 2);
  } else if (r === "persegi") {
    hasil = sisi.value ** 2;
  } else if (r === "lp") {
    hasil = panjang.value * lebar.value;
  } else if (r === "kp") {
    hasil = 2 * (parseFloat(panjang.value) + parseFloat(lebar.value));
  } else if (r === "segitiga") {
    hasil = 1
  } else if (r === "newton1") {
    hasil = resultan.value == 0 ? "Benda diam / GLB" : "Benda mengalami percepatan";
  } else if (r === "Gaya") {
    hasil = massa.value * percepatan.value;
  } else if (r === "Massa") {
    hasil = gaya.value / percepatan.value;
  } else if (r === "Percepatan") {
    hasil = gaya.value / massa.value;
  } else if (r === "gravitasi") {
    hasil = (6.674 * 10 ** -11 * massa1.value * massa2.value) / (jarak.value ** 2);
  } else if (r === "energi") {
    hasil = 0.5 * massa.value * kecepatan.value ** 2;
  } else if (r === "tekanan") {
    hasil = gaya.value / luas.value;
  } else {
    hasil = "-";
  }

  hasilBox.innerText = `Hasil : ${hasil}`;
}

/* ===================== FUNGSI SUBNETTING ====================== */

function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

function intToIp(int) {
  return [
    (int >>> 24) & 0xFF,
    (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF,
    int & 0xFF
  ].join('.');
}

function maskFromCIDR(cidr) {
  return cidr === 0 ? 0 : (((0xFFFFFFFF << (32 - cidr)) >>> 0) >>> 0);
}

function hitungSubnet() {
  const ipStr = document.getElementById("ip").value.trim();
  const CIDRraw = document.getElementById("cidr").value.trim();
  const hasilDiv = document.getElementById("hasil");

  const cidr = parseInt(CIDRraw.replace('/', ''), 10);
  const ipInt = ipToInt(ipStr);

  if (!ipInt) {
    hasilDiv.innerHTML = "<p style='color:red'>IP tidak valid! Contoh: 192.168.1.10</p>";
    return;
  }

  const firstOctet = parseInt(ipStr.split('.')[0]);
  let minCIDR, maxCIDR, kelasLabel;

  if (cidr >= 8 && cidr < 15) {
    kelasLabel = 'A';
  } else if (cidr >= 16 && cidr < 24) {
    kelasLabel = 'B';
  } else if (cidr >= 24 && cidr <= 32) {
    kelasLabel = 'C';
  }

  const maskInt = maskFromCIDR(cidr);
  const maskStr = intToIp(maskInt);
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const hostCount = (2 ** (32 - cidr)) - 2;

  let html = `
    <h3>Hasil Subneting Kelas ${kelasLabel}</h3>
    <table>
      <tr><th>IP Address</th><td>${ipStr}</td></tr>
      <tr><th>CIDR</th><td>/${cidr}</td></tr>
      <tr><th>Subnet Mask</th><td>${maskStr}</td></tr>
      <tr><th>Network Address</th><td>${intToIp(networkInt)}</td></tr>
      <tr><th>Broadcast Address</th><td>${intToIp(broadcastInt)}</td></tr>
      <tr><th>Host Usable</th><td>${hostCount}</td></tr>
      <tr><th>Range Host</th><td>${intToIp(networkInt + 1)} - ${intToIp(broadcastInt - 1)}</td></tr>
    </table>
  `;

  hasilDiv.innerHTML = html;
}

/* ===================== Data ====================== */
function hitungData() {
  const dataInput = document.getElementById("dataInput").value;
  const hasilDiv = document.getElementById("hasil");

  const dataArray = dataInput.split(',')
    .map(num => parseFloat(num.trim()))
    .filter(num => !isNaN(num));

  if (dataArray.length === 0) {
    hasilDiv.innerHTML = "<p style='color:red'>Masukkan data yang valid!</p>";
    return;
  }

  // Mean
  const Mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

  // Modus
  const ModusMap = {};
  dataArray.forEach(num => {
    ModusMap[num] = (ModusMap[num] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(ModusMap));
  const Modus = Object.keys(ModusMap)
    .filter(key => ModusMap[key] === maxCount)
    .map(Number)
    .join(', ');

  // Median
  const sortedData = [...dataArray].sort((a, b) => a - b);
  const mid = Math.floor(sortedData.length / 2);
  const Median = sortedData.length % 2 === 0
    ? (sortedData[mid - 1] + sortedData[mid]) / 2
    : sortedData[mid];

  // Jangkauan data
  dataArray.max = Math.max(...dataArray);
  dataArray.min = Math.min(...dataArray);
  const Range = dataArray.max - dataArray.min;

  // Jangkauan Kuartil
  const Q1 = sortedData[Math.floor(sortedData.length / 4)];
  const Q2 = sortedData[Math.floor(sortedData.length / 2)];
  const Q3 = sortedData[Math.floor(sortedData.length * (3 / 4))];
  const JQ = Q3 - Q1;

  // Simpangan Rata-Rata
  const SimpanganRataRata = dataArray.reduce((a, b) => a + Math.abs(b - Mean), 0) / dataArray.length;

  // Simpangan Kuartil
  const SimpanganKuartil = (Q3 - Q1) / 2;

  // tampilkan
  const html = `
    <h3>Hasil Statistik Data</h3>
    <table>
      <tr><th>Mean</th><td>${Mean.toFixed(2)}</td></tr>
      <tr><th>Modus</th><td>${Modus}</td></tr>
      <tr><th>Median</th><td>${Median}</td></tr>
      <tr><th>Jangkauan Data</th><td>${Range}</td></tr>
      <tr><th>Jangkauan Kuartil</th><td>${JQ}</td></tr>
      <tr><th>Kuartil 1 (Q1)</th><td>${Q1}</td></tr>
      <tr><th>Kuartil 2 (Q2)</th><td>${Q2}</td></tr>
      <tr><th>Kuartil 3 (Q3)</th><td>${Q3}</td></tr>
      <tr><th>Simpangan Rata-Rata</th><td>${SimpanganRataRata.toFixed(2)}</td></tr>
      <tr><th>Simpangan Kuartil</th><td>${SimpanganKuartil.toFixed(2)}</td></tr>
    </table>
  `;

  hasilDiv.innerHTML = html;
}

//===================== Data Kelompok ======================
function hitungDataKelompok() {
  const data_input = document.getElementById("dataKelompokInput").value;
  const frekuensi_input = document.getElementById("frekuensiInput").value;
  const hasil_div = document.getElementById("hasil");

  const kelas = data_input.split(',').map(k => k.trim());
  const frek = frekuensi_input.split(',').map(f => parseInt(f.trim()));

  if (kelas.length !== frek.length || kelas.length === 0) {
    hasil_div.innerHTML = "<p style='color:red'>Input tidak valid!</p>";
    return;
  }

  // cari kelas modus
  const fm = Math.max(...frek);
  const idx = frek.indexOf(fm);

  const [tb, ta] = kelas[idx].split('-').map(Number);
  const L = tb - 0.5;
  const p = ta - tb + 1;

  const f1 = idx > 0 ? frek[idx - 1] : 0;
  const f2 = idx < frek.length - 1 ? frek[idx + 1] : 0;

  const d1 = fm - f1;
  const d2 = fm - f2;

  const modus = L + ((d1 / (d1 + d2)) * p);

  hasil_div.innerHTML = `
    <h3>Hasil Statistik Data Kelompok</h3>
    <table>
      <tr><th>Kelas Modus</th><td>${kelas[idx]}</td></tr>
      <tr><th>Modus</th><td>${modus.toFixed(2)}</td></tr>
    </table>
  `;
}