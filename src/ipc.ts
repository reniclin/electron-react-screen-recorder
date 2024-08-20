
import { app, BrowserWindow, desktopCapturer, session, Menu, ipcMain, dialog } from 'electron';
import { writeFile } from 'fs';

app.whenReady().then(() => {
  // IPC save-video-buffer
  ipcMain.handle('save-video-buffer', async (event: Electron.IpcMainEvent, arrayBuffer: ArrayBuffer) => {
    const buffer = Buffer.from(arrayBuffer);

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Video',
      defaultPath: `vid-${Date.now()}.webm`
    });

    console.log('filePath ', filePath);

    if (filePath) {
      writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }
  });

  ipcMain.handle('get-video-sources', async () => await desktopCapturer.getSources({ types: ['screen'] }));

  // IPC set-title
  ipcMain.handle('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  });

  // setDisplayMediaRequestHandler
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    // for use navigator.mediaDevices.getDisplayMedia in render process
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => {
      let selectSource = sources[0];

      const videoOptionsMenu = Menu.buildFromTemplate(
        sources.map(source => ({
          label: source.name,
          click: () => {
            console.log('OptionsMenu click', source)
            selectSource = source;
          },
        }))
      );

      videoOptionsMenu.on('menu-will-close', () => {
        console.log('menu-will-close');
        setTimeout(() => {
          console.log(`callback({ video: ${selectSource}, audio: 'loopback' })`);
          callback({ video: selectSource, audio: 'loopback' });
        }, 100);
      });

      videoOptionsMenu.popup();
    });
  });
});
