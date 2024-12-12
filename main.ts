import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL('http://localhost:3000'); // Cambia esto si usas Next.js

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
