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
      "<strong>ODF Irreversibility Warning:</strong> On-Disk Format (ODF) upgrades are ONE-WAY and CANNOT be rolled back. Before proceeding: confirm full backup exists, confirm all stakeholders approve, document current ODF version: esxcli vsan debug object health summary get. If upgrade fails mid-way: engage VMware support immediately",
      "<strong>ESXi Version Parity:</strong> ALL ESXi hosts in the vSAN cluster MUST be at the same ESXi version before upgrading ODF. Verify: Get-VMHost -Cluster <name> | Select Name,Version,Build (PowerCLI). If any host is at older version: upgrade it first. Mixed-version clusters cannot safely upgrade ODF",
      "<strong>vSAN Health Status:</strong> vCenter > Cluster > Monitor > vSAN > Health. EVERY category must be GREEN. Red items = stop and fix. Yellow items = assess risk. Common blockers: network partition, disk errors, object compliance failures. Run: esxcli vsan health cluster list for CLI equivalent",
      "<strong>Spare Capacity (N+1):</strong> Cluster must have capacity to evacuate one full host. Check: Cluster > Monitor > vSAN > Capacity > Used vs. Total. Formula: (Total - Used) must exceed largest host's contribution. If tight: add capacity or decommission VMs before maintenance window",
      "<strong>Disk Group Status:</strong> On EVERY host run: esxcli vsan storage list. All disks must show 'In Use: true' and no 'Absent' or 'Degraded' state. If any disk absent: identify failed drive, replace, and wait for full resync before proceeding with upgrade",
      "<strong>Resync Operations:</strong> esxcli vsan debug resync summary. Output must show 0 objects resyncing, 0 bytes remaining. If resync in progress: WAIT for completion. Starting upgrade during resync = data loss risk. Monitor with: watch -n 10 'esxcli vsan debug resync summary'",
      "<strong>Free Space Threshold:</strong> Cluster > Monitor > vSAN > Capacity. Free space must be > 30% of total. During rolling upgrade, objects are rebuilt temporarily consuming extra space. If below 30%: add disks, delete snapshots, or thin unused VMs before upgrade",
      "<strong>vSAN Network Health:</strong> esxcli vsan network list — verify correct vmkernel adapter (vmk typically on dedicated VLAN). Check MTU: esxcli network ip interface list — vSAN vmk should be 9000 MTU if jumbo frames used. Verify multicast connectivity (vSAN 6.x) or unicast (7.0+)",
      "<strong>Network Latency:</strong> esxcli vsan debug vmknic check — tests latency between all vSAN hosts. Latency must be < 1ms for standard clusters, < 5ms for stretched clusters (between sites). If high: investigate network hops, congestion, or misconfigured QoS between vSAN nodes",
      "<strong>Storage Policy Documentation:</strong> PowerCLI: Get-SpbmStoragePolicy | Get-SpbmEntityConfiguration. Document which VMs use which policies (FTT=1, FTT=2, RAID-5/6, etc.). After ODF upgrade: verify policies still evaluate as compliant. Export to CSV for reference",
      "<strong>Witness Appliance:</strong> For stretched/2-node clusters: check witness version in vCenter > Host > Summary. Witness must be at same or higher version as cluster hosts. Upgrade witness FIRST before cluster hosts. SSH to witness: esxcli system version get to verify",
      "<strong>Decommissioned Disks:</strong> esxcli vsan storage list | grep -A5 'Is SSD'. Look for any disk groups marked 'Decommissioned' or disks not contributing capacity. Clean up decommissioned groups: remove from cluster, replace hardware if needed. Stale disk groups can block ODF upgrade"
    ],
    "6.7u3->7.0": [
      "<strong>ODF 10→12 Impact:</strong> Upgrading ODF from v10 to v12 enables: native file services, improved dedup/compression engine, enhanced data locality. This is IRREVERSIBLE. Verify: current ODF version via esxcli vsan debug object health summary get. Plan: upgrade all hosts to ESXi 7.0 first, then trigger ODF upgrade from vCenter",
      "<strong>Disk Group Health Audit:</strong> On every host: esxcli vsan debug disk list. Check for: I/O errors, congestion values > 0, latency spikes. Also: esxcli vsan storage list — every disk must show 'In Use' status. Any disk with errors = replace BEFORE upgrade to prevent data loss during rolling operation",
      "<strong>Witness Upgrade Order:</strong> For 2-node or stretched clusters: upgrade witness appliance FIRST. Deploy new witness OVA matching ESXi 7.0 version, or upgrade existing witness in-place. Verify: SSH to witness > esxcli system version get. Witness must be ≥ cluster host version",
      "<strong>Stretched Cluster Sequence:</strong> Upgrade order is critical: 1) Witness appliance, 2) Preferred fault domain (site A), 3) Secondary fault domain (site B). Never upgrade both sites simultaneously. Monitor: Cluster > Configure > vSAN > Fault Domains after each step",
      "<strong>Storage Policy Compatibility:</strong> After ODF 12: new policy capabilities available (e.g., file services). Existing policies continue working. But verify: Get-SpbmStoragePolicy — check all policies resolve correctly against new ODF. If any show 'Out of date': reconfigure",
      "<strong>KMS Connectivity (Encryption):</strong> If vSAN encryption enabled: vSAN > Configure > Encryption. Verify KMS cluster shows 'Connected'. Test key retrieval: rotate a test key. If KMS unreachable: DO NOT upgrade — encrypted disks will become inaccessible if keys can't be fetched during resync"
    ],
    "7.0u3->8.0": [
      "<strong>ODF 17→19 & ESA Option:</strong> ODF upgrade to v19 enables vSAN 8 Express Storage Architecture (ESA) as an OPTIONAL migration. ESA is not automatic — requires explicit pool creation. Original Storage Architecture (OSA) continues working. Understand: ESA = flat storage pool (no cache/capacity tiers), OSA = traditional disk groups",
      "<strong>ESA Prerequisites:</strong> ESA requires: ALL NVMe storage (no SAS, no SATA, no HDD). Check: esxcli storage core device list — verify 'Transport' shows NVMe for all claimed disks. If ANY disk is SAS/SATA: ESA is not available for that cluster. Hybrid clusters = stay on OSA",
      "<strong>HCL Validation (vSAN 8.0):</strong> Check VMware vSAN HCL: https://www.vmware.com/resources/compatibility/search.php?deviceCategory=vsan. Search by controller model AND drive model. Both must be certified for vSAN 8.0. Uncertified storage = potential data loss or performance issues",
      "<strong>Max Configuration Limits:</strong> Review changes: vSAN 7.0 max 32 hosts/cluster → vSAN 8.0 max 32 (OSA) or 24 (ESA in initial release). Max components per host changes. Review VMware Configuration Maximums doc for your target version. Plan capacity accordingly",
      "<strong>ESA Migration Planning:</strong> If planning ESA: requires FULL data evacuation from all OSA disk groups. This means: all VM data must be moved off vSAN, disk groups destroyed, ESA pools created, data moved back. Plan: 4-8 hour maintenance window minimum depending on data volume. Alternative: fresh cluster",
      "<strong>vSAN Health Plugin:</strong> In vCenter: Administration > Client Plug-Ins. Verify vSAN health plugin version matches or exceeds vCenter version. Outdated plugin = stale health data. Update plugin before running final health check. Navigate: Cluster > Monitor > vSAN > Health",
      "<strong>Custom vSAN Settings:</strong> esxcli system settings advanced list -o /VSAN/ | grep -v 'Default Value'. Any non-default settings may not carry over or may behave differently in vSAN 8.0. Document all custom tuning. Common: VSAN.ClomRepairDelay, VSAN.DedupScope, VSAN.ObjectScrubsPerYear"
    ]
  },
  postChecks: [
    "<strong>ODF Version Confirmation:</strong> esxcli vsan debug object health summary get — verify 'On-disk format version' matches target (e.g., v19 for vSAN 8.0). In vCenter: Cluster > Configure > vSAN > General > On-Disk Format. If version mismatch: ODF upgrade may not have been triggered yet — initiate manually from vCenter",
    "<strong>Full Health Check:</strong> vCenter > Cluster > Monitor > vSAN > Health. Click 'Retest' to force fresh evaluation. ALL categories must return GREEN: Network, Data, Limits, Physical Disks, Hardware Compatibility. Any red/yellow: investigate immediately — do NOT proceed to next host until resolved",
    "<strong>Resync Completion:</strong> esxcli vsan debug resync summary. Must show: 0 objects resyncing, 0 bytes to resync. If resync still active: WAIT. Do NOT evacuate next host until resync = 0. Monitor: run command every 60 seconds. Typical resync: 100GB takes 10-30 min depending on network speed",
    "<strong>Dedup/Compression Ratios:</strong> Cluster > Monitor > vSAN > Capacity > Deduplication and Compression. Compare savings ratio with pre-upgrade documented value. If ratio dropped significantly: may indicate changed data patterns or dedup engine recalculation in progress. Allow 24-48 hours to stabilize",
    "<strong>Capacity Validation:</strong> Cluster > Monitor > vSAN > Capacity. Verify: Used capacity matches pre-upgrade (no data loss), Free space is adequate (>25%), No unexpected capacity consumption. Compare total usable vs. pre-upgrade screenshot. If capacity reduced: check for failed disks or orphaned objects",
    "<strong>Performance Service:</strong> Cluster > Monitor > vSAN > Performance > Health. Verify performance service shows 'Enabled' and is collecting metrics. If no data: restart service via Cluster > Configure > vSAN > Performance Service > Turn Off/Turn On. Wait 5 minutes for initial data collection",
    "<strong>Storage Policy Compliance:</strong> PowerCLI: Get-SpbmEntityConfiguration -StoragePolicy * | Where {$_.ComplianceStatus -ne 'compliant'}. Should return empty (all compliant). If non-compliant VMs found: check if policy references ODF features not yet available, or if objects are still resyncing",
    "<strong>VM Provisioning Test:</strong> Deploy a small test VM (1 vCPU, 1GB RAM, 10GB disk) on vSAN datastore. Power on, write test data: dd if=/dev/urandom of=/tmp/test bs=1M count=100 (inside guest). Verify no errors. Delete test VM. This confirms full I/O path works end-to-end post-upgrade",
    "<strong>iSCSI Target Service:</strong> If using vSAN iSCSI targets: Cluster > Configure > vSAN > iSCSI Target. Verify targets show 'Online'. Test iSCSI connectivity from initiator: iscsiadm -m discovery -t st -p <vsan-iscsi-ip>. If targets offline: restart service or check network connectivity",
    "<strong>Stretched Cluster Witness:</strong> For stretched/2-node: Cluster > Configure > vSAN > Fault Domains & Stretched Cluster. Verify witness host shows 'Connected' and correct fault domain assignment. SSH to witness: esxcli vsan cluster get — should show membership in cluster. If disconnected: check network path to witness",
    "<strong>Disk Group ODF Consistency:</strong> On EVERY host: esxcli vsan storage list. Verify each disk group shows matching ODF version. All disk groups across cluster must be at same ODF version. If any lag behind: trigger ODF upgrade again from vCenter > Cluster > Configure > vSAN > Disk Management"
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
