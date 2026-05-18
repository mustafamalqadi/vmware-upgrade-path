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
      "Verify current vCenter build number matches expected source version: vCenter Admin > Summary > Build",
      "Take a file-based backup of vCenter via VAMI (https://vcsa:5480 > Backup > Backup Now) — store on NFS/SFTP, not local",
      "Take a VM-level snapshot of the VCSA with memory and quiesce guest FS — label it 'pre-upgrade-<version>'",
      "Verify all ESXi hosts show Connected (not Disconnected/Not Responding) in vCenter inventory",
      "Confirm DNS forward AND reverse resolution for VCSA FQDN from all management networks: nslookup <fqdn> && nslookup <ip>",
      "Verify required ports are open: 443 (UI/API), 5480 (VAMI), 9087 (Analytics), 2012/2020 (vCenter HA)",
      "Validate NTP synchronization: timedatectl on VCSA and esxcli system time get on all hosts — drift must be < 1 second",
      "Check VCSA disk space: df -h / (root > 2GB free), df -h /storage (> 10GB free for upgrade staging)",
      "Verify SSO domain health: /usr/lib/vmware-vmdir/bin/vdcrepadmin -f showpartnerstatus -h localhost -u admin -w <pass>",
      "List all registered vCenter plugins and verify compatibility with target version: MOB > ExtensionManager",
      "Validate VCSA root and admin@vsphere.local passwords are known and not expired",
      "If using external identity source (AD/LDAP), test authentication connectivity from VCSA: ldapsearch -H ldaps://<dc>"
    ],
    "6.5u3->6.7u3": [
      "External PSC topology MUST be converged to embedded before upgrading to 6.7 — use converge tool in 6.7 installer",
      "Run VMware Migration Assistant on the source VCSA to pre-validate the environment",
      "Verify all plugins are compatible with vCenter 6.7: vSAN, NSX, SRM, vROps, Horizon, vRA",
      "Check custom TLS certificates use SHA-256 — SHA-1 certs will cause service startup failures post-upgrade",
      "Validate VMware Directory Service (vmdir) replication if multi-site: vdcrepadmin -f showpartnerstatus",
      "Document current vCenter roles and permissions — export via PowerCLI: Get-VIPermission | Export-Csv",
      "If using vCenter HA, remove HA configuration before upgrade and reconfigure after"
    ],
    "6.7u3->7.0": [
      "External PSC MUST be converged to embedded — the converge tool is built into vCenter 6.7 U1+",
      "Run /usr/lib/vmware-vmdir/bin/vdcrepadmin to verify directory replication health before upgrade",
      "Verify ESXi hosts are at least 6.5 U2 — vCenter 7.0 drops support for ESXi 6.0 and older",
      "Review deprecated APIs: vSphere Web Client (Flash) is REMOVED in 7.0 — all automation must use REST/SOAP",
      "Confirm Enhanced Linked Mode (ELM) topology is healthy if using multiple vCenters: check SSO domain replication",
      "Backup vCenter certificates: scp /etc/vmware-vpx/ssl/* and /etc/vmware/ssl/* to safe location",
      "Export all Distributed Switch configs via vSphere Client > Networking > Export Configuration",
      "Verify VMware Tools versions on all critical VMs — upgrade to 11.x or later before vCenter upgrade",
      "If using vSphere Replication or SRM, verify compatibility with vCenter 7.0 and plan coordinated upgrade"
    ],
    "7.0u3->8.0": [
      "Verify all ESXi hosts are at 7.0 U2 or later — vCenter 8.0 requires minimum ESXi 7.0 U2",
      "Run VCSA Health Check from VAMI (https://vcsa:5480 > Health) and resolve ALL critical/warning items",
      "Validate vSphere Lifecycle Manager (vLCM) images if using image-based management — remediate any drift",
      "Check for deprecated features: vSphere Client customization spec format changed, Content Library sync behavior updated",
      "Ensure VCSA root partition has at least 10GB free: ssh root@vcsa 'df -h /'",
      "Verify all DRS/HA cluster configurations are valid — fix any orphaned resource pools or invalid affinity rules",
      "If using vSphere Trust Authority, verify Attestation Service and Key Provider configurations",
      "Review vCenter 8.0 release notes for removed/deprecated APIs that your automation scripts may depend on",
      "Test VCSA backup restore procedure in a lab if possible — verify backup integrity before committing to upgrade"
    ],
    "7.0u3->8.0u3": [
      "Direct jump from 7.0 U3 to 8.0 U3 is supported — but take file-based backup AND snapshot as dual safety net",
      "Run the vCenter 8.0 U3 pre-upgrade compatibility checker from the ISO mount: ./upgrade-runner.sh --precheck",
      "Validate no expired or soon-to-expire certificates: for-each-cert certool --info --cert=/path shows expiry",
      "Ensure VMware Directory Service database is consistent: vdcrepadmin -f showpartnerstatus -h localhost",
      "Review release notes for ALL intermediate versions (8.0, 8.0u1, 8.0u2, 8.0u3) for behavioral changes",
      "Verify no custom VCSA OS-level modifications (cron jobs, custom scripts in rc.local) that may break during upgrade"
    ]
  },
  postChecks: [
    "Verify all vCenter services are running: service-control --status --all (expect all RUNNING)",
    "Log into vSphere Client (https://vcsa/ui) and confirm all hosts, VMs, clusters, and datastores are visible",
    "Validate SSO/LDAP authentication: log in with AD-joined account and verify correct role/permissions",
    "Check vCenter alarms and events for any post-upgrade warnings: Monitor > Events > filter last 1 hour",
    "Test DRS functionality: manually vMotion a test VM between hosts and verify completion",
    "Test HA functionality: simulate host isolation on a test host (disconnect management NIC) and verify VM restart",
    "Verify vMotion works: right-click VM > Migrate > Change compute resource — confirm successful migration",
    "Confirm vSphere Lifecycle Manager baselines/images are intact: Lifecycle Manager > Imported ISOs/Baselines",
    "Verify Content Library sync is operational if using subscribed libraries across vCenters",
    "Check VCSA disk usage post-upgrade: df -h / — VCSA may consume more space after upgrade",
    "Validate automated tasks: scheduled backups, DRS automation level, HA admission control",
    "If using vCenter HA, reconfigure and verify passive/witness nodes are synchronized",
    "Run performance test: verify vCenter UI responsiveness and API response times are comparable to pre-upgrade"
  ],
  upgradeMethods: [
    { method: "GUI Installer (ISO)", desc: "Mount the VCSA ISO, run installer/vcsa-ui-installer/<os>/installer — GUI wizard walks through all steps. Best for most environments.", best: true },
    { method: "CLI Installer (JSON)", desc: "Use vcsa-deploy with a JSON template: vcsa-deploy install/upgrade --accept-eula <template.json>. Best for automated/repeatable deployments.", best: false },
    { method: "VAMI Update (Patch)", desc: "For minor updates only: VAMI (https://vcsa:5480) > Update > Check Updates > Stage & Install. Only for same-major patches (e.g., 8.0 U2 → 8.0 U3).", best: false },
    { method: "VCF Lifecycle Manager", desc: "For VCF environments ONLY: SDDC Manager orchestrates vCenter upgrade as part of the BOM bundle. Do not use standalone installer.", best: false }
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
