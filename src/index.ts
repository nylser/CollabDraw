import { registerPlugin } from '@capacitor/core';

import type { BBBMeetingPlugin } from './definitions';

const BBBMeeting = registerPlugin<BBBMeetingPlugin>('BBBMeeting', {
  web: () => import('./web').then(m => new m.BBBMeetingWeb()),
});

export * from './definitions';
export { BBBMeeting };
