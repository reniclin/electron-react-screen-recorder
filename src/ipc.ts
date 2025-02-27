
import { app, desktopCapturer, session, Menu, ipcMain, dialog } from 'electron';
import { writeFile } from 'fs';

app.whenReady().then(() => {
  // IPC save-video-buffer
  ipcMain.handle('save-video-buffer', async (event: Electron.IpcMainEvent, arrayBuffer: ArrayBuffer) => {
    const buffer = Buffer.from(arrayBuffer);

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Video',
      defaultPath: `Video-${Date.now()}.mp4`
    });

    if (filePath) {
      writeFile(filePath, buffer, (error) => {
        if (error) {
          console.error(`[save-video-buffer] Failed to save ${filePath}`, error);
        } else {
          console.log(`[save-video-buffer] Video ${filePath} saved`);
        }
      });
    } else {
      console.log(`[save-video-buffer] filePath is empty.`);
    }
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
            selectSource = source;
          },
        }))
      );

      videoOptionsMenu.on('menu-will-close', () => {
        setTimeout(() => {
          callback({ video: selectSource, audio: 'loopback' });
        }, 100);
      });

      videoOptionsMenu.popup();
    });
  });
});
