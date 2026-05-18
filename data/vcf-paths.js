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
      "<strong>SDDC Manager Orchestration (CRITICAL):</strong> VCF upgrades MUST be orchestrated through SDDC Manager — do NOT upgrade components individually. Manual vCenter/NSX/ESXi upgrades outside SDDC Manager will corrupt inventory and break lifecycle management. Always start from: Lifecycle Management > Upgrade",
      "<strong>Pre-Check Execution:</strong> Lifecycle Management > Pre-check > Run All. This validates: component connectivity, disk space, password validity, certificate expiry, BOM compatibility. Resolve ALL red (blocking) items. Yellow (warning) items: assess but may proceed. Re-run until clean. Export report as evidence",
      "<strong>SDDC Manager Backup:</strong> Administration > Backup > Backup Now. Target: remote SFTP server. Verify backup file appears on SFTP and size > 500MB (indicates complete backup). Also: SSH to SDDC Manager > ls -la /nfs/vmware/vcf/backup/ — verify recent timestamp. This is your rollback lifeline",
      "<strong>Management VM Snapshots:</strong> In vCenter: snapshot SDDC Manager VM, VCSA (management), all 3 NSX Manager VMs, Edge Node VMs. Label: 'pre-VCF-upgrade-<date>'. Verify snapshots succeed (check datastore space first). These enable rapid rollback if upgrade fails mid-way. Delete after 48h success",
      "<strong>Password Validation:</strong> SDDC Manager > Security > Password Management. All component passwords must show 'Valid' (green). If any show 'Expired' or 'Unknown': rotate BEFORE upgrade. SDDC Manager uses these credentials during upgrade automation — expired passwords = upgrade failure at arbitrary point",
      "<strong>Bundle Depot Access:</strong> SDDC Manager needs access to upgrade bundles. Online mode: test connectivity to depot.vmware.com (port 443). Offline mode: verify local depot has correct bundles uploaded. SSH to SDDC Manager: curl -I https://depot.vmware.com/PROD2/))). If offline: Administration > Bundle Transfer > Upload",
      "<strong>NTP Synchronization:</strong> ALL management components must be within 2 seconds of each other. Verify: SDDC Manager (date), vCenter (shell: date), NSX Managers (get clock), ESXi hosts (esxcli system time get). If drift > 2s: fix NTP config. Time skew causes: certificate validation failures, API auth errors during upgrade",
      "<strong>LCM Log Review:</strong> SSH to SDDC Manager: grep -i 'ERROR\\|FAIL' /var/log/vmware/vcf/lcm/*.log | tail -20. If recent errors related to workflows or bundle processing: investigate and resolve. Common: stale workflow locks (restart LCM service), corrupted bundle (re-download). Clean logs = higher upgrade confidence",
      "<strong>Disk Space:</strong> SSH to SDDC Manager: df -h. /opt must have > 100GB free (bundle staging). Also check vCenter VAMI: https://<vcsa>:5480 > Storage — verify > 20% free. Insufficient space = upgrade downloads fail or staging fails. Clean old bundles: rm /nfs/vmware/vcf/bundles/*.tar (old only)",
      "<strong>Workload Domain Health:</strong> SDDC Manager > Inventory > Workload Domains. ALL domains must show 'Active' (green). If any domain shows 'Error' or 'Activating': investigate and fix BEFORE upgrade. Check: domain > Hosts tab — all hosts must be 'Active'. Domain health issues will block upgrade pre-check",
      "<strong>Configuration Export:</strong> SDDC Manager > Developer Center > API Explorer. Execute: GET /v1/system — document response (system configuration). GET /v1/domains — document all domains. GET /v1/clusters — document all clusters. Save JSON responses as configuration baseline for post-upgrade validation",
      "<strong>DNS Resolution:</strong> From SDDC Manager: nslookup <vcenter-fqdn>, nslookup <nsx-fqdn>, nslookup <esxi-host-fqdn> for each management host. All must resolve correctly to expected IPs. Also verify reverse DNS: nslookup <ip-address>. DNS failures during upgrade = component communication breakdowns. Fix DNS records first"
    ],
    "4.5->5.0": [
      "<strong>vSAN ESA Readiness:</strong> VCF 5.0 supports vSAN ESA (Express Storage Architecture). If planning ESA adoption: verify ALL storage is NVMe (no SAS/SATA). Check each host: esxcli storage core device list — Transport must show 'NVMe'. If mixed storage: stay on OSA (Original Storage Architecture). ESA migration requires separate planning",
      "<strong>NSX 3.x→4.x Breaking Changes:</strong> VCF 5.0 BOM includes NSX 4.1.0 (from 3.2.x). This introduces Policy-only API mode. Verify: all NSX configurations exist in Policy API. Run MP-to-Policy promotion if needed BEFORE VCF upgrade: NSX Manager > System > Configuration > MP to Policy Promotion. SDDC Manager enforces this as pre-check",
      "<strong>ESXi 8.0 Hardware Requirements:</strong> All hosts must support ESXi 8.0 U1: minimum 32GB boot device (no USB/SD), supported NICs (check VMware IO HCL), supported storage controllers. Per host: esxcli system boot device get — verify ≥ 32GB SSD. Non-compliant hosts must be upgraded/replaced BEFORE VCF upgrade",
      "<strong>BOM Version Lock:</strong> VCF 5.0 locks: vCenter 8.0 U1 + ESXi 8.0 U1 + NSX 4.1.0 + vSAN 8.0 U1. You cannot mix versions within a VCF-managed domain. Review release notes for ALL four components. If any component has known issues affecting your workload: plan compensating controls or wait for next BOM update",
      "<strong>VMware Tools Currency:</strong> All workload VMs should have current VMware Tools. Outdated Tools may trigger compatibility warnings during vCenter upgrade. Check: PowerCLI: Get-VM | Where {$_.ExtensionData.Guest.ToolsVersionStatus -ne 'guestToolsCurrent'}. Update Tools via vLCM or in-guest installer before VCF upgrade",
      "<strong>Aria Suite Compatibility:</strong> If deployed: verify vRealize/Aria Operations (8.x→Aria), Aria Automation, Aria Log Insight versions support VCF 5.0 BOM. Check VMware Interoperability Matrix. If incompatible: plan separate Aria upgrade AFTER VCF upgrade. Temporary monitoring gap acceptable if documented",
      "<strong>NSX MP-to-Policy (Enforced):</strong> SDDC Manager 5.0 pre-check will FAIL if NSX MP-to-Policy promotion is not complete. Verify: NSX Manager > System > Configuration > check promotion status. If objects remain in Manager-only API: promote them before starting VCF upgrade. Otherwise SDDC Manager blocks at pre-check"
    ],
    "5.2->9.0": [
      "<strong>Major Version Change (Broadcom Era):</strong> VCF 9.0 is the first major release under Broadcom ownership. Expect: new licensing model, potential feature changes, updated support portals. Test THOROUGHLY in lab environment before production. Review all Broadcom transition documentation. Do NOT rush this upgrade",
      "<strong>Licensing Changes:</strong> VCF 9.0 licensing may differ from VMware-era VCF. Verify: current license keys work with VCF 9.0 (check portal.broadcom.com), understand new entitlement model, confirm all features you use are included in your license tier. Contact Broadcom/VMware sales if unclear before proceeding",
      "<strong>Third-Party Integration Validation:</strong> Test ALL integrations for VCF 9.0 compatibility: Backup (Veeam — check support matrix, Commvault — verify agent versions), Monitoring (SolarWinds, Datadog), Security (Trend Micro Deep Security, Carbon Black). Any unsupported integration = potential outage or data protection gap",
      "<strong>Bundle Size Planning:</strong> VCF 9.0 upgrade bundles are significantly larger (multi-GB). Verify: SDDC Manager /opt has 100GB+ free (df -h). Network bandwidth to depot adequate (or use offline bundles). Download time for online mode may be 2-4 hours depending on connection. Plan bundle download during off-hours",
      "<strong>BOM Validation (VCF 9.0):</strong> VCF 9.0 BOM: vCenter 8.0 U3c + ESXi 8.0 U3c + NSX 4.2.1 + vSAN 8.0 U3. Verify HCL compatibility for ALL hosts against ESXi 8.0 U3c: server models, NICs, storage controllers, boot devices. Use VMware Compatibility Guide with exact build number. Unsupported hardware = upgrade blocked or PSOD",
      "<strong>Extended Maintenance Window:</strong> VCF 9.0 upgrade includes enhanced firmware compliance checking that may require additional host reboots. Plan: 6-8 hour window per workload domain (vs. typical 2-4 hours). Communicate to stakeholders. Have rollback plan (snapshots) ready if window is exhausted",
      "<strong>Aria Suite Separate Path:</strong> If using Aria Suite (Operations, Automation, Logs): VCF 9.0 may require specific Aria versions. Check interoperability BEFORE VCF upgrade. If Aria versions incompatible: plan separate Aria upgrade path AFTER successful VCF 9.0 deployment. Temporary monitoring gap: acceptable with manual monitoring"
    ]
  },
  postChecks: [
    "<strong>SDDC Manager Dashboard:</strong> Inventory > Workload Domains. ALL domains must show green 'Active' status. If any show 'Error': click domain > check Tasks tab for failed workflow. Common: stale lock from interrupted upgrade — clear via API: DELETE /v1/tasks/<task-id>. All component tiles should show green health",
    "<strong>Full Validation:</strong> Administration > Inventory > Validate All. This triggers connectivity checks to every managed component. Wait for completion (may take 5-15 minutes for large environments). Review results: any 'Failed' validation = investigate immediately. Export validation report for change management records",
    "<strong>Lifecycle Compliance:</strong> Lifecycle Management > select each domain. 'Current Version' must match target VCF version. All components within domain must show 'Compliant'. If 'Non-Compliant': component upgrade may have failed silently — check upgrade history for that domain and retry individual component if needed",
    "<strong>BOM Component Versions:</strong> Inventory > select domain > Components tab. Verify: vCenter version, ESXi version, NSX version, vSAN version ALL match expected BOM. Cross-reference with: SDDC Manager > Lifecycle Management > Release Notes. Any version mismatch = investigate which component upgrade step failed",
    "<strong>NSX Connectivity:</strong> Test across all transport zones in each domain. East-West: ping VM-to-VM on different hosts/same segment. North-South: ping from VM to external. Cross-domain: if using shared Edge, test cross-domain routing. If any fails: check NSX Manager > Fabric > Transport Nodes state for that domain",
    "<strong>vSAN Health (All Clusters):</strong> For EVERY cluster in EVERY workload domain: vCenter > Cluster > Monitor > vSAN > Health. All checks must be green. Focus on: Network connectivity, Data health, Disk balance. If any cluster shows red: investigate before considering upgrade complete. Document health status per cluster",
    "<strong>Backup Functionality:</strong> Test: SDDC Manager > Administration > Backup > Backup Now — must succeed. Also: vCenter VAMI (https://<vcsa>:5480) > Backup > Run backup. If either fails post-upgrade: fix immediately — you need working backups before considering upgrade stable. Check SFTP target accessibility",
    "<strong>SDDC Manager API:</strong> curl -sk https://<sddc-mgr>/v1/system/health (with valid token). Response must contain 'status': 'HEALTHY'. Also test: GET /v1/domains (list all domains), GET /v1/hosts (list all hosts). API should respond in < 5 seconds. If slow or error: check SDDC Manager services: systemctl status vcf-*",
    "<strong>Cluster Expansion Test:</strong> SDDC Manager > Inventory > select cluster > Actions > Validate host addition (dry-run). Input a dummy host spec to verify the expansion workflow validation works. If validation fails: check ESXi image compatibility, network pool availability. Actual expansion not required — just validate capability",
    "<strong>Credential Rotation:</strong> Security > Password Management > select a non-critical component (e.g., ESXi host) > Rotate. Verify rotation succeeds. This confirms SDDC Manager can still manage credentials post-upgrade. If rotation fails: check SDDC Manager service account permissions and component connectivity",
    "<strong>Upgrade History:</strong> Lifecycle Management > Upgrade History. Verify ALL steps show 'Completed' (green checkmark). If any step shows 'Failed' or 'Skipped': investigate. Failed steps may indicate partial upgrade — component may be at wrong version. Retry failed step or escalate to VMware support if critical",
    "<strong>Aria Suite Integration:</strong> If using Aria Operations/Automation/Logs: verify dashboards load, data collection active, automation workflows functional. Aria Operations: check adapter connectivity (Administration > Adapters). Aria Logs: verify log forwarding from all components. If broken: may need Aria-side reconfiguration post-VCF upgrade"
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
