import browser from 'webextension-polyfill';

export function playSound() {
  const myAudio = new Audio(browser.runtime.getURL('bip.mp3'));
  myAudio.play();
}
