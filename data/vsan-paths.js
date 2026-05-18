const VSAN_DATA = {
  product: "vSAN",
  icon: "&#128190;",
  color: "#d29922",
  versions: [
    { id: "6.5", label: "vSAN 6.5", odf: 5, eol: true, release: "2016-11" },
    { id: "6.6", label: "vSAN 6.6", odf: 6, eol: true, release: "2017-04" },
    { id: "6.6.1", label: "vSAN 6.6.1", odf: 7, eol: true, release: "2017-07" },
    { id: "6.7", label: "vSAN 6.7", odf: 7, eol: true, release: "2018-04" },
    { id: "6.7u1", label: "vSAN 6.7 U1", odf: 8, eol: true, release: "2018-10" },
    { id: "6.7u3", label: "vSAN 6.7 U3", odf: 10, eol: true, release: "2019-08" },
    { id: "7.0", label: "vSAN 7.0", odf: 12, eol: false, release: "2020-04" },
    { id: "7.0u1", label: "vSAN 7.0 U1", odf: 13, eol: false, release: "2020-10" },
    { id: "7.0u2", label: "vSAN 7.0 U2", odf: 15, eol: false, release: "2021-03" },
    { id: "7.0u3", label: "vSAN 7.0 U3", odf: 17, eol: false, release: "2021-10" },
    { id: "8.0", label: "vSAN 8.0", odf: 19, eol: false, release: "2022-10" },
    { id: "8.0u1", label: "vSAN 8.0 U1", odf: 20, eol: false, release: "2023-04" },
    { id: "8.0u2", label: "vSAN 8.0 U2", odf: 21, eol: false, release: "2023-09" },
    { id: "8.0u3", label: "vSAN 8.0 U3", odf: 21, eol: false, release: "2024-06" }
  ],
  paths: {
    "6.5": ["6.6"],
    "6.6": ["6.6.1"],
    "6.6.1": ["6.7"],
    "6.7": ["6.7u1"],
    "6.7u1": ["6.7u3"],
    "6.7u3": ["7.0"],
    "7.0": ["7.0u1", "7.0u2", "7.0u3"],
    "7.0u1": ["7.0u2", "7.0u3"],
    "7.0u2": ["7.0u3", "8.0"],
    "7.0u3": ["8.0", "8.0u1", "8.0u2", "8.0u3"],
    "8.0": ["8.0u1", "8.0u2", "8.0u3"],
    "8.0u1": ["8.0u2", "8.0u3"],
    "8.0u2": ["8.0u3"],
    "8.0u3": []
  },
  preChecks: {
    _default: [
      "CRITICAL: On-Disk Format (ODF) upgrades are ONE-WAY and CANNOT be rolled back — plan carefully",
      "All ESXi hosts in the vSAN cluster MUST be at the same ESXi version before upgrading ODF",
      "Verify vSAN health is GREEN: vSAN Cluster > Monitor > vSAN > Health — resolve ALL red/yellow items first",
      "Ensure cluster has N+1 spare capacity — at least one host worth of capacity for maintenance mode evacuation",
      "Check vSAN disk group status on every host: esxcli vsan storage list — all disks must show 'In Use'",
      "Verify zero active resync operations: esxcli vsan debug resync summary — wait for 0 objects resyncing",
      "Confirm vSAN datastore free space > 30%: Cluster > Monitor > vSAN > Capacity — needed for rebuild headroom",
      "Verify vSAN network health: esxcli vsan network list — ensure vmkernel adapter is on correct VLAN with multicast/unicast",
      "Test vSAN network latency between hosts: esxcli vsan debug vmknic check — latency must be < 1ms",
      "Document current storage policy assignments: Get-SpbmStoragePolicy | Get-SpbmEntityConfiguration (PowerCLI)",
      "Verify witness appliance version matches cluster version (for stretched/2-node clusters)",
      "Check for decommissioned or absent disk groups: esxcli vsan storage list | grep -i 'Is SSD'"
    ],
    "6.7u3->7.0": [
      "ODF will upgrade from 10 to 12 — enables native file services and improved dedup/compression, but is IRREVERSIBLE",
      "Verify all disk groups are healthy on every host: esxcli vsan debug disk list — no errors or absent disks",
      "Check witness appliance version matches cluster version — upgrade witness FIRST if using 2-node or stretched cluster",
      "Stretched cluster configurations require witness upgrade coordination — upgrade witness, then preferred site, then secondary",
      "Verify all vSAN storage policies are compatible with new ODF features",
      "If using encryption, verify KMS connectivity and key availability: vSAN > Configure > vSAN > Encryption"
    ],
    "7.0u3->8.0": [
      "ODF upgrade from 17 to 19 enables vSAN 8 ESA (Express Storage Architecture) option — but ESA migration is OPTIONAL",
      "ESA requires all-NVMe storage configuration — hybrid or mixed SSD/HDD disk groups cannot use ESA",
      "Validate HCL compatibility for vSAN 8.0 storage controllers and drives: check VMware vSAN HCL portal",
      "Review vSAN Max Configuration limits changes between 7.0 and 8.0 (max hosts per cluster, max components, etc.)",
      "If planning ESA migration: requires full data evacuation from OSA disk groups — plan extended maintenance window",
      "Verify vSAN health plugin is updated in vCenter before running health checks",
      "Check cluster advanced settings for any custom vSAN tuning that may not carry over: esxcli system settings advanced list -o /VSAN/"
    ]
  },
  postChecks: [
    "Verify On-Disk Format version matches target: esxcli vsan debug object health summary get",
    "Run full vSAN health check from vSphere Client: Cluster > Monitor > vSAN > Health — all checks must be GREEN",
    "Monitor resync operations until 100% complete: esxcli vsan debug resync summary — do NOT start next host until done",
    "Validate deduplication and compression ratios are consistent with pre-upgrade values: Cluster > Monitor > vSAN > Capacity",
    "Check vSAN datastore capacity and ensure usable capacity matches expectations post-ODF upgrade",
    "Verify vSAN performance service is running and collecting metrics: Cluster > Monitor > vSAN > Performance",
    "Validate storage policies are still applied correctly: Get-SpbmEntityConfiguration -StoragePolicy * (PowerCLI)",
    "Test VM provisioning: deploy a test VM on vSAN datastore and verify it powers on and writes data successfully",
    "Verify vSAN iSCSI target service if in use: Cluster > Configure > vSAN > iSCSI Target",
    "Check vSAN stretched cluster witness connectivity if applicable: esxcli vsan cluster get",
    "Verify all disk groups show healthy with correct ODF version: esxcli vsan storage list"
  ],
  notes: {
    odf_warning: "On-Disk Format upgrades are ONE-WAY. Once upgraded, you cannot downgrade the ODF version. Ensure all hosts are upgraded first and a full backup exists before initiating ODF upgrade.",
    esa_note: "vSAN 8.0 Express Storage Architecture (ESA) is a new storage architecture that requires all-NVMe and is not compatible with hybrid or mixed disk groups. Migration from OSA to ESA requires data evacuation.",
    rolling: "vSAN upgrades are performed as a rolling upgrade. Each host enters maintenance mode, is upgraded, then exits. VMs remain running on other hosts. Ensure N+1 capacity."
  },
  knownIssues: {
    "7.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsan-kb/phase1.html#kb-9' target='_blank'>KB #9 — On-Disk Format Upgrade</a>: ODF upgrade pre-check may fail if stale objects exist. Run repair before upgrading.",
    "8.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsan-kb/phase1.html#kb-10' target='_blank'>KB #10 — Maintenance Mode Stuck</a>: Hosts may hang entering maintenance mode if resync backlog is high. Ensure full data evacuation can complete.",
    "8.0u2": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsan-kb/phase2.html#kb-11' target='_blank'>KB #11 — ESA Storage Pool</a>: ESA pool creation may fail on mixed-generation NVMe drives. Validate HCL before migration."
  },
  estimatedDowntime: {
    _default: "Zero VM downtime (rolling upgrade)",
    odf_upgrade: "5-10 min (metadata operation)",
    esa_migration: "Hours (full data evacuation required)"
  }
};
