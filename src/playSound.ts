export function PlaySound(){
    var myAudio = new Audio(chrome.runtime.getURL("bip.mp3"));
    myAudio.play();
}