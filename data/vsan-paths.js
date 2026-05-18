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
      "CRITICAL: On-Disk Format (ODF) upgrades are ONE-WAY and cannot be rolled back",
      "All hosts in the vSAN cluster must be at the same ESXi version before upgrading ODF",
      "Verify vSAN health is GREEN: vSAN Cluster > Monitor > vSAN > Health",
      "Ensure cluster has sufficient spare capacity for one host failure during rolling upgrade",
      "Check vSAN disk group status: esxcli vsan storage list",
      "Verify no active resync operations: esxcli vsan debug resync summary",
      "Confirm vSAN datastore free space > 30% for safe operation during upgrade"
    ],
    "6.7u3->7.0": [
      "ODF will upgrade from 10 to 12 - this enables new features but is irreversible",
      "Verify all disk groups are healthy: esxcli vsan debug disk list",
      "Check witness appliance version matches cluster version requirement",
      "Stretched cluster configurations require witness upgrade coordination"
    ],
    "7.0u3->8.0": [
      "ODF upgrade from 17 to 19 enables vSAN 8 ESA (Express Storage Architecture) option",
      "ESA migration is optional but requires all-NVMe storage configuration",
      "Validate HCL compatibility for vSAN 8.0 storage controllers and drives",
      "Review vSAN Max Configuration limits changes between 7.0 and 8.0"
    ]
  },
  postChecks: [
    "Verify On-Disk Format version: esxcli vsan debug object health summary get",
    "Run full vSAN health check from vSphere Client and resolve any warnings",
    "Monitor resync operations until complete: esxcli vsan debug resync summary",
    "Validate deduplication and compression ratios are consistent with pre-upgrade",
    "Check vSAN datastore capacity and ensure usable capacity is as expected",
    "Verify vSAN performance service is running and collecting metrics"
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
