export interface Preset {
  key: string;
  label: string;
  fun: string[];
  arg: any[][];
}

export const PRESETS: Preset[] = [
  {
    key: 'cmd_run',
    label: 'cmd.run — execute shell command',
    fun: ['cmd.run'],
    arg: [['echo "Hello from SystemLink Salt Runner"']],
  },
  {
    key: 'grains_items',
    label: 'grains.items — system info',
    fun: ['grains.items'],
    arg: [[]],
  },
  {
    key: 'test_ping',
    label: 'test.ping — connectivity test',
    fun: ['test.ping'],
    arg: [[]],
  },
  {
    key: 'pkg_list',
    label: 'pkg.list_pkgs — installed packages',
    fun: ['pkg.list_pkgs'],
    arg: [[]],
  },
  {
    key: 'service_list',
    label: 'service.get_all — running services',
    fun: ['service.get_all'],
    arg: [[]],
  },
  {
    key: 'disk_usage',
    label: 'disk.usage — disk usage',
    fun: ['disk.usage'],
    arg: [[]],
  },
  {
    key: 'status_all',
    label: 'status.all_status — system vitals',
    fun: ['status.all_status'],
    arg: [[]],
  },
  {
    key: 'set_network',
    label: 'nisysmgmt.set_network_address — set IP config',
    fun: ['nisysmgmt.set_network_address'],
    arg: [
      [
        'static',
        'eth0',
        '192.168.1.100',
        '255.255.255.0',
        '192.168.1.1',
        '8.8.8.8',
      ],
    ],
  },
  {
    key: 'minion_log',
    label: 'cmd.fetch_minion_log',
    fun: ['cmd.run'],
    arg: [
      [
        'type "C:\\ProgramData\\National Instruments\\salt\\var\\log\\salt\\minion" 2>nul || cat /var/log/salt/minion',
      ],
    ],
  },
];

export function getDefaultJobJson(): string {
  return JSON.stringify(
    {
      fun: ['cmd.run'],
      arg: [['echo "Hello from Salt Job Runner"']],
      timeout: 120,
      metadata: {},
    },
    null,
    2,
  );
}
