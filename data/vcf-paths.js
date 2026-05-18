const VCF_DATA = {
  product: "VCF / SDDC Manager",
  icon: "&#9729;&#65039;",
  color: "#f97316",
  versions: [
    { id: "4.0", label: "VCF 4.0", eol: true, release: "2020-04" },
    { id: "4.1", label: "VCF 4.1", eol: true, release: "2020-10" },
    { id: "4.2", label: "VCF 4.2", eol: true, release: "2021-03" },
    { id: "4.2.1", label: "VCF 4.2.1", eol: true, release: "2021-05" },
    { id: "4.3", label: "VCF 4.3", eol: true, release: "2021-07" },
    { id: "4.3.1", label: "VCF 4.3.1", eol: true, release: "2021-10" },
    { id: "4.4", label: "VCF 4.4", eol: true, release: "2022-02" },
    { id: "4.4.1", label: "VCF 4.4.1", eol: true, release: "2022-05" },
    { id: "4.5", label: "VCF 4.5", eol: false, release: "2022-08" },
    { id: "4.5.1", label: "VCF 4.5.1", eol: false, release: "2022-12" },
    { id: "4.5.2", label: "VCF 4.5.2", eol: false, release: "2023-06" },
    { id: "5.0", label: "VCF 5.0", eol: false, release: "2023-09" },
    { id: "5.1", label: "VCF 5.1", eol: false, release: "2024-03" },
    { id: "5.1.1", label: "VCF 5.1.1", eol: false, release: "2024-06" },
    { id: "5.2", label: "VCF 5.2", eol: false, release: "2024-10" },
    { id: "5.2.1", label: "VCF 5.2.1", eol: false, release: "2025-01" },
    { id: "9.0", label: "VCF 9.0", eol: false, release: "2025-05" }
  ],
  paths: {
    "4.0": ["4.1"],
    "4.1": ["4.2"],
    "4.2": ["4.2.1"],
    "4.2.1": ["4.3"],
    "4.3": ["4.3.1"],
    "4.3.1": ["4.4"],
    "4.4": ["4.4.1"],
    "4.4.1": ["4.5"],
    "4.5": ["4.5.1", "5.0"],
    "4.5.1": ["4.5.2", "5.0"],
    "4.5.2": ["5.0", "5.1"],
    "5.0": ["5.1", "5.1.1"],
    "5.1": ["5.1.1", "5.2"],
    "5.1.1": ["5.2", "5.2.1"],
    "5.2": ["5.2.1", "9.0"],
    "5.2.1": ["9.0"],
    "9.0": []
  },
  preChecks: {
    _default: [
      "CRITICAL: VCF upgrades MUST be orchestrated through SDDC Manager — do NOT upgrade components (vCenter, NSX, ESXi) individually",
      "Run SDDC Manager pre-check: Lifecycle Management > Pre-check — resolve ALL blocking items before proceeding",
      "Take a full file-level backup of SDDC Manager appliance via SFTP: Administration > Backup",
      "Snapshot ALL management domain VMs: SDDC Manager, vCenter, NSX Manager (x3), Edge Nodes — label 'pre-upgrade'",
      "Verify all component passwords are valid and not expired: SDDC Manager > Security > Password Management",
      "Ensure SDDC Manager can access upgrade bundle depot: test connectivity to depot.vmware.com or local offline depot",
      "Verify NTP synchronization across all management components: SDDC Manager, vCenter, NSX, ESXi hosts — drift < 2 seconds",
      "Check SDDC Manager logs for errors: ssh vcf@sddc-mgr 'grep ERROR /var/log/vmware/vcf/lcm/*.log | tail -20'",
      "Verify SDDC Manager disk space: df -h — need at least 100GB free for download and staging of upgrade bundles",
      "Validate all workload domain health: SDDC Manager > Inventory > Workload Domains — all must show 'Active'",
      "Export current configuration: SDDC Manager > Developer Center > API Explorer > GET /v1/system (document current state)",
      "Verify DNS resolution for all management components from SDDC Manager: nslookup <vcenter-fqdn>, <nsx-fqdn>"
    ],
    "4.5->5.0": [
      "VCF 5.0 introduces vSAN ESA support — review storage architecture requirements if planning ESA migration",
      "NSX will be upgraded from 3.2.x to 4.1.x as part of the VCF BOM — review NSX 4.x breaking changes (Policy-only mode)",
      "Verify ALL ESXi hosts meet ESXi 8.0 U1 hardware requirements: 32GB boot device, supported NICs and storage controllers",
      "Review VCF 5.0 BOM for locked component versions: vCenter 8.0 U1, ESXi 8.0 U1, NSX 4.1.0, vSAN 8.0 U1",
      "Ensure all workload domain VMs have current VMware Tools installed — old Tools may cause compatibility warnings",
      "Verify vRealize/Aria Suite integration compatibility if deployed: Aria Operations, Aria Automation, Aria Log Insight",
      "MP-to-Policy promotion for NSX must be complete before VCF 5.0 upgrade — SDDC Manager will enforce this"
    ],
    "5.2->9.0": [
      "VCF 9.0 is a MAJOR version change (Broadcom era) — requires extensive planning and testing in lab first",
      "Review Broadcom licensing changes applicable to VCF 9.0 — VCF licensing model may differ from VMware era",
      "Validate ALL third-party integrations for VCF 9.0 compatibility: backup (Veeam, Commvault), monitoring, security",
      "Ensure SDDC Manager has minimum 100GB free disk space for VCF 9.0 upgrade bundles (bundles are larger)",
      "Review VCF 9.0 BOM: vCenter 8.0 U3c, ESXi 8.0 U3c, NSX 4.2.1, vSAN 8.0 U3 — verify HCL for all components",
      "Plan for extended maintenance window — VCF 9.0 upgrade includes firmware compliance checks that may require reboots",
      "Verify Aria Suite (if deployed) compatibility with VCF 9.0 — separate upgrade path may be required"
    ]
  },
  postChecks: [
    "Verify SDDC Manager dashboard shows all components GREEN/Healthy: Inventory > Workload Domains",
    "Run SDDC Manager full validation: Administration > Inventory > Validate All — wait for completion",
    "Confirm all workload domains show 'Compliant' status in Lifecycle Management: LCM > Current Version matches target",
    "Verify BOM component versions match expected target: SDDC Manager > Inventory > select domain > Components tab",
    "Test NSX connectivity across all transport zones in each domain: verify VM-to-VM and VM-to-external traffic",
    "Validate vSAN health for ALL clusters across all workload domains: Cluster > Monitor > vSAN > Health",
    "Confirm backup jobs are running successfully post-upgrade: SDDC Manager backup + vCenter VAMI backup",
    "Verify SDDC Manager API accessibility: curl -k https://sddc-mgr/v1/system/health — should return 'HEALTHY'",
    "Test workload domain expansion: verify ability to add hosts to existing clusters (dry-run validation)",
    "Verify credential rotation works: Security > Password Management > Rotate for a non-critical component",
    "Check SDDC Manager upgrade history: Lifecycle Management > Upgrade History — verify all steps show 'Completed'",
    "Validate vRealize/Aria Suite connectivity if deployed: verify dashboards and data collection are operational"
  ],
  upgradeOrder: [
    { step: 1, component: "SDDC Manager", desc: "Upgrade SDDC Manager appliance first", downtime: "15-30 min (management only)" },
    { step: 2, component: "Management Domain - vCenter", desc: "Upgrade management domain vCenter Server", downtime: "30-60 min" },
    { step: 3, component: "Management Domain - NSX", desc: "Upgrade NSX Manager, Edge, and Host Transport Nodes", downtime: "60-90 min (rolling)" },
    { step: 4, component: "Management Domain - ESXi", desc: "Upgrade all ESXi hosts in management domain via vLCM", downtime: "15-30 min per host" },
    { step: 5, component: "Workload Domains", desc: "Repeat vCenter, NSX, ESXi upgrade for each workload domain", downtime: "2-4 hours per domain" }
  ],
  vcfBom: {
    "4.5": { vcenter: "7.0 U3", esxi: "7.0 U3", nsx: "3.2.1", vsan: "7.0 U3" },
    "4.5.1": { vcenter: "7.0 U3c", esxi: "7.0 U3c", nsx: "3.2.1", vsan: "7.0 U3" },
    "4.5.2": { vcenter: "7.0 U3n", esxi: "7.0 U3n", nsx: "3.2.3", vsan: "7.0 U3" },
    "5.0": { vcenter: "8.0 U1", esxi: "8.0 U1", nsx: "4.1.0", vsan: "8.0 U1" },
    "5.1": { vcenter: "8.0 U2", esxi: "8.0 U2", nsx: "4.1.2", vsan: "8.0 U2" },
    "5.1.1": { vcenter: "8.0 U2b", esxi: "8.0 U2b", nsx: "4.1.2", vsan: "8.0 U2" },
    "5.2": { vcenter: "8.0 U3", esxi: "8.0 U3", nsx: "4.2.0", vsan: "8.0 U3" },
    "5.2.1": { vcenter: "8.0 U3a", esxi: "8.0 U3a", nsx: "4.2.1", vsan: "8.0 U3" },
    "9.0": { vcenter: "8.0 U3c", esxi: "8.0 U3c", nsx: "4.2.1", vsan: "8.0 U3" }
  },
  estimatedDowntime: {
    _default: "2-6 hours per domain",
    management_domain: "3-5 hours total",
    workload_domain: "2-4 hours per domain"
  },
  knownIssues: {
    "5.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-12' target='_blank'>KB #12 — ESXi Patch / Upgrade</a>: SDDC Manager pre-check may fail if management cluster hosts have stale vLCM baselines. Refresh before upgrade.",
    "5.1": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase5.html#kb-42' target='_blank'>KB #42 — vpxd Service Issues</a>: Management domain vCenter may show brief inventory loss during BOM upgrade. Wait for auto-recovery.",
    "9.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-11' target='_blank'>KB #11 — Certificate Expiry</a>: VCF 9.0 upgrade requires valid certificates across all components. Renew any expiring certs before starting the upgrade workflow."
  }
};
