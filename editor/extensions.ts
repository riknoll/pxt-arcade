/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts" />

import lf = pxt.Util.lf;

namespace pxt.editor {
    class AudioResourceImporter implements pxt.editor.IResourceImporter {
        public id: 'audio';
        canImport(data: File): boolean {
            return /^audio\//.test(data.type);
        }
        importAsync(project: IProjectView, data: File): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                // load sound file bytes
                const reader = new FileReader();
                reader.onload = (res) => {
                    // decode into AudioBuffer
                    const buf = reader.result as ArrayBuffer;
                    const audioContext = new AudioContext()
                    audioContext.decodeAudioData(buf)
                        .then((pcm: AudioBuffer) => {
                            // resample to 1khz
                            const offlineContext = new OfflineAudioContext( 1, 1024*40, 3000);
                            const source = offlineContext.createBufferSource();
                            source.buffer = pcm;
                            source.start();
                            return offlineContext.startRendering();
                        }).then((pcm1k: AudioBuffer) => {
                            // resample sound
                            const data = pcm1k.getChannelData(0);

                        }, err => reject(err))
                };
                reader.onerror = (e) => reject(e);
                reader.readAsArrayBuffer(data);
            })
        }
    }

    initExtensionsAsync = function (opts: pxt.editor.ExtensionOptions): Promise<pxt.editor.ExtensionResult> {
        pxt.debug('loading extensions...')
        const res: pxt.editor.ExtensionResult = {
            resourceImporters: [new AudioResourceImporter()]
        };
        return Promise.resolve(res);
    }
}