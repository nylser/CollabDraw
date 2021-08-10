export interface BBBMeetingPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
