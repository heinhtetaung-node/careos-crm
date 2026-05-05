import { mediaConstraints } from '../config';

export default class MediaController {
  stream: MediaStream | null = null;

  async requestInputMedia() {
    this.stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    return this.stream;
  }

  closeInputMedia() {
    this.stream?.getTracks().forEach((track) => track.stop());
  }
}
