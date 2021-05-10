# Chromium Extension for Alerta tool

#  End-User documentation

## Why an extension ?

Alerta is an awesome API and UI tool to receive Alerts from all your monitoring systems (ie: your alerts producers). For support teams, the Alerta UI is perfect because they always have a browser opened on it or they are using the "Notification Sound" of Alerta UI.

But when a Developper team want to handle production support, they will need, in my opinion, an additionnal tools to "notify" them when something new happens in Alerta. That's why I created this Chromium Extension.

## Extension feature
This extension adds the following feature:
- Have a quick icon on your browser to see how many Alerts you have.
- Receive notifications when something new happens. Chromium needs to be open (Google Chrome, Brave, Microsoft Edge, ...) but can be minimized.
- Ack or Open Alert directly from the notification.

## Installation
After installing the extension, you'll have to setup some fields.
- Go to the extension option page
- Enter your Alerta host URL
- Enter your Alerta Auth Key.

## Configuration
Several options are available to customize the extension and to meet your needs :
- Avoid all notifications (You will just have the icon in the browser).
- Force Notifications to be shown (Interesting for Production support Team or everyone else that do no want to miss anything new).

# Developper documentation

## Getting started

To build the extension, and rebuild it when the files are changed, run

```
$ npm start
```

After the project has been built, a directory named `dist` has been created. You have to add this directory to your Chrome browser:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.
