export function playSound() {
  const myAudio = new Audio(chrome.runtime.getURL('bip.mp3'));
  myAudio.play();
}
