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
      "CRITICAL: VCF upgrades MUST be orchestrated through SDDC Manager - do NOT upgrade components individually",
      "Run SDDC Manager pre-check: Administration > Lifecycle Management > Pre-check",
      "Take a full file-level backup of SDDC Manager appliance",
      "Snapshot all management domain VMs (vCenter, NSX Manager, SDDC Manager, Edge)",
      "Verify all component passwords are valid and not expired in SDDC Manager credentials",
      "Ensure SDDC Manager has access to the upgrade bundle depot (online or offline)",
      "Verify NTP synchronization across all management components",
      "Check SDDC Manager /var/log/vmware/ for any ERROR entries before starting"
    ],
    "4.5->5.0": [
      "VCF 5.0 introduces vSAN ESA support - review storage architecture options",
      "NSX will be upgraded from 3.2.x to 4.1.x as part of the bundle",
      "Verify ESXi hosts meet 8.0 U1 hardware requirements (32GB boot device)",
      "Review VCF 5.0 BOM for all locked component versions",
      "Ensure all workload domain VMs have current VMware Tools installed"
    ],
    "5.2->9.0": [
      "VCF 9.0 is a major version change - requires extensive planning",
      "Review Broadcom licensing changes applicable to VCF 9.0",
      "Validate all third-party integrations for VCF 9.0 compatibility",
      "Ensure SDDC Manager has minimum 100GB free disk space for upgrade bundles"
    ]
  },
  postChecks: [
    "Verify SDDC Manager dashboard shows all components GREEN/Healthy",
    "Run SDDC Manager validation: Administration > Inventory > Validate All",
    "Confirm all workload domains show Compliant status in Lifecycle Management",
    "Verify BOM component versions match expected target in SDDC Manager inventory",
    "Test NSX connectivity across all transport zones in each domain",
    "Validate vSAN health for all clusters across all workload domains",
    "Confirm backup jobs are running successfully post-upgrade",
    "Verify SDDC Manager API accessibility: GET /v1/system/health"
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
