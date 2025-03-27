import { Stimulus } from './Stimulus';
import { Encoder } from './Encoder';

export default class StimSequence {
  name: string = 'Uninitialized StimSequence';
  readonly description: string = '';
  readonly stimuli: Stimulus[] = [];
  times: number[] = []; // Seconds into sequence
  private cachedDuration: number = -1;
  isEncoding: boolean = false;

  constructor(name?: string, description?: string, stimuli?: Stimulus[]) {
    this.name = name ?? this.name;
    this.description = description ?? this.description;
    this.stimuli = stimuli ?? this.stimuli;
  }

  // Calculate total duration AND populate times array in the same loop
  duration(): number {
    if (this.cachedDuration >= 0) {
      return this.cachedDuration;
    }
    this.times = new Array(this.stimuli.length);
    const total = this.stimuli
      .map((s) => s.duration)
      .reduce((accumulator, currentValue, currentIndex) => {
        this.times[currentIndex] = accumulator;
        return accumulator + currentValue;
      }, 0);
    this.cachedDuration = total;
    return total;
  }

  async saveToCacheAsync(width: number, height: number, fps: number) {
    /*
    for (let iStim = 0; iStim < this.stimuli.length; iStim++) {
      const stimulus = this.stimuli[iStim];
      await stimulus.saveToCacheAsync(width, height, fps);
    }
    */
    Promise.all(
      this.stimuli.map((stimulus) => stimulus.saveToCacheAsync(width, height, fps))
    );
  }

  async encodeAsync(
    width: number,
    height: number,
    fps: number,
    fileStream?: FileSystemWritableFileStream
  ): Promise<void> {
    this.isEncoding = true;
    try {
      const encoder = new Encoder(width, height, fps, fileStream);
      const duration = this.duration();
      console.log(`>>>>> Encoding ${this.stimuli.length} stimuli...`);
      const startTime = new Date().getTime();
      let encodedSecondsSoFar = 0;
      let elapsedMinutes = 0;
      for (let iStim = 0; iStim < this.stimuli.length; iStim++) {
        const stimulus = this.stimuli[iStim];
        stimulus.encode(encoder);
        encodedSecondsSoFar += stimulus.duration;
        const secondsRemainingToEncode = duration - encodedSecondsSoFar;
        if ((iStim && iStim % 200 === 0) || iStim >= this.stimuli.length) {
          // Periodically flush and log
          await encoder.videoEncoder.flush();
          const nowTime = new Date().getTime();
          elapsedMinutes = (nowTime - startTime) / (1000 * 60);
          const speed = Math.round(encodedSecondsSoFar / (elapsedMinutes * 60));
          const expectedMinutesToFinish = Math.round(
            secondsRemainingToEncode / (speed * 60)
          );
          console.log(
            `>>>>> iStim=${iStim} ` +
              `elapsed=${elapsedMinutes.toFixed(1)}mins speed=${speed}x ` +
              `will finish in ~${expectedMinutesToFinish}mins at ` +
              `~${new Date(nowTime + expectedMinutesToFinish * 60_000).toLocaleTimeString()}`
          );
        }
      }
      // All done
      await encoder.videoEncoder.flush();
      encoder.muxer.finalize();
      if (fileStream) {
        await fileStream.close();
      }
      console.log(
        `>>>>> Finished encoding ${this.stimuli.length} stimuli at ` +
          new Date().toLocaleTimeString() +
          ` after ${elapsedMinutes} minutes`
      );
    } catch (err) {
      throw new Error(`encodeAsync() ${err}`);
    } finally {
      this.isEncoding = false;
    }
  }
}
