import { CMUDCore, CMUDReplacer } from './cmud.js';

const dictionary = {
  replace: "action",
  change: "action",
  ganti: "action",
  ubah: "action",
  into: "connector",
  to: "connector",
  ke: "connector",
  jadi: "connector",
  menjadi: "connector",
  line: "modifier"
};

const pseudoWords = ["at", "please", "dong", "coba"];

const core = new CMUDCore({
  dictionary,
  pseudoWords,
  splitters: ["dan", "and"]
});

const cmud = new CMUDReplacer(core);

const editor = document.getElementById("editor");
const commandInput = document.getElementById("command");
const modal = document.getElementById("modal");
const btnHelp = document.getElementById("btn-help");
const btnSend = document.getElementById("btn-send");
const btnCloseModal = document.getElementById("btn-close-modal");

function runCommand() {
  const cmd = commandInput.value;
  if (cmd.trim()) {
    editor.value = cmud.run(cmd, editor.value);
    commandInput.value = "";
  }
}

function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

btnHelp.addEventListener("click", openModal);
btnSend.addEventListener("click", runCommand);
btnCloseModal.addEventListener("click", closeModal);

commandInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    runCommand();
  }
});
