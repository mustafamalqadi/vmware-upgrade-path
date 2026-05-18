const ESXI_DATA = {
  product: "ESXi",
  icon: "&#128421;",
  color: "#3fb950",
  versions: [
    { id: "6.5", label: "6.5", eol: true, release: "2016-11", build: "4564106" },
    { id: "6.5u1", label: "6.5 U1", eol: true, release: "2017-07", build: "5969303" },
    { id: "6.5u2", label: "6.5 U2", eol: true, release: "2018-05", build: "8294253" },
    { id: "6.5u3", label: "6.5 U3", eol: true, release: "2019-04", build: "13932383" },
    { id: "6.7", label: "6.7", eol: true, release: "2018-04", build: "8169922" },
    { id: "6.7u1", label: "6.7 U1", eol: true, release: "2018-10", build: "10302608" },
    { id: "6.7u2", label: "6.7 U2", eol: true, release: "2019-04", build: "13006603" },
    { id: "6.7u3", label: "6.7 U3", eol: true, release: "2019-08", build: "14320388" },
    { id: "7.0", label: "7.0", eol: false, release: "2020-04", build: "15843807" },
    { id: "7.0u1", label: "7.0 U1", eol: false, release: "2020-10", build: "16850804" },
    { id: "7.0u2", label: "7.0 U2", eol: false, release: "2021-03", build: "17630552" },
    { id: "7.0u3", label: "7.0 U3", eol: false, release: "2021-10", build: "19193900" },
    { id: "7.0u3n", label: "7.0 U3n", eol: false, release: "2023-03", build: "21930508" },
    { id: "7.0u3p", label: "7.0 U3p", eol: false, release: "2023-07", build: "22348816" },
    { id: "8.0", label: "8.0", eol: false, release: "2022-10", build: "20513097" },
    { id: "8.0u1", label: "8.0 U1", eol: false, release: "2023-04", build: "21495797" },
    { id: "8.0u2", label: "8.0 U2", eol: false, release: "2023-09", build: "22380479" },
    { id: "8.0u3", label: "8.0 U3", eol: false, release: "2024-06", build: "24022510" },
    { id: "8.0u3a", label: "8.0 U3a", eol: false, release: "2024-08", build: "24280767" },
    { id: "8.0u3b", label: "8.0 U3b", eol: false, release: "2024-11", build: "24585291" },
    { id: "8.0u3c", label: "8.0 U3c", eol: false, release: "2025-02", build: "25012014" }
  ],
  paths: {
    "6.5": ["6.5u1"],
    "6.5u1": ["6.5u2"],
    "6.5u2": ["6.5u3"],
    "6.5u3": ["6.7u3", "7.0"],
    "6.7": ["6.7u1"],
    "6.7u1": ["6.7u2"],
    "6.7u2": ["6.7u3"],
    "6.7u3": ["7.0", "7.0u1", "7.0u2", "7.0u3"],
    "7.0": ["7.0u1", "7.0u2", "7.0u3", "8.0"],
    "7.0u1": ["7.0u2", "7.0u3", "8.0"],
    "7.0u2": ["7.0u3", "8.0", "8.0u1"],
    "7.0u3": ["7.0u3n", "7.0u3p", "8.0", "8.0u1", "8.0u2", "8.0u3"],
    "7.0u3n": ["7.0u3p", "8.0u2", "8.0u3"],
    "7.0u3p": ["8.0u2", "8.0u3"],
    "8.0": ["8.0u1", "8.0u2", "8.0u3"],
    "8.0u1": ["8.0u2", "8.0u3"],
    "8.0u2": ["8.0u3", "8.0u3a", "8.0u3b", "8.0u3c"],
    "8.0u3": ["8.0u3a", "8.0u3b", "8.0u3c"],
    "8.0u3a": ["8.0u3b", "8.0u3c"],
    "8.0u3b": ["8.0u3c"],
    "8.0u3c": []
  },
  preChecks: {
    _default: [
      "Place host in maintenance mode: esxcli system maintenanceMode set --enable true",
      "Verify boot device health: esxcli storage core device list | grep -i boot",
      "Check VMware Hardware Compatibility List (HCL) for target ESXi version",
      "List installed VIBs and verify compatibility: esxcli software vib list",
      "Verify sufficient boot device capacity: esxcli storage filesystem list",
      "Ensure no active vMotion or Storage vMotion tasks on the host",
      "Confirm NTP is synchronized: esxcli system time get && esxcli hardware clock get",
      "Check host profile compliance if using Host Profiles (vLCM or legacy)"
    ],
    "6.7u3->7.0": [
      "WARNING: USB/SD boot devices deprecated in ESXi 7.0 - plan migration to SSD/NVMe",
      "Verify no VMFS-5 datastores in use; upgrade to VMFS-6 first: esxcli storage vmfs upgrade",
      "Check for legacy CIM providers that may not be compatible with ESXi 7.0",
      "Validate network driver compatibility - e1000e replaced by native drivers in 7.0",
      "Remove any third-party async drivers that are not signed for ESXi 7.0"
    ],
    "7.0u3->8.0": [
      "CRITICAL: Boot device must be at least 32GB (8GB minimum for ESXi-OSData partition)",
      "USB/SD boot devices are NO LONGER SUPPORTED in ESXi 8.0 - must migrate to persistent storage",
      "Check for deprecated drivers: esxcli software vib list | grep -E 'nmlx4|bnx2x|lpfc'",
      "Verify TPM 2.0 module presence if using vSphere Trust Authority",
      "Validate NIC driver compatibility - several inbox drivers removed in 8.0",
      "Ensure Secure Boot is configured if enabling vSphere 8 security features"
    ],
    "8.0u2->8.0u3": [
      "Verify server firmware is on vendor-supported matrix for ESXi 8.0 U3",
      "Check for known NIC firmware issues with i40en/ice drivers (see vendor release notes)",
      "Validate vSAN disk group compatibility if host participates in vSAN cluster"
    ]
  },
  postChecks: [
    "Exit maintenance mode: esxcli system maintenanceMode set --enable false",
    "Verify host reconnects to vCenter and shows Connected status",
    "Check vmkernel.log for errors: tail -100 /var/log/vmkernel.log | grep -i error",
    "Test vmkernel network connectivity: vmkping -I vmk0 <gateway_ip>",
    "Monitor DRS rebalancing - VMs should migrate back within 5 minutes",
    "Run vSAN health check if host is part of vSAN cluster",
    "Verify installed VIBs match expected: esxcli software vib list | wc -l",
    "Test vMotion with a small VM to validate network and compute compatibility"
  ],
  upgradeMethods: [
    { method: "vLCM Image", desc: "vSphere Lifecycle Manager with a defined image (recommended for clusters)", best: true },
    { method: "vLCM Baseline", desc: "Legacy Update Manager baseline with ESXi ISO bundle", best: false },
    { method: "esxcli", desc: "Command-line upgrade via esxcli software profile update -d <depot.zip>", best: false },
    { method: "ISO Interactive", desc: "Boot from ISO and select upgrade (standalone hosts or initial deployment)", best: false }
  ],
  knownIssues: {
    "7.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-12' target='_blank'>KB #12 — ESXi Patch / Upgrade with vLCM</a>: Remediation may fail if depot metadata is corrupted or host has incompatible async drivers.",
    "8.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-15' target='_blank'>KB #15 — SSH / Shell &amp; Hardening</a>: After ESXi 8.0 upgrade, SSH may be disabled by default due to stricter lockdown profile. Re-enable if needed.",
    "8.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase8.html#kb-75' target='_blank'>KB #75 — vLCM Image-Based Updates</a>: Hardware Support Manager (HSM) firmware add-ons may fail compliance after update to 8.0 U3."
  },
  estimatedDowntime: {
    _default: "15-30 min per host",
    single_host: "30-45 min"
  }
};
