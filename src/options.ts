




// Saves options to chrome.storage
function save_options() {
    if(document == null) return;
    var alertaUrl = (document.getElementById('alertaUrl') as any).value;
    var generateNotifications = (document.getElementById('generateNotifications')as any).checked;
    var alertsNeedsAck = (document.getElementById('alertsNeedsAck')as any).checked;

    chrome.storage.sync.set({
      alertaUrl: alertaUrl,
      generateNotifications: generateNotifications,
      alertsNeedsAck: alertsNeedsAck
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('saveSucess')as any;
      status.style.display = "block";
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
    }, function(items) {
      (document.getElementById('alertaUrl')as any).value = items.alertaUrl;
      (document.getElementById('generateNotifications')as any).checked = items.generateNotifications;
      (document.getElementById('alertsNeedsAck')as any).checked = items.alertsNeedsAck;
    });
  }

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById("savePreference")!.addEventListener('click', save_options);