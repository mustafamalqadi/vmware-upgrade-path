const VCENTER_DATA = {
  product: "vCenter Server",
  icon: "&#127970;",
  color: "#58a6ff",
  versions: [
    { id: "6.5", label: "6.5", eol: true, release: "2016-11", build: "4944578" },
    { id: "6.5u1", label: "6.5 U1", eol: true, release: "2017-07", build: "5973321" },
    { id: "6.5u2", label: "6.5 U2", eol: true, release: "2018-05", build: "8815520" },
    { id: "6.5u3", label: "6.5 U3", eol: true, release: "2019-04", build: "13643870" },
    { id: "6.7", label: "6.7", eol: true, release: "2018-04", build: "8546234" },
    { id: "6.7u1", label: "6.7 U1", eol: true, release: "2018-10", build: "10244857" },
    { id: "6.7u2", label: "6.7 U2", eol: true, release: "2019-04", build: "13643639" },
    { id: "6.7u3", label: "6.7 U3", eol: true, release: "2019-08", build: "14367737" },
    { id: "7.0", label: "7.0", eol: false, release: "2020-04", build: "15952599" },
    { id: "7.0u1", label: "7.0 U1", eol: false, release: "2020-10", build: "17004997" },
    { id: "7.0u2", label: "7.0 U2", eol: false, release: "2021-03", build: "17694817" },
    { id: "7.0u3", label: "7.0 U3", eol: false, release: "2021-10", build: "19234570" },
    { id: "7.0u3n", label: "7.0 U3n", eol: false, release: "2023-03", build: "21958395" },
    { id: "7.0u3p", label: "7.0 U3p", eol: false, release: "2023-07", build: "22357613" },
    { id: "8.0", label: "8.0", eol: false, release: "2022-10", build: "20519528" },
    { id: "8.0u1", label: "8.0 U1", eol: false, release: "2023-04", build: "21560480" },
    { id: "8.0u2", label: "8.0 U2", eol: false, release: "2023-09", build: "22385739" },
    { id: "8.0u3", label: "8.0 U3", eol: false, release: "2024-06", build: "24022515" },
    { id: "8.0u3a", label: "8.0 U3a", eol: false, release: "2024-08", build: "24305601" },
    { id: "8.0u3b", label: "8.0 U3b", eol: false, release: "2024-11", build: "24601789" },
    { id: "8.0u3c", label: "8.0 U3c", eol: false, release: "2025-02", build: "25020103" }
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
      "Verify current vCenter build number matches expected source version (vCenter Admin > Summary)",
      "Take a file-based backup of vCenter (VAMI > Backup > Run backup now)",
      "Take a VM-level snapshot of the vCenter Server Appliance with memory included",
      "Verify all ESXi hosts are connected and not in maintenance mode",
      "Confirm DNS forward and reverse resolution for VCSA FQDN from all networks",
      "Ensure port 443, 5480, 9087 are open between VCSA and all management endpoints",
      "Validate NTP synchronization across vCenter and all ESXi hosts (esxcli system time get)"
    ],
    "6.5u3->6.7u3": [
      "External PSC topology must be converged to embedded before upgrading to 6.7 U3",
      "Run the VMware Migration Assistant on the source VCSA to validate environment",
      "Verify all plugins are compatible with vCenter 6.7 (vSAN, NSX, SRM, vROps)",
      "Check custom TLS certificates are SHA-256; SHA-1 certs will fail post-upgrade",
      "Validate VMware Directory Service (vmdir) replication if multi-site topology exists"
    ],
    "6.7u3->7.0": [
      "External PSC must be converged to embedded identity provider before upgrading",
      "Run /usr/lib/vmware-vmdir/bin/vdcrepadmin to verify directory replication health",
      "Verify ESXi hosts are at least 6.5 U2 before upgrading vCenter to 7.0",
      "Review deprecated APIs: vSphere Web Client (Flash) removed in 7.0",
      "Confirm Enhanced Linked Mode topology is healthy if using multiple vCenters",
      "Backup vCenter certificates from /etc/vmware-vpx/ssl/ and /etc/vmware/ssl/"
    ],
    "7.0u3->8.0": [
      "Verify all ESXi hosts are at 7.0 U2 or later (vCenter 8.0 requires this minimum)",
      "Run VCSA Health Check from VAMI and resolve all critical/warning items",
      "Validate vSphere Lifecycle Manager (vLCM) images if using image-based management",
      "Check for deprecated features: vSphere Client customization specs format change",
      "Ensure VCSA root partition has at least 10GB free (df -h /)",
      "Verify all DRS/HA cluster configurations are valid and no orphaned objects exist"
    ],
    "7.0u3->8.0u3": [
      "Direct jump from 7.0 U3 to 8.0 U3 is supported but back up extensively",
      "Run the vCenter Server 8.0 U3 pre-upgrade compatibility checker ISO first",
      "Validate no expired or soon-to-expire certificates in Certificate Manager",
      "Ensure VMware Directory Service database is consistent (vdcrepadmin -f showpartnerstatus)",
      "Review release notes for all intermediate versions for any behavioral changes"
    ]
  },
  postChecks: [
    "Verify vCenter services are running: service-control --status --all",
    "Log into vSphere Client and confirm all hosts, VMs, and clusters are visible",
    "Validate SSO/LDAP authentication by logging in with AD-joined accounts",
    "Check vCenter alarms and events for any post-upgrade warnings",
    "Verify DRS, HA, and vMotion functionality with a test migration",
    "Confirm vSphere Lifecycle Manager baselines/images are intact and accessible"
  ],
  knownIssues: {
    "7.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase5.html#kb-42' target='_blank'>KB #42 — vpxd Service Crash</a>: vCenter may show stale inventory after upgrade from 6.7. Resolution: Restart vpxd service and verify DB connections.",
    "8.0": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-11' target='_blank'>KB #11 — Certificate Expiry &amp; STS Token</a>: Custom SSL certificates may revert to VMCA-signed during upgrade. Re-apply custom certs post-upgrade.",
    "8.0u1": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase2.html#kb-16' target='_blank'>KB #16 — SSO / AD Integration</a>: LDAPS connections may fail if intermediate CA certificates are not in the trusted store.",
    "8.0u2": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase8.html#kb-75' target='_blank'>KB #75 — vLCM Image-Based Updates</a>: vLCM image compliance checks may report false negatives after upgrade. Run remediation scan.",
    "8.0u3": "<a href='https://mustafamalqadi.github.io/vmware-kbs/vsphere-kb/phase5.html#kb-49' target='_blank'>KB #49 — vCenter HA Failover</a>: vCenter HA failover may take longer than expected on first failover post-upgrade. Reconfigure vCenter HA."
  },
  estimatedDowntime: {
    _default: "30-60 minutes",
    migration: "60-90 minutes"
  }
};
