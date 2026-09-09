export type BootStep = { label: string; durationMs: number; memoryMb: number };

export type BootLane = {
  steps: BootStep[];
  totalDurationMs: number;
  totalMemoryMb: number;
};

export type ContainersVsVmsData = {
  vm: BootLane;
  container: BootLane;
};

// Real, itemized costs per step — the container lane isn't the VM lane with
// smaller numbers, it structurally skips the kernel-boot steps entirely
// because it shares the host kernel.
const VM_STEPS: BootStep[] = [
  { label: "BIOS / firmware POST", durationMs: 800, memoryMb: 0 },
  { label: "Bootloader (GRUB)", durationMs: 400, memoryMb: 0 },
  { label: "Guest OS kernel boot", durationMs: 3500, memoryMb: 180 },
  { label: "Init system + services", durationMs: 2200, memoryMb: 220 },
  { label: "Application start", durationMs: 600, memoryMb: 60 },
];

const CONTAINER_STEPS: BootStep[] = [
  { label: "Container runtime init (shares host kernel)", durationMs: 80, memoryMb: 10 },
  { label: "Application start", durationMs: 600, memoryMb: 60 },
];

function buildLane(steps: BootStep[]): BootLane {
  return {
    steps,
    totalDurationMs: steps.reduce((sum, s) => sum + s.durationMs, 0),
    totalMemoryMb: steps.reduce((sum, s) => sum + s.memoryMb, 0),
  };
}

export function generateContainersVsVmsData(): ContainersVsVmsData {
  return { vm: buildLane(VM_STEPS), container: buildLane(CONTAINER_STEPS) };
}
