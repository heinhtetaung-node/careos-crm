export default class CallMonitor {
  subscription: ReturnType<typeof setInterval>;

  constructor(rtc: RTCPeerConnection) {
    this.subscription = setInterval(async () => {
      const stats = await rtc.getStats();
      this.reportStatistics(stats);
      if (rtc.iceConnectionState === 'closed') {
        this.end();
      }
    }, 1000);
  }

  end() {
    clearInterval(this.subscription);
  }

  // eslint-disable-next-line class-methods-use-this
  reportStatistics(stats: RTCStatsReport) {
    stats.forEach((report) => {
      if (
        report.type === 'outbound-rtp' ||
        report.type === 'inbound-rtp' ||
        report.type === 'media-playout' ||
        report.type === 'media-source'
      ) {
        const { type: name, ...rest } = report;
        const event = newrelic.interaction();
        event.setName(name);
        this.addAttributes(rest, event);
        event.save();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addAttributes(stats: Record<string, number>, interaction: any) {
    Object.keys(stats).forEach((key) => {
      interaction.setAttribute(key, stats[key]);
    });
    return interaction;
  }
}
