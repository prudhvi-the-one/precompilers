export interface JitsiMeetExternalApiInstance {
  executeCommand: (command: string, ...args: unknown[]) => void;
  dispose: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiMeetExternalApiInstance;
  }
}
