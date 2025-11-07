
/*
Convertir audio de un mp3 a un wav
*/

import { PassThrough, Readable } from "stream";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const convertAudioToWav = async (audio: Buffer): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const inputStream = new Readable({
            read() {
                this.push(audio);
                this.push(null);
            }
        })

        const outputStream = new PassThrough();
        const chunks: Buffer[] = [];

        ffmpeg(inputStream)
        .inputFormat('mp3')
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .format('wav')
        .on('start', cmd => {
            console.log('Comando de ffmpeg:', cmd);
        })
        .on('error', err => {
            reject(new Error('Error al convertir el audio: ' + err.message));
        })
        .on('end', () => {
            resolve(Buffer.concat(chunks));
        })
        .pipe(outputStream);

        outputStream.on('data', chunk => chunks.push(chunk));
        outputStream.on('error', reject);
    });
}