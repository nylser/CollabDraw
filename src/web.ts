import { WebPlugin } from '@capacitor/core';

import type { BBBMeetingPlugin } from './definitions';

export class BBBMeetingWeb extends WebPlugin implements BBBMeetingPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
