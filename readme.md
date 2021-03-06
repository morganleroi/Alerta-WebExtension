# WebExtension for Alerta

#  End-User documentation

## Why an extension ?

[Alerta](https://alerta.io/) is an awesome API and UI tool to receive Alerts from all your monitoring systems (ie: your alerts producers). For support teams, the Alerta UI is perfect because they always have a browser opened on it or they are using the "Notification Sound" of Alerta UI.

But when a Developper want to handle production support (or keep an eye on it), they will need, in my opinion, an additionnal tools to "notify" them when something new happens in Alerta. That's why I created this WebExtension.

## Quick tour

- Quick view on your browser to see how many Alerts you have (According to your user preferences and filters)

![image](https://user-images.githubusercontent.com/2246570/169973147-8bb613a3-4c11-4877-81f8-fe677f25d60b.png)

- Stay focus on your work while keeping an eye on the production. You will receive notifications when something new happens in Alerta. Browser needs to be open but can be minimized.

<img src="https://user-images.githubusercontent.com/2246570/169975358-491dbdf4-c5ef-4a2f-9745-60b895fa0dd7.png" width="500" >

- Ack or Open Alert directly from the notification. (Beware, on each system, notification can look like different - Here, it's MacOS)

<img src="https://user-images.githubusercontent.com/2246570/169975733-474941d9-29da-4006-88fb-d81990b15b0c.png" width="500" >

- Only triggers notifications when something happens according to your filters

<img src="https://user-images.githubusercontent.com/2246570/169991077-05178517-d0c1-4bb2-9efa-93e0d58da3b3.png" width="900" >


## Installation

### Chromium (Chrome, Brave, Opera, Edge)
- Extension is available [in the Chrome Store](https://chrome.google.com/webstore/detail/alerta-notifier/kekdcgmihkkkemaanieognhnjgaeelml)
- Extension will be available in few days in Firefox Store.


After installing the extension, you'll have to setup some fields.
- Go to the extension option page
- Enter your Alerta host URL
- Click on Allow to allow the extension to fetch alerts in Alerta API.
- Enter your Alerta Auth Key.
- Select one on more filters
- Save and wait 1 min

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
